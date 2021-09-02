import { InvalidParamError } from "../../presentation/errors/invalid-param-error";
import { Validation } from "../../presentation/protocols/validation";

export class CompareFieldsValidation implements Validation {

  constructor(
    private readonly field: string,
    private readonly compareField: string
  ) {}

  validate(input: any): Error {
    if (input[this.field] !== input[this.compareField]) {
      return new InvalidParamError(this.compareField);
    }
  }
}
