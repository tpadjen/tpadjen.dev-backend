const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')
const {
  createUser,
  createInitialAdminUser,
  USERS_URL_BASE,
  ID_USER_URL_BASE,
  loginUser,
  deleteNonEssentialUsers,
  putWithToken,
  getWithToken,
} = require('../utils/test_helpers')
const { admin } = require('googleapis/build/src/apis/admin')

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

  describe('IDed User', () => {

    test('users can access their own info', async () => {
      const currentUser = await createUser({ name: 'access', ticket: 'now' }, adminToken)
      const { token: currentUserToken } = await loginUser('now')

      const { body } = await api
        .get(`${ID_USER_URL_BASE}/${currentUser.id}`)
        .set('Authorization', `Bearer ${currentUserToken}`)
        .expect(200)

      expect(body.id).toBe(currentUser.id)
      expect(body.name).toBe(currentUser.name)
      expect(body.roles).toEqual(currentUser.roles)
      expect(body.token).toBe(currentUser.token)
    })

    test("users cannot access someone else's info", async () => {
      const otherUser = await createUser({ name: 'other', ticket: 'else' }, adminToken)
      await createUser({ name: 'access', ticket: 'now' }, adminToken)
      const { token: currentUserToken } = await loginUser('now')

      const { body } = await api
        .get(`${ID_USER_URL_BASE}/${otherUser.id}`)
        .set('Authorization', `Bearer ${currentUserToken}`)
        .expect(403)

      expect(body.id).toBeUndefined()
      expect(body.name).toBeUndefined()
      expect(body.roles).toBeUndefined()
      expect(body.token).toBeUndefined()
    })
  })

  describe('Admin access', () => {

    test('accessible with authentication and admin', async () => {
      const { body } = await api
        .get(USERS_URL_BASE)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(body[0].name).toBe('TestAdmin')
    })

    test('improper roles are forbidden', async () => {
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
        expect(theUser.ticket).toBe(userInfo.ticket)
        expect(theUser.id).toBeTruthy()

        const createdUser = await User.findById(theUser.id)

        expect(createdUser.name).toBe(userInfo.name)
        expect(createdUser.id).toBe(theUser.id)
        expect(createdUser.created_at).toBeTruthy()
        expect(createdUser.updated_at).toBeTruthy()

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
          await Promise.all(roles.map(async (role) => {
            const response = await createUser({ name: 'name', ticket: 't', roles: [role] }, adminToken)

            expect(response.error.errors['roles.0'].properties.message).toMatch(`\`${role}\` is not a valid`)
            expect(response.id).toBeFalsy()
          }))

        })

      })

    })

    describe('get', () => {
      let user
      beforeEach(async () => {
        user = await createUser({ name: 'username', ticket: 'userticket' }, adminToken)
      })

      test('can get a user', async () => {
        const { body } = await getWithToken(
          `${USERS_URL_BASE}/${user.id}`,
          adminToken
        )
          .expect(200)

        expect(body.name).toBe(user.name)
        expect(body.ticket).toBe(user.ticket)
        expect(body.roles).toBeTruthy()
        expect(body.roles.length).toBe(1)
        expect(body.roles[0]).toBe('user')
        expect(body.created_at).toBeTruthy()
        expect(body.updated_at).toBeTruthy()
      })

      test('can get all users', async () => {
        await createUser({ name: 'username2', ticket: 'userticket2' }, adminToken)
        await createUser({ name: 'username3', ticket: 'userticket3' }, adminToken)

        const { body } = await getWithToken(
          `${USERS_URL_BASE}`,
          adminToken
        )
          .expect(200)

        expect(body.length).toBe(4)
        expect(body.map(user => user.name)).toContain('TestAdmin')
        expect(body.map(user => user.name)).toContain('username')
        expect(body.map(user => user.name)).toContain('username2')
        expect(body.map(user => user.name)).toContain('username3')
      })
    })

    describe('editing', () => {

      let original
      beforeEach(async () => {
        original = await createUser({ name: 'original-name', ticket: 'original-ticket' }, adminToken)
      })

      test('can change the name', async () => {
        const { body } = await putWithToken(
          `${USERS_URL_BASE}/${original.id}`,
          { name: 'new-name' },
          adminToken
        )
          .expect(200)
          .expect('Content-Type', /application\/json/)

        expect(body.name).toBe('new-name')
        expect(body.ticket).toBe(original.ticket)
      })

      test('can change the ticket', async () => {
        const { body } = await putWithToken(
          `${USERS_URL_BASE}/${original.id}`,
          { ticket: 'new-ticket' },
          adminToken
        )
          .expect(200)
          .expect('Content-Type', /application\/json/)

        expect(body.name).toBe(original.name)
        expect(body.ticket).toBe('new-ticket')
      })

      test('cannot change the roles', async () => {
        const { body } = await putWithToken(
          `${USERS_URL_BASE}/${original.id}`,
          { roles: ['admin'] },
          adminToken
        )
          .expect(200)
          .expect('Content-Type', /application\/json/)

        expect(body.name).toBe(original.name)
        expect(body.ticket).toBe(original.ticket)
        expect(body.roles.length).toBe(1)
        expect(body.roles[0]).toBe('user')
      })

    })
  })

})