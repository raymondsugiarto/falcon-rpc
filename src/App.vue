<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters([
      'workspace/isFirstRun',
    ])
  },
  mounted () {
    if (!this.isFirstRun) {
      this.$store.dispatch('workspace/initFalconDir')
    }
  }
}
</script>
