import { DbAddAccount } from "../../../data/usecases/add-account/db-add-account";
import { BcryptAdapter } from "../../../infra/criptography/bcrypt-adapter";
import { AccountMongoRepository } from "../../../infra/db/mongodb/account-repository/account";
import { SignUpController } from "../../../presentation/controllers/signup"
import { Controller } from "../../../presentation/protocols/controller"
import { EmailValidatorAdapter } from "../../../utils/email-validator-adapter"

export const makeSignupController = (): Controller => {
  const emailValidator = new EmailValidatorAdapter();
  const encrypter = new BcryptAdapter(12);
  const addAccountRepository = new AccountMongoRepository();
  const addAccount = new DbAddAccount(encrypter, addAccountRepository);
  return new SignUpController(emailValidator, addAccount);
}
