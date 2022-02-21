import { Connection } from 'typeorm';
import request from 'supertest';
import { app } from '../../../app';
import createConnection from '../../../database'

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
        amount: 676,
        description: 'Harriet Lawson'
      })
      .set({
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNTcwYzdhODAtYjc2Ny00ZWE5LWEzYWEtZTc1OGU1MmQ4YWQzIiwibmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCRlZVI2UldORmJMV3VoNGFHVzdURkNlZW9ZU1VmZmZON25ORXgyeFBnaUdRZmRrYXdlOTFhdSIsImNyZWF0ZWRfYXQiOiIyMDIyLTAyLTE4VDE1OjQyOjMyLjEzNFoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMi0xOFQxNTo0MjozMi4xMzRaIn0sImlhdCI6MTY0NTE5ODk1NCwiZXhwIjoxNjQ1Mjg1MzU0LCJzdWIiOiI1NzBjN2E4MC1iNzY3LTRlYTktYTNhYS1lNzU4ZTUyZDhhZDMifQ.BKSBFy9kWHEFIcnDpK5154lmCq-cVq4ieM19Up-Vo5I`
      })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })

  it('should not be able to make a withdraw with a unexistent user', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 976,
        description: 'Nannie Watkins'
      })
      .set({
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNTcwYzdhODAtYjc2Ny00ZWE5LWEzYWEtZTc1OGU1MmQ4YWQzIiwibmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCRlZVI2UldORmJMV3VoNGFHVzdURkNlZW9ZU1VmZmZON25ORXgyeFBnaUdRZmRrYXdlOTFhdSIsImNyZWF0ZWRfYXQiOiIyMDIyLTAyLTE4VDE1OjQyOjMyLjEzNFoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMi0xOFQxNTo0MjozMi4xMzRaIn0sImlhdCI6MTY0NTE5ODk1NCwiZXhwIjoxNjQ1Mjg1MzU0LCJzdWIiOiI1NzBjN2E4MC1iNzY3LTRlYTktYTNhYS1lNzU4ZTUyZDhhZDMifQ.BKSBFy9kWHEFIcnDpK5154lmCq-cVq4ieM19Up-Vo5I`
      })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })

  it('should not be able to make a withdraw more than amount', async () => {
    const { body } = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: '61443'
    })

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 87,
        description: 'Harriett Moss'
      })
      .set({
        Authorization: `Bearer ${body.token}`
      })
    
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 29084388,
        description: 'Nannie Watkins'
      })
      .set({
        Authorization: `Bearer ${body.token}`
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Insufficient funds')
  })

  it('should not be able to get balance of an unexistent user', async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNTcwYzdhODAtYjc2Ny00ZWE5LWEzYWEtZTc1OGU1MmQ4YWQzIiwibmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCRlZVI2UldORmJMV3VoNGFHVzdURkNlZW9ZU1VmZmZON25ORXgyeFBnaUdRZmRrYXdlOTFhdSIsImNyZWF0ZWRfYXQiOiIyMDIyLTAyLTE4VDE1OjQyOjMyLjEzNFoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMi0xOFQxNTo0MjozMi4xMzRaIn0sImlhdCI6MTY0NTE5ODk1NCwiZXhwIjoxNjQ1Mjg1MzU0LCJzdWIiOiI1NzBjN2E4MC1iNzY3LTRlYTktYTNhYS1lNzU4ZTUyZDhhZDMifQ.BKSBFy9kWHEFIcnDpK5154lmCq-cVq4ieM19Up-Vo5I`
      })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })

  it('should not be able to get a statement by unexistent user', async () => {
    const response = await request(app)
      .get(`/api/v1/statements/d2d6a932-ad44-4696-9317-af7d51ea6c4e`)
      .set({
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNTcwYzdhODAtYjc2Ny00ZWE5LWEzYWEtZTc1OGU1MmQ4YWQzIiwibmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCRlZVI2UldORmJMV3VoNGFHVzdURkNlZW9ZU1VmZmZON25ORXgyeFBnaUdRZmRrYXdlOTFhdSIsImNyZWF0ZWRfYXQiOiIyMDIyLTAyLTE4VDE1OjQyOjMyLjEzNFoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMi0xOFQxNTo0MjozMi4xMzRaIn0sImlhdCI6MTY0NTE5ODk1NCwiZXhwIjoxNjQ1Mjg1MzU0LCJzdWIiOiI1NzBjN2E4MC1iNzY3LTRlYTktYTNhYS1lNzU4ZTUyZDhhZDMifQ.BKSBFy9kWHEFIcnDpK5154lmCq-cVq4ieM19Up-Vo5I`
      })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })

  it('should not be able to get statement by unexistent id', async () => {
    const { body } = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: '61443'
    })

    const response = await request(app).get('/api/v1/statements/d2d6a932-ad44-4696-9317-af7d51ea6c4e').set({
      Authorization: `Bearer ${body.token}`
    })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Statement not found')
  })
})