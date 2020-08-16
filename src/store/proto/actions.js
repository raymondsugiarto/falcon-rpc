import { loadProtos } from '@/utils/proto'
import { LocalStorage } from 'quasar'
import remove from 'lodash/remove'

const fs = require('fs')
const path = require('path')

export function loadExistingProto (context, { collectionPath } ) {
	const protos = LocalStorage.getItem('protos')
	if (protos) {
        let protoLoaded = protos.find(x => x.cpath == collectionPath)
        let protoFileExists = protoLoaded.protos
        // Delete from local storage if not exists
        protoFileExists = remove(protoFileExists, filePath => {
            if (fs.existsSync(filePath)) {
                return true
            }
            context.dispatch('removeProtoLocalStorage', { collectionPath: protoLoaded.cpath, protoFile: filePath })
            return false
        })
        loadProtos(protoFileExists, (protoFiles, e) => {
            if (protoFiles.length > 0) {
                context.commit('ADD_PROTO', {
                    initProto: true,
                    collectionPath: protoLoaded.cpath,
                    protoFiles
                })
            }
        })
	}
}

// currently not used
export function uploadProtoFiles (context, { targetPath }) {
    var app = require('electron').remote; 
    var dialog = app.dialog;

    dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
    }).then(async result => {
        if (!result.canceled) {
            await Promise.all(result.filePaths.map(filePath => {
                    const fileName = filePath.split('/').pop()
                    const dest = path.join(targetPath, fileName)
                    fs.copyFile(filePath, dest, (err) => {
                        if (err) throw err;
                        console.log(filePath + ' was copied to ' + dest);
                    });
                })
            )
            // destination.txt will be created or overwritten by default.
        }
    }).catch(err => {
        console.log(err)
    })
}

export function uploadProtos (context, { onProtoUploaded }) {
    var app = require('electron').remote; 
    var dialog = app.dialog;

    dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
    }).then(async result => {
        if (!result.canceled) {
            loadProtos(result.filePaths, onProtoUploaded)
        }
    }).catch(err => {
        console.log(err)
    })
}

export function removeProtoLocalStorage (state, { collectionPath, protoFile }) {
	let protosStorage = LocalStorage.getItem('protos')
	const idx = protosStorage.findIndex(x => x.cpath === collectionPath)
	if (idx > -1) {
			protosStorage[idx].protos = remove(protosStorage[idx].protos, p => {
					return p != protoFile
			})
			LocalStorage.set('protos', protosStorage)
	}
}
