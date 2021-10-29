import { AccountModel } from "../../../../domain/models/account";
import { AddAccountParams } from "../../../../domain/usecases/account/add-account";
import { AddAccountRepository } from "../../../protocols/db/account/add-account-repository";
import { Hasher } from "../../../protocols/criptography/hasher";
import { DbAddAccount } from "./db-add-account";
import { LoadAccountByEmailRepository } from "../../../protocols/db/account/load-account-by-email-repository";
import { mockAddAccountParams, mockAccountModel } from '../../../../domain/test/mock-account';

type SutTypes = {
  sut: DbAddAccount,
  hasherStub: Hasher,
  addAccountRepositoryStub: AddAccountRepository,
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash(value: string): Promise<string> {
      return Promise.resolve('any_password');
    }
  }
  return new HasherStub;
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add(account: AddAccountParams): Promise<AccountModel> {
      return Promise.resolve(mockAccountModel());
    }
  }
  return new AddAccountRepositoryStub();
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail(email: string): Promise<AccountModel> {
      return Promise.resolve(null);
    }
  }
  return new LoadAccountByEmailRepositoryStub();
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher();
  const addAccountRepositoryStub = makeAddAccountRepository();
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository();
  const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub, loadAccountByEmailRepositoryStub);
  return { sut, hasherStub, addAccountRepositoryStub, loadAccountByEmailRepositoryStub };
}

describe('DbAddAccount usecase', () => {
  test('Should call Hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut();
    const encrypterSpy = jest.spyOn(hasherStub, 'hash');
    const accountData = mockAddAccountParams();
    await sut.add(accountData);
    expect(encrypterSpy).toHaveBeenCalledWith('any_password');
  });

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut();
    jest.spyOn(hasherStub, 'hash').mockRejectedValueOnce(new Error());
    const accountData = mockAddAccountParams();
    const promise = sut.add(accountData);
    await expect(promise).rejects.toThrow();
  });

  test('Should call AddAccountRepository with correct values', async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');
    const accountData = mockAddAccountParams();
    await sut.add(accountData);
    expect(addSpy).toHaveBeenCalledWith(mockAddAccountParams());
  });

  test('Should return an acccount on success', async () => {
    const { sut } = makeSut();
    const accountData = mockAddAccountParams();
    const account = await sut.add(accountData);
    expect(account).toEqual(mockAccountModel());
  });

  test('Should call LoadAccountbyEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail');
    const accountData = mockAddAccountParams();
    await sut.add(accountData);
    expect(loadSpy).toHaveBeenCalledWith('any_mail@mail.com');
  });

  test('Should return null if LoadAccountbyEmailRepository not returns null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut();
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(Promise.resolve(mockAccountModel()));
    const accountData = mockAddAccountParams();
    const account = await sut.add(accountData);
    expect(account).toBeNull();
  });
});
