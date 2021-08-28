import { makeSignupController } from "../factories/controllers/signup/signup-factory";
import { makeLoginController } from "../factories/controllers/login/login-factory";
import { adaptRoute } from '../adapters/express/express-route-adapter';
import { Router } from "express";

export default (router: Router): void => {
  router.post('/signup', adaptRoute(makeSignupController()));
  router.post('/login', adaptRoute(makeLoginController()));
}
