import { LoadSurveysController } from "../../../../../presentation/controllers/survey/load-surveys/load-surveys-controller";
import { Controller } from "../../../../../presentation/protocols/controller";
import { makeLogControllerDecorator } from "../../../decorators/log-controller-decorator-factory";
import { makeDbLoadSurveys } from "../../../usecases/survey/load-surveys/db-load-surveys-factory";

export const makeLoadSurveysController = (): Controller => {
  const loadSurveys = makeDbLoadSurveys();
  const loadSurveysController = new LoadSurveysController(loadSurveys);
  return makeLogControllerDecorator(loadSurveysController);
}
