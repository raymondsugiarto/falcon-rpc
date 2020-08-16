<template>
  <q-dialog v-model="showDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ $t('workspace.newCollection') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="collectionName" autofocus @keyup.enter="prompt = false" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat :label="$t('action.cancel')" v-close-popup />
        <q-btn flat :label="$t('action.save')" @click="handleSaveCollection" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'CreateCollectionDialog',
  data () {
    return {
      collectionName: '',
      showDialog: false
    }
  },
  methods: {
    openDialog () {
      this.showDialog = true
    },
    handleSaveCollection () {
      this.$store.dispatch('workspace/createCollection', { collectionName:  this.collectionName })
      this.showDialog = false
    }
  }
}
</script>
