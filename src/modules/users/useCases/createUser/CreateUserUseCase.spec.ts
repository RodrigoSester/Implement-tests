import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"

let usersRepositoryInMemory: InMemoryUsersRepository

describe('Create user use case', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
  })

  it('it should be able to create a new user', async () => {
    const user = {
      name: 'test',
      email: 'test@test.com', 
      password: 'test'
    }

    const created = await usersRepositoryInMemory.create(user)

    expect(created).toHaveProperty('id')
  })

})