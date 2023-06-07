const { default: S } = require('fluent-json-schema')

module.exports = function (instance, _, done) {
  const handlers_options = {
    get: {
      schema: {
        query: S.object()
          .prop('reasons', S.boolean())
          .prop('explanation', S.boolean())
          .prop('match', S.boolean())
          .prop('from', S.string())
          .prop('to', S.string())
          .valueOf(),
      },
      preHandler: [instance.srs_validators.period],
    },

    post: {
      schema: {
        body: S.object()
          .prop(
            'reasons',
            S.array()
              .items(S.number().minimum(0).maximum(255))
              .uniqueItems(true)
              .required(),
          )
          .prop('match', S.string())
          .prop('explanation', S.string().maxLength(200))
          .valueOf(),
      },
      preHandler: [instance.srs_validators.reasons],
    },
  }

  instance.get('', handlers_options.get, function (request, reply) {
    return []
  })

  instance.post('', handlers_options.post, function (request, reply) {
    const { name } = request.params
    reply.code(201)
    return 'test_id'
  })

  done()
}
