const { default: S } = require('fluent-json-schema')
const { isValid } = require('ulidx')

module.exports = function (instance, options, done) {
  instance.get(
    '*',
    {
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
    (request) => {
      return instance.prisma.recommendations.findMany({
        where: {
          reasons: { equals: request.query.reasons },
          recommender: request.query.recommender,
          recommended: request.query.recommended,
          match: request.query.recommended,
          created_at: {
            gt: request.query.from,
            lt: request.query.to,
          },
        },
      })
    },
  )

  instance.decorateRequest('record', null)
  instance.get(
    '/:id',
    {
      onRequest: check_id,
    },
    (request) => {
      return instance.prisma.recommendations.findUnique({
        where: { id: request.params.id },
      })
    },
  )
  function check_id(request, _, done) {
    const { id } = request.params
    if (!isValid(id))
      throw new instance.srs.errors.InvalidSchema('id must be valid ULID')

    instance.prisma.recommendations
      .findUnique({
        where: { id },
      })
      .then((record) => {
        if (!record) done(new instance.srs.errors.NotExist())
        request.record = record
        done()
      })
      .catch((e) => {
        done(new instance.srs.errors.Internal())
      })
  }

  done()
}
