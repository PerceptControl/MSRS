//TODO перенести сессии в Redis
//TODO сделать кастомные ошибки и продумать DTO
//TODO сделать общий файл конфигурации

const Computer = require('./Computer')
const __sessions = require('./Sessions/Match')
const __DB = require('../../Plugins/database').DATABASE

/**
 * @type {Map<string, Computer>}
 */
const __computers = new Map()

/**
 * @param {{match: string, accuser: {name: string, rating: number}, accused: {name: string, rating: number}, reasons: Array<number>}} action
 * @returns
 */
async function report({ match, accuser, accused, reasons }) {
  if (!match || typeof match != 'string') throw new Error()

  await __computer(match, [
    'report',
    {
      actor: accuser,
      actored: accused,
      reasons,
    },
  ])
}

/**
 * @param {{match: string, recommender: {name: string, rating: number}, recommended: {name: string, rating: number}, reasons: Array<number>}} action
 * @returns
 */
async function commend({ match, recommender, recommended, reasons }) {
  if (!match || typeof match != 'string') throw new Error()

  await __computer(match, [
    'commend',
    {
      actor: recommender,
      actored: recommended,
      reasons,
    },
  ])
}

/**
 *
 * @param {string} id
 * @param {[import('./Relation Map/Relation').ACTION_TYPES, import('./Relation Map/Relation').Action]} param1
 * @returns {Computer | Promise<Computer>}
 */
function __computer(id, [type, action]) {
  if (__computers.has(id)) return void __computers.get(id)[type](action)

  return __prepare(id)
    .then(() => {
      const new_computer = new Computer(id, 20 * 60 * 1000, (deltas) => {
        for (let [name, rating_change] of deltas) {
          rating_change = parseInt(Math.round(rating_change))
          let [_, rating] = __sessions.members.get(name)
          if (rating == 1500 && rating_change > 0) rating_change = 0
          __DB.events
            .create({ name }, { match: id, rating_change })
            .catch((err) => {
              console.error(err)
            })
        }
      })

      __computers.set(id, new_computer)
      new_computer[type](action)
    })
    .catch((e) => {
      console.error(e)
      throw e
    })
}

async function __prepare(id) {
  if (__sessions.has(id)) throw new Error()
  if ((await __DB.events.search({}, { match: id })).length > 0)
    throw new Error()

  return __DB.matches
    .get_names_for(id)
    .then(async (names) => {
      if (names.length == 0) throw new Error()
      const members = []
      const not_stored = []

      for (let name of names) {
        if (!__sessions.members.has(name)) not_stored.push(name)
        else members.push([name])
      }

      let persons = await __DB.persons.search({ names: not_stored })
      for (let person of persons) members.push([person.name, person.rating])

      __sessions.set(id, members)
    })
    .catch((e) => {
      throw e
    })
}

module.exports = {
  report,
  commend,
}
