const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.post('', async (req, res) => {
  const { name, ticket, roles } = req.body
  try {
    const newUser = await new User({ name, ticket, roles }).save()
    res.json(newUser)
  } catch (error) {
    return res.status(401).send({ error: error })
  }
})

usersRouter.get('', async (_req, res) => {
  const users = await User.find({})
  res.json(users)
})

usersRouter.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  res.json(user)
})

module.exports = usersRouter
