const SESSION_DELAY = 20 * 60 * 1000 //20 minutes

/**
 * @type {Map<string, [number]>}
 */
const member_sessions = new Map()
const timers = new WeakMap()

function set(name, rating) {
  if (member_sessions.has(name)) __extend(name, member_sessions.get(name))
  else __create(name, [rating])

  return get(name)
}

/**
 * @param {string} name
 * @returns {[string, number] | undefined}
 */
function get(name) {
  if (member_sessions.has(name)) return [name, member_sessions.get(name)[0]]
}

function has(name) {
  return member_sessions.has(name)
}

/**
 * @param {string} name
 * @param {[number]} link
 */
function __create(name, link) {
  member_sessions.set(name, link)
  timers.set(
    link,
    setTimeout(() => {
      __delete(name, link)
    }, SESSION_DELAY),
  )
}

/**
 * @param {string} name
 * @param {[number]} link
 */
function __extend(name, link) {
  clearTimeout(timers.get(link))
  timers.set(
    link,
    setTimeout(() => {
      __delete(name, link)
    }, SESSION_DELAY),
  )
}

/**
 * @param {string} name
 * @param {[number]} link
 */
function __delete(name, link) {
  clearTimeout(timers.get(link))
  timers.delete(link)

  member_sessions.members.delete(name)
}

module.exports = {
  set,
  get,
  has,
}
