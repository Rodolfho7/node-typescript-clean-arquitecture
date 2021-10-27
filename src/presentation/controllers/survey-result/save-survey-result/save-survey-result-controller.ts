import { SaveSurveyResult } from "../../../../domain/usecases/survey-result/save-survey-result";
import { LoadSurveyById } from "../../../../domain/usecases/survey/load-survey-by-id";
import { InvalidParamError } from "../../../errors/invalid-param-error";
import { forbidden, ok, serverError } from "../../../helpers/http/http-helper";
import { Controller } from "../../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../../protocols/http";

export class SaveSurveyResultController implements Controller {

  constructor(
    private readonly loadSurveyById: LoadSurveyById,
    private readonly saveSurveyResult: SaveSurveyResult
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { surveyId } = httpRequest.params;
      const { answer } = httpRequest.body;
      const { accountId } = httpRequest;
      const survey = await this.loadSurveyById.loadById(surveyId);
      if (survey) {
        const answers = survey.answers.map((s) => s.answer);
        if (!answers.includes(answer)) {
          return forbidden(new InvalidParamError('answer'));
        }
        const surveyResult = await this.saveSurveyResult.save({ surveyId, accountId, answer, date: new Date() });
        return ok(surveyResult);
      } else {
        return forbidden(new InvalidParamError('surveyId'));
      }
    } catch(error) {
      return serverError(error);
    }
  }
}
