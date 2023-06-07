const { default: S } = require('fluent-json-schema')

module.exports = function (instance, _, done) {
  const handlers_options = {
    get: {
      schema: {
        query: S.object()
          .prop('code', S.boolean())
          .prop('rating_change', S.boolean())
          .prop('match', S.boolean())
          .prop('explanation', S.boolean())
          .prop('created_at', S.boolean())
          .prop('from', S.string())
          .prop('to', S.string())
          .valueOf(),
      },
      preHandler: [instance.srs_validators.period],
    },

    post: {
      schema: {
        body: S.object()
          .prop('code', S.number().minimum(0).maximum(255).required())
          .prop('rating_change', S.number().minimum(-128).maximum(127))
          .prop('explanation', S.string().maxLength(200))
          .prop('match', S.string())
          .valueOf(),
      },
    },
  }

  instance.get('', handlers_options.get, function (request, reply) {
    return []
  })

  instance.post('', handlers_options.post, function (request, reply) {
    reply.code(201)
    return 'test_id'
  })

  done()
}
