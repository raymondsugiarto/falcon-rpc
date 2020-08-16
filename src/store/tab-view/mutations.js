export function ADD_VISITED_VIEWS (state, view) {
  if (state.visitedViews.some(v => v.fullPath === view.fullPath)) {
    // do nothing
  } else {
    const tempView = {
      name: view.name,
      fullPath: view.fullPath,
      path: view.path,
      meta: { ...view.meta },
      params: { ...view.params },
      query: { ...view.query }
    }
    state.visitedViews.push(tempView)
  }
}

export function ADD_CACHED_VIEWS (state, view) {
  if (state.cachedViews.some(v => v.fullPath === view.fullPath)) {
    // do nothing
  } else {
    const tempView = {
      name: view.name,
      fullPath: view.fullPath,
      path: view.path,
      meta: { ...view.meta },
      params: { ...view.params },
      query: { ...view.query }
    }
    state.cachedViews.push(tempView)
  }
}

export function DELETE_VISITED_VIEW (state, view) {
  for (const [i, v] of state.visitedViews.entries()) {
    if (v.fullPath === view.fullPath) {
      state.visitedViews.splice(i, 1)
      break
    }
  }
}

export function DEL_OTHERS_VISITED_VIEWS (state, view) {
  state.visitedViews = state.visitedViews.filter(v => {
    return v.meta.affix || v.fullPath === view.fullPath
  })
}

export function DEL_ALL_VISITED_VIEWS (state, view) {
  // keep affix tags
  const affixTags = state.visitedViews.filter(tag => tag.meta.affix)
  state.visitedViews = affixTags
}
