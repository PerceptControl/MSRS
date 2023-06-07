require('dotenv').config()
const server = require('fastify')({
  logger: true,
})

server.register(require('./Plugins/errors'))
server.register(require('./Plugins/authenticate'))
server.register(require('./Plugins/validation_schema'))
server.register(require('./Hooks'))
server.register(require('./API'))
server.setNotFoundHandler((request, reply) => {
  reply.code(404)
  return 'Not Found'
})
server.setErrorHandler((error, request, reply) => {
  reply.code(500)
  return 'Internal Error'
})

server.listen(
  { port: process.env.PORT_HTTP, host: '0.0.0.0' },
  (err, address) => {
    if (err) {
      server.log.error(err)
      process.exit(1)
    }
  },
)
