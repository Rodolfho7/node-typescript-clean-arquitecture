import { AccountModel } from "../../../domain/models/account";
import { Authentication } from "../../../domain/usecases/authentication";
import { HashCompare } from "../../protocols/criptography/hash-compare";
import { TokenGenerator } from "../../protocols/criptography/token-generator";
import { LoadAccountByEmailRepository } from "../../protocols/db/load-account-by-email-repository";
import { DbAuthentication } from "./db-authentication";

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async load(email: string): Promise<AccountModel> {
      const account: AccountModel = {
        id: 'any_id',
        name: 'any_name',
        email: 'any_mail@mail.com',
        password: 'hashed_password'
      }
      return Promise.resolve(account);
    }
  }
  return new LoadAccountByEmailRepositoryStub();
}

const makeHashCompare = (): HashCompare => {
  class HashCompareStub implements HashCompare {
    compare(value: string, hash: string): Promise<boolean> {
      return Promise.resolve(true);
    }
  }
  return new HashCompareStub();
}

const makeTokenGenerator = (): TokenGenerator => {
  class TokenGeneratorStub implements TokenGenerator {
    generate(): Promise<string> {
      return Promise.resolve('any_token');
    }
  }
  return new TokenGeneratorStub();
}

type SutTypes = {
  sut: Authentication,
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository,
  hashCompareStub: HashCompare,
  tokenGeneratorStub: TokenGenerator
}

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
  const hashCompareStub = makeHashCompare();
  const tokenGeneratorStub = makeTokenGenerator();
  const sut = new DbAuthentication(loadAccountByEmailRepositoryStub, hashCompareStub, tokenGeneratorStub);
  return { sut, loadAccountByEmailRepositoryStub, hashCompareStub, tokenGeneratorStub };
}

describe('DbAuthentication Usecase', () => {
  test('Should call LoadAccountbyEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load');
    await sut.auth({ email: 'any_mail@mail.com', password: 'any_password' });
    expect(loadSpy).toHaveBeenCalledWith('any_mail@mail.com');
  });

  test('Should throw if LoadAccountbyEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockImplementationOnce(() => Promise.reject(new Error()));
    const promise = sut.auth({ email: 'any_mail@mail.com', password: 'any_password' });
    await expect(promise).rejects.toThrow();
  });

  test('Should return null if LoadAccountbyEmailRepository returns null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(null);
    const accessToken = await sut.auth({ email: 'any_mail@mail.com', password: 'any_password' });
    expect(accessToken).toBeNull();
  });

  test('Should call HashCompare with correct password', async () => {
    const { sut, hashCompareStub } = makeSut();
    const compareSpy = jest.spyOn(hashCompareStub, 'compare');
    await sut.auth({ email: 'any_mail@mail.com', password: 'any_password' });
    expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password');
  });

  test('Should throw if HashCompare throws', async () => {
    const { sut, hashCompareStub } = makeSut();
    jest.spyOn(hashCompareStub, 'compare').mockImplementationOnce(() => Promise.reject(new Error()));
    const promise = sut.auth({ email: 'any_mail@mail.com', password: 'any_password' });
    await expect(promise).rejects.toThrow();
  });

  test('Should return null if HashCompare fails', async () => {
    const { sut, hashCompareStub } = makeSut();
    jest.spyOn(hashCompareStub, 'compare').mockImplementationOnce(() => Promise.resolve(false));
    const accessToken = await sut.auth({ email: 'any_mail@mail.com', password: 'any_password' });
    expect(accessToken).toBeNull();
  });

  test('Should call TokenGenerator with correct id', async () => {
    const { sut, tokenGeneratorStub } = makeSut();
    const generateSpy = jest.spyOn(tokenGeneratorStub, 'generate');
    await sut.auth({ email: 'any_mail@mail.com', password: 'any_password' });
    expect(generateSpy).toHaveBeenCalledWith('any_id');
  });

  test('Should call TokenGenerator with correct id', async () => {
    const { sut } = makeSut();
    const accessToken = await sut.auth({ email: 'any_mail@mail.com', password: 'any_password' });
    expect(accessToken).toBe('any_token');
  });
});