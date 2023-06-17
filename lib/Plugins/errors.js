const fp = require('fastify-plugin')

class ServiceError extends Error {
  error_codes = new Map([
    ['Invalid Schema', 400],
    ['Invalid Token', 401],
    ['Not Exist', 402],
    ['Locked', 403],
    ['Not Found', 404],
    ['Internal Error', 500],
  ])

  constructor(message, code = null) {
    super(message)
    if (!code) this.statusCode = this.error_codes.get(message) ?? 500
    else this.statusCode = code
  }
}

class InvalidSchema extends ServiceError {
  constructor(message) {
    super('Invalid Schema')
    if (message) this.message = message
  }
}

class InvalidToken extends ServiceError {
  constructor(message) {
    super('Invalid Token')
    if (message) this.message = message
  }
}

class NotExist extends ServiceError {
  constructor(message) {
    super('Not Exist')
    if (message) this.message = message
  }
}

class NotFound extends ServiceError {
  constructor(message) {
    super('Not Found')
    if (message) this.message = message
  }
}

class Locked extends ServiceError {
  constructor(message) {
    super('Locked')
    if (message) this.message = message
  }
}

class Internal extends ServiceError {
  constructor(message) {
    super('Internal Error')
    if (message) this.message = message
  }
}

module.exports.default = fp(function (instance, _, done) {
  instance.decorate('srs', {
    errors: {
      ServiceError,
      InvalidSchema,
      InvalidToken,
      NotExist,
      Locked,
      NotFound,
      Internal,
    },
  })
  done()
})

module.exports.errors = {
  ServiceError,
  InvalidSchema,
  InvalidToken,
  NotExist,
  Locked,
  NotFound,
  Internal,
}
