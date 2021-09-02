import { SignUpController } from './signup-controller';
import { MissingParamError } from '../../errors/missing-param-error';
import { ServerError } from '../../errors/server-error';
import { AddAccount, AddAccountModel } from '../../../domain/usecases/add-account';
import { AccountModel } from '../../../domain/models/account';
import { Validation } from '../../protocols/validation';
import { badRequest, forbidden, ok } from '../../helpers/http/http-helper';
import { Authentication, AuthenticationModel } from '../../../domain/usecases/authentication';
import { HttpRequest } from '../../protocols/http';
import { EmailInUseError } from '../../errors/email-in-use-error';

const makeAuthentication = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth(authentication: AuthenticationModel): Promise<string> {
      return Promise.resolve('any_token');
    }
  }
  return new AuthenticationStub();
}

type SutTypes = {
  sut: SignUpController,
  addAccountStub: AddAccount,
  validationStub: Validation,
  authenticationStub: Authentication
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(input: any): Error {
      return null;
    }
  }
  return new ValidationStub();
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add(account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
      return Promise.resolve(fakeAccount);
    }
  }
  return new AddAccountStub();
}

const makeSut = (): SutTypes => {
  const addAccountStub = makeAddAccount();
  const validationStub = makeValidation();
  const authenticationStub = makeAuthentication();
  const sut = new SignUpController(addAccountStub, validationStub, authenticationStub);

  return { sut, addAccountStub, validationStub, authenticationStub };
}

describe('SignUpController', () => {

  test('Should return 500 if addAccount throws', async () => {
    const { sut, addAccountStub } = makeSut();
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => Promise.reject(new Error()));

    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        password: 'any-password',
        passwordConfirmation: 'any-password'
      }
    }

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError(new Error().stack));
  });

  test('Should call addAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSut();
    const addSpy = jest.spyOn(addAccountStub, 'add');

    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        password: 'any-password',
        passwordConfirmation: 'any-password'
      }
    }

    await sut.handle(httpRequest);
    expect(addSpy).toHaveBeenCalledWith({
      email: 'any-mail@mail.com',
      name: 'any-name',
      password: 'any-password',
    });
  });

  test('Should return 403 if addAccount returns null', async () => {
    const { sut, addAccountStub } = makeSut();
    const httpRequest = {
      body: {
        email: 'valid_mail@mail.com',
        name: 'valid_name',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    };
    jest.spyOn(addAccountStub, 'add').mockReturnValueOnce(Promise.resolve(null));

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(forbidden(new EmailInUseError()));
  });

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'valid_mail@mail.com',
        name: 'valid_name',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    }

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(ok({ accessToken: 'any_token' }));
  });

  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut();
    const validateSpy = jest.spyOn(validationStub, 'validate');
    const httpRequest = {
      body: {
        email: 'valid_mail@mail.com',
        name: 'valid_name',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    }
    await sut.handle(httpRequest);
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body);
  });

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut();
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))
    const httpRequest = {
      body: {
        email: 'valid_mail@mail.com',
        name: 'valid_name',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')));
  });

  test('Should call authentication with correct values', async () => {
    const { sut, authenticationStub } = makeSut();

    const authSpy = jest.spyOn(authenticationStub, 'auth');
    const httpRequest: HttpRequest = {
      body: {
        email: 'any_mail@mail.com',
        password: 'any_password'
      }
    }
    await sut.handle(httpRequest);
    expect(authSpy).toHaveBeenCalledWith({ email: 'any_mail@mail.com', password: 'any_password' });
  });
});
