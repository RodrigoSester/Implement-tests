import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { CreateStatementError } from "./CreateStatementError"

let usersRepositoryInMemory: InMemoryUsersRepository
let statementeRepositoryInMemory: InMemoryStatementsRepository
let createStatementUseCase: CreateStatementUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

describe('Create statement', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementeRepositoryInMemory = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementeRepositoryInMemory)
  })

  it('should be able to create a new statement', async () => {
    const user = {
      name: 'test',
      email: 'test@test.com',
      password: 'test'
    }

    const createdUser = await usersRepositoryInMemory.create(user)

    const statement = {
      user_id: createdUser.id!,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: 'description test'
    }

    const statementCreated = await createStatementUseCase.execute(statement)

    expect(statementCreated).toHaveProperty('id')
  })

  it('should not be able to make a statement of a unexistent user id', () => {
    expect(async () => {
      const statement = {
        user_id: 'test',
        type: OperationType.DEPOSIT,
        amount: 200,
        description: 'description test'
      }

      await createStatementUseCase.execute(statement)
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it('should not be able to make a withdraw of a insufficient funds', () => {
    expect(async () => {
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
      
      await createStatementUseCase.execute(depositStatement)

      const withdrawStatement = {
        user_id: createdUser.id!,
        type: OperationType.WITHDRAW,
        amount: 200,
        description: 'description test'
      }

      await createStatementUseCase.execute(withdrawStatement)
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})