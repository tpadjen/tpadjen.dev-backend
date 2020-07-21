const express = require('express')
const config = require('./utils/config')
const cors = require('cors')
const morgan = require('morgan')
const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const db = require('./utils/db')

db.connect()
  .catch((error) => {
    console.error('error connecting to MongoDB', error.message)
    process.exit(-1)
  })

const app = express()

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('tiny'))
}
app.use(cors({
  origin: config.ORIGIN_URL
}))
app.use(express.json())

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)

// app.get('/', (_req, res) => {
//   res.json({ message: 'Welcome to the app' })
// })

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
