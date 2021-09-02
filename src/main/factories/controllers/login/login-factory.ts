import { makeLoginValidationComposite } from "./login-validation-factory";
import { LoginController } from "../../../../presentation/controllers/login/login-controller";
import { Controller } from "../../../../presentation/protocols/controller";
import { makeDbAuthentication } from "../../usecases/authentication/db-authentication-factory";
import { makeLogControllerDecorator } from "../../decorators/log-controller-decorator-factory";

export const makeLoginController = (): Controller => {
  const validationComposite = makeLoginValidationComposite();
  const dbAuthentication = makeDbAuthentication();
  const loginController =  new LoginController(validationComposite, dbAuthentication);
  return makeLogControllerDecorator(loginController);
}
