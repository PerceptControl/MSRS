const { default: S } = require('fluent-json-schema')
const { isValid } = require('ulidx')

module.exports = function (instance, options, done) {
  instance.decorateRequest('record', null)

  instance.addHook('onRequest', check_id)
  function check_id(request, _, done) {
    const { id } = request.params
    if (!isValid(id))
      throw new instance.srs.errors.InvalidSchema('id must be valid ULID')
    instance.prisma.events
      .findUnique({
        where: { id },
      })
      .then((record) => {
        if (!record) done(new instance.srs.errors.NotExist())
        request.record = record
        done()
      })
      .catch((e) => {
        done(new instance.srs.errors.Internal())
      })
  }

  instance.get('', (request, reply) => {
    return { test: true }
  })

  instance.patch(
    '',
    {
      schema: {
        query: S.object()
          .prop('code', S.number().minimum(0).maximum(255))
          .prop('change', S.number().minimum(-128).maximum(127))
          .prop('match', S.string())
          .prop('explanation', S.string())
          .valueOf(),
      },
    },
    (request, reply) => {
      reply.code(202)
      return null
    },
  )

  instance.delete('', (request, reply) => {
    reply.code(203)
    return null
  })

  done()
}
