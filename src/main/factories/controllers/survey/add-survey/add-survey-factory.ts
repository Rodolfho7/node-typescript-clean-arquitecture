import { AddSurveyController } from "../../../../../presentation/controllers/survey/add-survey/add-survey-controller";
import { Controller } from "../../../../../presentation/protocols/controller";
import { makeLogControllerDecorator } from "../../../decorators/log-controller-decorator-factory";
import { makeDbAddSurvey } from "../../../usecases/add-survey/db-add-survey-factory";
import { makeAddSurveyValidationComposite } from "./add-survey-validation-factory";

export const makeAddSurveyController = (): Controller => {
  const validation = makeAddSurveyValidationComposite();
  const addSurvey = makeDbAddSurvey();
  const addSurveyController = new AddSurveyController(validation, addSurvey);
  return makeLogControllerDecorator(addSurveyController);
}
