import { RequiredFieldValidation } from "../../../presentation/helpers/validators/required-field-validation";
import { Validation } from "../../../presentation/helpers/validators/validation";
import { ValidationComposite } from "../../../presentation/helpers/validators/validation-composite";

export const makeSignUpValidationComposite = (): Validation => {
  return new ValidationComposite([
    new RequiredFieldValidation('name'),
    new RequiredFieldValidation('email'),
    new RequiredFieldValidation('password'),
    new RequiredFieldValidation('passwordConfirmation'),
  ]);
}
