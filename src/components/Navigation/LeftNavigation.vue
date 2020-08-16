<template>
  <q-toolbar class="left-navigation bg-white shadow-3 q-mb-sm">
    <q-btn
      :label="$t('workspace.createCollection')"
      @click="handleCreateNewCollection"
      icon="add"
      class="bg-blue full-width"
      flat no-caps
    />
    <create-collection-dialog ref="dialog"/>
    <!-- <q-space /> -->
    <!-- <q-btn
      :label="$t('action.upload')"
      @click="handleUploadFile"
      class="bg-green"
      icon="fas fa-file-upload"
      flat no-caps
    /> -->
  </q-toolbar>
</template>

<script>
export default {
  name: 'LeftNavigation',
  components: {
    CreateCollectionDialog: () => import('@/components/Workspace/CreateCollectionDialog.vue')
  },
  methods: {
    handleCreateNewCollection () {
      this.$refs.dialog.openDialog()
    },
    handleUploadFile (directory) {
      this.$store.dispatch('proto/uploadProtos', {
        onProtoUploaded: (protoFiles, e) => {
          if (!e) {
            this.protos = protoFiles
            this.$store.commit('proto/ADD_PROTO', protoFiles)
          }
        }
      })  
    },
  }
}
</script>