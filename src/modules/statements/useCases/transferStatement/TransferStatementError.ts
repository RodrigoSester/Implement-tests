import { AppError } from "../../../../shared/errors/AppError";

export class TransferStatementError extends AppError {
  constructor() {
    super('User not found', 404);
  }
}