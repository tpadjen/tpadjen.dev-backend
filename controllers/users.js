const usersRouter = require('express').Router()
const { verifyToken } = require('../auth/verifyToken')
const User = require('../models/user')

usersRouter.post('', async (req, res) => {
  const { name, ticket } = req.body
  try {
    const newUser = await new User({ name, ticket }).save()
    res.json(newUser)
  } catch (error) {
    return res.status(401).send({ error: error })
  }
})

if (process.env.NODE_ENV === 'test') {

  usersRouter.get('', async (_req, res) => {
    const users = await User.find({})
    res.json(users)
  })

  usersRouter.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id)
    res.json(user)
  })

}

module.exports = usersRouter
