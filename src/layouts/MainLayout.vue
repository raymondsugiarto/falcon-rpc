<template>
  <q-layout view="hHh Lpr fFf">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
        <q-space />
        <q-toolbar-title>
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar> -->
          FalconRPC
        </q-toolbar-title>

        <!-- <q-btn dense flat round icon="menu" @click="right = !right" /> -->
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="left"
      :width="350"
      :breakpoint="500"
      bordered
      content-class="bg-grey-3"
    >
      <left-sidebar />
    </q-drawer>

    <!-- <q-drawer show-if-above v-model="right" side="right" bordered>
      drawer content
    </q-drawer> -->
    <q-footer>
      <div class="q-pa-sm text-right">
        <q-btn
          icon="view_stream"
          size="sm"
          :class="viewMode === 'stream' ? '' : 'rotate-90'"
          round
          flat
          @click="handleChangeViewMode"
        />
      </div>
    </q-footer>

    <q-page-container class="bg-grey-1">
      <tab-view-list /> 
      <router-view :key="$route.fullPath"/>
    </q-page-container>

  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'MainLayout',
  components: {
    LeftSidebar: () => import('@/layouts/Sidebar/LeftSidebar.vue'),
    TabViewList: () => import('@/components/Navigation/TabViewList.vue')
  },
  data () {
    return {
      left: true,
      right: false
    }
  },
  computed: {
    ...mapGetters({
      viewMode: 'falcon/getViewMode'
    })
  },
  methods: {
    handleChangeViewMode () {
      this.$store.dispatch('falcon/changeViewMode')
    }
  }
}
</script>
