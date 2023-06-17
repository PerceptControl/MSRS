const { createVerifier } = require('fast-jwt')
const fp = require('fastify-plugin')

module.exports = fp(function (instance, _, done) {
  const verify = createVerifier({
    key: async () => process.env.JWT_SECRET,
    cache: 100,
  })
  //создаем шаблон объекта аутентификации для оптимизации запросов
  instance.decorateRequest('auth', {
    user: { name: '', record: null },
    role: 'anonym',
  })
  instance.decorate('auth', function (request, reply, done) {
    if (!request.headers['service-token']) done()
    else {
      verify(request.headers['service-token'], (err, payload) => {
        if (err) done(new instance.service_error(401))

        //копируем данные из токена в объект запроса
        request.auth.user.name = payload.username
        request.auth.role = payload.role

        instance.prisma.persons
          .findUnique({ where: { name: request.auth.user.name } })
          .then((record) => {
            if (!record) {
              instance.prisma.persons
                .create({
                  data: {
                    name: request.auth.user.name,
                    passport: {
                      create: {
                        person: request.auth.user.name,
                      },
                    },
                  },
                  include: {
                    passport: true,
                  },
                })
                .then((record) => {
                  request.auth.user.record = record
                  done()
                })
                .catch((e) => {
                  done(new instance.srs.errors.Internal())
                })
            } else {
              request.auth.user.record = record
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
