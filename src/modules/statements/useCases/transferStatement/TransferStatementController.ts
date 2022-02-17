import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferStatementUseCase } from "./TransferStatementUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

class TransferStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id } = request.user
    const { user_id } = request.params
    const { amount, description } = request.body

    const transferStatementUseCase = container.resolve(TransferStatementUseCase)

    const splittedPath = request.originalUrl.split('/')
    const type = splittedPath[splittedPath.length - 2] as OperationType;

    const transfer = await transferStatementUseCase.execute(id, { user_id, amount, description, type })

    return response.status(200).json(transfer)
  }
}

export { TransferStatementController }