const googleRouter = require('express').Router()
const config = require('../utils/config')
const { google } = require('googleapis')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_AUTH_ID,
  config.GOOGLE_AUTH_SECRET,
  config.GOOGLE_REDIRECT_URI
)
google.options({ auth: oauth2Client })


async function verify(token) {
  const ticket = await oauth2Client.verifyIdToken({
    idToken: token,
    audience: config.GOOGLE_AUTH_ID,
  })
  const payload = ticket.getPayload()
  payload.userid = payload['sub']
  return payload
}

googleRouter.post('/authenticate', async (req, res) => {
  const { id_token } = req.body
  if (!id_token) return res.status(403).json({ message: 'Sign in failed' })

  let payload

  try {
    payload = await verify(id_token)
  } catch (error) {
    return res.status(403).json({ message: 'Sign in failed' })
  }

  try {
    const user = await User.findOne({ googleId: payload.userid })

    if (!user) return res.status(401).json({ message: 'You are not worthy' })

    const userInfo = {
      id: user._id,
      name: user.name,
      roles: user.roles
    }

    const token = jwt.sign(userInfo, config.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    })

    return res.json({ ...userInfo, token })
  } catch (error) {
    return res.status(401).json({ message: 'You are not an admin' })
  }
})

module.exports = googleRouter
