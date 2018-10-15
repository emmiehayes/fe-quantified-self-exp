const environment = process.env.NODE_ENV || 'development'
const configuration = require('../../knexfile')[environment]
const database = require('knex')(configuration)

class Food {

  static all() {
    return database('foods')
    .returning("*") 
  }

  static find(id) {
    return database('foods')
    .where('id', id)
    .select("*")
  }
}

module.exports = Food