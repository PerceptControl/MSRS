const Computer = require('./Computer')

class Manager {
  /**
   * @type {Map<string, Computer>}
   */
  static #computers = new Map()

  /**
   *
   * @param {string} id
   * @returns {Computer}
   */
  static computer(id, callback) {
    if (this.#computers.has(id)) return this.#computers.get(id)

    this.#prepare(id)
      .then((members) => {
        const new_computer = new Computer(id, members, 1200, () => {
          if (typeof callback == 'function') callback()
        })
        this.#computers.set(id, new_computer)

        return new_computer
      })
      .catch((e) => {
        console.error(e)
        throw e
      })
  }

  /**
   * @returns {number}
   */
  static get size() {
    return this.#computers.size
  }

  static clear() {
    for (let [id, computer] of this.#computers) {
      this.#computers.delete(id)
    }
  }

  /**
   * @param {{name: string, rating: number}} author
   * @param {{match: string, accuser: {name: string, rating: number}, accused: {name: string, rating: number}, reasons: Array<number>}} action
   * @returns
   */
  static report(author, { match, accuser, accused, reasons }) {
    if (!match || typeof match != 'string') return false

    this.#store_member(author)
    return this.computer(match).commend({
      actor: accuser,
      actored: accused,
      reasons,
    })
  }

  /**
   * @param {{name: string, rating: number}} author
   * @param {{match: string, accuser: {name: string, rating: number}, accused: {name: string, rating: number}, reasons: Array<number>}} action
   * @returns
   */
  static commend(author, { match, recommender, recommended, reasons }) {
    if (!match || typeof match != 'string') return false

    this.#store_member(author)
    return this.computer(match).commend({
      actor: recommender,
      actored: recommended,
      reasons,
    })
  }
}

module.exports = Manager