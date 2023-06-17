const { PrismaClient } = require('@prisma/client')
const fp = require('fastify-plugin')
const { ulid, isValid } = require('ulidx')

const client = new PrismaClient()
module.exports.default = fp((instance, _, done) => {
  client
    .$connect()
    .then(() => {
      instance.decorate('db', methods)
      done()
    })
    .catch((e) => {
      done(e)
    })

  const methods = {
    persons: {
      /**
       *
       * @param {String} name
       * @returns
       */
      get: (name) => client.persons.findUnique({ where: { name } }),

      /**
       *
       * @param {String} name
       * @returns
       */
      create: (name) =>
        client.create({
          data: {
            name,
            passport: {
              create: {
                person: name,
              },
            },
          },
          include: {
            passport: true,
          },
        }),

      list: () => client.persons.findMany(),
    },

    commends: {
      /**
       *
       * @param {{from?: Date, to?: Date}} period
       * @param {{reasons?: number[], recommender?: String, recommended?: String, match?: String}} query
       * @returns
       */
      search: ({ from, to }, { reasons, recommender, recommended, match }) =>
        client.recommendations.findMany({
          where: {
            reasons: reasons ? { equals: reasons } : undefined,
            recommender,
            recommended,
            match,
            created_at: {
              gt: from,
              lt: to,
            },
          },
        }),

      /**
       *
       * @param {{from?: Date, to?: Date}} period
       * @param {{[key: string]: boolean | undefined}} query
       * @param {name: String} person
       * @returns
       */
      filter: ({ from, to }, query, { name }) =>
        client.recommendations.findMany({
          where: {
            recommended: name,
            created_at: {
              gt: from,
              lt: to,
            },
          },
          select: {
            id: true,
            ...query,
          },
        }),

      /**
       *
       * @param {{recommender: String, recommended: String}} param0
       * @param {{reasons: number[], match: String, explanation?: String}} param0
       * @returns {Promise<String>} ulid
       */
      create: ({ recommender, recommended }, { reasons, match, explanation }) =>
        client.recommendations
          .create({
            data: {
              id: ulid(),
              Recommender: {
                connect: {
                  passport: recommender,
                },
              },
              Recommended: {
                connect: {
                  passport: recommended,
                },
              },
              reasons,
              match,
              explanation,
            },
            include: { Recommender: true, Recommended: true },
          })
          .then(
            (commend) => commend.id,
            (e) => e,
          ),

      /**
       *
       * @param {String} id
       * @returns
       */
      get: (id) => {
        if (!isValid(id))
          throw new instance.srs.errors.InvalidSchema('id must be valid ULID')

        return client.recommendations.findUnique({ where: { id } })
      },
    },

    reports: {
      /**
       *
       * @param {{from?: Date, to?: Date}} period
       * @param {{reasons?: number[], accuser?: String, accused?: String, match?: String}} query
       * @returns
       */
      search: ({ from, to }, { reasons, accuser, accused, match }) =>
        client.reports.findMany({
          where: {
            reasons: reasons ? { equals: reasons } : undefined,
            accuser,
            accused,
            match,
            created_at: {
              gt: from,
              lt: to,
            },
          },
        }),

      /**
       *
       * @param {{from?: Date, to?: Date}} period
       * @param {{[key: string]: boolean | undefined}} query
       * @param {name: String} person
       * @returns
       */
      filter: ({ from, to }, query, { name }) =>
        client.reports.findMany({
          where: {
            accused: name,
            created_at: {
              gt: from,
              lt: to,
            },
          },
          select: {
            id: true,
            ...query,
          },
        }),

      /**
       *
       * @param {{accuser: String, accused: String}} persons
       * @param {{reasons: number[], match: String, explanation?: String}} payload
       * @returns {Promise<String>} ulid
       */
      create: ({ accuser, accused }, { reasons, match, explanation }) =>
        client.reports
          .create({
            data: {
              id: ulid(),
              Accuser: {
                connect: {
                  passport: accuser,
                },
              },
              Accused: {
                connect: {
                  passport: accused,
                },
              },
              reasons,
              match,
              explanation,
            },
            include: { Accuser: true, Accused: true },
          })
          .then(
            (report) => report.id,
            (e) => e,
          ),

      /**
       *
       * @param {String} id
       * @returns
       */
      get: (id) => {
        if (!isValid(id))
          throw new instance.srs.errors.InvalidSchema('id must be valid ULID')
        return client.reports.findUnique({
          where: { id },
        })
      },
    },

    events: {
      /**
       *
       * @param {{from?: Date, to?: Date}} period
       * @param {{[key: string]: boolean | undefined}} query
       * @param {name: String} person
       * @returns
       */
      filter: ({ from, to }, query, { name }) =>
        client.events.findMany({
          where: {
            user: name,
            created_at: {
              gt: from,
              lt: to,
            },
          },
          select: {
            id: true,
            ...query,
          },
        }),

      create: async ({ user, body }) => {
        return instance.prisma.client.events
          .create({
            data: {
              id: ulid(),
              User: {
                connect: {
                  passport: user.name,
                },
              },
              Code: {
                connect: {
                  code: body.code,
                },
              },
              rating_change: body.rating_change,
              match: body.match,
              explanation: body.explanation,
            },
            include: { User: true, Code: true },
          })
          .then(
            (commend) => {
              reply.code(201).send(commend.id)
            },
            (e) => reply.send(e),
          )
      },

      /**
       *
       * @param {String} id
       * @returns
       */
      get: (id) => {
        if (!isValid(id))
          throw new instance.srs.errors.InvalidSchema('id must be valid ULID')
        return client.events.findUnique({
          where: { id },
        })
      },
    },
  }

  instance.addHook('onClose', () => {
    instance.prisma.client.$disconnect()
  })
})
