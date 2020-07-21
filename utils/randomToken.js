const crypto = require('crypto')


crypto.randomBytes(64, function (_err, buffer) {
  const token = buffer.toString('hex')
  console.log(token)
})