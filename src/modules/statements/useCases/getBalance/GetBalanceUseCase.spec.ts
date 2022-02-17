import { Statement } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceUseCase } from "./GetBalanceUseCase"
import { GetBalanceError } from "./GetBalanceError"

let usersRepositoryInMemory: InMemoryUsersRepository
let statementRepositoryInMemory: InMemoryStatementsRepository
let getBalanceUseCase: GetBalanceUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

describe('Get balance', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementRepositoryInMemory = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementRepositoryInMemory, usersRepositoryInMemory)
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

    await statementRepositoryInMemory.create(depositStatement)

    const getBalance = await getBalanceUseCase.execute({user_id: createdUser.id!})

    expect(getBalance.balance).toBe(100)
  })

  it('should not be able to get balance of a unexistent user', () => {
    expect(async () => {
      await getBalanceUseCase.execute({user_id: ''})
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})