const Computer = require('./Computer')

/**
 * @type {Map<string, Computer>}
 */
const __computers = new Map()

/**
 *
 * @param {string} id
 * @returns {Computer}
 */
function __computer(id) {
  if (__computers.has(id)) return __computers.get(id)

  // this.#prepare(id)
  //   .then((members) => {
  //     const new_computer = new Computer(id, members, 1200, () => {
  //       if (typeof callback == 'function') callback()
  //     })
  //     this.#computers.set(id, new_computer)

  //     return new_computer
  //   })
  //   .catch((e) => {
  //     console.error(e)
  //     throw e
  //   })
}

/**
 * @param {{match: string, accuser: {name: string, rating: number}, accused: {name: string, rating: number}, reasons: Array<number>}} action
 * @returns
 */
function report({ match, accuser, accused, reasons }) {
  if (!match || typeof match != 'string') return false

  return __computer(match).report({
    actor: accuser,
    actored: accused,
    reasons,
  })
}

/**
 * @param {{match: string, accuser: {name: string, rating: number}, accused: {name: string, rating: number}, reasons: Array<number>}} action
 * @returns
 */
function commend({ match, recommender, recommended, reasons }) {
  if (!match || typeof match != 'string') return false

  return __computer(match).commend({
    actor: recommender,
    actored: recommended,
    reasons,
  })
}

module.exports = {
  report,
  commend,
}
