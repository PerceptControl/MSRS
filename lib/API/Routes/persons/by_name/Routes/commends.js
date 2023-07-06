const { default: S } = require('fluent-json-schema')

module.exports = function (instance, _, done) {
  instance.route({
    path: '',
    method: 'GET',
    schema: {
      query: S.object()
        .prop('recommender', S.boolean())
        .prop('reasons', S.boolean())
        .prop('explanation', S.boolean())
        .prop('match', S.boolean())
        .prop('from', S.string())
        .prop('to', S.string())
        .valueOf(),
    },
    preHandler: [instance.srs_validators.period],
    handler: function (request) {
      const { from, to } = request.query
      delete request.query.from
      delete request.query.to

      return instance.db.commends.filter(
        { from, to },
        request.query,
        request.person,
      )
    },
  })

  instance.route({
    path: '',
    method: 'POST',
    schema: {
      body: S.object()
        .prop(
          'reasons',
          S.array()
            .items(S.number().minimum(0).maximum(255))
            .uniqueItems(true)
            .required(),
        )
        .prop('match', S.string().required())
        .prop('explanation', S.string().maxLength(200))
        .valueOf(),
    },
    onRequest: function (request, _, done) {
      request.access(instance.roles.USER)
      done()
    },
    handler: async function (request, reply) {
      if (request.user.name == request.person.name)
        throw new instance.srs.errors.InvalidSchema(`can't commend yourself`)

      const action = {
        recommender: request.user.name,
        recommended: request.person.name,
        ...request.body,
      }

      await instance.analyze.commend(action)

      const id = await instance.db.commends.create(action)
      reply.code(201)
      return id
    },
  })

  done()
}
