import { CompareFieldsValidation } from "../../../../../validation/validators/compare-field-validation";
import { EmailValidation } from "../../../../../validation/validators/email-validation";
import { RequiredFieldValidation } from "../../../../../validation/validators/required-field-validation";
import { Validation } from "../../../../../presentation/protocols/validation";
import { ValidationComposite } from "../../../../../validation/validators/validation-composite";
import { EmailValidatorAdapter } from "../../../../../infra/validators/email-validator-adapter";

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
