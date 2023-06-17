const { createVerifier } = require('fast-jwt')
const fp = require('fastify-plugin')

module.exports = fp(function (instance, _, done) {
  const verify = createVerifier({
    key: async () => process.env.JWT_SECRET,
    cache: 100,
  })
  instance.decorateRequest('user', null)
  instance.decorateRequest('role', null)
  instance.decorate('auth', function (request, reply, done) {
    if (!request.headers['service-token']) done()
    else {
      verify(request.headers['service-token'], (err, payload) => {
        if (err) done(new instance.service_error(401))

        request.user = { name: payload.username, role: payload.role }
        instance.prisma.persons
          .findUnique({ where: { name: request.user.name } })
          .then((record) => {
            if (!record) {
              instance.prisma.persons
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
                    dossiers: true,
                  },
                })
                .then((record) => {
                  request.user.record = record
                  done()
                })
                .catch((e) => {
                  done(new instance.srs.errors.Internal())
                })
            } else {
              request.user.record = record
              done()
            }
          })
          .catch((e) => {
            done(new instance.srs.errors.Internal())
          })
      })
    }
  })

  done()
})
