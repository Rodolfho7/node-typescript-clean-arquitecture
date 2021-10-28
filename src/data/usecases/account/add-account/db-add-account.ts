import { AccountModel } from "../../../../domain/models/account";
import { AddAccount, AddAccountParams } from "../../../../domain/usecases/account/add-account";
import { AddAccountRepository } from "../../../protocols/db/account/add-account-repository";
import { Hasher } from "../../../protocols/criptography/hasher";
import { LoadAccountByEmailRepository } from "../../../protocols/db/account/load-account-by-email-repository";

export class DbAddAccount implements AddAccount {

  constructor(
    private readonly hasher: Hasher,
    private readonly addAccountRepository: AddAccountRepository,
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository 
  ) {}

  async add(account: AddAccountParams): Promise<AccountModel> {
    const accountExists = await this.loadAccountByEmailRepository.loadByEmail(account.email);
    if (accountExists) {
      return null;
    }
    const hashedPassword = await this.hasher.hash(account.password);
    const accountData: AddAccountParams = { ...account, password: hashedPassword };
    const newAccount = await this.addAccountRepository.add(accountData);
    return newAccount;
  }
}