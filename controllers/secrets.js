const secretRouter = require('express').Router()

const secrets = ['All', 'of', 'my', 'secrets'].map((s, i) => {
  return {
    secret: {
      id: i.toString(),
      data: s
    }
  }
})

secretRouter.get('/', (req, res) => {
  res.json({ secrets })
})

secretRouter.get('/:id', (req, res) => {
  res.json({ secret: { id: req.params.id, data: `secret${req.params.id}`}})
})


module.exports = secretRouter
