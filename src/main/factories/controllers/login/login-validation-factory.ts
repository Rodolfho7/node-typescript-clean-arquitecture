import { EmailValidation } from "../../../../presentation/helpers/validators/email-validation";
import { RequiredFieldValidation } from "../../../../presentation/helpers/validators/required-field-validation";
import { Validation } from "../../../../presentation/protocols/validation";
import { ValidationComposite } from "../../../../presentation/helpers/validators/validation-composite";
import { EmailValidatorAdapter } from "../../../adapters/validators/email-validator-adapter";

export const makeLoginValidationComposite = (): Validation => {
  return new ValidationComposite([
    new RequiredFieldValidation('email'),
    new RequiredFieldValidation('password'),
    new EmailValidation('email', new EmailValidatorAdapter())
  ]);
}
