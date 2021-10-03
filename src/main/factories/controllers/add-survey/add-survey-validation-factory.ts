import { Validation } from "../../../../presentation/protocols/validation";
import { RequiredFieldValidation } from "../../../../validation/validators/required-field-validation";
import { ValidationComposite } from "../../../../validation/validators/validation-composite";

export const makeAddSurveyValidationComposite = (): Validation => {
  return new ValidationComposite([
    new RequiredFieldValidation('question'),
    new RequiredFieldValidation('answers')
  ]);
}