const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../plugin')

class Person extends Model {}

Person.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
  },
  { sequelize },
)
