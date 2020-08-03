const mongoose = require('mongoose')
const {
  createUser,
  createInitialAdminUser,
  CONTACT_INFO_URL_BASE,
  loginUser,
  deleteNonEssentialUsers,
  getWithToken,
} = require('../utils/test_helpers')
const ContactInfo = require('../models/contactInfo')


describe('contact-info', () => {

  let adminToken = undefined
  beforeAll(async () => {
    adminToken = await createInitialAdminUser()
  })

  afterAll(() => {
    mongoose.connection.close()
  })

  beforeEach(async () => {
    await deleteNonEssentialUsers()
    await ContactInfo.deleteMany({})
  })

  describe('Not logged in', () => {

    test('non-users cannot access the contact info', async () => {
      const contact = new ContactInfo({
        email: 'test@example.com',
        phone: '5555555555',
        github: 'test-user@github.com',
        linkedin: 'linkedin.com/exampleuser'
      })
      await contact.save()

      const { body } = await getWithToken(CONTACT_INFO_URL_BASE, 'not a valid token')
        .expect(401)

      expect(body.id).toBeUndefined()
      expect(body._id).toBeUndefined()
      expect(body.email).toBeUndefined()
      expect(body.phone).toBeUndefined()
      expect(body.github).toBeUndefined()
      expect(body.linkedin).toBeUndefined()
    })

  })

  describe('IDed User', () => {

    test('users can access the contact info', async () => {
      const contact = new ContactInfo({
        email: 'test@example.com',
        phone: '5555555555',
        github: 'test-user@github.com',
        linkedin: 'linkedin.com/exampleuser'
      })
      await contact.save()
      await createUser({ name: 'access', ticket: 'now' }, adminToken)
      const { token: currentUserToken } = await loginUser('now')

      const { body } = await getWithToken(CONTACT_INFO_URL_BASE, currentUserToken)
        .expect(200)

      expect(body.id).toBeTruthy()
      expect(body._id).toBeUndefined()
      expect(body.email).toBe(contact.email)
      expect(body.phone).toBe(contact.phone)
      expect(body.github).toEqual(contact.github)
      expect(body.linkedin).toBe(contact.linkedin)
    })

  })

  describe('Admin user', () => {

    test('admin users can access the contact info', async () => {
      const contact = new ContactInfo({
        email: 'test2@example.com',
        phone: '5555555556',
        github: 'test-user2@github.com',
        linkedin: 'linkedin.com/exampleuser2'
      })
      await contact.save()

      const { body } = await getWithToken(CONTACT_INFO_URL_BASE, adminToken)
        .expect(200)

      expect(body.id).toBeTruthy()
      expect(body._id).toBeUndefined()
      expect(body.email).toBe(contact.email)
      expect(body.phone).toBe(contact.phone)
      expect(body.github).toEqual(contact.github)
      expect(body.linkedin).toBe(contact.linkedin)
    })

  })

})