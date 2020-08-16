<template>
  <q-expansion-item
    ref="exCollection"
    v-model="expansionValue"
    expand-icon-toggle
    switch-toggle-side
    dense
    dense-toggle
    @before-show="onBeforeShow"
    @before-hide="onBeforeHide"
    :header-inset-level="deep * 0.2"
    header-class="collection"
  >
    <template v-slot:header>
      <q-item-section avatar>
        <q-icon v-if="!expansionValue" name="folder" color="primary" text-color="white" />
        <q-icon v-if="expansionValue" name="folder_open" color="primary" text-color="white" />
      </q-item-section>
      <q-item-section>
        {{ collection }}
      </q-item-section>
      <q-space />
      <q-item-section avatar>
        <q-icon name="more_vert">
          <q-menu>
            <q-list dense style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section @click="handleUploadFile(collection)">{{ $t('action.upload') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-icon>
      </q-item-section>
    </template>
    <template v-if="protoList && protoList.length > 0">
        <proto-list :protos="protoList" :current-path="currentPath" :deep="deep + 1"/>
      </template>
    <div v-if="!loadingCollection">
      <template v-for="(itemCollection, index) in collections">
        <collection-item
          :key="index"
          :deep="deep + 1"
          :collection="itemCollection"
          :current-path="getCollectionPath(itemCollection)"
        />
      </template>
    </div>
  </q-expansion-item>
</template>

<script>
import path from 'path'
import { mapGetters } from 'vuex'
export default {
  name: 'CollectionItem',
  components: {
    ProtoList: () => import('@/components/Proto/ProtoList.vue'),
    CollectionItem: () => import('@/components/Navigation/CollectionItem.vue')
  },
  props: {
    collection: {
      type: String,
      default: ''
    },
    currentPath: {
      type: String,
      default: ''
    },
    deep: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      expansionValue: false,
      loadingCollection: true,
      protoList: [],
      collections: []
    }
  },
  watch: {
    protos (oldValue, value) {
      this.refreshProtos()
    },
  },
  computed: {
    ...mapGetters({
      protos: 'proto/getProtos',
    }),
    collectionDirs () {
      return this.collections.filter(x => x.name !== 'example')
    },
    collectionPath () {
      return path.join(this.currentPath, this.collection)
    }
  },
  methods: {
    onBeforeShow () {
      this.loadCollection()
      this.loadProtos()
    },
    onBeforeHide () {
      // TODO: need enhancement with refresh button, so dont need to remove proto if only show/hide
      this.removeProtos()
    },
    loadProtos () {
      this.$store.dispatch('proto/loadExistingProto', { collectionPath: this.collectionPath })
    },
    refreshProtos () {
      const protosInPath = this.protos.find(x => x.cpath === this.collectionPath)
      if (protosInPath) {
        this.protoList = protosInPath.protos
      }
    },
    removeProtos () {
      this.$store.commit('proto/REMOVE_PROTO', { collectionPath: this.collectionPath })
    },
    loadCollection () {
      this.$store.dispatch('workspace/loadCollection', {
        currentPath: this.collectionPath,
        onSuccess: cs => {
          this.loadingCollection = false
        }
      })
    },
    handleUploadFile () {
      this.$store.dispatch('proto/uploadProtos', {
        onProtoUploaded: (protoFiles, e) => {
          if (!e) {
            this.$store.commit('proto/ADD_PROTO', {
              collectionPath: this.collectionPath,
              protoFiles
            })
            this.$refs.exCollection.show()
          }
        }
      })
    }
  }
}
</script>
