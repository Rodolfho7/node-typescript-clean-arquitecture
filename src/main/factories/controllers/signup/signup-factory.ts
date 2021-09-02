import { SignUpController } from "../../../../presentation/controllers/login/signup/signup-controller";
import { Controller } from "../../../../presentation/protocols/controller";
import { makeLogControllerDecorator } from "../../decorators/log-controller-decorator-factory";
import { makeDbAddAccount } from "../../usecases/add-account/db-add-account-factory";
import { makeDbAuthentication } from "../../usecases/authentication/db-authentication-factory";
import { makeSignUpValidationComposite } from "./signup-validation-factory";

export const makeSignupController = (): Controller => {
  const addAccount = makeDbAddAccount();
  const validationComposite = makeSignUpValidationComposite();
  const dbAuthentication = makeDbAuthentication();
  const signupController =  new SignUpController(addAccount, validationComposite, dbAuthentication);
  return makeLogControllerDecorator(signupController);
}
