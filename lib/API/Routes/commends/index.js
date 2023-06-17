const { default: S } = require('fluent-json-schema')

module.exports = function (instance, options, done) {
  instance.route({
    path: '',
    method: 'GET',
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
    handler: function (request) {
      const { from, to } = request.query
      delete request.query.from
      delete request.query.to

      return instance.db.commends.search({ from, to }, request.query)
    },
  })

  instance.route({
    path: '/:id',
    method: 'GET',
    onRequest: function (request, reply, done) {
      instance.db.commends.get(request.params.id).then((commend) => {
        if (!commend) done(new instance.srs.errors.NotExist())
        reply.send(commend)
      })
    },
    handler: function () {},
  })

  done()
}
