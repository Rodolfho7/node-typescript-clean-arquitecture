import { adaptRoute } from '../adapters/express-route-adapter';
import { Router } from "express";
import { makeAddSurveyController } from '../factories/controllers/survey/add-survey/add-survey-factory';
import { adaptMiddleware } from '../adapters/express-middleware-adapter';
import { makeAuthMiddleware } from '../factories/middlewares/auth-middleware-factory';

export default (router: Router): void => {
  const adminAuth = adaptMiddleware(makeAuthMiddleware('admin'));
  router.post('/surveys', adminAuth, adaptRoute(makeAddSurveyController()));
}
