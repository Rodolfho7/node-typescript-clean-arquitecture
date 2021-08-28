import { HttpResponse, HttpRequest } from '../../protocols/http';
import { badRequest, ok, serverError } from '../../helpers/http/http-helper';
import { Controller } from '../../protocols/controller';
import { ServerError } from '../../errors/server-error';
import { AddAccount } from '../../../domain/usecases/add-account';
import { Validation } from '../../protocols/validation';

export class SignUpController implements Controller {

  constructor(
    private readonly addAccount: AddAccount,
    private readonly validation: Validation
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body);
      if (error) {
        return badRequest(error);
      }
      const { name, email, password } = httpRequest.body;

      const account = await this.addAccount.add({ name, email, password });
      return ok(account);
    } catch (error) {
      return serverError(new ServerError(error));
    }
  }
}
