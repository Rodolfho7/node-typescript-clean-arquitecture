import { AccountModel } from "../../../domain/models/account";
import { AddAccount, AddAccountModel } from "../../../domain/usecases/add-account";
import { AddAccountRepository } from "../../protocols/db/add-account-repository";
import { Hasher } from "../../protocols/criptography/hasher";

export class DbAddAccount implements AddAccount {

  constructor(
    private readonly encrypter: Hasher,
    private readonly addAccountRepository: AddAccountRepository
  ) {}

  async add(account: AddAccountModel): Promise<AccountModel> {
    const hashedPassword = await this.encrypter.hash(account.password);
    const accountData: AddAccountModel = {
      ...account,
      password: hashedPassword
    };
    const newAccount = await this.addAccountRepository.add(accountData);
    return newAccount;
  }
}