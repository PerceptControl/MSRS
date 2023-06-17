module.exports = function (instance, options, done) {
  instance.route({
    path: '*',
    method: 'GET',
    handler: function () {
      return instance.prisma.persons.findMany()
    },
  })

  instance.register(require('./by_name'), { prefix: '/:name' })

  done()
}
