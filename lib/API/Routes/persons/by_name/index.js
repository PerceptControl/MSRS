module.exports = function (instance, options, done) {
  instance.decorateRequest('record', null)
  instance.addHook('onRequest', check_person)
  function check_person(request, _, done) {
    const { name } = request.params
    instance.prisma.persons
      .findUnique({
        where: { name },
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

  instance.get('/rating', function (request, reply) {
    return request.record.rating
  })

  instance.get('/is_fake', function (request, reply) {
    return request.record.fake
  })

  instance.register(require('./Routes/verdicts'), {
    prefix: '/verdicts',
  })
  instance.register(require('./Routes/events'), {
    prefix: '/events',
  })
  instance.register(require('./Routes/reports'), {
    prefix: '/reports',
  })
  instance.register(require('./Routes/commends'), {
    prefix: '/commends',
  })

  done()
}
