const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')
const {
  createUser,
  createInitialAdminUser,
  USERS_URL_BASE,
  loginUser,
  deleteNonEssentialUsers,
} = require('../utils/test_helpers')

describe('users', () => {

  let adminToken = undefined
  beforeAll(async () => {
    adminToken = await createInitialAdminUser()
  })

  afterAll(() => {
    mongoose.connection.close()
  })

  beforeEach(async () => {
    await deleteNonEssentialUsers()
  })

  describe('auth', () => {

    test('accessible with authentication and admin', async () => {
      const { body } = await api
        .get(USERS_URL_BASE)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(body[0].name).toBe('TestAdmin')
    })

    test('improper roles is forbidden', async () => {
      await createUser({ name: 'another admin', ticket: 'another admin' }, adminToken)
      const { token: userToken } = await loginUser('another admin')


      const { body } = await api
        .get(USERS_URL_BASE)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)

      expect(body[0]).toBeUndefined()
    })

    test('bad token is unauthorized', async () => {
      const { body } = await api
        .get(USERS_URL_BASE)
        .set('Authorization', 'Bearer not-admin')
        .expect(401)

      expect(body[0]).toBeUndefined()
    })

  })

  describe('with authenticated admin', () => {

    describe('creation: ', () => {

      test('can be created', async () => {
        const userInfo = {
          name: 'Charlie',
          ticket: 'golden'
        }

        const { body: theUser } = await api
          .post(USERS_URL_BASE)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(userInfo)
          .expect(200)
          .expect('Content-Type', /application\/json/)

        expect(theUser.name).toEqual(userInfo.name)
        expect(theUser.ticket).toBeUndefined()
        expect(theUser.id).toBeTruthy()

        const createdUser = await User.findById(theUser.id)

        expect(createdUser.name).toBe(userInfo.name)
        expect(createdUser.id).toBe(theUser.id)

        const users = await User.find({})
        const foundUser = users.find(user => user.id === theUser.id)

        expect(foundUser.name).toEqual(userInfo.name)
      })

      describe('name', () => {

        test('is required', async () => {
          const newUser = {
            ticket: 'No Name',
          }

          const response = await api
            .post(USERS_URL_BASE)
            .set('Authorization', `Bearer ${adminToken}`)
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
          }, adminToken)
        })

        test('is required', async () => {
          const newUser = {
            name: 'No Ticket',
          }

          const response = await api
            .post(USERS_URL_BASE)
            .set('Authorization', `Bearer ${adminToken}`)
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
            .post(USERS_URL_BASE)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newUser)
            .expect(401)
            .expect('Content-Type', /application\/json/)

          expect(response.error.text).toContain('expected `ticket` to be unique')
          expect(response.id).toBeUndefined()
        })

      })

      describe('roles', () => {

        test("should default to ['user']", async () => {
          const user = await createUser({ name: 'name', ticket: 't' }, adminToken)

          expect(user.roles).toHaveLength(1)
          expect(user.roles[0]).toBe('user')
        })

        test('can include admin', async () => {
          const user = await createUser({ name: 'name', ticket: 't', roles: ['admin'] }, adminToken)

          expect(user.roles).toHaveLength(1)
          expect(user.roles[0]).toBe('admin')
        })

        test('can be both user and admin', async () => {
          const user = await createUser({ name: 'name', ticket: 't', roles: ['user', 'admin'] }, adminToken)

          expect(user.roles).toHaveLength(2)
          expect(user.roles.includes('admin')).toBe(true)
          expect(user.roles.includes('user')).toBe(true)
        })


        test('can not be other roles', async () => {
          const roles = ['apple', 'superuser', 'sudo', 'president', 'boss']
          await Promise.all(roles.map(async (role) =>  {
            const response = await createUser({ name: 'name', ticket: 't', roles: [role] }, adminToken)

            expect(response.error.errors['roles.0'].properties.message).toMatch(`\`${role}\` is not a valid`)
            expect(response.id).toBeFalsy()
          }))

        })

      })

    })

  })

})