import get from 'lodash/get'

export class ProtoInfo {

  service;
  methodName

  constructor(service, methodName) {
    this.service = service;
    this.methodName = methodName;
  }

  client() {
      return get(this.service.proto.ast, this.service.serviceName);
  }

  serviceDef() {
    return this.service.proto.root.lookupService(this.service.serviceName);
  }

  methodDef() {
    return this.serviceDef().methods[this.methodName];
  }

  isClientStreaming() {
    const method = this.methodDef();
    return method && method.requestStream;
  }

  isServerStreaming() {
    const method = this.methodDef();
    return method && method.responseStream;
  }

  isBiDirectionalStreaming() {
    return this.isClientStreaming() && this.isServerStreaming();
  }

  usesStream() {
    return this.isClientStreaming() || this.isServerStreaming();
  }
}