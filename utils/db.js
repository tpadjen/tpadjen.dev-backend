const mongoose = require('mongoose')
const { MONGODB_URI } = require('./config')
const logger = require('./logger')


const connect = () => {
  return mongoose.connect(MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => {
      logger.info('Connected to MongoDB')
    })
}

module.exports = { connect }
