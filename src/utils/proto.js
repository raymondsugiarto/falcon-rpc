import * as path from 'path'
import { fromFileName, walkServices } from '@/utils/protobuf'
import { mockRequestMethods } from '@/utils/proto-mock'
import { v4 as uuidv4 } from 'uuid'

export async function loadProtos (filePaths, onProtoUploaded, usingMock) {
    try {
        const protoFiles = await Promise.all(filePaths.map(fileName => {
                return fromFileName(fileName, [])
            })
        )
        const protoList = await protoFiles.reduce((list, proto) => {
            // Services with methods
            const services = parseServices(proto, usingMock);
            
            let newProto = proto

            if (!usingMock) {
                newProto = {
                    fileName: proto.fileName,
                    filePath: proto.filePath,
                    protoText: proto.protoText,
                    ast: proto.ast
                }
            }
            const uniqueID = uuidv4()

            // Proto file
            list.push({
                id: uniqueID,
                proto: newProto,
                fileName: proto.fileName.split(path.sep).pop() || "",
                services,
            });
            
            return list;
        }, [])
        onProtoUploaded && onProtoUploaded(protoList, undefined);
        return protoList
    } catch (error) {
        onProtoUploaded && onProtoUploaded([], error);

        if (!onProtoUploaded) {
            throw error;
        }

        return [];
    }
}

/**
 * Parse Grpc services from root
 * @param proto
 */
function parseServices(proto, usingMock) {

    const services = {};
  
    walkServices(proto, (service, _, serviceName) => {
        const mocks = mockRequestMethods(service);

        let newProto = proto

        if (!usingMock) {
            newProto = {
                fileName: proto.fileName,
                filePath: proto.filePath,
                protoText: proto.protoText,
                ast: proto.ast
            }
        }

        const uniqueID = uuidv4()
        services[serviceName] = {
            id: uniqueID,
            serviceName: serviceName,
            proto: newProto,
            methodsMocks: mocks,
            methodsName: Object.keys(mocks),
        };
    });
  
    return services;
}