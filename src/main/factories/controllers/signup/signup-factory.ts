import { DbAddAccount } from "../../../../data/usecases/add-account/db-add-account";
import { BcryptAdapter } from "../../../../infra/criptography/bcrypt-adapter/bcrypt-adapter";
import { AccountMongoRepository } from "../../../../infra/db/mongodb/account/account-mongo-repository";
import { LogMongoRepository } from "../../../../infra/db/mongodb/log/log-mongo-repository";
import { SignUpController } from "../../../../presentation/controllers/signup/signup-controller";
import { Controller } from "../../../../presentation/protocols/controller";
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator";
import { makeSignUpValidationComposite } from "./signup-validation-factory";

export const makeSignupController = (): Controller => {
  const encrypter = new BcryptAdapter(12);
  const addAccountRepository = new AccountMongoRepository();
  const addAccount = new DbAddAccount(encrypter, addAccountRepository);
  const validationComposite = makeSignUpValidationComposite();
  const signupController =  new SignUpController(addAccount, validationComposite);
  const logMongoRepository = new LogMongoRepository();
  return new LogControllerDecorator(signupController, logMongoRepository);
}
