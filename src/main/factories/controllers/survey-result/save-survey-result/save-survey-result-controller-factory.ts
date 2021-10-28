import { SaveSurveyResultController } from "../../../../../presentation/controllers/survey-result/save-survey-result/save-survey-result-controller";
import { Controller } from "../../../../../presentation/protocols/controller";
import { makeLogControllerDecorator } from "../../../decorators/log-controller-decorator-factory";
import { MakeDbSaveSurveyResult } from "../../../usecases/survey-result/save-survey-result/db-save-survey-result";
import { makeDbLoadSurveyById } from "../../../usecases/survey/load-survey-by-id/db-load-survey-by-id";

export const makeSaveSurveyResultController = (): Controller => {
  const loadSurveyById = makeDbLoadSurveyById();
  const saveSurveyResult = MakeDbSaveSurveyResult();
  const saveSurveyResultController = new SaveSurveyResultController(loadSurveyById, saveSurveyResult);
  return makeLogControllerDecorator(saveSurveyResultController);
}
