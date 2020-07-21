const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')


const USERS_URL_BASE = '/api/admin/users'

const createUser = async (userInfo, token) => {
  const response = await api
    .post(USERS_URL_BASE)
    .set('Authorization', `Bearer ${token}`)
    .send(userInfo)
  return response.body
}

const createInitialAdminUser = async () => {
  await User.deleteMany({})
  const admin = new User({
    name: 'TestAdmin',
    ticket: 'admin',
    roles: ['admin']
  })
  await admin.save()
  const { token } = await loginUser('admin')
  return token
}

const deleteNonEssentialUsers = async () => {
  return User.deleteMany({ name: { $nin: ['TestAdmin'] } })
}

const loginUser = async (ticket) => {
  const response = await api
    .post('/api/login')
    .send({ ticket })
  return response.body
}

module.exports = {
  USERS_URL_BASE,
  createUser,
  loginUser,
  createInitialAdminUser,
  deleteNonEssentialUsers,
}
