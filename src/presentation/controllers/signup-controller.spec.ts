import { SignUpController } from './signup';
import { MissingParamError } from '../errors/missing-param-error';
import { InvalidParamError } from '../errors/invalid-param-error';
import { EmailValidator } from '../protocols/email-validator';
import { ServerError } from '../errors/server-error';
import { AddAccount, AddAccountModel } from '../../domain/usecases/add-account';
import { AccountModel } from '../../domain/models/account';

type SutTypes = {
  sut: SignUpController,
  emailValidatorStub: EmailValidator,
  addAccountStub: AddAccount
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }
  return new EmailValidatorStub();
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

  const emailValidatorStub = makeEmailValidator();
  const addAccountStub = makeAddAccount();
  const sut = new SignUpController(emailValidatorStub, addAccountStub);

  return { sut, emailValidatorStub, addAccountStub };
}

describe('SignUpController', () => {
  test('Should return 400 if no name is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        password: 'any-password',
        passwordConfirmation: 'any-password'
      }
    }
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('name'));
  });

  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any-name',
        password: 'any-password',
        passwordConfirmation: 'any-password'
      }
    }
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        passwordConfirmation: 'any-password'
      }
    }
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  test('Should return 400 if no passwordConfirmation is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        password: 'any-password'
      }
    }
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'));
  });

  test('Should return 400 if passwordConfirmation fails', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        password: 'any-password',
        passwordConfirmation: 'invalid-password'
      }
    }
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'));
  });

  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorStub } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        password: 'any-password',
        passwordConfirmation: 'any-password'
      }
    }

    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('email'));
  });

  test('Should call emailValidor with correct email', async () => {
    const { sut, emailValidatorStub } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        password: 'any-password',
        passwordConfirmation: 'any-password'
      }
    }

    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

    await sut.handle(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith('any-mail@mail.com');
  });

  test('Should return 500 if emailValidator throws', async () => {
    const { sut, emailValidatorStub } = makeSut();
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => { throw new Error() });

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
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    })
  });
});
