<template>
  <div class="proto-list">
    <q-list v-if="protos.length > 0">
      <template v-for="(proto, index) in protos">
        <proto-list-item
          :key="index"
          :proto="proto"
          :current-path="currentPath"
          :deep="deep"
        />
      </template>
    </q-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'ProtoList',
  components: {
    ProtoListItem: () => import('@/components/Proto/ProtoListItem.vue')
  },
  props: {
    protos: {
      type: Array,
      default: () => []
    },
    currentPath: {
      type: String,
      default: ''
    },
    deep: {
      type: Number,
      default: 0
    }
  }
}
</script>