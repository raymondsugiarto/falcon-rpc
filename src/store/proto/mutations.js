import cloneDeep from "lodash/cloneDeep"
// import uniq from "lodash/uniq"
import { LocalStorage } from 'quasar'

export function SET_PROTOS (state, payload) {
    state.protos = payload
}

export function ADD_PROTO (state, { collectionPath, protoFiles, initProto }) {
    const tempProtos = cloneDeep(state.protos)
    const protoIndex = tempProtos.findIndex(x => x.cpath === collectionPath)
    if (protoIndex > -1) {
        tempProtos[protoIndex].protos = [...tempProtos[protoIndex].protos, ...protoFiles] 
    } else {
        tempProtos.push({
            cpath: collectionPath,
            protos: protoFiles
        })
    }
    state.protos = Object.assign([], tempProtos)

    // skip save to storage if first load page
    if (!initProto) {
        const filePaths = protoFiles.map(x => x.proto.filePath)
        let protosStorage = LocalStorage.getItem('protos')
        if (!protosStorage) {
            protosStorage = []
        }
        const idx = protosStorage.findIndex(x => x.cpath === collectionPath)
        if (idx > -1) {
            protosStorage[idx].protos = [...protosStorage[idx].protos, ...filePaths]
            // protosStorage[idx].protos = uniq(protosStorage[idx].protos)
        } else {
            protosStorage.push({
                cpath: collectionPath,
                protos: filePaths
            })
        }
        LocalStorage.set('protos', protosStorage)
    }
}

export function REMOVE_PROTO (state, { collectionPath }) {
    const tempProtos = cloneDeep(state.protos)
    const protoIndex = state.protos.findIndex(x => x.cpath === collectionPath)
    if (protoIndex > -1) {
        console.log(collectionPath)
        tempProtos[protoIndex].protos = []
        state.protos = Object.assign([], tempProtos)
    }
}
