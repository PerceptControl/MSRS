const RelationMap = require('./Relation Map/Map')

class Computer {
  /**
   * @type {RelationMap}
   */
  #relations

  /**
   * @type {Map<string, number>}
   */
  #deltas = new Map()

  #timer

  /**
   * @param {string} id - match id
   * @param  {[Name, Rating][]} actors
   * @param {number} timeout - autostart time in ms
   */
  constructor(id, actors, timeout = 0, callback = null) {
    if (typeof timeout != 'number' || Object.is(NaN, timeout) || timeout < 0)
      throw new Error('timeout must be valid uint')
    this.#relations = new RelationMap(actors)
    this.#timer = setTimeout(() => {
      this.#compute()
      if (typeof callback == 'function') callback(this.#deltas)
    }, timeout)
    this.id = id
  }

  /**
   * @param {{actor: string, actored: string, reasons: Array<number>, explanation?: string}} action
   * @returns
   */
  report(action) {
    const { actor, actored, reasons } = action
    if (!actor || !actored || !reasons) return false
    if (
      typeof actor != 'string' ||
      typeof actored != 'string' ||
      !(reasons instanceof Array)
    )
      return false
    if (actor == actored) return false

    this.#relations.relation(actor, actored).add({
      type: 'report',
      ...action,
    })
    return true
  }

  /**
   * @param {{actor: string, actored: string, reasons: Array<number>, explanation?: string}} action
   * @returns
   */
  commend(action) {
    const { actor, actored, reasons } = action
    if (!actor || !actored || !reasons) return false
    if (
      typeof actor != 'string' ||
      typeof actored != 'string' ||
      !(reasons instanceof Array)
    )
      return false
    if (actor == actored) return false

    this.#relations.relation(actor, actored).add({
      type: 'commend',
      ...action,
    })
    return true
  }

  compute() {
    clearTimeout(this.#timer)
    this.#compute()
    callback(this.#deltas)
  }

  #compute() {
    for (let [actor, relations] of this.#relations.relations) {
      if (!this.#deltas.has(actor)) this.#deltas.set(actor, 0)
      for (let [actored, relation] of relations) {
        if (!this.#deltas.has(actored)) this.#deltas.set(actored, 0)

        let tmp = this.#deltas.get(actor)
        this.#deltas.set(actor, tmp + relation.delta(actor))

        tmp = this.#deltas.get(actored)
        this.#deltas.set(actored, tmp + relation.delta(actor))

        this.#relations.delete(actor, actored)
      }
    }
  }
}

module.exports = Computer
