<template>
  <div class="left-content bg-grey-3" v-if="!loadingCollection">
    <!-- <template v-for="(collection, index) in collections">
      <collection-item :key="index" :collection="collection" :current-path="getCollectionPath(collection)"/> -->
      <!-- <q-separator :key="`separator`+ index"/> -->
    <!-- </template> -->
    <template v-for="(collection, index) in rootCollections">
      <collection-item :key="index" :current-path="workspaceRootPath" :collection="collection"/>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LeftContent',
  components: {
    CollectionItem: () => import('@/components/Navigation/CollectionItem.vue')
  },
  computed: {
    ...mapGetters({
      workspaceRootPath: 'workspace/getWorkspaceRootPath',
      collections: 'workspace/getCollections'
    }),
    rootCollections () {
      if (!this.loadingCollection) {
        return this.collections[0].dirs
      }
      return []
    }
  },
  data () {
    return {
      loadingCollection: true,
    }
  },
  mounted () {
    this.loadCollection()
  },
  methods: {
    loadCollection () {
      this.$store.dispatch('workspace/loadCollection', {
        currentPath: this.workspaceRootPath,
        collectionName: '',
        onSuccess: cs => {
          this.loadingCollection = false
        }
      })
    },
    getCollectionPath (collection) {
      const path = require('path')
      return path.join(this.workspaceRootPath, collection.name)
    }
  }
}
</script>
