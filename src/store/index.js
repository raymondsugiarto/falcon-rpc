import Vue from 'vue'
import Vuex from 'vuex'

import workspace from './workspace'
import tabView from './tab-view'
import proto from './proto'
import falcon from './falcon'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      workspace,
      tabView,
      proto,
      falcon
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
