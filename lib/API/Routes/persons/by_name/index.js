module.exports = function (instance, options, done) {
  instance.addHook('onRequest', instance.srs_hooks.api.persons.check_name)

  instance.get('/rating', function (request, reply) {
    return Math.floor(Math.random() * (1500 - 100) + 100)
  })

  instance.get('/is_fake', function (request, reply) {
    return Math.random() >= 0.5
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
