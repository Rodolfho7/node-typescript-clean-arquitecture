import { InvalidParamError } from "../../presentation/errors/invalid-param-error";
import { MissingParamError } from "../../presentation/errors/missing-param-error";
import { Validation } from "../../presentation/protocols/validation";
import { ValidationComposite } from "./validation-composite";

const makeValidationStub = (): Validation => {
  class ValidationStub implements Validation {
    validate({}): Error {
      return null;
    }
  }
  return new ValidationStub();
}

type SutTypes = {
  sut: Validation,
  validationStubs: Validation[]
}

const makeSut = (): SutTypes => {
  const validationStubs = [makeValidationStub(), makeValidationStub()];
  const sut = new ValidationComposite(validationStubs);
  return { sut, validationStubs };
}

describe('Validation Composite', () => {
  test('Should return an error if any validation fails', () => {
    const { sut, validationStubs } = makeSut();
    jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(new MissingParamError('any_field'));
    const error = sut.validate({ name: 'name' });
    expect(error).toEqual(new MissingParamError('any_field'));
  });

  test('Should return the first validation fail if more than 1 fails', () => {
    const { sut, validationStubs } = makeSut();
    jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(new MissingParamError('any_field'));
    jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(new InvalidParamError('any_field'));
    const error = sut.validate({ name: 'name' });
    expect(error).toEqual(new MissingParamError('any_field'));
  });

  test('Should not return if validation succeeds', () => {
    const { sut } = makeSut();
    const error = sut.validate({ name: 'name' });
    expect(error).toBeFalsy();
  });
});
