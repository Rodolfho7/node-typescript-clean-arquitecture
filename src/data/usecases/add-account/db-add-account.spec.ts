import { AccountModel } from "../../../domain/models/account";
import { AddAccountModel } from "../../../domain/usecases/add-account";
import { AddAccountRepository } from "../../protocols/add-account-repository";
import { Encrypter } from "../../protocols/encrypter";
import { DbAddAccount } from "./db-add-account";

type SutTypes = {
  sut: DbAddAccount,
  encrypterStub: Encrypter,
  addAccountRepositoryStub: AddAccountRepository
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt(value: string): Promise<string> {
      return Promise.resolve('hashed_password');
    }
  }
  return new EncrypterStub;
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add(account: AddAccountModel): Promise<AccountModel> {
      return Promise.resolve({
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_mail@mail.com',
        password: 'hashed_password'
      });
    }
  }
  return new AddAccountRepositoryStub();
}

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter();
  const addAccountRepositoryStub = makeAddAccountRepository();
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);
  return { sut, encrypterStub, addAccountRepositoryStub };
}

describe('DbAddAccount usecase', () => {
  test('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut();
    const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt');
    const accountData = {
      name: 'valid_name',
      email: 'valid_mail@mail.com',
      password: 'valid_password'
    };

    await sut.add(accountData);
    expect(encrypterSpy).toHaveBeenCalledWith('valid_password');
  });

  test('Should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut();
    jest.spyOn(encrypterStub, 'encrypt').mockImplementationOnce(() => Promise.reject(new Error()));
    const accountData = {
      name: 'valid_name',
      email: 'valid_mail@mail.com',
      password: 'valid_password'
    };

    const promise = sut.add(accountData);
    await expect(promise).rejects.toThrow();
  });

  test('Should call AddAccountRepository with correct values', async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');
    const accountData = {
      name: 'valid_name',
      email: 'valid_mail@mail.com',
      password: 'valid_password'
    };

    await sut.add(accountData);
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_mail@mail.com',
      password: 'hashed_password'
    });
  });

  test('Should return an acccount on success', async () => {
    const { sut } = makeSut();
    const accountData = {
      name: 'valid_name',
      email: 'valid_mail@mail.com',
      password: 'valid_password'
    };

    const account = await sut.add(accountData);

    expect(account).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_mail@mail.com',
      password: 'hashed_password'
    });
  });
});
