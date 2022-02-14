import { Connection } from 'typeorm';
import request from 'supertest';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
  })

  it('should be able create session for a user', async () => {
    const email = 'test@test.com'
    const password = 'test'

    const response = await request(app).post('api/v1/sessions').send({
      email,
      password
    })

    expect(response.status).toBe(200)
  })
})