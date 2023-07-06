const SESSION_DELAY = 20 * 60 * 1000 //20 minutes
const __members_sessions = require('./Members')

/**
 * @type {Map<string, string[]>}
 */
const __sessions = new Map()

/**
 *
 * @param {string} id
 * @param {[string, number][]} members
 * @returns
 */
function set(id, members) {
  if (__sessions.has(id)) return
  const names = []

  for (let [name, rating] of members) {
    __members_sessions.set(name, rating, SESSION_DELAY * 2)
    names.push(name)
  }

  __sessions.set(id, names)
  setTimeout(() => {
    __sessions.delete(id)
  }, SESSION_DELAY)
}

/**
 *
 * @param {string} id
 * @returns {[string, number][]}
 */
function get(id) {
  const names = __sessions.get(id)
  const members = []

  for (let name of names) members.push(__members_sessions.get(name))
  return members
}

/**
 *
 * @param {string} id
 * @returns
 */
function has(id) {
  return __sessions.has(id)
}

module.exports = {
  set,
  get,
  has,
  members: __members_sessions,
}
