const express = require('express')
const config = require('./utils/config')
const cors = require('cors')
const morgan = require('morgan')
const middleware = require('./utils/middleware')
const {
  usersRouter,
  idUserRouter,
} = require('./controllers/users')
const googleRouter = require('./controllers/google')
const loginRouter = require('./controllers/login')
const secretsRouter = require('./controllers/secrets')

const db = require('./utils/db')
const {
  hasValidToken,
  isAdmin,
  isIDedUser,
} = require('./utils/auth')

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
app.use('/api/google', googleRouter)

if (process.env.NODE_ENV === 'test') {
  app.use('/api/secrets', [hasValidToken], secretsRouter)
}

// users can grab their own info
app.use('/api/users/:id', [hasValidToken, isIDedUser], idUserRouter)

// admins can access everything
app.use('/api/admin', [hasValidToken, isAdmin])
app.use('/api/admin/users', usersRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
