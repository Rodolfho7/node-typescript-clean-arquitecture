import { DbAddAccount } from "../../../../../data/usecases/account/add-account/db-add-account";
import { AddAccount } from "../../../../../domain/usecases/account/add-account";
import { BcryptAdapter } from "../../../../../infra/criptography/bcrypt-adapter/bcrypt-adapter";
import { AccountMongoRepository } from "../../../../../infra/db/mongodb/account/account-mongo-repository";

export const makeDbAddAccount = (): AddAccount => {
  const hasher = new BcryptAdapter(12);
  const addAccountRepository = new AccountMongoRepository();
  return new DbAddAccount(hasher, addAccountRepository, addAccountRepository);
}
