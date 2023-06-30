let SESSION_DELAY = 20 * 60 * 1000 //20 minutes

/**
 * @typedef {[string, number]} LINK
 */

/**
 * @type {Map<string, [string, number]>}
 */
const member_sessions = new Map()
const timers = new WeakMap()

/**
 *
 * @param {string} name
 * @param {number} rating
 * @returns
 */
function set(name, rating) {
  if (member_sessions.has(name)) __extend(name, member_sessions.get(name))
  else __create(name, [name, rating])

  return get(name)
}

/**
 * @param {string} name
 * @returns {[string, number] | undefined}
 */
function get(name) {
  if (member_sessions.has(name)) return member_sessions.get(name)
}

function has(name) {
  return member_sessions.has(name)
}

/**
 * @param {number} delay кастомное время отложенной чистки кэша
 */
function config(delay) {
  if (delay == SESSION_DELAY) return
  SESSION_DELAY = delay
  for (let [name, link] of member_sessions) __extend(name, link)
}

function clear() {
  for (let [name, link] of member_sessions) __delete(name, link)
  member_sessions.clear()
}

/**
 * @param {string} name
 * @param {LINK} link
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
 * @param {LINK} link
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
 * @param {LINK} link
 */
function __delete(name, link) {
  clearTimeout(timers.get(link))
  timers.delete(link)

  member_sessions.delete(name)
}

module.exports = {
  set,
  get,
  has,
  clear,
  config,
}
