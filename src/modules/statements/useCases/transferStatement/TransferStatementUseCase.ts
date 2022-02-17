import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateStatementError } from "../createStatement/CreateStatementError";

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

    if (!user) throw new CreateStatementError.UserNotFound

    const userTransfer = await this.usersRepository.findById(user_id)

    if(!userTransfer) throw new CreateStatementError.UserNotFound

    const { balance } = await this.statementRepository.getUserBalance({ user_id: user.id as string })

    if(balance < amount) throw new CreateStatementError.InsufficientFunds

    const transferStatementOperation = await this.statementRepository.transfer(user.id!, { user_id, amount, description, type })

    return transferStatementOperation
  }
}

export { TransferStatementUseCase }