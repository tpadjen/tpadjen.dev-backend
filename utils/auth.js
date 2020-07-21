const jwt = require('jsonwebtoken')
const config = require('../utils/config')


const extractToken = (authorization) => {
  return authorization && authorization.toLowerCase().startsWith('bearer')
    ? authorization.substring(7)
    : undefined
}

const verifyToken = (req, res, next) => {
  const token = extractToken(req.get('Authorization'))

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send()

    req.userId = decoded.id
    req.roles = decoded.roles
    next()
  })

}

const isAdmin = (req, res, next) => {
  if (!req.roles || !req.roles.includes('admin')) return res.status(403).send()
  next()
}

module.exports = {
  verifyToken,
  isAdmin,
}
