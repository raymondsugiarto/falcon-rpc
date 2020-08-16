<template>
  <div class="service">
    <div class="q-mb-sm">
      <div class="row">
        <span class="text-h6 text-bold">{{ methodName }}</span>
        <q-space />
        <q-btn 
          :label="$t('service.saveRPC')"
          dense
          class="bg-orange text-white q-px-md"
          @click="handleOpenSaveDialog"
        />
        <q-btn 
          :label="$t('service.loadRPC')"
          dense
          class="bg-brown text-white q-px-md q-ml-md"
          @click="handleOpenLoadDialog"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-10 col-lg-11">
        <q-input
          v-model="address"
          outlined square
          class="bg-white"
        />
      </div>
      <div class="col-2 col-lg-1">
        <q-btn
          :label="$t('action.run')"
          @click="handleClickRun"
          :loading="loading"
          padding="md"
          push glossy
          class="bg-primary text-white full-width"
        />
      </div>
    </div>
    <q-splitter
      v-model="splitterModel"
      :horizontal="viewMode === 'stream'"
      style="height: 700px"
      class="q-mt-md"
      :separator-style="viewMode === 'column' ? 'width: 3px' : 'height: 3px'"
      :separator-class="(viewMode === 'column' ? 'q-mx-sm' : 'q-my-sm') + ' bg-primary'"
    >

      <template v-slot:before>
        <q-card flat square>
          <q-tabs
            v-model="tabRequest"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
          >
            <q-tab name="metadata" :label="$t('service.metadata')" />
            <q-tab name="request" :label="$t('service.request')" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tabRequest" animated>
            <q-tab-panel name="metadata">
              <div class="window-width window-height">
                <editor
                  v-model="metadata"
                  @init="editorInit"
                  :config="config"
                  mode="json"
                  theme="textmate"
                  :showPrintMargin="false"
                  showGutter
                  :highlightActiveLine="false"
                  :fontSize="13"
                  :cursorStart="2"
                  tabSize="2"
                >
                </editor>
              </div>
            </q-tab-panel>
            <q-tab-panel name="request">
              <div class="window-width window-height">
                <editor
                  v-model="jsonRequest"
                  @init="editorInit"
                  :config="config"
                  mode="json"
                  theme="textmate"
                  :showPrintMargin="false"
                  showGutter
                  :highlightActiveLine="false"
                  :fontSize="13"
                  :cursorStart="2"
                  tabSize="2"
                >
                </editor>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </template>

      <!-- <template v-slot:separator>
        <q-avatar color="primary" text-color="white" size="40px" icon="drag_indicator" />
      </template> -->

      <template v-slot:after>
        <q-card flat square>
          <q-tabs
            v-model="tabResponse"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
          >
            <q-tab name="response" :label="$t('service.response')" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tabResponse" animated>
            <q-tab-panel name="response">
              <div class="window-width window-height">
                <editor
                  v-model="jsonResponse"
                  @init="editorInit"
                  :config="config"
                  mode="json"
                  theme="textmate"
                  :showPrintMargin="false"
                  showGutter
                  :highlightActiveLine="false"
                  :fontSize="13"
                  :cursorStart="2"
                  tabSize="2"
                >
              </editor>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </template>
    </q-splitter>
    <service-save-dialog ref="saveDialog" @on-save="handleSaveRPC" />
    <service-load-dialog ref="loadDialog" :path="methodPath" @on-select="handleSelectRPC" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { GRPCRequest, GRPCEventType } from '@/utils/grpc-request'
import { ProtoInfo } from '@/utils/proto-info'
import cloneDeep from 'lodash/cloneDeep'
import { mockRequestMethods } from '@/utils/proto-mock'
import { loadProtos } from '@/utils/proto'
import { v4 as uuidv4 } from 'uuid'
import { promisifyRead } from '@/utils/protobuf'
const fs = require('fs')
const path = require('path')

