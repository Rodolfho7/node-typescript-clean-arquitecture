import { adaptRoute } from '../adapters/express-route-adapter';
import { Router } from "express";
import { auth } from '../middlewares/auth';
import { makeSaveSurveyResultController } from '../factories/controllers/survey-result/save-survey-result/save-survey-result-controller-factory';

export default (router: Router): void => {
  router.put('/surveys/:surveyId/results', auth, adaptRoute(makeSaveSurveyResultController()));
}
