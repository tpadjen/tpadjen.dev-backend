const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const { createUser } = require('../utils/test_helpers')
const jwt = require('jsonwebtoken')


describe('login', () => {
  let legitUser

  beforeEach(async () => {
    legitUser = await createUser({
      name: 'Test',
      ticket: 'ticket'
    })
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

      const tokenData = jwt.decode(user.token)
      expect(tokenData.id).toBe(legitUser.id)
      expect(tokenData.name).toBe(legitUser.name)
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
