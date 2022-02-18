import { app } from "../../../../app"
import request from "supertest"
import { Connection } from "typeorm"
import createConnection from '../../../../database/index'

let connection: Connection

describe('Transfer', () => {
  beforeAll( async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to make a transfer', async () => {
    const user = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jane Allison',
        email: 'egnek@zocas.im',
        password: '4740'
      })
    
    const { body } = await request(app).post('/api/v1/sessions').send({
      email: 'egnek@zocas.im',
      password: '4740'
    })

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 200,
        description: 'Churrasco'
      })
      .set({
        Authorization: `Bearer ${body.token}`
      })

    const response = await request(app).post(`/api/v1/statements/transfer/${user.body.id}`)
      .send({
        amount: 100,
        description: 'Beatrice Torres'
      })
      .set({
        Authorization: `Bearer ${body.token}`
      })

    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty('amount')
    expect(response.body).toHaveProperty('description')
    expect(response.body).toHaveProperty('type')
    expect(response.body).toHaveProperty('user_id')
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('created_at')
    expect(response.body).toHaveProperty('updated_at')

    expect(response.body.amount).toEqual(100)
    expect(response.body.description).toEqual('Beatrice Torres')
    expect(response.body.type).toEqual('transfer')
  })

  it('should not be able to make a transfer with unexistent user', async () => {
    const user = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jane Allison',
        email: 'egnek@zocas.im',
        password: '4740'
      })

    const response = await request(app).post(`/api/v1/statements/transfer/${user.body.id}`)
    .send({
      amount: 100,
      description: 'Beatrice Torres'
    })
    .set({
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNTcwYzdhODAtYjc2Ny00ZWE5LWEzYWEtZTc1OGU1MmQ4YWQzIiwibmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCRlZVI2UldORmJMV3VoNGFHVzdURkNlZW9ZU1VmZmZON25ORXgyeFBnaUdRZmRrYXdlOTFhdSIsImNyZWF0ZWRfYXQiOiIyMDIyLTAyLTE4VDE1OjQyOjMyLjEzNFoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wMi0xOFQxNTo0MjozMi4xMzRaIn0sImlhdCI6MTY0NTE5ODk1NCwiZXhwIjoxNjQ1Mjg1MzU0LCJzdWIiOiI1NzBjN2E4MC1iNzY3LTRlYTktYTNhYS1lNzU4ZTUyZDhhZDMifQ.BKSBFy9kWHEFIcnDpK5154lmCq-cVq4ieM19Up-Vo5I`
    })

    expect(response.status).toBe(404)
    expect(response.body.message).toEqual('User not found')
  })

  it('should not be able to tranfer to unexistent user', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jane Allison',
        email: 'egnek@zocas.im',
        password: '4740'
      })
    
    const { body } = await request(app).post('/api/v1/sessions').send({
      email: 'egnek@zocas.im',
      password: '4740'
    })

    await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 200,
        description: 'Churrasco'
      })
      .set({
        Authorization: `Bearer ${body.token}`
      })

    const response = await request(app).post(`/api/v1/statements/transfer/570c7a80-b767-4ea9-a3aa-e758e52d8ad3`)
      .send({
        amount: 100,
        description: 'Beatrice Torres'
      })
      .set({
        Authorization: `Bearer ${body.token}`
      })

    expect(response.status).toBe(404)
    expect(response.body.message).toEqual('User not found')
  })
})