export default {
  name: 'Service',
  components: {
    editor: require('vue2-ace-editor'),
    ServiceSaveDialog: () => import('@/components/Service/ServiceSaveDialog'),
    ServiceLoadDialog: () => import('@/components/Service/ServiceLoadDialog')
  },
  data () {
    return {
      splitterModel: 50,
      serviceID: null,
      protoID: null,
      currentPath: null,
      methodName: null,
      service: null,
      serviceName: null,
      proto: null,
      protoPath: null,
      originProtoPath: null,
      methodPath: null,
      address: '0.0.0.0:8810',
      loading: false,
      metadata: null,
      tabRequest: 'request',
      tabResponse: 'response',
      jsonRequest: null,
      jsonResponse: null,
      jsonIndent: 4,
      config: {
        useWorker: true,
        displayIndentGuides: true,
        lang: 'json'
      }
    }
  },
  computed: {
    ...mapGetters({
      protos: 'proto/getProtos',
      viewMode: 'falcon/getViewMode'
    }),
    cacheKey () {
      return this.serviceID + '|' + this.methodName
    }
  },
  mounted () {
    const { query } = this.$route
    if (query) {
      this.protoID = query.protoID
      this.serviceID = query.svcID
      this.serviceName = query.svcName
      this.methodName = query.method
      this.currentPath = query.path
      this.originProtoPath = query.protoPath
      this.init()
    }
  },
  beforeDestroy() {
    // save metadata to localstorage
    if (this.metadata) {
      const value = {
        metadata: this.metadata,
        request: this.request
      }
      this.$q.localStorage.set(this.cacheKey, value)
    }
  },
  methods: {
    init () {
      const cache = this.$q.localStorage.getItem(this.cacheKey)
      if (cache) {
        this.metadata = cache.metadata
        this.request = cache.request
      }
      loadProtos([this.originProtoPath], (protoFiles, e) => {
        if (!e) {
          if (protoFiles.length > 0) {
            const protoFile = protoFiles[0]
            this.service = protoFile.services[this.serviceName]

            if (this.service) {
              const { plain } = this.service.methodsMocks[this.methodName]()
              this.jsonRequest = JSON.stringify(plain, null, this.jsonIndent)
            }
          }
        }
      }, true)
    },
    editorInit: function () {
      require('brace/ext/language_tools') //language extension prerequsite...
      require('brace/mode/html')                
      require('brace/mode/javascript')    //language
      require('brace/mode/less')
      require('brace/theme/chrome')
      require('brace/snippets/javascript') //snippet
    },
    handleClickRun () {
      const protoInfo = new ProtoInfo(this.service, this.methodName)
      const grpcRequest = new GRPCRequest({
        url: this.address,
        inputs: this.jsonRequest,
        metadata: this.metadata,
        protoInfo,
        interactive: false,
        tlsCertificate: null,
      });

      grpcRequest.on(GRPCEventType.ERROR, (e, metaInfo) => {
        this.loading = false
        this.jsonResponse = JSON.stringify({ error: e.message, }, null, 2)
        // dispatch(setResponse({
        //   responseTime: metaInfo.responseTime,
        //   output: JSON.stringify({
        //     error: e.message,
        //   }, null, 2)
        // }));
      });

      grpcRequest.on(GRPCEventType.DATA, (data, metaInfo) => {
        this.loading = false
        this.jsonResponse = JSON.stringify(data, null, 2)
        // if (metaInfo.stream && state.interactive) {
        //   dispatch(addResponseStreamData({
        //     output: JSON.stringify(data, null, 2),
        //     responseTime: metaInfo.responseTime,
        //   }));
        // } else {
        //   dispatch(setResponse({
        //     responseTime: metaInfo.responseTime,
        //     output: JSON.stringify(data, null, 2),
        //   }));
        // }
      });

      grpcRequest.on(GRPCEventType.END, () => {
        this.loading = false
        // dispatch(setIsLoading(false));
        // dispatch(setCall(undefined));
        // dispatch(setStreamCommitted(false));
      });

      try {
        this.loading = true
        grpcRequest.send()
      } catch(e) {
        this.loading = false
        console.error(e);
        // notification.error({
        //   message: "Error constructing the request",
        //   description: e.message,
        //   duration: 5,
        //   placement: "bottomRight",
        //   style: {
        //     width: "100%",
        //     wordBreak: "break-all",
        //   }
        // });
        grpcRequest.emit(GRPCEventType.END);
      }
    },
    handleSaveRPC (rpcFileName) {
      let examplePath = path.join(this.currentPath, 'example')

      // Create Dir for Method
      this.$store.dispatch('workspace/createCollection', {
        rootPath: this.currentPath,
        collectionName: 'example'
      })

      // Create Dir for Proto File
      this.$store.dispatch('workspace/createCollection', {
        rootPath: examplePath,
        collectionName: this.proto.fileName
      })
      examplePath = path.join(examplePath, this.proto.fileName)
      
      // Create Dir for Method
      this.$store.dispatch('workspace/createCollection', {
        rootPath: examplePath,
        collectionName: this.methodName
      })
      examplePath = path.join(examplePath, this.methodName)

      // save to file
      const rpc = {
        address: this.address,
        metadata: this.metadata,
        request: this.jsonRequest,
        response: this.jsonResponse
      }
      
      const filePath = path.join(examplePath, rpcFileName + "." + uuidv4() + ".ex.json")
      fs.writeFile(filePath, JSON.stringify(rpc), function (err) {
        if (err) return console.log(err);
      });
    },
    async handleSelectRPC (fileName) {
      const filePath = path.join(this.methodPath, fileName)
      let rpc = await promisifyRead(filePath)
      if (rpc) {
        rpc = JSON.parse(rpc)
        this.jsonRequest = rpc.request
        this.jsonResponse = rpc.response
        this.address = rpc.address
        this.methodPath = rpc.metadata
      }
    },
    handleOpenSaveDialog () {
      this.$refs.saveDialog.openDialog()
    },
    handleOpenLoadDialog () {
      this.$refs.loadDialog.openDialog()
    },
    handleLoadRPC () {

    }
  }
}
</script>