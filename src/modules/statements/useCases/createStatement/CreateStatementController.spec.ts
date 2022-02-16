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

    console.log(response.body)

    expect(response.status).toBe(200)
    expect(response.body.balance).toBe(100)
    expect(response.body).toHaveProperty('statement')
  })
})