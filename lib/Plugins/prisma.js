const { PrismaClient } = require('@prisma/client')
const fp = require('fastify-plugin')
const { ulid, isValid, decodeTime } = require('ulidx')

const client = new PrismaClient()
module.exports = fp((instance, _, done) => {
  client
    .$connect()
    .then(() => {
      instance.decorateRequest('prisma', client)
      instance.decorateRequest('ulid', {
        generate: ulid,
        validate: isValid,
        decode_time: decodeTime,
      })
      done()
    })
    .catch((e) => {
      done(e)
    })
  instance.addHook('onClose', () => {
    instance.client.$disconnect()
  })
})
