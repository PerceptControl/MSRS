const { PrismaClient } = require('@prisma/client')
const fp = require('fastify-plugin')
const { ulid, isValid } = require('ulidx')

const client = new PrismaClient()
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
      client.report
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
     * @param {{user?: String, match?: String}} query
     * @returns
     */
    search: ({ from, to }, { user, match }) =>
      client.events.findMany({
        where: {
          user,
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

    /**
     *
     * @param {{name: String}} person
     * @param {{code: Number?, match?: String, explanation?: String, rating_change?: Number}} param1
     * @returns
     */
    create: async ({ name }, { code, match, explanation, rating_change }) => {
      const CUSTOM_EVENT_CODE = 1
      if ((!code && !rating_change) || code == CUSTOM_EVENT_CODE)
        throw new instance.srs.errors.InvalidSchema(
          'code or rating change must be specified and code must not be equal to CUSTOM',
        )

      if (rating_change) code = CUSTOM_EVENT_CODE
      else
        rating_change = (
          await client.event_Codes.findUnique({
            where: { code },
          })
        )?.rating_change

      if (!rating_change)
        throw new instance.srs.errors.Internal(`event code ${code} unsupported`)

      return await client.$transaction(
        async (client) => {
          await client.persons.update({
            where: { name },
            data: {
              rating: { increment: rating_change },
              passport: {
                update: { rating: { increment: rating_change } },
              },
            },
            include: {
              passport: true,
            },
          })

          return (
            await client.events.create({
              data: {
                id: ulid(),
                User: {
                  connect: {
                    passport: name,
                  },
                },
                Code: {
                  connect: {
                    code: code,
                  },
                },
                rating_change,
                match,
                explanation,
              },
              include: { User: true, Code: true },
            })
          ).id
        },
        { maxWait: 1000, timeout: 4000 },
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

  instance.addHook('onClose', () => {
    instance.prisma.client.$disconnect()
  })
})

module.exports.DATABASE = methods
