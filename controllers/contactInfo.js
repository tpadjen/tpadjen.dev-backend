const contactInfoRouter = require('express').Router()
const ContactInfo = require('../models/contactInfo')


contactInfoRouter.get('', async (_req, res) => {
  const infos = await ContactInfo.find({})
  return res.status(200).json(infos[0])
})

module.exports = contactInfoRouter
