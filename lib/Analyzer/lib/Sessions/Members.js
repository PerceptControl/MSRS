let SESSION_DELAY = 20 * 60 * 1000 //20 minutes

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
function set(name, rating) {
  if (__member_sessions.has(name)) __extend(name, __member_sessions.get(name))
  else __create(name, [name, rating])

  return get(name)
}

/**
 * @param {string} name
 */
function extend(name) {
  if (!__member_sessions.has(name)) return
  __extend(name, __member_sessions.get(name))
}

/**
 * @param {string} name
 * @returns {[string, number] | undefined}
 */
function get(name) {
  return __member_sessions.get(name)
}

function has(name) {
  return __member_sessions.has(name)
}

/**
 * @param {number} delay кастомное время отложенной чистки кэша
 */
function config(delay) {
  if (delay == SESSION_DELAY) return
  SESSION_DELAY = delay
  for (let [name, link] of __member_sessions) __extend(name, link)
}

function clear() {
  for (let [name, link] of __member_sessions) __delete(name, link)
  __member_sessions.clear()
}

/**
 * @param {string} name
 * @param {LINK} link
 */
function __create(name, link) {
  __member_sessions.set(name, link)
  __timers.set(
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
  clearTimeout(__timers.get(link))
  __timers.set(
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
  clearTimeout(__timers.get(link))
  __timers.delete(link)

  __member_sessions.delete(name)
}

module.exports = {
  set,
  get,
  extend,
  has,
  clear,
  config,
}
