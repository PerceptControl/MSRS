const { default: S } = require('fluent-json-schema')

module.exports = function (instance, options, done) {
  instance.addHook('onRequest', instance.srs_hooks.api.events.check_id)
  const handlers_options = {
    patch: {
      schema: {
        query: S.object()
          .prop('code', S.number().minimum(0).maximum(255))
          .prop('change', S.number().minimum(-128).maximum(127))
          .prop('match', S.string())
          .prop('explanation', S.string())
          .valueOf(),
      },
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
