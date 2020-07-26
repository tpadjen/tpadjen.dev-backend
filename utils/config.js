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
  GOOGLE_AUTH_ID: process.env.GOOGLE_AUTH_ID,
  GOOGLE_AUTH_SECRET: process.env.GOOGLE_AUTH_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
}
