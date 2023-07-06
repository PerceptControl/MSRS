const DEFAULT_DELAY = 10 * 60 * 1000 //10 min

/**
 * @typedef {[string, number]} LINK
 */

/**
 * @type {Map<string, [string, number]>}
 */
const __member_sessions = new Map()
const __timers = new WeakMap()

/**
 *
 * @param {string} name
 * @param {number} rating
 * @returns
 */
function set(name, rating, delay = DEFAULT_DELAY) {
  if (__member_sessions.has(name)) return __extend(name, delay)
  return __create(name, [rating], delay)
}

/**
 * @param {string} name
 * @returns {[string, number] | undefined}
 */
function get(name) {
  return [name, __member_sessions.get(name)[0]]
}

function has(name) {
  return __member_sessions.has(name)
}

/**
 * @param {string} name
 * @param {LINK} link
 * @param {number}
 */
function __create(name, link, delay) {
  __member_sessions.set(name, link)
  __timers.set(
    link,
    setTimeout(() => {
      __delete(name)
    }, delay),
  )
}

/**
 * @param {string} name
 * @param {number}
 */
function __extend(name, delay) {
  const link = __member_sessions.get(name)
  clearTimeout(__timers.get(link))
  __timers.set(
    link,
    setTimeout(() => {
      __delete(name)
    }, delay),
  )
}

/**
 * @param {string} name
 * @param {LINK} link
 */
function __delete(name) {
  const link = __member_sessions.get(name)
  clearTimeout(__timers.get(link))
  __timers.delete(link)

  __member_sessions.delete(name)
}

module.exports = {
  set,
  get,
  has,
}
