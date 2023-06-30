const { test } = require('node:test')
const assert = require('node:assert/strict')

test('Manager', async (t) => {
  const match = 'test match'
  const manager = require('../lib/Manager')
  await t.test('computers', { concurrency: true }, async (t) => {
    await t.test('clear', () => {
      manager.report({
        match,
        accuser: 'test2',
        accused: 'test',
        reasons: [1, 2],
      })
      manager.report({
        match,
        accuser: 'test1',
        accused: 'test',
        reasons: [1, 2],
      })
      manager.report({
        match,
        accuser: 'test3',
        accused: 'test',
        reasons: [1, 2],
      })

      manager.clear()
      assert.equal(manager.size, 0)
    })

    await t.test('timeout', (_, done) => {
      manager.computer('test', () => {
        done()
      })
    })
  })

  await t.test('manager', { concurrency: true }, async (t) => {
    const manager = require('../lib/Manager')
    const match = 'test'

    await t.test('clear', () => {
      manager.report({
        match,
        accuser: 'test2',
        accused: 'test',
        reasons: [1, 2],
      })
      manager.report({
        match,
        accuser: 'test1',
        accused: 'test',
        reasons: [1, 2],
      })
      manager.report({
        match,
        accuser: 'test3',
        accused: 'test',
        reasons: [1, 2],
      })

      manager.clear()
      assert.equal(manager.size, 0)
    })

    await t.test('timeout', (_, done) => {
      manager.computer('test', () => {
        done()
      })
    })

    await t.test('sessions', () => {})
  })

  t.todo('connect with database')
})
