const { PrismaClient } = require('@prisma/client')
const fp = require('fastify-plugin')

const client = new PrismaClient()
module.exports = fp((instance, _, done) => {
  client
    .$connect()
    .then(() => {
      instance.decorate('prisma', client)
      done()
    })
    .catch((e) => {
      done(e)
    })
  instance.addHook('onClose', () => {
    instance.client.$disconnect()
  })
})
