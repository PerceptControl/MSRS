const Ajv = require('ajv').default
const fp = require('fastify-plugin')

const schemaCompilers = {
  body: new Ajv({
    removeAdditional: false,
    coerceTypes: false,
    allErrors: true,
  }),
  params: new Ajv({
    removeAdditional: false,
    coerceTypes: false,
    allErrors: true,
  }),
  querystring: new Ajv({
    removeAdditional: false,
    coerceTypes: true,
    allErrors: true,
  }),
  headers: new Ajv({
    removeAdditional: false,
    coerceTypes: true,
    allErrors: true,
  }),
}

module.exports = fp(function (instance, _, done) {
  instance.setValidatorCompiler((req) => {
    if (!req.httpPart) {
      throw new Error('Missing httpPart')
    }
    const compiler = schemaCompilers[req.httpPart]
    if (!compiler) {
      throw new Error(`Missing compiler for ${req.httpPart}`)
    }
    return compiler.compile(req.schema)
  })
  instance.setSchemaErrorFormatter((errors, type) => {
    let message = ''
    for (let error of errors)
      error.instancePath.length > 0
        ? (message += `${error.instancePath.split('/')[1]} ${error.message};`)
        : (message += `${error.message};`)
    return new instance.schema_error(message)
  })
  done()
})
