const { default: S } = require('fluent-json-schema')

module.exports = function (instance, options, done) {
  const handlers_options = {
    search: {
      schema: {
        query: S.object()
          .prop('user', S.string())
          .prop('code', S.number().minimum(0).maximum(255))
          .prop('match', S.string())
          .prop('from', S.string())
          .prop('to', S.string())
          .valueOf(),
      },
      preHandler: [
        instance.srs_validators.reasons,
        instance.srs_validators.period,
      ],
    },
  }

  instance.get('*', handlers_options.search, (request, reply) => {
    return []
  })

  instance.register(require('./by_id'), { prefix: '/:id' })

  done()
}
