<template>
  <q-dialog v-model="showDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ $t('service.loadRPCDialogTitle') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div>
          <div
            :key="index"
            v-for="(item, index) in examples"
            @click="handleSelectFile(item)"
          >
            {{ item }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ServiceLoadDialog',
  props: {
    path: {
      type: String,
      default: ""
    }
  },
  data () {
    return {
      rpcFileName: '',
      examples: [],
      showDialog: false,
    }
  },
  methods: {
    loadRPCExample () {
      const examplePath = path.join(this.path, 'example')
      this.$store.dispatch('workspace/loadFiles', {
        path: examplePath,
        onSuccess: files => {
          this.examples = files
        }
      })
    },
    openDialog () {
      this.loadRPCExample()
      this.showDialog = true
    },
    handleSelectFile (file) {
      this.$emit('on-select', file)
      this.showDialog = false
    }
  }
}
</script>