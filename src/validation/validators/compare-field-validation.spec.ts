import { InvalidParamError } from "../../presentation/errors/invalid-param-error";
import { CompareFieldsValidation } from "./compare-field-validation";
import { Validation } from "../../presentation/protocols/validation";

type SutTypes = {
  sut: Validation
}

const makeSut = (): SutTypes => {
  const sut = new CompareFieldsValidation('field', 'compareField');
  return { sut };
}

describe('CompareField Validation', () => {
  test('Should return a InvalidParamError if validation fails', () => {
    const { sut } = makeSut();
    const error = sut.validate({ field: 'valid_field', compareField: 'invalid_field' });
    expect(error).toEqual(new InvalidParamError('compareField'));
  });

  test('Should not return an error if validation pass', () => {
    const { sut } = makeSut();
    const error = sut.validate({ field: 'valid_field', compareField: 'valid_field' });
    expect(error).toBeFalsy();
  });
});
