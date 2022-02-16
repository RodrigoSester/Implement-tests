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
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZDY1ZTRmMjktNmM2Yi00NGJkLWE5YzItMTAyZDMxNWZhZmI2IiwibmFtZSI6Ik1hcmlhIEZpZ3Vlcm9hIiwiZW1haWwiOiJrZWRhd0B1cG9pYm5pbS51YSIsInBhc3N3b3JkIjoiJDJhJDA4JEtXOWV2UDViZldyOWhvdDZiNDdCenVBbTJ1V1NqZ1UxRHBzQkhvUk8ybDRDd3NMem9vV3NtIiwiY3JlYXRlZF9hdCI6IjIwMjItMDItMTZUMTQ6NDA6MDcuNjE4WiIsInVwZGF0ZWRfYXQiOiIyMDIyLTAyLTE2VDE0OjQwOjA3LjYxOFoifSwiaWF0IjoxNjQ1MDIyNDA3LCJleHAiOjE2NDUxMDg4MDcsInN1YiI6ImQ2NWU0ZjI5LTZjNmItNDRiZC1hOWMyLTEwMmQzMTVmYWZiNiJ9.7fuSANap0i2W8Oit1FNSNJU7Sk9F07V3eQx0heaRhLI`
    })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })
})