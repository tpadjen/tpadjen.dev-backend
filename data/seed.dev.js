const User = require('../models/user')
const db = require('../utils/db')
const mongoose = require('mongoose')

const userData = require(`./fixtures/users.${process.env.NODE_ENV}.json`)
const PRODUCTION = process.env.NODE_ENV === 'production'

const seedDb = async () => {
  await db.connect()
  console.log('Connected')
  if (!PRODUCTION) {
    console.log('Clearing...')
    await User.deleteMany({})
  }
  console.log('Adding users')
  await Promise.all(userData.users.map( async(user) => {
    const newUser = await new User(user).save()
    console.log(`Created ${newUser.name}`)
  }))
}

seedDb()
  .then(() => {
    console.log('Finished')
    mongoose.connection.close()
  })
