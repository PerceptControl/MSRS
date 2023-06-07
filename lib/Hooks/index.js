const fp = require('fastify-plugin')
module.exports = fp(function (instance, _, done) {
  instance.decorate('srs_hooks', {
    api: {
      persons: require('./API/persons'),
      events: require('./API/events'),
      verdicts: require('./API/verdicts'),
      commends: require('./API/commends'),
      reports: require('./API/reports'),
    },
  })
  done()
})
