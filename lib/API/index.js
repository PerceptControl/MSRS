module.exports = function (instance, options, done) {
  instance.addHook('onRequest', instance.auth)

  instance.register(require('./Routes/persons'), { prefix: '/persons' })
  instance.register(require('./Routes/reports'), { prefix: '/reports' })
  instance.register(require('./Routes/commends'), { prefix: '/commends' })
  instance.register(require('./Routes/events'), { prefix: '/events' })
  instance.register(require('./Routes/verdicts'), { prefix: '/verdicts' })

  instance.setErrorHandler((error, request, reply) => {
    if (error.statusCode) reply.code(error.statusCode)
    return error.message
  })
  done()
}
