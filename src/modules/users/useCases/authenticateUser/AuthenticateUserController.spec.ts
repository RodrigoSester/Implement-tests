import { Connection } from 'typeorm';
import request from 'supertest';

import { app } from '../../../../app';
import createConnection from '../../../../database';
import { hash } from 'bcryptjs';

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

    console.log(response.error)

    expect(response.status).toBe(200)
  })
})