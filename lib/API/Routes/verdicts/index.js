const { default: S } = require('fluent-json-schema')

module.exports = function (instance, options, done) {
  const handlers_options = {
    search: {
      schema: {
        query: S.object()
          .prop('user', S.string())
          .prop('explanation', S.string().maxLength(200))
          .prop('report', S.string())
          .prop('execution', S.number().minimum(0).maximum(255))
          .prop('duration', S.string())
          .prop('from', S.string())
          .prop('to', S.string())
          .valueOf(),
      },
      preHandler: [
        instance.srs_validators.period,
        instance.srs_validators.duration,
      ],
    },
  }

  instance.get('*', handlers_options.search, (request, reply) => {
    return []
  })

  instance.register(require('./by_id'), { prefix: '/:id' })

  done()
}
