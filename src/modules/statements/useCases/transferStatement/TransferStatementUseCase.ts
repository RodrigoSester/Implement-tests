import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { TransferStatementError } from "./TransferStatementError";
import { type } from "os";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

@injectable()
class TransferStatementUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementRepository: IStatementsRepository,
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ){}

  async execute(id: string, { user_id, description, amount, type }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(id)

    if (!user) throw new TransferStatementError()

    const userTransfer = await this.usersRepository.findById(user_id)

    if(!userTransfer) throw new TransferStatementError()

    const transferStatementOperation = await this.statementRepository.transfer({ user_id, amount, description, type })

    return transferStatementOperation
  }
}

export { TransferStatementUseCase }