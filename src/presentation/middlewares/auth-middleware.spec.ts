import { HttpRequest } from "../protocols/http";
import { forbidden, ok, serverError } from '../helpers/http/http-helper';
import { AccessDeniedError } from '../errors/access-denied-error';
import { AuthMiddleware } from './auth-middleware';
import { Middleware } from "../protocols/middleware";
import { LoadAccountByToken } from '../../domain/usecases/account/load-account-by-token';
import { AccountModel } from "../../domain/models/account";

const makeLoadAccountByToken = (): LoadAccountByToken => {
  class LoadAccountByTokenStub implements LoadAccountByToken {
    async load(accessToken: string): Promise<AccountModel> {
      return Promise.resolve({
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_mail@mail.com',
        password: 'hashed_password'
      });
    }
  }
  return new LoadAccountByTokenStub();
}

type SutTypes = {
  sut: Middleware,
  loadAccountByTokenStub: any
}

const makeSut = (role?: string): SutTypes => {
  const loadAccountByTokenStub = makeLoadAccountByToken();
  const sut = new AuthMiddleware(loadAccountByTokenStub, role);
  return { sut, loadAccountByTokenStub };
}

describe('Auth Middleware', () => {
  test('Should return 403 if no x-access-token exists in headers', async () => {
    const { sut }= makeSut();
    const httpRequest: HttpRequest = {
      headers: {}
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()));
  });

  test('Should call LoadAccountByToken with correct accessToken', async () => {
    const role = 'any_role';
    const { sut, loadAccountByTokenStub }= makeSut(role);
    const loadSpy = jest.spyOn(loadAccountByTokenStub, 'load');
    const httpRequest: HttpRequest = {
      headers: {
        'x-access-token': 'any_token'
      }
    };
    await sut.handle(httpRequest);
    expect(loadSpy).toHaveBeenCalledWith('any_token', role);
  });

  test('Should return 403 if LoadAccountByToken returns null', async () => {
    const { sut, loadAccountByTokenStub } = makeSut();
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(Promise.resolve(null));
    const httpResponse = await sut.handle({});
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()));
  });

  test('Should return 200 if LoadAccountByToken returns an account', async () => {
    const { sut } = makeSut();
    const httpRequest: HttpRequest = {
      headers: {
        'x-access-token': 'any_token'
      }
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(ok({ accountId: 'valid_id' }));
  });

  test('Should return 500 if LoadAccountByToken throws', async () => {
    const { sut, loadAccountByTokenStub } = makeSut();
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(Promise.reject(new Error()));
    const httpRequest: HttpRequest = {
      headers: {
        'x-access-token': 'any_token'
      }
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(serverError(new Error()));
  });
});
