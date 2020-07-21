const path = require('path')

let environment = 'development'
switch (process.env.NODE_ENV) {
  case 'production':
    environment = 'production'
    break
  case 'test':
    environment = 'test'
    break
}

require('dotenv').config({
  path: path.join(__dirname, `../.env.${environment}`)
})

module.exports = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  ORIGIN_URL: process.env.ORIGIN_URL,
  DB_FILE: `db.${environment}.json`,
  MONGODB_URI: process.env.MONGODB_URI,
}
