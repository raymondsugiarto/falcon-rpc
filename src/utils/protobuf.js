import * as path from 'path'
import get from 'lodash/get'
import { 
    Root,
    Enum,
    Field,
    MapField, Method,
    Namespace,
    OneOf,
    Service,
    Service as ProtoService,
    Type,
} from 'protobufjs'
import { loadPackageDefinition } from '@grpc/grpc-js'
import {load as grpcDef} from '@grpc/proto-loader'
import { v4 as uuidv4 } from 'uuid'
const fs = require('fs')


export async function fromFileName (protoPath, includeDirectories) {
    let includeDirs = includeDirectories ? [...includeDirectories] : []
    
    if (path.isAbsolute(protoPath)) {
        includeDirs.push(
            path.dirname(protoPath)
        );
    } else {
        includeDirs.push(
            path.dirname(path.join(process.cwd(), protoPath))
        );
    }

    const packageDefinition = await grpcDef(path.basename(protoPath), {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs,
    })
    const protoAST = loadPackageDefinition(packageDefinition)
    
    const protoRoot = new Root()
    addIncludePathToRoot(protoRoot, includeDirs)

    const root = await protoRoot.load(protoPath, { keepCase: true })

    // const protoText = await promisifyRead(protoPath)

    return {
        id:  uuidv4(),
        fileName: protoPath.split(path.sep).pop() || '',
        filePath: protoPath,
        // protoText,
        ast: protoAST,
        root,
    }
}

/**
 * Walk through services
 */
export function walkServices(proto, onService) {
    const {ast, root} = proto;
  
    walkNamespace(root, namespace => {
        const nestedNamespaceTypes = namespace.nested;
        if (nestedNamespaceTypes) {
            Object.keys(nestedNamespaceTypes).forEach(nestedTypeName => {
                const fullNamespaceName = (namespace.fullName.startsWith('.'))
                    ? namespace.fullName.replace('.', '')
                    : namespace.fullName;
        
                const nestedType = root.lookup(`${fullNamespaceName}.${nestedTypeName}`);
    
                if (nestedType instanceof Service) {
                    const serviceName = [
                        ...fullNamespaceName.split('.'),
                        nestedType.name
                    ];
    
                    const fullyQualifiedServiceName = serviceName.join('.');
        
                    onService(nestedType, get(ast, serviceName), fullyQualifiedServiceName);
                }
            });
        }
    });
  
    Object.keys(ast)
        .forEach(serviceName => {
            const lookupType = root.lookup(serviceName);
            if (lookupType instanceof Service) {
                // No namespace, root services
                onService(serviceByName(root, serviceName), ast[serviceName], serviceName);
            }
    });
}


export function walkNamespace(root, onNamespace, parentNamespace) {
    const nestedType = (parentNamespace && parentNamespace.nested) || root.nested;
  
    if (nestedType) {
        Object.keys(nestedType).forEach((typeName) => {
            if (parentNamespace && parentNamespace.name === typeName) {
                // TODO: traverse recursively for identical namespace name
                typeName = typeName + '.' + typeName;
            }
            const nestedNamespace = root.lookup(typeName);
            if (nestedNamespace && isNamespace(nestedNamespace)) {
                onNamespace(nestedNamespace);
                walkNamespace(root, onNamespace, nestedNamespace);
            }
        });
    }
}

function addIncludePathToRoot (root, includePaths ) {
    const originalResolvePath = root.resolvePath;
    root.resolvePath = (origin, target) => {
      if (path.isAbsolute(target)) {
        return target;
      }
      for (const directory of includePaths) {
        const fullPath = path.join(directory, target);
        try {
          fs.accessSync(fullPath, fs.constants.R_OK);
          return fullPath;
        } catch (err) {
          continue;
        }
      }
      return originalResolvePath(origin, target);
    };
}

export function promisifyRead (fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function isNamespace(lookupType) {
    if (
        (lookupType instanceof Namespace) &&
        !(lookupType instanceof Service) &&
        !(lookupType instanceof Type) &&
        !(lookupType instanceof Enum) &&
        !(lookupType instanceof Field) &&
        !(lookupType instanceof MapField) &&
        !(lookupType instanceof OneOf) &&
        !(lookupType instanceof Method)
    ) {
        return true;
    }
  
    return false;
}
  
