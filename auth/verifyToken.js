// const { UserDatabase } = require('../data/database')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')


const extractToken = (authorization) => {
  return authorization && authorization.toLowerCase().startsWith('bearer')
    ? authorization.substring(7)
    : undefined
}

exports.verifyToken = (req, res, next) => {
  const token = extractToken(req.get('Authorization'))

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send()
    req.userId = decoded.id
    next()
  })

}
