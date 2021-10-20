import { AddSurvey } from "../../../../domain/usecases/add-survey";
import { badRequest, noContent, serverError } from "../../../helpers/http/http-helper";
import { Controller } from "../../../protocols/controller";
import { Validation } from "../../../protocols/validation";
import { HttpRequest, HttpResponse } from "../../../protocols/http";

export class AddSurveyController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly addSurvey: AddSurvey
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body);
      if (error) {
        return badRequest(error);
      }
      const { question, answers } = httpRequest.body;
      await this.addSurvey.add({ question, answers, date: new Date() });
      return noContent();
    } catch(error) {
      return serverError(error);
    }
  }
}
