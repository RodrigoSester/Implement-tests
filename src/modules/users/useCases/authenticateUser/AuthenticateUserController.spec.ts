import { Connection } from 'typeorm';
import request from 'supertest';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  it('should be able create session for a user', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'test',
        email: 'test@test.com',
        password: '61443'
      })

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: '61443'
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
  })

  it('should not be able to authenticate an unexistent user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'hi@latul.sd',
      password: ''
    })
    
    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Incorrect email or password")
  })

  it('should not be able to authenticate an user with incorrect password', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'test',
        email: 'test@test.com',
        password: '61443'
      })

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: ''
    })

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Incorrect email or password")
  })
})