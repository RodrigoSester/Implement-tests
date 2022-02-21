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
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiOWI2M2Q3NTctMTBmNy00NjA3LWJmZTktNTUyNDk5Nzc2YzNkIiwibmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCRSVVE1SWouTDlRb1NHOWZLODhnb2pPNm5PaWczd3k2VDQ0Q0pSSjJMV3ZNR2pLdXByYy5xVyIsImNyZWF0ZWRfYXQiOiIyMDIyLTAyLTIxVDEyOjI5OjQxLjY1NFoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMi0yMVQxMjoyOTo0MS42NTRaIn0sImlhdCI6MTY0NTQ0NjYwMSwiZXhwIjoxNjQ1NTMzMDAxLCJzdWIiOiI5YjYzZDc1Ny0xMGY3LTQ2MDctYmZlOS01NTI0OTk3NzZjM2QifQ.4Scyo3Fe8JO8alMjEkPGqUMoEDMxvgfq8wKBhgX8d2M`
    })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })
})