const { test } = require('node:test')
const assert = require('node:assert/strict')

test('Session', { only: true, concurrency: true }, async (t) => {
  await t.test('Members', { concurrency: true }, async (t) => {
    const member_sessions = require('../lib/Sessions/Members')

    await t.test('create', () => {
      console.log(member_sessions.set('test', 1000))
      assert(Object.is(member_sessions.set('test', 1000), ['test', 1000]))
      assert(member_sessions.get('test') == ['test', 1000])
      assert(member_sessions.has('test'))
    })
  })
})
