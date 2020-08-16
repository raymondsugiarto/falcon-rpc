
const mainLayout = () => import('layouts/MainLayout.vue')
const indexPage = () => import('pages/IndexPage.vue')
const servicePage = () => import('pages/ServicePage.vue')

const routes = [
  {
    path: '/',
    component: mainLayout,
    children: [
      { path: '', component:  indexPage},
    ]
  },
  {
    path: '/service',
    component: mainLayout,
    children: [
      { name: 'service', path: '/service', component:  servicePage, meta: { affix: false, customTitle: true }}
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
