const { default: S } = require('fluent-json-schema')

module.exports = function (instance, options, done) {
  instance.decorateRequest('record', null)

  instance.addHook('onRequest', check_id)
  function check_id(request, _, done) {
    const { id } = request.params
    if (!isValid(id))
      throw new instance.srs.errors.InvalidSchema('id must be valid ULID')

    instance.prisma.client.verdicts
      .findUnique({
        where: { id },
      })
      .then((record) => {
        if (!record) return void done(new instance.srs.errors.NotExist())
        request.record = record
        done()
      })
      .catch((e) => {
        done(new instance.srs.errors.Internal())
      })
  }

  instance.get('', (request, reply) => {
    return request.record
  })

  instance.patch(
    '',
    {
      schema: {
        query: S.object()
          .prop('explanation', S.string())
          .prop('execution', S.number().minimum(0).maximum(255))
          .prop('duration', S.string())
          .valueOf(),
      },
      preHandler: [instance.srs_validators.duration],
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
