const { test } = require('node:test')
const assert = require('node:assert/strict')

const DB = require('../../Plugins/database')

test('Manager', async (t) => {
  let manager = require('../lib/Manager')
  const match = 'test'

  const members = [
    { name: 'test', rating: 900 },
    { name: 'test1', rating: 1001 },
    { name: 'test2', rating: 1000 },
    { name: 'test3', rating: 1000 },
    { name: 'test4', rating: 1500 },
    { name: 'test5', rating: 1400 },
    { name: 'test6', rating: 1300 },
    { name: 'test7', rating: 1200 },
    { name: 'test8', rating: 1500 },
    { name: 'test9', rating: 1400 },
  ]

  const names = []
  members.forEach((val) => names.push(val.name))

  t.mock.method(DB.DATABASE.events, 'search', async () => [])
  t.mock.method(DB.DATABASE.matches, 'get_names_for', async () => names)
  t.mock.method(DB.DATABASE.persons, 'search', async () => members)

  t.beforeEach(() => {
    delete require.cache[require.resolve('../lib/Manager')]
    delete require.cache[require.resolve('../lib/Computer')]
    delete require.cache[require.resolve('../lib/Sessions/Match')]
    delete require.cache[require.resolve('../lib/Sessions/Members')]
    manager = require('../lib/Manager')
  })

  await t.test('prepare', { skip: true }, async (t) => {
    const Sessions = require('../lib/Sessions/Match')
    const sessions_set = t.mock.method(Sessions, 'set')
    await manager.report({
      match,
      accuser: 'test2',
      accused: 'test',
      reasons: [1, 2],
    })

    assert(Sessions.get(match).length == members.length)
    await manager.report({
      match,
      accuser: 'test1',
      accused: 'test',
      reasons: [1, 2],
    })
    assert(sessions_set.mock.callCount() === 1)
  })

  await t.test('analyze match', async () => {
    const report = (acr, acd) => {
      return manager.report({
        match,
        accuser: acr,
        accused: acd,
        reasons: [1, 2],
      })
    }

    const commend = (acr, acd) => {
      return manager.commend({
        match,
        recommender: acr,
        recommended: acd,
        reasons: [1, 2],
      })
    }

    await report('test', 'test1')
    await report('test', 'test2')
    await report('test', 'test3')
    await report('test', 'test4')
    await report('test', 'test5')
    await report('test', 'test6')
    await report('test', 'test7')
    await report('test', 'test8')
    await commend('test', 'test9')

    await commend('test1', 'test')
    await commend('test1', 'test2')
    await commend('test1', 'test3')
    await commend('test1', 'test4')
    await commend('test1', 'test5')
    await commend('test1', 'test6')
    await commend('test1', 'test7')
    await commend('test1', 'test8')
    await commend('test1', 'test9')

    await commend('test2', 'test')
    await commend('test2', 'test1')
    await report('test2', 'test3')
    await commend('test2', 'test4')
    await report('test2', 'test5')
    await commend('test2', 'test6')
    await report('test2', 'test7')
    await commend('test2', 'test8')
    await report('test2', 'test9')

    await commend('test3', 'test')
    await report('test3', 'test1')
    await commend('test3', 'test2')
    await report('test3', 'test4')
    await commend('test3', 'test5')
    await report('test3', 'test6')
    await commend('test3', 'test7')
    await report('test3', 'test8')
    await commend('test3', 'test9')

    await commend('test4', 'test')
    await report('test4', 'test1')
    await commend('test4', 'test2')
    await commend('test4', 'test3')
    await report('test4', 'test5')
    await report('test4', 'test6')
    await commend('test4', 'test7')
    await commend('test4', 'test8')
    await report('test4', 'test9')

    await commend('test5', 'test')
    await commend('test5', 'test1')
    await report('test5', 'test2')
    await report('test5', 'test3')
    await commend('test5', 'test4')
    await commend('test5', 'test6')
    await report('test5', 'test7')
    await report('test5', 'test8')
    await commend('test5', 'test9')

    await commend('test6', 'test')
    await commend('test6', 'test5')
    await report('test6', 'test1')
    await commend('test6', 'test4')

    await commend('test7', 'test')
    await report('test7', 'test5')
    await commend('test7', 'test1')
    await commend('test7', 'test4')

    await commend('test8', 'test2')
    await report('test8', 'test3')

    await commend('test9', 'test')
    await commend('test9', 'test8')
    await commend('test9', 'test4')
  })
})
