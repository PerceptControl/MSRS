module.exports = function (instance, options, done) {
  instance.get('', (request, reply) => {
    return instance.prisma.persons.findAll().catch((e) => {
      console.error(e)
      throw instance.srs.errors.Internal
    })
  })

  instance.register(require('./by_name'), { prefix: '/:name' })

  done()
}
