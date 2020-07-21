const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')
const { createUser, loginUser } = require('../utils/test_helpers')
const User = require('../models/user')

describe('Auth', () => {

  beforeEach(async () => {
    await User.deleteMany({})
    await createUser({ name: 'Test', ticket: 'ticket' })
  })

  describe('some routes do not require auth', () => {

    test('POST login', async () => {
      await api
        .post('/api/login')
        .send({ ticket: 'no ticket' })
        .expect(403)
    })

    test('GET login', async () => {
      await api
        .get('/api/login')
        .expect(404)
    })

  })

  describe('some routes do require auth', () => {

    test('GET secrets', async () => {
      await api
        .get('/api/secrets')
        .expect(401)
    })

    test('GET secrets/:id', async () => {
      await api
        .get('/api/secrets/0')
        .expect(401)
    })

    test('GET secrets with token', async () => {
      const loggedIn = await loginUser('ticket')

      const { body } = await api
        .get('/api/secrets')
        .set('Authorization', `Bearer ${loggedIn.token}`)
        .expect(200)

      const message = body.secrets.map(secret => secret.secret.data).join(' ')
      expect(message).toContain('All of my secrets')
    })

    test('GET secrets/:id with token', async () => {
      const loggedIn = await loginUser('ticket')

      const { body } = await api
        .get('/api/secrets/0')
        .set('Authorization', `Bearer ${loggedIn.token}`)
        .expect(200)

      expect(body.secret.data).toBe('secret0')
    })

  })

  afterAll(() => {
    mongoose.connection.close()
  })

})
