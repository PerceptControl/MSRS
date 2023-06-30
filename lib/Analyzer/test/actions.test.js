const test = require('node:test')
const assert = require('node:assert/strict')

const RelationMap = require('../lib/Relation Map/Map')
const Relation = require('../lib/Relation Map/Relation')

test('Relation map', { concurrency: true }, async (t) => {
  /**
   * @type {RelationMap}
   */
  let relations

  await t.test('relation', async (t) => {
    t.beforeEach(() => {
      relations = new RelationMap([
        ['test', 1500],
        ['test1', 1200],
        ['test2', 1300],
      ])
    })

    await t.test('add', () => {
      relations.relation('test', 'test1')
      relations.relation('test1', 'test2')

      assert(
        Object.is(
          relations.relation('test', 'test1'),
          relations.relation('test1', 'test'),
        ),
      )

      assert(relations.has('test', 'test1'))
      assert(relations.has('test1', 'test2'))
      assert(!relations.has('test', 'test2'))
    })

    await t.test('delete', () => {
      relations.relation('test', 'test1')
      relations.relation('test', 'test2')

      relations.delete('test', 'test1')

      assert(
        !relations.has('test1'),
        !relations.has('test', 'test1'),
        !relations.has('test1', 'test'),
      )
    })
  })
})

