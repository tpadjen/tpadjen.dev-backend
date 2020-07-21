const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const {
  createUser,
  createInitialAdminUser,
  deleteNonEssentialUsers,
} = require('../utils/test_helpers')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


describe('login', () => {

  let adminToken
  beforeAll(async () => {
    adminToken = await createInitialAdminUser()
  })

  afterAll(() => {
    mongoose.connection.close()
  })

  let legitUser
  beforeEach(async () => {
    await deleteNonEssentialUsers()
    legitUser = await createUser({
      name: 'Test',
      ticket: 'ticket'
    }, adminToken)
  })

  describe('with a proper ticket', () => {

    test('should send a JWT with user info', async () => {
      const response = await api
        .post('/api/login')
        .send({ ticket: 'ticket' })
        .expect(200)
        .expect('Content-Type', /application\/json/)


      const user = response.body
      expect(user.id).toBe(legitUser.id)
      expect(user.name).toBe(legitUser.name)
      expect(user.roles).toEqual(['user'])

      const tokenData = jwt.decode(user.token)
      expect(tokenData.id).toBe(legitUser.id)
      expect(tokenData.name).toBe(legitUser.name)
      expect(tokenData.roles).toEqual(['user'])
    })

  })

  describe('without a proper ticket', () => {

    test('should be forbidden', async () => {
      const response = await api
        .post('/api/login')
        .send({ ticket: 'no ticket' })
        .expect(403)
        .expect('Content-Type', /application\/json/)

      expect(response.error).toBeTruthy()
    })

  })

})
