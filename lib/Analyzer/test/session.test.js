const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setTimeout } = require('node:timers/promises')

test('Session', { concurrency: true }, async (t) => {
  await t.test('Match', async (t) => {
    const sessions = require('../lib/Sessions/Match')
    const id = 'test-match'

    await t.test('create', () => {
      sessions.set(id, [
        ['test1', 1000],
        ['test2', 1000],
        ['test3', 1000],
        ['test4', 1000],
        ['test5', 1000],
      ])

      assert(sessions.get(id) instanceof Array && sessions.get(id).length == 5)
    })
  })

  await t.test('Members', { concurrency: true }, async (t) => {
    const member_sessions = require('../lib/Sessions/Members')

    await t.test('create', () => {
      member_sessions.set('test', 1000)
      assert(member_sessions.get('test')[0] === 'test')
      assert(member_sessions.has('test'))
    })

    await t.test('extend', async () => {
      member_sessions.set('test', 1000, 150)
      assert(member_sessions.has('test'))
      await setTimeout(100)
      assert(member_sessions.has('test'))
      member_sessions.set('test', null, 100)
      await setTimeout(50)
      assert(member_sessions.has('test'))
      await setTimeout(100)
      assert(!member_sessions.has('test'))
    })
  })
})