test('Relation', { concurrency: true }, async (t) => {
  /**
   * @type {Relation}
   */
  let relation

  await t.test('create', async (t) => {
    const actor = 'test'
    const actored = 'test1'

    const actor_data = {
      weight: 0.1,
      rating: 1000,
    }
    const actored_data = {
      weight: 0.2,
      rating: 1200,
    }

    /** @type {import('../lib/Relation Map/Relation').Action[]} */
    let actions

    t.beforeEach(() => {
      actions = []
      relation = new Relation(
        actions,
        [actor, actor_data],
        [actored, actored_data],
      )
    })

    await t.test('correct', () => {
      assert(relation.is_for(actor, actored))
      assert(relation.is_for(actored, actor))
      assert(relation.is_for(actor))
      assert(relation.is_for(actored))
    })

    await t.test('duplicate', () => {
      relation.add({ type: 'report', actor, actored })
      let error = null

      try {
        relation.add({ type: 'report', actor, actored })
      } catch (e) {
        error = e
      }

      assert(error instanceof Error)
      error = null

      try {
        relation.add({ type: 'report', actor, actored })
      } catch (e) {
        error = e
      }
      assert(error instanceof Error)
    })
  })

  await t.test(
    'weight comparsion',
    { only: true, concurrency: true },
    async (t) => {
      let actions, relation
      const actor = 'test'
      const actored = 'test1'

      await t.test('compare by rating', async (t) => {
        await t.test('actor worse than actored', async (t) => {
          t.beforeEach(() => {
            actions = []
            relation = new Relation(
              actions,
              [actor, { rating: 1000, weight: 0.7 }],
              [actored, { rating: 1200, weight: 0.7 }],
            )
          })

          await t.test('idle(equal)', () => {
            assert(relation.delta(actor) == relation.delta(actored))
          })

          await t.test('both reports(actor < actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({
              type: 'report',
              actor: actored,
              actored: actor,
            })
            assert(relation.delta(actor) < relation.delta(actored))
          })

          await t.test('report and commend(actor >= actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({
              type: 'commend',
              actor: actored,
              actored: actor,
            })
            assert(relation.delta(actor) >= relation.delta(actored))
          })

          await t.test('both commend(actor >= actored)', () => {
            relation.add({ type: 'commend', actor, actored })
            relation.add({
              type: 'commend',
              actor: actored,
              actored: actor,
            })
            assert(relation.delta(actor) >= relation.delta(actored))
          })
        })

        await t.test('actor better than actored', async (t) => {
          t.beforeEach(() => {
            actions = []
            relation = new Relation(
              actions,
              [actor, { rating: 1200, weight: 0.7 }],
              [actored, { rating: 1000, weight: 0.7 }],
            )
          })

          await t.test('idle(equal)', () => {
            assert(relation.delta(actor) == relation.delta(actored))
          })

          await t.test('both reports(actor >= actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'report', actor: actored, actored: actor })
            assert(relation.delta(actor) >= relation.delta(actored))
          })

          await t.test('report and commend(actor >= actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) >= relation.delta(actored))
          })

          await t.test('both commend(actor <= actored)', () => {
            relation.add({ type: 'commend', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) <= relation.delta(actored))
          })
        })

        await t.test('actor equal to actored', async (t) => {
          t.beforeEach(() => {
            actions = []
            relation = new Relation(
              actions,
              [actor, { rating: 1000, weight: 0.7 }],
              [actored, { rating: 1000, weight: 0.7 }],
            )
          })

          await t.test('idle', () => {
            assert(relation.delta(actor) == relation.delta(actored))
          })

          await t.test('both reports(equal)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'report', actor: actored, actored: actor })
            assert(relation.delta(actor) == relation.delta(actored))
          })

          await t.test('report and commend(actor >= actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) >= relation.delta(actored))
          })

          await t.test('both commend(equal)', () => {
            relation.add({ type: 'commend', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) == relation.delta(actored))
          })
        })
      })

      await t.test('compare by global weight', async (t) => {
        await t.test('actor worse than actored', async (t) => {
          t.beforeEach(() => {
            actions = []
            relation = new Relation(
              actions,
              [actor, { rating: 1500, weight: 0.5 }],
              [actored, { rating: 1500, weight: 0.7 }],
            )
          })

          await t.test('idle(equal)', () => {
            assert(relation.delta(actor) == relation.delta(actored))
          })

          await t.test('both reports(actor <= actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'report', actor: actored, actored: actor })
            assert(relation.delta(actor) <= relation.delta(actored))
          })

          await t.test('report and commend(actor >= actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) >= relation.delta(actored))
          })

          await t.test('both commend(actor >= actored)', () => {
            relation.add({ type: 'commend', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) >= relation.delta(actored))
          })
        })

        await t.test('actor better than actored', async (t) => {
          t.beforeEach(() => {
            actions = []
            relation = new Relation(
              actions,
              [actor, { rating: 1200, weight: 0.7 }],
              [actored, { rating: 1000, weight: 0.5 }],
            )
          })

          await t.test('idle(equal)', () => {
            assert(relation.delta(actor) == relation.delta(actored))
          })

          await t.test('both reports(actor >= actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'report', actor: actored, actored: actor })
            assert(relation.delta(actor) >= relation.delta(actored))
          })

          await t.test('report and commend(actor >= actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) >= relation.delta(actored))
          })

          await t.test('both commend(actor <= actored)', () => {
            relation.add({ type: 'commend', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) <= relation.delta(actored))
          })
        })

        await t.test('actor equal to actored', async (t) => {
          t.beforeEach(() => {
            actions = []
            relation = new Relation(
              actions,
              [actor, { rating: 1500, weight: 0.5 }],
              [actored, { rating: 1500, weight: 0.5 }],
            )
          })

          await t.test('idle(equal)', () => {
            assert(relation.delta(actor) == relation.delta(actored))
          })

          await t.test('both reports(equal)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'report', actor: actored, actored: actor })
            assert(relation.delta(actor) == relation.delta(actored))
          })

          await t.test('report and commend(actor >= actored)', () => {
            relation.add({ type: 'report', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) >= relation.delta(actored))
          })

          await t.test('both commend(equal)', () => {
            relation.add({ type: 'commend', actor, actored })
            relation.add({ type: 'commend', actor: actored, actored: actor })
            assert(relation.delta(actor) == relation.delta(actored))
          })
        })
      })
    },
  )
})
