import { adaptRoute } from '../adapters/express/express-route-adapter';
import { Router } from "express";
import { makeAddSurveyController } from '../factories/controllers/add-survey/add-survey-factory';

export default (router: Router): void => {
  router.post('/surveys', adaptRoute(makeAddSurveyController()));
}