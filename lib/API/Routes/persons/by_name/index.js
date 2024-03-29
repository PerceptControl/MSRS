module.exports = function (instance, options, done) {
  instance.decorateRequest('person', null)
  instance.addHook('onRequest', check_person)
  function check_person(request, _, done) {
    const { name } = request.params
    instance.db.persons
      .get(name)
      .then((person) => {
        if (person) {
          request.person = person
          return void done()
        }

        instance.db.persons.create(name).then((person) => {
          if (!person) return void done(new instance.srs.errors.NotExist())

          request.person = person
          done()
        })
      })
      .catch((e) => {
        done(new instance.srs.errors.Internal())
      })
  }

  instance.get('/rating', function (request, reply) {
    return request.person.rating
  })

  instance.get('/is_fake', function (request, reply) {
    return request.person.fake
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
