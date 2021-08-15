import { HttpResponse, HttpRequest } from '../../protocols/http';
import { MissingParamError } from '../../errors/missing-param-error';
import { badRequest, ok, serverError } from '../../helpers/http-helper';
import { Controller } from '../../protocols/controller';
import { EmailValidator } from '../../protocols/email-validator';
import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { AddAccount } from '../../../domain/usecases/add-account';

export class SignUpController implements Controller {

  constructor(
    private readonly emailValidator: EmailValidator,
    private readonly addAccount: AddAccount
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation'];
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field));
        }
      }
      const { name, email, password, passwordConfirmation } = httpRequest.body;
      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'));
      }

      const isValid = this.emailValidator.isValid(email);
      if (!isValid) {
        return badRequest(new InvalidParamError('email'));
      }

      const account = await this.addAccount.add({ name, email, password });
      return ok(account);
    } catch (error) {
      return serverError(new ServerError(error));
    }
  }
}