import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

let usersRepositoryInMemory: InMemoryUsersRepository
let authenticateUser: AuthenticateUserUseCase

describe('Authenticate user', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    authenticateUser = new AuthenticateUserUseCase(usersRepositoryInMemory)
  })

  it('should not be able to authenticate a unexistent user', async () => {
    expect(async () => {
      await authenticateUser.execute({email: '', password: ''})
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})