const { Sequelize } = require('sequelize')

module.exports.sequelize = new Sequelize(
  process.env.DB_BASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'postgres',
    host: process.env.DB_HOST,
  },
)

module.exports.plugin = async function (fastify, options) {
  try {
    await module.exports.sequelize.authenticate()
    await sync_models()
  } catch (e) {
    console.error(e)
  }
}

function sync_models() {
  const sync_promises = []
  for (let model of [...require('./Core')]) sync_promises.push(model.sync())

  return Promise.all(sync_promises)
}
