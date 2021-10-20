import { AuthMiddleware } from "../../../presentation/middlewares/auth-middleware";
import { Middleware } from "../../../presentation/protocols/middleware";
import { makeDbLoadAccount } from "../usecases/account/load-account-by-token/db-load-account-by-token-factory";

export const makeAuthMiddleware = (role?: string): Middleware => {
  const loadAccountByToken = makeDbLoadAccount();
  return new AuthMiddleware(loadAccountByToken, role)
}