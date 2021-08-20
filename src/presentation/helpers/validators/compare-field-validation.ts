import { InvalidParamError } from "../../errors/invalid-param-error";
import { Validation } from "./validation";

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
