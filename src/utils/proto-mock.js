import * as uuid from 'uuid'
import { 
  Enum,
  MapField,
  Service as ProtoService,
  Type,
} from 'protobufjs'

const MethodType = {
  REQUEST: 'request',
  RESPONSE: 'response'
}

/**
 * Mock methods request
 */
export function mockRequestMethods(service, mocks) {
  return mockMethodReturnType(
      service,
      MethodType.REQUEST,
      mocks
  );
}

function mockMethodReturnType(service, type, mocks) {
  const root = service.root;
  const serviceMethods = service.methods;

  return Object.keys(serviceMethods).reduce((methods, method) => {
      const serviceMethod = serviceMethods[method];
  
      const methodMessageType = type === MethodType.REQUEST
          ? serviceMethod.requestType
          : serviceMethod.responseType;
  
      const messageType = root.lookupType(methodMessageType);

      methods[method] = () => {
          let data = {};
          if (!mocks) {
            data = mockTypeFields(messageType);
          }
          return {plain: data, message: messageType.fromObject(data)};
      };

    return methods;
  }, {});
}

/**
* Mock a field type
*/
function mockTypeFields(type) {
  const fieldsData = {};

  return type.fieldsArray.reduce((data, field) => {
    field.resolve();

    if (field.parent !== field.resolvedType) {
      if (field.repeated) {
        data[field.name] = [mockField(field)];
      } else {
        data[field.name] = mockField(field);
      }
    }

    return data;
  }, fieldsData);
}

/**
 * Mock a field
 */
function mockField(field) {
  if (field instanceof MapField) {
    let mockPropertyValue = null;
    if (field.resolvedType === null) {
      mockPropertyValue = mockScalar(field.type, field.name);
    }

    if (mockPropertyValue === null) {
      const resolvedType = field.resolvedType;

      if (resolvedType instanceof Type) {
        if (resolvedType.oneofs) {
          mockPropertyValue = pickOneOf(resolvedType.oneofsArray);
        } else {
          mockPropertyValue = mockTypeFields(resolvedType);
        }
      } else if (resolvedType instanceof Enum) {
        mockPropertyValue = mockEnum(resolvedType);
      } else if (resolvedType === null) {
        mockPropertyValue = {};
      }
    }

    return {
      [mockScalar(field.keyType, field.name)]: mockPropertyValue,
    };
  }

  if (field.resolvedType instanceof Type) {
    return mockTypeFields(field.resolvedType);
  }

  if (field.resolvedType instanceof Enum) {
    return mockEnum(field.resolvedType);
  }

  const mockPropertyValue = mockScalar(field.type, field.name);

  if (mockPropertyValue === null) {
    const resolvedField = field.resolve();

    return mockField(resolvedField);
  } else {
    return mockPropertyValue;
  }
}

function pickOneOf(oneofs) {
  return oneofs.reduce((fields, oneOf) => {
    fields[oneOf.name] = mockField(oneOf.fieldsArray[0]);
    return fields;
  }, {});
}

function mockScalar(type, fieldName) {
  switch (type) {
  case 'string':
    return interpretMockViaFieldName(fieldName);
  case 'number':
    return 10;
  case 'bool':
    return true;
  case 'int32':
    return 10;
  case 'int64':
    return 20;
  case 'uint32':
    return 100;
  case 'uint64':
    return 100;
  case 'sint32':
    return 100;
  case 'sint64':
    return 1200;
  case 'fixed32':
    return 1400;
  case 'fixed64':
    return 1500;
  case 'sfixed32':
    return 1600;
  case 'sfixed64':
    return 1700;
  case 'double':
    return 1.4;
  case 'float':
    return 1.1;
  case 'bytes':
    return new Buffer('Hello');
  default:
    return null;
  }
}

/**
 * Tries to guess a mock value from the field name.
 * Default Hello.
 */
function interpretMockViaFieldName(fieldName) {
  const fieldNameLower = fieldName.toLowerCase();

  if (fieldNameLower.startsWith('id') || fieldNameLower.endsWith('id')) {
    return uuid.v4();
  }

  return 'Hello';
}
