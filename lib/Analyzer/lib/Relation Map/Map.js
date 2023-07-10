const Relation = require('./Relation')

/**
 * @typedef {string} Name
 */

/**
 * @typedef {number} Rating
 */

/**
 * @typedef {{weight: number, rating: number} ActorPayload
 */

class RelationMap {
  /**
   * @type {Map<Name, Map<Name, Relation>>}
   */
  #relations = new Map()

  /**
   * @type {Map<Name, ActorPayload>}
   */
  #actors = new Map()

  /**
   * @type {import('./Relation').Action[]}
   */
  #actions = new Array(40).fill(null)

  /**
   * @param  {[Name, Rating][]} actors
   */
  constructor(actors) {
    for (let actor of actors) {
      let [name, rating] = actor
      if (rating <= 0) throw new Error('rating must be > 0')

      this.#actors.set(name, {
        rating,
        weight: rating / 100,
      })
    }
  }

  clear() {
    this.#relations.clear()
    this.#actors.clear()
    this.#actions.fill(null)
  }

  /**
   * @param {Name} actor
   * @param {Name} actored
   */
  relation(actor, actored) {
    return this.#get_relation(actor, actored)
  }

  /**
   * @param {Name} actor
   * @param {Name} actored
   * Удаляет все данные об указанном отношении
   */
  delete(actor, actored) {
    if (!this.has(actor, actored)) return
    this.#get_relation(actor, actored).clear()

    const actor_relations = this.#relations.get(actor)
    actor_relations.delete(actored)
    if (actor_relations.size == 0) this.#relations.delete(actor)

    const actored_relations = this.#relations.get(actored)
    actored_relations.delete(actor)
    if (actored_relations.size == 0) this.#relations.delete(actored)
  }

  /**
   * Возвращает, совершалось какое-либо действие от actor над actored(репорт и/или комменд)
   *
   * @param {Name} actor
   * @param {Name?} actored
   */
  has(actor, actored) {
    if (!actored) return this.#relations.has(actor)
    return this.#relations.get(actor)?.has(actored) ?? false
  }

  get relations() {
    return this.#relations
  }

  get actions() {
    return this.#actions
  }

  /**
   * @param {Name} actor
   * @param {Name} actored
   * @returns {Relation}
   */
  #get_relation(actor, actored) {
    if (!this.#actors.has(actor))
      throw new Error(`${actor} not exist in relations`)
    if (!this.#actors.has(actored))
      throw new Error(`${actored} not exist in relations`)

    if (this.#relations.has(actor) && this.#relations.get(actor).has(actored))
      // Мы имеем возможность так сделать, поскольку при создании обе карты отношений пользователя ссылаются на один объект
      return this.#relations.get(actor).get(actored)

    return this.#create_relation(actor, actored)
  }

  /**
   * @param {Name} actor
   * @param {Name} actored
   * @returns {Acts}
   */
  #create_relation(actor, actored) {
    const relation = new Relation(
      this.#actions,
      [actor, this.#actors.get(actor)],
      [actored, this.#actors.get(actored)],
    )

    this.#relations.has(actor)
      ? this.#relations.get(actor).set(actored, relation)
      : this.#relations.set(actor, new Map([[actored, relation]]))

    this.#relations.has(actored)
      ? this.#relations.get(actored).set(actor, relation)
      : this.#relations.set(actored, new Map([[actor, relation]]))

    return relation
  }
}

module.exports = RelationMap
