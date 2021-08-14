import { DbAddAccount } from "../../../data/usecases/add-account/db-add-account";
import { BcryptAdapter } from "../../../infra/criptography/bcrypt-adapter";
import { AccountMongoRepository } from "../../../infra/db/mongodb/account-repository/account";
import { LogMongoRepository } from "../../../infra/db/mongodb/log-repository/log";
import { SignUpController } from "../../../presentation/controllers/signup";
import { Controller } from "../../../presentation/protocols/controller";
import { EmailValidatorAdapter } from "../../../utils/email-validator-adapter";
import { LogControllerDecorator } from "../../decorators/log";

export const makeSignupController = (): Controller => {
  const emailValidator = new EmailValidatorAdapter();
  const encrypter = new BcryptAdapter(12);
  const addAccountRepository = new AccountMongoRepository();
  const addAccount = new DbAddAccount(encrypter, addAccountRepository);
  const signupController =  new SignUpController(emailValidator, addAccount);
  const logMongoRepository = new LogMongoRepository();
  return new LogControllerDecorator(signupController, logMongoRepository);
}
