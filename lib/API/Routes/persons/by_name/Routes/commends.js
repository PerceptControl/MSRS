const { default: S } = require('fluent-json-schema')
const { ulid } = require('ulidx')

module.exports = function (instance, _, done) {
  instance.get(
    '',
    {
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
    function (request, reply) {
      return []
    },
  )

  instance.post(
    '',
    {
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
    },
    async function (request, reply) {
      //если в имя в параметрах(record) совпадает с именем в токене(user)
      // if (request.user.name == request.record.name)
      //   throw new instance.srs.errors.InvalidSchema(`can't commend yourself`)

      reply.code(201)
      return (
        await instance.prisma.recommendations.create({
          data: {
            id: ulid(),
            Recommender: {
              connect: {
                passport: request.user.name,
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
      ).id
    },
  )

  done()
}
