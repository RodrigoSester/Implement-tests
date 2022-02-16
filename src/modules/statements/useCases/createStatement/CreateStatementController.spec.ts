import { Connection } from 'typeorm';
import request from 'supertest';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;

describe('Create statement', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'test',
        email: 'test@test.com',
        password: '61443'
      })
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  it('should be able to make a deposit', async () => {
    const { body } = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: '61443'
    })

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 200,
        description: 'Churrasco'
      })
      .set({
        Authorization: `Bearer ${body.token}`
      })

    expect(response.status).toBe(201)

    expect(response.body).toHaveProperty('user_id')
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('updated_at')
    expect(response.body).toHaveProperty('created_at')
    
    expect(response.body.amount).toEqual(200)
    expect(response.body.type).toEqual('deposit')
    expect(response.body.description).toEqual('Churrasco')
  })

  it('should be able to make a deposit', async () => {
    const { body } = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: '61443'
    })

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 100,
        description: 'Contas'
      })
      .set({
        Authorization: `Bearer ${body.token}`
      })

    expect(response.status).toBe(201)

    expect(response.body).toHaveProperty('user_id')
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('updated_at')
    expect(response.body).toHaveProperty('created_at')
    
    expect(response.body.amount).toEqual(100)
    expect(response.body.type).toEqual('withdraw')
    expect(response.body.description).toEqual('Contas')
  })

  it('should be able to get balance of user', async () => {
    const { body } = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: '61443'
    })

    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${body.token}`
    })

    expect(response.status).toBe(200)
    expect(response.body.balance).toBe(100)
    expect(response.body).toHaveProperty('statement')
  })

  it('should be able to list a statement by id', async () => {
    const { body } = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: '61443'
    })

    const balance = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${body.token}`
    })

    const response = await request(app).get(`/api/v1/statements/${balance.body.statement[0].id}`).set({
      Authorization: `Bearer ${body.token}`
    })
    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('user_id')
    expect(response.body).toHaveProperty('description')
    expect(response.body).toHaveProperty('amount')
    expect(response.body).toHaveProperty('type')
    expect(response.body).toHaveProperty('created_at')
    expect(response.body).toHaveProperty('updated_at')
  })

  it('should not be able to make a deposit with a unexistent user', async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 200,
        description: 'Churrasco'
      })
      .set({
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZDY1ZTRmMjktNmM2Yi00NGJkLWE5YzItMTAyZDMxNWZhZmI2IiwibmFtZSI6Ik1hcmlhIEZpZ3Vlcm9hIiwiZW1haWwiOiJrZWRhd0B1cG9pYm5pbS51YSIsInBhc3N3b3JkIjoiJDJhJDA4JEtXOWV2UDViZldyOWhvdDZiNDdCenVBbTJ1V1NqZ1UxRHBzQkhvUk8ybDRDd3NMem9vV3NtIiwiY3JlYXRlZF9hdCI6IjIwMjItMDItMTZUMTQ6NDA6MDcuNjE4WiIsInVwZGF0ZWRfYXQiOiIyMDIyLTAyLTE2VDE0OjQwOjA3LjYxOFoifSwiaWF0IjoxNjQ1MDIyNDA3LCJleHAiOjE2NDUxMDg4MDcsInN1YiI6ImQ2NWU0ZjI5LTZjNmItNDRiZC1hOWMyLTEwMmQzMTVmYWZiNiJ9.7fuSANap0i2W8Oit1FNSNJU7Sk9F07V3eQx0heaRhLI`
      })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })
})