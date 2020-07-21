const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, _request, _response, next) => {
  // console.error(error.message)

  // if (error.name === 'CastError') {
  //   return response.status(400).send({ error: 'malformatted id' })
  // } else if (error.name === 'ValidationError') {
  //   return response.status(400).json({ error: error.message })
  // } else if (error.name === 'JsonWebTokenError') {
  //   return response.status(401).json({ error: 'not authorized' })
  // }

  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}