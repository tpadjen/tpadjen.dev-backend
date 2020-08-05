const loginRouter = require('express').Router()
const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


loginRouter.post('', async (req, res) => {
  const { ticket } = req.body
  const user = await User.findOne({ ticket })


  if (!user) return res.status(403).json({ message: 'nope' })

  // reject admin users logging in with just a ticket, except in testing
  if (process.env.NODE_ENV !== 'test')
    if (user.googleId) return res.status(403).json({ message: 'nope' })

  const userInfo = {
    id: user._id,
    name: user.name,
    roles: user.roles,
    jobTitle: user.jobTitle,
  }

  const token = jwt.sign(userInfo, config.JWT_SECRET, {
    expiresIn: 86400 // 24 hours
  })

  res.json({ ...userInfo, token })
})

module.exports = loginRouter
