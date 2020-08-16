<template>
  <q-page padding class="bg-blue-grey-2">
    <service />
  </q-page>
</template>

<script>
export default {
  name: 'ServicePage',
  components: {
    Service: () => import('@/components/Service/Service.vue')
  }
}
</script>
