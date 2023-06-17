module.exports = function (instance, options, done) {
  instance.route({
    path: '',
    method: 'GET',
    handler: function () {
      return instance.db.persons.list()
    },
  })

  instance.register(require('./by_name'), { prefix: '/:name' })

  done()
}
