const { default: S } = require('fluent-json-schema')
const { ulid } = require('ulidx')

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

      return instance.prisma.recommendations.findMany({
        where: {
          recommended: request.person.name,
          created_at: {
            gt: from,
            lt: to,
          },
        },
        select: {
          id: true,
          ...request.query,
        },
      })
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
    handler: function (request, reply) {
      if (request.user.name == request.person.name)
        throw new instance.srs.errors.InvalidSchema(`can't commend yourself`)

      return instance.prisma.recommendations
        .create({
          data: {
            id: ulid(),
            Recommender: {
              connect: {
                passport: request.user.name,
              },
            },
            Recommended: {
              connect: {
                passport: request.person.name,
              },
            },
            reasons: request.body.reasons,
            match: request.body.match,
            explanation: request.body.explanation,
          },
          include: { Recommender: true, Recommended: true },
        })
        .then(
          (commend) => {
            reply.code(201).send(commend.id)
          },
          (e) => reply.send(e),
        )
    },
  })

  done()
}
