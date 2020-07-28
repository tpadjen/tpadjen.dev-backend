const mongoose = require('mongoose')
const {
  createInitialAdminUser,
  TICKETS_URL_BASE,
  deleteNonEssentialUsers,
  getWithToken,
  loginUser,
  createUser,
} = require('../utils/test_helpers')


describe('tickets', () => {

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

  describe('GET ', () => {

    test('requires admin', async () => {
      await createUser({ name: 'test', ticket: 'test' }, adminToken)
      const { token: userToken } = await loginUser('test')

      const { body } = await getWithToken(TICKETS_URL_BASE, userToken)
        .expect(401)

      expect(body).toBeUndefined()
    })

    test('should create a ticket', async () => {
      const { body: { tickets } } = await getWithToken(TICKETS_URL_BASE, adminToken)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(tickets).toHaveLength(1)
      expect(tickets[0].length).toBeGreaterThan(4)
    })

    test('can create multiple tickets', async () => {
      const amounts = new Array(10).fill().map((_, i) => i + 1)
      const tests = amounts.map(async (amount) => {
        return getWithToken(TICKETS_URL_BASE, adminToken)
          .query({ amount })
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .then(({ body: { tickets } }) => {
            expect(tickets).toHaveLength(amount)
            tickets.forEach(ticket => {
              expect(ticket.length).toBeGreaterThan(4)
            })
          })
      })
      await Promise.all(tests)
    })

    test('cannot create more than 10', async () => {
      const { body: { tickets } } = await getWithToken(TICKETS_URL_BASE, adminToken)
        .query({ amount: 11 })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(tickets).toHaveLength(10)
      tickets.forEach(ticket => {
        expect(ticket.length).toBeGreaterThan(4)
      })
    })

    test('always creates at least one', async () => {
      const { body: { tickets } } = await getWithToken(TICKETS_URL_BASE, adminToken)
        .query({ amount: 0 })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(tickets).toHaveLength(1)
      tickets.forEach(ticket => {
        expect(ticket.length).toBeGreaterThan(4)
      })
    })

    test('tickets should be slugs with three parts', async () => {
      const { body: { tickets } } = await getWithToken(TICKETS_URL_BASE, adminToken)
        .query({ amount: 10 })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      tickets.forEach(ticket => {
        expect(ticket).toMatch(/^[a-z]{3,12}-[a-z]{3,12}-[a-z]{3,12}$/)
      })
    })

  })

})