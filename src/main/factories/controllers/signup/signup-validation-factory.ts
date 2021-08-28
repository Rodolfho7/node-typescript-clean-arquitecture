import { CompareFieldsValidation } from "../../../../presentation/helpers/validators/compare-field-validation";
import { EmailValidation } from "../../../../presentation/helpers/validators/email-validation";
import { RequiredFieldValidation } from "../../../../presentation/helpers/validators/required-field-validation";
import { Validation } from "../../../../presentation/protocols/validation";
import { ValidationComposite } from "../../../../presentation/helpers/validators/validation-composite";
import { EmailValidatorAdapter } from "../../../adapters/validators/email-validator-adapter";

export const makeSignUpValidationComposite = (): Validation => {
  return new ValidationComposite([
    new RequiredFieldValidation('name'),
    new RequiredFieldValidation('email'),
    new RequiredFieldValidation('password'),
    new RequiredFieldValidation('passwordConfirmation'),
    new CompareFieldsValidation('password', 'passwordConfirmation'),
    new EmailValidation('email', new EmailValidatorAdapter())
  ]);
}
