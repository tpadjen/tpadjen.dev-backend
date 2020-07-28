const _ = require('lodash')
const POSITIVE = require('../data/fixtures/positivity')
const ANIMALS = require('../data/fixtures/animals')
const FRUITS_AND_VEGGIES = require('../data/fixtures/fruits-and-veggies')
const HIPSTER = require('../data/fixtures/hipster')
const User = require('../models/user')


const generateTicket = () => {
  const positive = _.sample(POSITIVE)
  const others = [_.sample(ANIMALS), _.sample(FRUITS_AND_VEGGIES), _.sample(HIPSTER)]
  const chosen = _.shuffle([positive, ..._.sampleSize(others, 2)])
  return chosen.join('-')
}

const generateUniqueTicket = async () => {
  let ticket = generateTicket()
  let count = 0
  // eslint-disable-next-line no-cond-assign
  while (await User.findOne({ ticket })) {
    ticket = generateTicket()
    count = count + 1
    if (count > 12) throw new Error('Ticket generation error')
  }
  return ticket
}

module.exports = {
  generateUniqueTicket,
}
