const { default: S } = require('fluent-json-schema')

module.exports = function (instance, _, done) {
  instance.route({
    path: '',
    method: 'GET',
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
    handler: function (request) {
      const { from, to } = request.query
      delete request.query.from
      delete request.query.to

      return instance.prisma.events.filter(
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
        .prop('code', S.number().minimum(0).maximum(255).required())
        .prop('rating_change', S.number().minimum(-128).maximum(127))
        .prop('match', S.string())
        .prop('explanation', S.string().maxLength(200))
        .valueOf(),
    },
    onRequest: function (request, _, done) {
      request.access(instance.roles.ADMIN)
      done()
    },
    handler: function (request, reply) {
      if (request.user.name == request.person.name)
        throw new instance.srs.errors.InvalidSchema(`can't commend yourself`)
      return instance.prisma.create_event(request)
    },
  })

  done()
}
