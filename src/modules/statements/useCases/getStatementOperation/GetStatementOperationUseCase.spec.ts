import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"


let usersRepositoryInMemory: InMemoryUsersRepository
let statementRepositoryInMemory: InMemoryStatementsRepository
let getStatementOperationUseCase: GetStatementOperationUseCase

describe('Get statement operation', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementRepositoryInMemory = new InMemoryStatementsRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementRepositoryInMemory)
  })

  it('should be able to get statement operation', () => {
    
  })
})