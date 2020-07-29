const usersRouter = require('express').Router()
const idUserRouter = require('express').Router()
const User = require('../models/user')


usersRouter.post('', async (req, res) => {
  const { name, ticket, roles = ['user'] } = req.body
  try {
    const newUser = await new User({ name, ticket, roles }).save()
    res.json(newUser)
  } catch (error) {
    return res.status(401).send({ error: error })
  }
})

usersRouter.put('/:id', async (req, res) => {
  const { name, ticket } = req.body
  const originalUser = await User.findById(req.params.id)
  if (!originalUser) return res.status(403).send()

  try {
    originalUser.name = name || originalUser.name
    originalUser.ticket = ticket || originalUser.ticket

    await originalUser.save()
    return res.status(200).send(originalUser)
  } catch (error) {
    return res.status(401).send()
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

idUserRouter.get('', async (req, res) => {
  const user = await User.findById(req.userId)
  res.json(user)
})

module.exports = {
  usersRouter,
  idUserRouter,
}
