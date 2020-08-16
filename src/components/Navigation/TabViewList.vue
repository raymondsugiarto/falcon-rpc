<template>
  <q-scroll-area
    horizontal
    style="height: 49px; width: 100%;"
    class="q-px-md q-pt-sm bg-white"
  >
    <q-chip
      v-for="(view, index) in visitedViews"
      :key="index"
      color="green-5"
      :outline="!isActive(view)"
      dark
      ripple
      :removable="!view.meta.affix"
      square
      :clickable="!isActive(view)"
      @click="onOpenTabView(view)"
      @remove="onRemoveTabView(view)"
    >
      {{ pageTitle(view) }}
      <q-menu
        v-if="!view.meta.affix"
        touch-position
        context-menu
      >
        <q-list dense style="min-width: 100px">
          <q-item clickable v-close-popup @click="onRefreshTabView(view)">
            <q-item-section>{{ $t('action.refresh') }}</q-item-section>
          </q-item>
        </q-list>
        <q-list dense style="min-width: 100px">
          <q-item clickable v-close-popup @click="onRemoveTabView(view)">
            <q-item-section>{{ $t('action.close') }}</q-item-section>
          </q-item>
        </q-list>
        <q-list dense style="min-width: 100px">
          <q-item clickable v-close-popup @click="onCloseOtherTabViews(view)">
            <q-item-section>{{ $t('action.closeOther') }}</q-item-section>
          </q-item>
        </q-list>
        <q-list dense style="min-width: 100px">
          <q-item clickable v-close-popup @click="onCloseAllTabViews(view)">
            <q-item-section>{{ $t('action.closeAll') }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-chip>
  </q-scroll-area>
</template>

<script>
import path from 'path'
import { mapState } from 'vuex'
import routes from '@/router/routes'

export default {
  name: 'TabViewList',
  computed: {
    ...mapState({
      'tabView': state => state['tabView']
    }),
    visitedViews () {
      return this.tabView.visitedViews
    },
    routes () {
      return routes
    }
  },
  data () {
    return {
      affixTags: []
    }
  },
  watch: {
    $route (to, from) {
      this.addTab()
    }
  },
  mounted () {
    this.initTab()
    this.addTab()
  },
  methods: {
    pageTitle (view) {
      if (view.meta.customTitle) {
        const { query } = view
        return query.method
      }
      return this.$t(`route.${view.meta.title}`)
    },
    initTab () {
      this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of this.affixTags) {
        // Must have tag name
        if (tag.name) {
          this.$store.dispatch('tabView/addVisitedTabView', tag)
        }
      }
    },
    filterAffixTags (routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const childTags = this.filterAffixTags(route.children, route.path)
          if (childTags.length >= 1) {
            tags = [...tags, ...childTags]
          }
        }
      })
      return tags
    },
    addTab () {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tabView/addTabView', this.$route)
      }
      return false
    },
    onRemoveTabView (view) {
      this.$store.dispatch('tabView/delTabView', view)
      if (this.isActive(view)) {
        this.toLastView(view)
      }
    },
    isActive (route) {
      return route.fullPath === this.$route.fullPath
    },
    onOpenTabView (view) {
      if (!this.isActive(view)) {
        this.$router.push(view)
      }
    },
    onCloseOtherTabViews (view) {
      if (!this.isActive(view)) {
        this.$router.push(view)
      }
      this.$store.dispatch('tabView/delOthersTabViews', view)
    },
    onCloseAllTabViews (view) {
      this.$store.dispatch('tabView/delAllTabViews', view)
      this.toLastView(view)
    },
    toLastView (view) {
      const latestView = this.visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView)
      } else {
        // Default redirect to the home page if there is no tags-view, adjust it if you want
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    onRefreshTabView (view) {
      const { fullPath } = view
      this.$nextTick(() => {
        this.$router.replace({
          path: '/redirect' + fullPath
        })
      })
    }
  }
}
</script>
