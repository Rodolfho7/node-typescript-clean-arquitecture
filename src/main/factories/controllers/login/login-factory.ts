import { makeLoginValidationComposite } from "./login-validation-factory";
import { AccountMongoRepository } from "../../../../infra/db/mongodb/account/account-mongo-repository";
import { LogControllerDecorator } from "../../../decorators/log-controller-decorator";
import { LogMongoRepository } from "../../../../infra/db/mongodb/log/log-mongo-repository";
import { DbAuthentication } from "../../../../data/usecases/authentication/db-authentication";
import { LoginController } from "../../../../presentation/controllers/login/login-controller";
import { BcryptAdapter } from "../../../../infra/criptography/bcrypt-adapter/bcrypt-adapter";
import { JwtAdapter } from "../../../../infra/criptography/jwt-adapter/jwt-adapter";
import { Controller } from "../../../../presentation/protocols/controller";
import env from '../../../config/env';

export const makeLoginController = (): Controller => {
  const validationComposite = makeLoginValidationComposite();
  const accountMongoRepository = new AccountMongoRepository();
  const salt = 12;
  const hashCompare = new BcryptAdapter(salt);
  const encrypter = new JwtAdapter(env.jwtSecret);
  const dbAuthentication = new DbAuthentication(accountMongoRepository, hashCompare, encrypter, accountMongoRepository);
  const loginController =  new LoginController(validationComposite, dbAuthentication);
  const logMongoRepository = new LogMongoRepository();
  return new LogControllerDecorator(loginController, logMongoRepository);
}
