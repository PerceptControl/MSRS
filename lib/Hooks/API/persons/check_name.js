const { ServiceError } = require('../../../Plugins/errors')

module.exports = (request, reply, done) => {
  const { name } = request.params

  if (Math.random() <= 0.5) done(new ServiceError(402))
  done()
}
