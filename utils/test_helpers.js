const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')


const ID_USER_URL_BASE = '/api/users'
const USERS_URL_BASE = '/api/admin/users'
const TICKETS_URL_BASE = '/api/admin/tickets'
const CONTACT_INFO_URL_BASE = '/api/contact-info'

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
    googleId: 'admin-google-id',
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

const getWithToken = (url, token) => {
  return api.get(url).set('Authorization', `Bearer ${token}`)
}

const putWithToken = (url, data, token) => {
  return api
    .put(url)
    .send(data)
    .set('Authorization', `Bearer ${token}`)
}

module.exports = {
  ID_USER_URL_BASE,
  USERS_URL_BASE,
  TICKETS_URL_BASE,
  CONTACT_INFO_URL_BASE,
  createUser,
  loginUser,
  createInitialAdminUser,
  deleteNonEssentialUsers,
  getWithToken,
  putWithToken,
}
