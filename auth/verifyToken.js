// const { UserDatabase } = require('../data/database')
const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token']
  console.log('Token', token)

  if (!token) {
    return res.status(403)
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401)

    req.userId = decoded.id
    next()
  })
}



