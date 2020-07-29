const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const ROLES = ['user', 'admin']

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ticket: {
    type: String,
    unique: true,
    required: true,
  },
  roles: {
    type: [{
      type: String,
      enum: ROLES
    }],
    'default': ['user'],
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

userSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    if (returnedObject.roles.includes('admin'))
      delete returnedObject.ticket
  }
})

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema)

module.exports = User
