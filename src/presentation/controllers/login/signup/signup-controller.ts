import { HttpResponse, HttpRequest } from '../../../protocols/http';
import { badRequest, forbidden, ok, serverError } from '../../../helpers/http/http-helper';
import { Controller } from '../../../protocols/controller';
import { ServerError } from '../../../errors/server-error';
import { AddAccount } from '../../../../domain/usecases/account/add-account';
import { Validation } from '../../../protocols/validation';
import { Authentication } from '../../../../domain/usecases/account/authentication';
import { EmailInUseError } from '../../../errors/email-in-use-error';

export class SignUpController implements Controller {

  constructor(
    private readonly addAccount: AddAccount,
    private readonly validation: Validation,
    private readonly authentication: Authentication
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body);
      if (error) {
        return badRequest(error);
      }
      const { name, email, password } = httpRequest.body;
      const account = await this.addAccount.add({ name, email, password });
      if (!account) {
        return forbidden(new EmailInUseError());
      }
      const accessToken = await this.authentication.auth({ email, password });
      return ok({ accessToken });
    } catch (error) {
      return serverError(new ServerError(error));
    }
  }
}
