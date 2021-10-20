import { Collection } from 'mongodb';
import { MongoHelper } from '../helpers/mongo-helper';
import { AccountMongoRepository } from './account-mongo-repository';

const makeSut = (): AccountMongoRepository => {
  return new AccountMongoRepository();
}

describe('Account Mongo Repository', () => {
  let accountsCollection: Collection;
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  beforeEach(async () => {
    accountsCollection = await MongoHelper.getCollection('accounts');
    await accountsCollection.deleteMany({});
  });

  test('Should return an account on add success', async () => {
    const sut = makeSut();
    const account = await sut.add({
      name: 'any_name',
      email: 'any_mail@mail.com',
      password: 'hashed_password'
    });

    expect(account).toBeTruthy();
    expect(account.id).toBeTruthy();
    expect(account.name).toBe('any_name');
    expect(account.email).toBe('any_mail@mail.com');
    expect(account.password).toBe('hashed_password');
  });

  test('Should return an account on loadByEmail success', async () => {
    const sut = makeSut();
    await accountsCollection.insertOne({
      name: 'any_name',
      email: 'any_mail@mail.com',
      password: 'hashed_password'
    });

    const account = await sut.loadByEmail('any_mail@mail.com');

    expect(account).toBeTruthy();
    expect(account.id).toBeTruthy();
    expect(account.name).toBe('any_name');
    expect(account.email).toBe('any_mail@mail.com');
    expect(account.password).toBe('hashed_password');
  });

  test('Should return an account on loadByEmail success', async () => {
    const sut = makeSut();
    const account = await sut.loadByEmail('any_mail@mail.com');
    expect(account).toBeFalsy();
  });

  test('Should update the account accessToken on updateAccessToken success', async () => {
    const sut = makeSut();
    const res = await accountsCollection.insertOne({
      name: 'any_name',
      email: 'any_mail@mail.com',
      password: 'hashed_password'
    });
    expect(res.ops[0].accessToken).toBeFalsy();

    await sut.updateAccessToken(res.ops[0]._id, 'any_token');
    const account = await accountsCollection.findOne({ _id: res.ops[0]._id });
    expect(account).toBeTruthy();
    expect(account.accessToken).toBe('any_token');
  });

  describe('loadByToken', () => {
    test('Should return an account on loadByToken without role', async () => {
      const sut = makeSut();
      await accountsCollection.insertOne({
        name: 'any_name',
        email: 'any_mail@mail.com',
        password: 'hashed_password',
        accessToken: 'any_token'
      });
      const account = await sut.loadByToken('any_token');
      
      expect(account).toBeTruthy();
      expect(account.id).toBeTruthy();
      expect(account.name).toBe('any_name');
      expect(account.email).toBe('any_mail@mail.com');
      expect(account.password).toBe('hashed_password');
    });

    test('Should return an account on loadByToken with admin role', async () => {
      const sut = makeSut();
      await accountsCollection.insertOne({
        name: 'any_name',
        email: 'any_mail@mail.com',
        password: 'hashed_password',
        accessToken: 'any_token',
        role: 'admin'
      });
      const account = await sut.loadByToken('any_token', 'admin');
      
      expect(account).toBeTruthy();
      expect(account.id).toBeTruthy();
      expect(account.name).toBe('any_name');
      expect(account.email).toBe('any_mail@mail.com');
      expect(account.password).toBe('hashed_password');
    });

    test('Should return null on loadByToken with invalid role', async () => {
      const sut = makeSut();
      await accountsCollection.insertOne({
        name: 'any_name',
        email: 'any_mail@mail.com',
        password: 'hashed_password',
        accessToken: 'any_token'
      });
      const account = await sut.loadByToken('any_token', 'admin');
      expect(account).toBeFalsy();
    });

    test('Should return an account on loadByToken if user is admin', async () => {
      const sut = makeSut();
      await accountsCollection.insertOne({
        name: 'any_name',
        email: 'any_mail@mail.com',
        password: 'hashed_password',
        accessToken: 'any_token',
        role: 'admin'
      });
      const account = await sut.loadByToken('any_token');
      
      expect(account).toBeTruthy();
      expect(account.id).toBeTruthy();
      expect(account.name).toBe('any_name');
      expect(account.email).toBe('any_mail@mail.com');
      expect(account.password).toBe('hashed_password');
    });
  });
});
