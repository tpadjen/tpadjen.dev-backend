const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)


const getUserById = async (id) => {
  const response = await api.get(`/api/users/${id}`)
  return response.body
}

const getAllUsers = async () => {
  const response = await api.get('/api/users')
  return response.body
}

const createUser = async (userInfo) => {
  const response = await api.post('/api/users').send(userInfo)
  return response.body
}

const loginUser = async (ticket) => {
  const response = await api
    .post('/api/login')
    .send({ ticket })
  return response.body
}

module.exports = {
  getUserById,
  getAllUsers,
  createUser,
  loginUser,
}
