<template>
  <div class="left-sidebar">
    <left-navigation />
    <left-content />
  </div>
</template>

<script>
export default {
  name: 'LeftSidebar',
  components: {
    LeftNavigation: () => import('@/components/Navigation/LeftNavigation.vue'),
    LeftContent: () => import('@/components/Navigation/LeftContent.vue')
  }
}
</script>