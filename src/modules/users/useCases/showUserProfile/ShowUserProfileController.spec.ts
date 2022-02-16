import { Connection } from 'typeorm';
import request from 'supertest';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;

describe('Show user profile', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  it('should be able to show a user profile', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Maria Figueroa',
        email: 'kedaw@upoibnim.ua',
        password: '#276297'
      })
    
    const { body } = await request(app).post('/api/v1/sessions').send({
      email: 'kedaw@upoibnim.ua',
      password: '#276297'
    })
    
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${body.token}`
    })

    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty('created_at')
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('updated_at')
    
    expect(response.body.name).toEqual('Maria Figueroa')
    expect(response.body.email).toEqual('kedaw@upoibnim.ua')
    
  })
})