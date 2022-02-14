import request from "supertest"
import { Connection } from "typeorm"
import { app } from '../../../../app'
import { CreateUserError } from "./CreateUserError"
import createConnection from '../../../../database'

let connection: Connection

describe('Create user controller', () => {
  beforeAll( async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll( async () => {
    await connection.dropDatabase()
  })

  it('it should be able to create a new user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'test',
        email: 'test@test.com',
        password: 'test'
      })

    expect(response.statusCode).toBe(201)
  })

  it('should not be able to create new user with email already exists', async () => {
    const email = 'test@test.com'

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email,
      password: 'test'
    })

    const response = await request(app).post('api/v1/users').send({
      name: 'test',
      email,
      password: 'test'
    })

    expect(response.statusCode).toBe(400)
  })
})