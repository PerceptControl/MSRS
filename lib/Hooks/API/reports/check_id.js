const { isValid } = require('ulidx')
const { ServiceError, SchemaError } = require('../../../Plugins/errors')

module.exports = (request, reply, done) => {
  const id = request.params.id
  if (!isValid(id)) done(new SchemaError('id must be ulid'))
  console.log(request.routerPath, 'reports')
  if (Math.random() <= 0.5) done(new ServiceError(402))
  done()
}
