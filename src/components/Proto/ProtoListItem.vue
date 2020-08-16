<template>
  <q-expansion-item
    v-if="proto"
    :label="proto.fileName"
    :header-inset-level="deep * 0.2"
  >
    <q-list>
      <q-expansion-item
        v-for="[index, service] of Object.entries(proto.services)"
        :key="index"
        default-opened
        dense
        :header-inset-level="deep * 0.2"
        :content-inset-level="deep * 0.2"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <img src="grpc-icon.png" width="30px" style="height: auto;" />
          </q-item-section>
          <q-item-section>
            {{ service.serviceName }}
          </q-item-section>
        </template>
        <q-list>
          <q-item
            v-for="(methodName, key) in service.methodsName"
            :key="key"
            clickable
            dense
            @click="handleClickService(proto, service, index, methodName)"
          >
            <q-item-section class="q-pl-lg">{{ methodName }}</q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </q-list>
  </q-expansion-item>
</template>

<script>
export default {
  name: 'ProtoListItem',
  props: {
    proto: {
      type: Object,
      default: () => {}
    },
    currentPath: {
      type: String,
      default: ''
    },
    deep: {
      type: Number,
      default: 0,
    }
  },
  methods: {
    handleClickService (proto, service, serviceName, methodName) {
      this.$router.push({
        path: 'service',
        query: {
          protoID: proto.id,
          svcID: service.id,
          method: methodName,
          svcName: serviceName,
          path: this.currentPath,
          protoPath: service.proto.filePath
        }
      })
    }
  }
}
</script>