import { AccountModel } from "../../../domain/models/account";
import { Authentication } from "../../../domain/usecases/authentication";
import { HashCompare } from "../../protocols/criptography/hash-compare";
import { TokenGenerator } from "../../protocols/criptography/token-generator";
import { LoadAccountByEmailRepository } from "../../protocols/db/load-account-by-email-repository";
import { UpdateAccessTokenRepository } from "../../protocols/db/update-access-token-repository";
import { DbAuthentication } from "./db-authentication";

const makeFakeAuthentication = () => {
  return { email: 'any_mail@mail.com', password: 'any_password' };
}

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
    async compare(value: string, hash: string): Promise<boolean> {
      return Promise.resolve(true);
    }
  }
  return new HashCompareStub();
}

const makeTokenGenerator = (): TokenGenerator => {
  class TokenGeneratorStub implements TokenGenerator {
    async generate(): Promise<string> {
      return Promise.resolve('any_token');
    }
  }
  return new TokenGeneratorStub();
}

const makeUpdateAccessTokenRepository = (): any => {
  class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
    update(id: string, token: string): Promise<void> {
      return Promise.resolve(null);
    }
  }
  return new UpdateAccessTokenRepositoryStub();
}

type SutTypes = {
  sut: Authentication,
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository,
  hashCompareStub: HashCompare,
  tokenGeneratorStub: TokenGenerator,
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
}

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
  const hashCompareStub = makeHashCompare();
  const tokenGeneratorStub = makeTokenGenerator();
  const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepository();
  const sut = new DbAuthentication(loadAccountByEmailRepositoryStub, hashCompareStub, tokenGeneratorStub, updateAccessTokenRepositoryStub);
  return {
    sut,
    loadAccountByEmailRepositoryStub,
    hashCompareStub,
    tokenGeneratorStub,
    updateAccessTokenRepositoryStub
  };
}

describe('DbAuthentication Usecase', () => {
  test('Should call LoadAccountbyEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load');
    await sut.auth(makeFakeAuthentication());
    expect(loadSpy).toHaveBeenCalledWith('any_mail@mail.com');
  });

  test('Should throw if LoadAccountbyEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockImplementationOnce(() => Promise.reject(new Error()));
    const promise = sut.auth(makeFakeAuthentication());
    await expect(promise).rejects.toThrow();
  });

  test('Should return null if LoadAccountbyEmailRepository returns null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(null);
    const accessToken = await sut.auth(makeFakeAuthentication());
    expect(accessToken).toBeNull();
  });

  test('Should call HashCompare with correct password', async () => {
    const { sut, hashCompareStub } = makeSut();
    const compareSpy = jest.spyOn(hashCompareStub, 'compare');
    await sut.auth(makeFakeAuthentication());
    expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password');
  });

  test('Should throw if HashCompare throws', async () => {
    const { sut, hashCompareStub } = makeSut();
    jest.spyOn(hashCompareStub, 'compare').mockImplementationOnce(() => Promise.reject(new Error()));
    const promise = sut.auth(makeFakeAuthentication());
    await expect(promise).rejects.toThrow();
  });

  test('Should return null if HashCompare fails', async () => {
    const { sut, hashCompareStub } = makeSut();
    jest.spyOn(hashCompareStub, 'compare').mockImplementationOnce(() => Promise.resolve(false));
    const accessToken = await sut.auth(makeFakeAuthentication());
    expect(accessToken).toBeNull();
  });

  test('Should call TokenGenerator with correct id', async () => {
    const { sut, tokenGeneratorStub } = makeSut();
    const generateSpy = jest.spyOn(tokenGeneratorStub, 'generate');
    await sut.auth(makeFakeAuthentication());
    expect(generateSpy).toHaveBeenCalledWith('any_id');
  });

  test('Should call TokenGenerator with correct id', async () => {
    const { sut } = makeSut();
    const accessToken = await sut.auth(makeFakeAuthentication());
    expect(accessToken).toBe('any_token');
  });

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut();
    const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'update');
    await sut.auth(makeFakeAuthentication());
    expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token');
  });
});