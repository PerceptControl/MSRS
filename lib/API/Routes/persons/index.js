module.exports = function (instance, options, done) {
  instance.get('', (request, reply) => {
    return []
  })

  instance.register(require('./by_name'), { prefix: '/:name' })

  done()
}
