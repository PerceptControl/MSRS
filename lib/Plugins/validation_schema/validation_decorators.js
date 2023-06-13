const fp = require('fastify-plugin')

module.exports = fp(function (instance, _, done) {
  instance.decorate('srs_validators', {
    reasons: (request, _, done) => {
      validate_reasons(request.query, (err = null, reasons_array = null) => {
        if (err) done(new instance.schema_error(err))
        if (!reasons_array) done()

        request.query.reasons = reasons_array
        done()
      })
    },
    period: (request, _, done) => {
      validate_from_to(request.query, (err = null, dates = null) => {
        if (err) done(new instance.schema_error(err))
        if (!dates) done()

        dates[0]?.setUTCHours(0, 0, 0, 0)
        dates[1]?.setUTCHours(0, 0, 0, 0)

        request.query.from = dates[0]
        request.query.to = dates[1]
        done()
      })
    },
    duration: (request, _, done) => {
      validate_duration(request.query, (err = null, date = null) => {
        if (err) done(new instance.schema_error(err))
        if (!date) done()

        date.setUTCHours(0, 0, 0, 0)
        request.query.duration = date
        done()
      })
    },
  })
  done()
})

/**
 *
 * @param {{from: string | null, to: string | null}} params
 * @param {(err: string | null, result:  [Date | null, Date | null]) => *} callback
 */
function validate_from_to({ from = null, to = null }, callback) {
  if (!from && !to) callback(null)
  try {
    if (from) from = new Date(from)
    else from = null

    if (to) to = new Date(to)
    else to = null

    if (from && to && from > to) callback('from must be < to')
    callback(null, [from, to])
  } catch (e) {
    callback('invalid dates')
  }
}

/**
 *
 * @param {{duration?: string}} params
 * @param {(err: string | null, result:  Date | null) => *} callback
 */
function validate_duration({ duration = null }, callback) {
  if (!duration) callback(null)
  try {
    callback(null, new Date(duration))
  } catch (e) {
    callback('duration must be date')
  }
}

/**
 *
 * @param {{reasons: string | null}} request - инстант запроса fastify
 * @param {(err: string | null, reasons: number[] | null) => *} callback
 */
function validate_reasons({ reasons = null }, callback) {
  if (!reasons) callback(null)
  const code_set = new Set()

  try {
    reasons = JSON.parse(reasons)
  } catch (e) {
    callback('reasons must be string with format: [1,2,3];')
  }

  for (let number of reasons) {
    if (isNaN(number)) callback('reasons must be number;')
    if (code_set.has(number)) callback('reasons must be unique;')
    if (number < 0) callback('reasons must be >= 0')
    if (number > 255) callback('reasons must be <= 255')
    code_set.add(number)
  }
  callback(null, Array.from(code_set))
}