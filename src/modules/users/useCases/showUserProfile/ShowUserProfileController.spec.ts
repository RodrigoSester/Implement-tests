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

  it('should not be able to show a profile of a unexistent user', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNTcwYzdhODAtYjc2Ny00ZWE5LWEzYWEtZTc1OGU1MmQ4YWQzIiwibmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCRlZVI2UldORmJMV3VoNGFHVzdURkNlZW9ZU1VmZmZON25ORXgyeFBnaUdRZmRrYXdlOTFhdSIsImNyZWF0ZWRfYXQiOiIyMDIyLTAyLTE4VDE1OjQyOjMyLjEzNFoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMi0xOFQxNTo0MjozMi4xMzRaIn0sImlhdCI6MTY0NTE5ODk1NCwiZXhwIjoxNjQ1Mjg1MzU0LCJzdWIiOiI1NzBjN2E4MC1iNzY3LTRlYTktYTNhYS1lNzU4ZTUyZDhhZDMifQ.BKSBFy9kWHEFIcnDpK5154lmCq-cVq4ieM19Up-Vo5I`
    })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })
})