export function addTabView (context, payload) {
  context.commit('ADD_VISITED_VIEWS', payload)
}

export function addVisitedTabView (context, payload) {
  context.commit('ADD_VISITED_VIEWS', payload)
}

export function delTabView (context, payload) {
  context.commit('DELETE_VISITED_VIEW', payload)
}

export function delOthersTabViews (context, payload) {
  context.commit('DEL_OTHERS_VISITED_VIEWS', payload)
}

export function delAllTabViews (context, payload) {
  context.commit('DEL_ALL_VISITED_VIEWS', payload)
}
