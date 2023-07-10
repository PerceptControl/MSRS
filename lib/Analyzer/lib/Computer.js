const RelationMap = require('./Relation Map/Map')
const __sessions = require('./Sessions/Match')

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
   * @param {number} timeout - autostart time in ms
   * @param {(deltas: Map<string,number>) => void} [callback=null]
   */
  constructor(id, timeout = 0, callback) {
    if (typeof timeout != 'number' || Object.is(NaN, timeout) || timeout < 0)
      throw new Error('timeout must be valid uint')
    this.id = id
    this.#relations = new RelationMap(__sessions.get(this.id))
    this.#timer = setTimeout(() => {
      this.#compute()
      if (typeof callback == 'function') callback(this.#deltas)
    }, timeout)
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
