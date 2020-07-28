const ticketRouter = require('express').Router()
const ticketService = require('../services/ticket')
const clamp = require('../utils/math').clamp


ticketRouter.get('', async (req, res) => {
  let n = Number(req.query.amount || 1)
  n = clamp(n, 1, 10)
  try {
    const ticketGenerators = new Array(n).fill().map(() => ticketService.generateUniqueTicket())
    const tickets = await Promise.all(ticketGenerators)
    res.status(200).json({ tickets })
  } catch (error) {
    return res.status(500).json(error)
  }
})

module.exports = ticketRouter
