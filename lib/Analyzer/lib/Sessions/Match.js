const { MongoClient } = require('mongodb')

const prisma = require('../../../Plugins/prisma').DATABASE
const matches = new MongoClient(process.env.MONGO_URL)
  .db()
  .collection('matches')

const SESSION_DELAY = 20 * 60 * 1000 //20 minutes

const sessions = {
  /**
   * @type {Map<string, string[]>}
   */
  match: new Map(),
}

async function prepare(id) {
  const names = await __get_names(id)

  sessions.match.set(id, names)
  setTimeout(() => {
    sessions.match.delete(id)
  }, SESSION_DELAY),
    __store_match(names)
}

async function get(id) {
  const members = []
  for (let name of __get_names(id)) members.push(__get_member(name))

  return members
}

async function has(id) {}

async function __get_names(id) {
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
    for await (let member of matches.aggregate(pipeline))
      names.push(member.name)
  } catch (e) {
    console.error(e)
    throw errors.Internal('match search error')
  }

  return names
}

/**
 * @param {string[]} names
 */
function __store_match(names) {
  const promises = []
  for (let name of names) {
    if (!sessions.members.has(name)) promises.push(prisma.persons.get(name))
    else __member_session(name).extend()
  }

  return Promise.all(promises)
    .then((persons) => {
      for (const person of persons)
        __member_session(person.name).link(person.rating)
    })
    .catch((e) => {
      throw e
    })
}
