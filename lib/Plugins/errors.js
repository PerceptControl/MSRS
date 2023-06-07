const fp = require('fastify-plugin')

module.exports.ServiceError = class ServiceError extends Error {
  error_codes = new Map([
    [400, 'Invalid Schema'],
    [401, 'Invalid Token'],
    [402, 'Not Exist'],
    [403, 'Locked'],
    [404, 'Not Found'],
  ])
  constructor(code, message = null) {
    super('Service Error')
    this.statusCode = code
    if (!message) this.message = this.error_codes.get(code) ?? 'Unknown Error'
    else this.message = message
  }
}

module.exports.SchemaError = class SchemaError extends (
  module.exports.ServiceError
) {
  constructor(message) {
    super(400, message)
  }
}

module.exports.default = fp(function (instance, _, done) {
  instance.decorate('service_error', module.exports.ServiceError)
  instance.decorate('schema_error', module.exports.SchemaError)
  done()
})
