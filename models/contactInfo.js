const mongoose = require('mongoose')

const contactInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  github: {
    type: String,
    required: true
  },
  linkedin: {
    type: String,
    required: true
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

contactInfoSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const User = mongoose.model('ContactInfo', contactInfoSchema)

module.exports = User
