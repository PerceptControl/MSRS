const { default: S } = require('fluent-json-schema')

module.exports = function (instance, options, done) {
  instance.get(
    '*',
    {
      schema: {
        query: S.object()
          .prop('reasons', S.string())
          .prop('accuser', S.string())
          .prop('accused', S.string())
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
    (request, reply) => {
      return instance.prisma.reports.findAll().catch((e) => {
        done(new instance.srs.errors.Internal())
      })
    },
  )

  instance.decorateRequest('record', null)

  instance.get(
    '/:id',
    {
      onRequest: check_id,
    },
    (request, reply) => {
      return { test: true }
    },
  )
  function check_id(request, _, done) {
    const { id } = request.params
    if (!isValid(id))
      throw new instance.srs.errors.InvalidSchema('id must be valid ULID')

    instance.prisma.reports
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
