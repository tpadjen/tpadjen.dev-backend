const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')
const { getUserById, getAllUsers, createUser } = require('../utils/test_helpers')

describe('users', () => {

  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('creation: ', () => {

    test('can be created', async () => {
      const userInfo = {
        name: 'Charlie',
        ticket: 'golden'
      }

      const { body: theUser } = await api
        .post('/api/users')
        .send(userInfo)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(theUser.name).toEqual(userInfo.name)
      expect(theUser.ticket).toBeUndefined()
      expect(theUser.id).toBeTruthy()

      const createdUser = await getUserById(theUser.id)

      expect(createdUser.name).toBe(userInfo.name)
      expect(createdUser.id).toBe(theUser.id)

      const users = await getAllUsers()
      const foundUser = users.find(user => user.id === theUser.id)

      expect(foundUser.name).toEqual(userInfo.name)
    })

    describe('name', () => {

      test('is required', async () => {
        const newUser = {
          ticket: 'No Name',
        }

        const response = await api
          .post('/api/users')
          .send(newUser)
          .expect(401)
          .expect('Content-Type', /application\/json/)


        expect(response.error.text).toContain('`name` is required')
        expect(response.id).toBeUndefined()
      })

    })


    describe('ticket', () => {

      beforeEach(async () => {
        await createUser({
          name: 'Charlie',
          ticket: 'golden'
        })
      })

      test('is required', async () => {
        const newUser = {
          name: 'No Ticket',
        }

        const response = await api
          .post('/api/users')
          .send(newUser)
          .expect(401)
          .expect('Content-Type', /application\/json/)


        expect(response.error.text).toContain('`ticket` is required')
        expect(response.id).toBeUndefined()
      })

      test('must be unique', async () => {
        const newUser = {
          name: 'Charlie',
          ticket: 'golden'
        }

        const response = await api
          .post('/api/users')
          .send(newUser)
          .expect(401)
          .expect('Content-Type', /application\/json/)

        expect(response.error.text).toContain('expected `ticket` to be unique')
        expect(response.id).toBeUndefined()
      })

    })

  })

  afterAll(() => {
    mongoose.connection.close()
  })

})