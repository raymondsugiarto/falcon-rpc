import { LocalStorage } from 'quasar'

const fs = require('fs')
const path = require('path')
const remote = require('electron').remote
const app = remote.app

export function initFalconDir (context) {
  const falconPath = path.join(app.getPath('userData'), context.state.falconDir)
  console.log('Falcon Initialize:' + falconPath)
  context.dispatch('createDir', falconPath)
  context.commit('SET_FALCON_PATH', falconPath)
  context.commit('SET_FIRST_RUN', true)
  LocalStorage.set('fcpath', falconPath)
  context.dispatch('createWorkspace')
}

export function createWorkspace (context) {
  const workspaceRootPath = path.join(context.state.falconPath, context.state.workspaceRootDir)
  context.commit('SET_WORKSPACE_ROOT_PATH', workspaceRootPath)
  context.dispatch('createDir', workspaceRootPath)
  LocalStorage.set('wrootpath', workspaceRootPath)
  console.log('Falcon Initialize:' + workspaceRootPath)
}

export function createCollection (context, { rootPath, collectionName }) {
  let currentPath = rootPath
  if (!currentPath) {
    currentPath = context.state.workspaceRootPath
  }
  const workspacePath = path.join(currentPath, collectionName)
  context.dispatch('createDir', workspacePath)
  console.log('Create Dir:' + workspacePath)
  context.dispatch('loadCollection', { currentPath, collectionName })
}

export async function loadCollection (context, { currentPath, collectionName, onSuccess }) {
  let targetPath = context.state.workspaceRootPath
  if (currentPath) {
    targetPath = currentPath
  }
  const dirs = fs.readdirSync(targetPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  context.commit('ADD_WORKSPACE', { targetPath, collectionName, dirs  })
  onSuccess && onSuccess(dirs)
}

export async function loadFiles (context, { path, onSuccess }) {
  const files = fs.readdirSync(path, { withFileTypes: true })
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name)
  onSuccess(files)
}

export function createDir (context, payload) {
  if (!fs.existsSync(payload)){
    fs.mkdirSync(payload)
  }
}

