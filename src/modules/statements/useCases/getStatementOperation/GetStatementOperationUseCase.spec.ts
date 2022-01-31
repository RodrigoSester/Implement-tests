import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let usersRepositoryInMemory: InMemoryUsersRepository
let statementRepositoryInMemory: InMemoryStatementsRepository
let getStatementOperationUseCase: GetStatementOperationUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

describe('Get statement operation', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementRepositoryInMemory = new InMemoryStatementsRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementRepositoryInMemory)
  })

  it('should be able to get statement operation by id statement', async () => {
    const user = {
      name: 'test',
      email: 'test@test.com',
      password: 'test'
    }

    const createdUser = await usersRepositoryInMemory.create(user)

    const depositStatement = {
      user_id: createdUser.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'description test'
    }

    const getStatementOperation = await statementRepositoryInMemory.create(depositStatement)

    expect(getStatementOperation).toMatchObject({
        type: 'deposit',
        amount: 100,
        description: 'description test'
    })
  })
})