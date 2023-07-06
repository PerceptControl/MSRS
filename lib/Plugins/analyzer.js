const fastifyPlugin = require('fastify-plugin')
const Manager = require('../Analyzer/lib/Manager')

module.exports.default = fastifyPlugin((instance, _, done) => {
  instance.decorate('analyze', Manager)
  done()
})
