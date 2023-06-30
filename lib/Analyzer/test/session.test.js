const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setTimeout } = require('node:timers/promises')

test('Session', { concurrency: true, only: true }, async (t) => {
  await t.test('Members', { concurrency: true }, async (t) => {
    const member_sessions = require('../lib/Sessions/Members')
    t.beforeEach(() => {
      member_sessions.clear()
    })

    await t.test('create', () => {
      let link = member_sessions.set('test', 1000)
      assert(link[0] == 'test' && link[1] == 1000)
      assert(member_sessions.get('test') === link)
      assert(member_sessions.has('test'))
    })

    await t.test('extend', async () => {
      const delay = 500
      member_sessions.config(delay)
      member_sessions.set('test', 1000)
      assert(member_sessions.has('test'))

      await setTimeout(delay * 2)
      assert(!member_sessions.has('test'))
    })
  })
})
