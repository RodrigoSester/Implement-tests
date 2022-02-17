import { app } from "../../../../app"
import request from "supertest"
import { Connection } from "typeorm"
import createConnection from '../../../../database/index'

let connection: Connection

describe('Transfer', () => {
  beforeAll( async () => {
    connection = await createConnection()
    await connection.runMigrations()

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Mattie Strickland',
        email: 'fabsij@gako.de',
        password: '562832'
      })
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
})