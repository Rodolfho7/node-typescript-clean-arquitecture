import { MissingParamError } from "../../errors/missing-param-error";
import { RequiredFieldValidation } from "./required-field-validation";
import { Validation } from "../../protocols/validation";

type SutTypes = {
  sut: Validation
}

const makeSut = (field: string): SutTypes => {
  const sut = new RequiredFieldValidation(field);
  return { sut };
}

describe('RequiredField Validation', () => {
  test('Should return a MissingParamError if validation fails', () => {
    const { sut } = makeSut('valid_field');
    const error = sut.validate({ any_field: 'any_field' });
    expect(error).toEqual(new MissingParamError('valid_field'));
  });

  test('Should not return an error if validation pass', () => {
    const { sut } = makeSut('valid_field');
    const error = sut.validate({ valid_field: 'valid_field' });
    expect(error).toBeFalsy();
  });
});
