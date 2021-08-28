import { CompareFieldsValidation } from "../../../../presentation/helpers/validators/compare-field-validation";
import { EmailValidation } from "../../../../presentation/helpers/validators/email-validation";
import { RequiredFieldValidation } from "../../../../presentation/helpers/validators/required-field-validation";
import { Validation } from "../../../../presentation/protocols/validation";
import { ValidationComposite } from "../../../../presentation/helpers/validators/validation-composite";
import { EmailValidator } from "../../../../presentation/protocols/email-validator";
import { makeSignUpValidationComposite } from "./signup-validation-factory";

jest.mock('../../../../presentation/helpers/validators/validation-composite');

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }
  return new EmailValidatorStub(); 
}

describe('SignUpValidation Factory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeSignUpValidationComposite();
    const validations: Validation[] = [];
    for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
      validations.push(new RequiredFieldValidation(field));
    }
    validations.push(new CompareFieldsValidation('password', 'passwordConfirmation'));
    validations.push(new EmailValidation('email', makeEmailValidator()));
    expect(ValidationComposite).toHaveBeenCalledWith(validations);
  });
});