const fp = require('fastify-plugin')

module.exports = fp(function (instance, _, done) {
  instance.register(require('./settings'))
  instance.register(require('./validation_decorators'))
  done()
})
