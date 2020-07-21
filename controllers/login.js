const loginRouter = require('express').Router()
const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


loginRouter.post('', async (req, res) => {
  const { ticket } = req.body
  const user = await User.findOne({ ticket })

  if (!user) return res.status(403).send({ error: 'nope' })

  const userInfo = { id: user._id, name: user.name }
  const token = jwt.sign(userInfo, config.JWT_SECRET, {
    expiresIn: 86400 // 24 hours
  })
  res.json({ ...userInfo, token })
})

module.exports = loginRouter
