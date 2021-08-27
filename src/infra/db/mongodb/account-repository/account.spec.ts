import { Collection } from 'mongodb';
import { MongoHelper } from '../helpers/mongo-helper';
import { AccountMongoRepository } from './account';

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
});
