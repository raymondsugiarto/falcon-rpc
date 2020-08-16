import cloneDeep from "lodash/cloneDeep"
import uniq from "lodash/uniq"
import sortedUniq from "lodash/sortedUniq"

export function SET_FIRST_RUN (state, payload) {
  state.firstRun = payload
}

export function SET_FALCON_PATH (state, payload) {
  state.falconPath = payload
}

export function SET_WORKSPACE_ROOT_DIR (state, payload) {
  state.workspaceRootDir = payload
}

export function SET_WORKSPACE_ROOT_PATH (state, payload) {
  state.workspaceRootPath = payload
}

export function SET_WORKSPACE_DIR (state, payload) {
  state.workspaceDir = payload
}

export function SET_WORKSPACE_PATH (state, payload) {
  state.workspacePath = payload
}

export function ADD_WORKSPACE (state, { targetPath, collectionName, dirs }) {
  const temp = cloneDeep(state.collections)
  const idx = temp.findIndex(x => x.path === targetPath)
  if (idx > -1) {
    temp[idx].dirs = [...temp[idx].dirs, ...dirs] 
    temp[idx].dirs = uniq(temp[idx].dirs).sort()
  } else {
      temp.push({
          path: targetPath,
          name: collectionName,
          dirs: dirs
      })
  }
  state.collections = Object.assign([], temp)
}