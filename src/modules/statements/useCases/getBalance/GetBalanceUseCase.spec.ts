import { Statement } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let usersRepositoryInMemory: InMemoryUsersRepository
let statementRepositoryInMemory: InMemoryStatementsRepository
let getBalanceUseCase: GetBalanceUseCase
let createStatementUseCase: CreateStatementUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

describe('Get balance', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementRepositoryInMemory = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementRepositoryInMemory, usersRepositoryInMemory)
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory)
  })
  
  it('should be able to get balance of a user', async () => {
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

    const getBalance = await getBalanceUseCase.execute({user_id: createdUser.id!})

    expect(getBalance.balance).toBe(100)
  })
})