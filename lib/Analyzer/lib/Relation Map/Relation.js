/**
 * @typedef {'report' | 'commend'} ACTION_TYPES
 */

/**
 * @typedef {{type: ACTION_TYPES, actor: Name, actored: Name, reasons: Array<number>, explanation?: string}} Action
 */

/**
 * @typedef {{action: number, delta: number, global: import("./Map").ActorPayload}} WeightData
 */

class Relation {
  /**
   * Участники отношений и вес действий, совершенных ими
   * @type {Map<import("./Map").Name, WeightData>}
   */
  #actors_weight

  /**
   * Действия, совершенные между участниками
   */
  #actions = {
    /**
     * Ссылка на все события в мапе
     * @type {Action[]}
     */
    global: null,

    /**
     * Сведения о том, получил ли участник отношений репорт или комменд от другого участника
     * @type {Map<import("./Map").Name, {report: boolean, commend: boolean}>}
     */
    local: null,
  }

  /**
   * @param {Array<import("./Map").ActionsList>} global_actions
   * @param {[import("./Map").Name, import("./Map").ActorPayload]} member1
   * @param {[import("./Map").Name, import("./Map").ActorPayload]} member2
   */
  constructor(global_actions, member1, member2) {
    this.#actors_weight = new Map()
    this.#actions.local = new Map()
    this.#actions.global = global_actions

    this.#store_actor(member1)
    this.#store_actor(member2)
  }

  /**
   * @param {Action} action
   */
  add(action) {
    this.#validate_action(action)
    this.#store_local_action(action)
    this.#store_global_action(action)
    this.#update_weights(action)
  }

  /**
   * очищает данные отношений
   */
  clear() {
    this.#actors_weight.clear()
    this.#actors_weight = null
    this.#actions.global = null
    this.#actions.local = null
    this.#actions = null
  }

  /**
   * Опознает, является ли это отношение между двумя требуемыми пользователями
   *
   * @param {import("./Map").Name} user1
   * @param {import("./Map").Name?} user2
   * @returns boolean
   */
  is_for(user1, user2) {
    if (!user2) return this.#actors_weight.has(user1)
    return this.#actors_weight.has(user1) && this.#actors_weight.has(user2)
  }

  /**
   * @param {import("./Map").Name} actor
   */
  delta(actor) {
    return this.#actors_weight.get(actor).delta
  }

  get actions() {
    return this.#actions.local
  }

  /**
   *
   * @param {[string, import("./Map").ActorPayload]]} actor
   */
  #store_actor([name, global]) {
    this.#actors_weight.set(name, {
      action: 0,
      delta: 0,
      global,
    })
    this.#actions.local.set(name, { report: false, commend: false })
  }

  /**
   * @param {Action} action
   */
  #validate_action(action) {
    if (!['report', 'commend'].includes(action.type))
      throw new Error(`action type { ${type} } not supported`)
  }

  /**
   * @param {Action} action
   */
  #store_local_action(action) {
    let commited_actions = this.#actions.local.get(action.actored)
    if (commited_actions.commend || commited_actions.report)
      throw new Error('can`t do more than one action')
    this.#actions.local.get(action.actored)[action.type] = true
  }

  /**
   * @param {Action} action
   * @return {number} global index
   */
  #store_global_action(action) {
    let index = this.#actions.global.indexOf(null)
    if (!~index) index = this.#actions.global.push(null)

    this.#actions.global[index] = action
  }

  /**
   * @param {Action} action
   */
  #update_weights({ actor, actored, type }) {
    const [actor_weight, actored_weight] = [
      this.#actors_weight.get(actor),
      this.#actors_weight.get(actored),
    ]

    this.#compare_action_weights([actor_weight, actored_weight])
    this.#update_deltas(type, [
      { name: actor, weight: actor_weight },
      { name: actored, weight: actored_weight },
    ])
    this.#update_global_weights(type, [actor_weight, actored_weight])
  }

  /**
   * @param {[WeightData, WeightData]} param0
   */
  #compare_action_weights([actor, actored]) {
    if (
      actor.global.weight == actored.global.weight &&
      actor.global.rating == actored.global.rating
    )
      return

    if (actor.global.rating > actored.global.rating) actor.action += 0.5
    else actored.action += 0.5

    actor.action += actor.global.weight
    actored.action += actored.global.weight
  }

  /**
   * @param {ACTION_TYPES} type
   * @param {[{name: string, weight: WeightData}, {name: string, weight: WeightData}]}
   */
  #update_deltas(type, [actor, actored]) {
    switch (type) {
      case 'report':
        if (actor.weight.action > actored.weight.action) {
          actor.weight.delta += 0.1 * actored.weight.global.weight
          actored.weight.delta -= 0.5 * actor.weight.global.weight
        } else {
          actor.weight.delta -= 0.15 * actored.weight.global.weight
          actored.weight.delta -= 0.1 * actor.weight.global.weight
        }
        break
      case 'commend':
        if (actor.weight.action_weight > actored.weight.action_weight) {
          actor.weight.delta += 0.2 * actored.weight.global.weight
          actored.weight.delta += 0.5 * actor.weight.global.weight
        } else actored.weight.delta += 0.1 * actor.weight.global.weight
        break
    }
  }

  /**
   * @param {ACTION_TYPES} type
   * @param {[WeightData, WeightData]} param0
   */
  #update_global_weights(type, [actor, actored]) {
    actor.global.weight += ((actor.delta / 5) * actor.action) / 4
    actored.global.weight += ((actored.delta / 5) * actored.action) / 4
  }
}

module.exports = Relation
