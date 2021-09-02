import { EmailValidation } from "../../../../validation/validators/email-validation";
import { RequiredFieldValidation } from "../../../../validation/validators/required-field-validation";
import { Validation } from "../../../../presentation/protocols/validation";
import { ValidationComposite } from "../../../../validation/validators/validation-composite";
import { EmailValidatorAdapter } from "../../../../infra/validators/email-validator-adapter";

export const makeLoginValidationComposite = (): Validation => {
  return new ValidationComposite([
    new RequiredFieldValidation('email'),
    new RequiredFieldValidation('password'),
    new EmailValidation('email', new EmailValidatorAdapter())
  ]);
}
