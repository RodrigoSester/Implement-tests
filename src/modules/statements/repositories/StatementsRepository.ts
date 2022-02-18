import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({ user_id, amount, description, type }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO): Promise< { balance: number } | { balance: number, statement: Statement[] } > {
    const statement = await this.repository.find({
      where: { user_id }
    });

    if(statement[0].sender_id != null) {
      statement.reduce((total, operation) => {
        if (operation.type === 'deposit' || operation.type === 'transfer') {
          return total + Number(operation.amount)
        } else {
          return total - Number(operation.amount)
        }
      }, 0)
    }

    const balance = statement.reduce((total, operation) => {
      if (operation.type === 'deposit') {
        return total + Number(operation.amount)
      } else {
        return total - Number(operation.amount)
      }
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }

  async transfer(sender_id: string, { amount, type, description, user_id }: ICreateStatementDTO): Promise<Statement> {
    const receiver = await this.repository.find({ user_id })

    const sender = await this.repository.find({ sender_id })

    const operation = this.repository.create({
      user_id,
      amount,
      description,
      type,
      sender_id
    })

    sender.reduce((total, operation) => {
      return total - Number(operation.amount)
    }, 0)

    const transfered = this.repository.create({ amount, description, type, id: sender_id, user_id })
    
    receiver.reduce((total, operation) => {
      return total + Number(operation.amount)
    }, 0)

    await this.create({ user_id, amount, description, type })
    await this.create({ user_id: sender_id, amount, description, type })

    await this.repository.save(transfered)

    const balance = await this.repository.save(operation)

    return balance
  }
}
