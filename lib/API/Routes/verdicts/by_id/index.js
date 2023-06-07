const { default: S } = require('fluent-json-schema')

module.exports = function (instance, options, done) {
  instance.addHook('onRequest', instance.srs_hooks.api.verdicts.check_id)
  const handlers_options = {
    patch: {
      schema: {
        query: S.object()
          .prop('explanation', S.string())
          .prop('execution', S.number().minimum(0).maximum(255))
          .prop('duration', S.string())
          .valueOf(),
      },
      preHandler: [instance.srs_validators.duration],
    },
  }

  instance.get('', (request, reply) => {
    return { test: true }
  })

  instance.patch('', handlers_options.patch, (request, reply) => {
    reply.code(202)
    return null
  })

  instance.delete('', (request, reply) => {
    reply.code(203)
    return null
  })

  done()
}
