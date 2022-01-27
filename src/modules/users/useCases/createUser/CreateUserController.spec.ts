import { UsersRepository } from "../../../users/repositories/UsersRepository"
import request from "supertest"
import { app } from "../../../../app"
import { CreateUserUseCase } from "./CreateUserUseCase"

let usersRepository: UsersRepository
let createUserUseCase: CreateUserUseCase

describe('Create User', () => {

  beforeEach(() => {
    usersRepository = new UsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    jest.useFakeTimers()
  })

  it('it should be create a new user', async () => {
    const user = {
      name: 'test',
      email: 'test@test.com',
      password: 'test'
    }

    const responseR = await request(app)
      .post('/api/v1/users')
      .send(user)

    expect(responseR.status).toBe(201)
  })
})