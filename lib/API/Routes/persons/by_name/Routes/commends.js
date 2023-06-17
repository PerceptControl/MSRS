const { default: S } = require('fluent-json-schema')
const { ulid } = require('ulidx')

module.exports = function (instance, _, done) {
  instance.route({
    path: '',
    method: 'GET',
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
    handler: function (request) {
      return instance.prisma.recommendations.findMany({
        where: { name: request.auth.user.name },
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
    handler: function (request, reply) {
      //если в имя в параметрах(record) совпадает с именем в токене(user)
      if (request.auth.user.name == request.record.name)
        throw new instance.srs.errors.InvalidSchema(`can't commend yourself`)

      return instance.prisma.recommendations
        .create({
          data: {
            id: ulid(),
            Recommender: {
              connect: {
                passport: request.auth.user.name,
              },
            },
            Recommended: {
              connect: {
                passport: request.record.name,
              },
            },
            reasons: request.body.reasons,
            match: request.body.match,
            explanation: request.body.explanation,
          },
          include: { Recommender: true, Recommended: true },
        })
        .then(
          (record) => {
            reply.code(201).send(record.id)
          },
          (e) => reply.send(e),
        )
    },
  })

  done()
}
