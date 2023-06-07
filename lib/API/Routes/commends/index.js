const { default: S } = require('fluent-json-schema')

module.exports = function (instance, options, done) {
  const handlers_options = {
    search: {
      schema: {
        query: S.object()
          .prop('reasons', S.string())
          .prop('recommender', S.string())
          .prop('recommended', S.string())
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
    get_id: {
      preHandler: [instance.srs_hooks.api.commends.check_id],
    },
  }

  instance.get('*', handlers_options.search, (request, reply) => {
    return []
  })

  instance.get('/:id', handlers_options.get_id, (request, reply) => {
    return { test: true }
  })

  done()
}
