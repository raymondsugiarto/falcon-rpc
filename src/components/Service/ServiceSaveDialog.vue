<template>
  <q-dialog v-model="showDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ $t('service.saveRPCDialogTitle') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="rpcFileName" autofocus @keyup.enter="prompt = false" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat :label="$t('action.cancel')" v-close-popup />
        <q-btn flat :label="$t('action.save')" @click="handleSaveRPCToFile" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ServiceSaveDialog',
  data () {
    return {
      rpcFileName: '',
      showDialog: false
    }
  },
  methods: {
    openDialog () {
      this.showDialog = true
    },
    handleSaveRPCToFile () {
      if (this.rpcFileName.toLowerCase() === 'example') {
        this.$q.notify({
          message: this.$t('service.reservedName', { reservedName: this.rpcFileName }),
          color: 'red'
        })
      } else {
        this.$emit('on-save', this.rpcFileName)
        this.showDialog = false
      }
    }
  }
}
</script>