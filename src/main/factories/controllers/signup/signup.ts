import { DbAddAccount } from "../../../../data/usecases/add-account/db-add-account";
import { BcryptAdapter } from "../../../../infra/criptography/bcrypt-adapter/bcrypt-adapter";
import { AccountMongoRepository } from "../../../../infra/db/mongodb/account-repository/account";
import { LogMongoRepository } from "../../../../infra/db/mongodb/log-repository/log";
import { SignUpController } from "../../../../presentation/controllers/signup/signup";
import { Controller } from "../../../../presentation/protocols/controller";
import { LogControllerDecorator } from "../../../decorators/log";
import { makeSignUpValidationComposite } from "./signup-validation";

export const makeSignupController = (): Controller => {
  const encrypter = new BcryptAdapter(12);
  const addAccountRepository = new AccountMongoRepository();
  const addAccount = new DbAddAccount(encrypter, addAccountRepository);
  const validationComposite = makeSignUpValidationComposite();
  const signupController =  new SignUpController(addAccount, validationComposite);
  const logMongoRepository = new LogMongoRepository();
  return new LogControllerDecorator(signupController, logMongoRepository);
}
