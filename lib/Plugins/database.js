const { PrismaClient } = require('@prisma/client')
const fp = require('fastify-plugin')
const { ulid, isValid } = require('ulidx')

const internal = new PrismaClient()
const { MongoClient } = require('mongodb')
const external = new MongoClient(process.env.MONGO_URL).db()

const methods = {
  persons: {
    /**
     *
     * @param {string} name
     * @returns
     */
    get: (name) => internal.persons.findUnique({ where: { name } }),

    /**
     *
     * @param {string} name
     * @returns {boolean}
     */
    create: (name) => {
      return external
        .collection('users')
        .findOne({ 'profile.username': name })
        .then(
          (val) =>
            !val
              ? false
              : internal.persons.create({
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
          () => false,
        )
    },

    list: () => internal.persons.findMany(),

    /**
     *
     * @param {names?: string[], ratings?: number[]} projection
     * @returns
     */
    search: ({ names, ratings }) =>
      internal.persons.findMany({
        where: {
          name: { in: names },
          rating: { in: ratings },
        },
      }),
  },

  commends: {
    /**
     *
     * @param {{from?: Date, to?: Date}} period
     * @param {{reasons?: number[], recommender?: string, recommended?: string, match?: string}} query
     * @returns
     */
    search: ({ from, to }, { reasons, recommender, recommended, match }) =>
      internal.recommendations.findMany({
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
     * @param {name: string} person
     * @returns
     */
    filter: ({ from, to }, query, { name }) =>
      internal.recommendations.findMany({
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
     * @param {{recommender: string, recommended: string, reasons: number[], match: string, explanation?: string}} param0
     * @returns {Promise<string>} ulid
     */
    create: ({ recommender, recommended, reasons, match, explanation }) =>
      internal.recommendations
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
     * @param {string} id
     * @returns
     */
    get: (id) => {
      if (!isValid(id))
        throw new instance.srs.errors.InvalidSchema('id must be valid ULID')

      return internal.recommendations.findUnique({ where: { id } })
    },
  },

  reports: {
    /**
     *
     * @param {{from?: Date, to?: Date}} period
     * @param {{reasons?: number[], accuser?: string, accused?: string, match?: string}} query
     * @returns
     */
    search: ({ from, to }, { reasons, accuser, accused, match }) =>
      internal.reports.findMany({
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
     * @param {name: string} person
     * @returns
     */
    filter: ({ from, to }, query, { name }) =>
      internal.reports.findMany({
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
     * @param {{accuser: string, accused: string, reasons: number[], match: string, explanation?: string}} action
     * @returns {Promise<string>} ulid
     */
    create: ({ accuser, accused, reasons, match, explanation }) =>
      internal.reports
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
     * @param {string} id
     * @returns
     */
    get: (id) => {
      if (!isValid(id))
        throw new instance.srs.errors.InvalidSchema('id must be valid ULID')
      return internal.reports.findUnique({
        where: { id },
      })
    },
  },

  events: {
    /**
     *
     * @param {{from?: Date, to?: Date}} period
     * @param {{user?: string, match?: string}} query
     * @returns
     */
    search: ({ from, to }, { user, match }) =>
      internal.events.findMany({
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
     * @param {name: string} person
     * @returns
     */
    filter: ({ from, to }, query, { name }) =>
      internal.events.findMany({
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
     * @param {{name: string}} person
     * @param {{code: Number?, match?: string, explanation?: string, rating_change?: Number}} param1
     * @returns
     */
    create: async ({ name }, { code, match, explanation, rating_change }) => {
      const CUSTOM_EVENT_CODE = 1
      if (typeof rating_change == 'number' && rating_change != null)
        code = CUSTOM_EVENT_CODE
      else
        rating_change = (
          await internal.event_Codes.findUnique({
            where: { code },
          })
        )?.rating_change

      if (rating_change == null)
        throw new instance.srs.errors.Internal(`event code ${code} unsupported`)

      return await internal.$transaction(
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
     * @param {string} id
     * @returns
     */
    get: (id) => {
      if (!isValid(id))
        throw new instance.srs.errors.InvalidSchema('id must be valid ULID')
      return internal.events.findUnique({
        where: { id },
      })
    },
  },

  matches: {
    /**
     *
     * @param {string} id
     */
    get_names_for: async (id) => {
      /**
       * @type {string[]}
       */
      const names = []

      const pipeline = [
        { $match: { 'info.id': id } },
        { $unwind: '$members' },
        { $project: { name: '$members.name', _id: 0 } },
      ]

      try {
        for await (let member of external
          .collection('matches')
          .aggregate(pipeline))
          names.push(member.name)
      } catch (e) {
        console.error(e)
        throw errors.Internal('match search error')
      }

      return names
    },
  },
}

module.exports.default = fp((instance, _, done) => {
  internal
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
