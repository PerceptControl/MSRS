const { MongoClient } = require('mongodb')

const prisma = require('../../../Plugins/prisma').DATABASE
const matches = new MongoClient(process.env.MONGO_URL)
  .db()
  .collection('matches')

let SESSION_DELAY = 20 * 60 * 1000 //20 minutes
const __members_sessions = require('./Members').config(SESSION_DELAY)

/**
 * @type {Map<string, string[]>}
 */
const __sessions = new Map()

async function prepare(id) {
  const names = await __find_names_for(id)
  __sessions.set(id, names)

  const unstored = __extend_sessions(names)
  __create_sessions(unstored).then(
    () => {
      setTimeout(() => {
        __sessions.match.delete(id)
      }, SESSION_DELAY)
    },
    (err) => {
      throw err
    },
  )
}

async function get(id) {
  const members = []
  for (let name of __find_names_for(id)) members.push(__get_member(name))

  return members
}

async function has(id) {}

/**
 *
 * @param {string} match
 * @returns
 */
async function __find_names_for(match) {
  /**
   * @type {string[]}
   */
  const names = []

  const pipeline = [
    { $match: { 'info.id': match } },
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
 * @returns {string[]} пользователи, которых не было в кэше
 */
function __extend_sessions(names) {
  const unstored = []
  for (let name of names) {
    if (__members_sessions.has(name)) __members_sessions.extend(name)
    else unstored.push(name)
  }
  return unstored
}

/**
 * @param {string[]} names
 */
function __create_sessions(names) {
  return prisma.persons
    .search({}, { names })
    .then((persons) => {
      for (const person of persons)
        __members_sessions.set(person.name, person.rating)
    })
    .catch((e) => {
      throw e
    })
}
