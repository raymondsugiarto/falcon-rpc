export function changeViewMode (context) {
  if (context.state.viewMode === 'stream') {
    context.commit('SET_VIEW_MODE', 'column')
  } else {
    context.commit('SET_VIEW_MODE', 'stream')    
  }
}
