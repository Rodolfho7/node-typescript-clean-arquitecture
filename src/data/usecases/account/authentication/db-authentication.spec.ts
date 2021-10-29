import { AccountModel } from "../../../../domain/models/account";
import { Authentication } from "../../../../domain/usecases/account/authentication";
import { HashCompare } from "../../../protocols/criptography/hash-compare";
import { Encrypter } from "../../../protocols/criptography/encrypter";
import { LoadAccountByEmailRepository } from "../../../protocols/db/account/load-account-by-email-repository";
import { UpdateAccessTokenRepository } from "../../../protocols/db/account/update-access-token-repository";
import { DbAuthentication } from "./db-authentication";
import { mockAccountModel } from '../../../../domain/test/mock-account';

const makeFakeAuthentication = () => {
  return { email: 'any_mail@mail.com', password: 'any_password' };
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail(email: string): Promise<AccountModel> {
      const account: AccountModel = mockAccountModel();
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

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt(): Promise<string> {
      return Promise.resolve('any_token');
    }
  }
  return new EncrypterStub();
}

const makeUpdateAccessTokenRepository = (): any => {
  class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
    updateAccessToken(id: string, token: string): Promise<void> {
      return Promise.resolve(null);
    }
  }
  return new UpdateAccessTokenRepositoryStub();
}

type SutTypes = {
  sut: Authentication,
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository,
  hashCompareStub: HashCompare,
  encrypterStub: Encrypter,
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
}

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
  const hashCompareStub = makeHashCompare();
  const encrypterStub = makeEncrypter();
  const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepository();
  const sut = new DbAuthentication(loadAccountByEmailRepositoryStub, hashCompareStub, encrypterStub, updateAccessTokenRepositoryStub);
  return {
    sut,
    loadAccountByEmailRepositoryStub,
    hashCompareStub,
    encrypterStub,
    updateAccessTokenRepositoryStub
  };
}

describe('DbAuthentication Usecase', () => {
  test('Should call LoadAccountbyEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail');
    await sut.auth(makeFakeAuthentication());
    expect(loadSpy).toHaveBeenCalledWith('any_mail@mail.com');
  });

  test('Should throw if LoadAccountbyEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockImplementationOnce(() => Promise.reject(new Error()));
    const promise = sut.auth(makeFakeAuthentication());
    await expect(promise).rejects.toThrow();
  });

  test('Should return null if LoadAccountbyEmailRepository returns null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(null);
    const accessToken = await sut.auth(makeFakeAuthentication());
    expect(accessToken).toBeNull();
  });

  test('Should call HashCompare with correct password', async () => {
    const { sut, hashCompareStub } = makeSut();
    const compareSpy = jest.spyOn(hashCompareStub, 'compare');
    await sut.auth(makeFakeAuthentication());
    expect(compareSpy).toHaveBeenCalledWith('any_password', 'any_password');
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

  test('Should call Encrypt with correct id', async () => {
    const { sut, encrypterStub } = makeSut();
    const generateSpy = jest.spyOn(encrypterStub, 'encrypt');
    await sut.auth(makeFakeAuthentication());
    expect(generateSpy).toHaveBeenCalledWith('any_id');
  });

  test('Should return a token on success', async () => {
    const { sut } = makeSut();
    const accessToken = await sut.auth(makeFakeAuthentication());
    expect(accessToken).toBe('any_token');
  });

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut();
    const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken');
    await sut.auth(makeFakeAuthentication());
    expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token');
  });
});
