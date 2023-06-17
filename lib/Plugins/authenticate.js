const { createVerifier } = require('fast-jwt')
const fp = require('fastify-plugin')

const ROLES = {
  ANONYM: 0,
  USER: 1,
  ADMIN: 2,
}

module.exports.default = fp(function (instance, _, done) {
  const verify = createVerifier({
    key: async () => process.env.JWT_SECRET,
    cache: 100,
  })

  const parse_token = ({ user }, token) => {
    user.name = token.username
    user.role = token.role == 'admin' ? ROLES.ADMIN : ROLES.USER
  }

  instance.addHook('onRequest', function (req, _, done) {
    req.user = { name: null, role: 0 }
    done()
  })

  instance.decorateRequest('access', function (minimum = 0) {
    if (this.user.role < minimum) throw new instance.srs.errors.Locked()
  })

  instance.decorate('auth', function (request, reply, done) {
    if (!request.headers['service-token']) done()
    else {
      verify(request.headers['service-token'], (err, payload) => {
        if (err) done(new instance.service_error(401))
        parse_token(request, payload)

        instance.db.persons.get(request.user.name).then(
          function (user) {
            if (!user) {
              instance.db.persons
                .create({
                  data: {
                    name: request.user.name,
                    passport: {
                      create: {
                        person: request.user.name,
                      },
                    },
                  },
                  include: {
                    passport: true,
                  },
                })
                .then(
                  function () {
                    done()
                  },
                  function (error) {
                    done(new instance.srs.errors.Internal())
                  },
                )
            } else {
              request.user.record = user
              done()
            }
          },
          function (error) {
            done(new instance.srs.errors.Internal())
          },
        )
      })
    }
  })

  instance.decorate('roles', ROLES)

  done()
})

module.exports.ROLES = ROLES
