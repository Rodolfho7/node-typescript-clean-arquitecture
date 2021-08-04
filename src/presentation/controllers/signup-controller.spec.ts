import { SignUpController } from './signup';
import { MissingParamError } from '../errors/missing-param-error';
import { InvalidParamError } from '../errors/invalid-param-error';
import { EmailValidator } from '../protocols/email-validator';
import { ServerError } from '../errors/server-error';

type SutTypes = {
  sut: SignUpController,
  emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }

  const emailValidatorStub = new EmailValidatorStub();
  const sut = new SignUpController(emailValidatorStub);

  return { sut, emailValidatorStub };
}

describe('SignUpController', () => {
  test('Should return 400 if no name is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        password: 'any-password',
        passwordConfirmation: 'any-password'
      }
    }
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('name'));
  });

  test('Should return 400 if no email is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any-name',
        password: 'any-password',
        passwordConfirmation: 'any-password'
      }
    }
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  test('Should return 400 if no password is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        passwordConfirmation: 'any-password'
      }
    }
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  test('Should return 400 if no password is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        password: 'any-password'
      }
    }
    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'));
  });

  test('Should return 400 if an invalid email is provided', () => {
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

    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('email'));
  });

  test('Should call emailValidor with correct email', () => {
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

    sut.handle(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith('any-mail@mail.com');
  });

  test('Should return 500 if emailValidator throws', () => {
    const { sut, emailValidatorStub } = makeSut();
    const httpRequest = {
      body: {
        email: 'any-mail@mail.com',
        name: 'any-name',
        password: 'any-password',
        passwordConfirmation: 'any-password'
      }
    }

    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => { throw new Error() });

    const httpResponse = sut.handle(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });
});
