import request from 'supertest';
import app from '../config/app';
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper';
import { Collection } from 'mongodb';
import { hash } from 'bcrypt';

describe('Login Routes', () => {
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

  describe('POST /signup', () => {
    test('Should return 200 on signup', async () => {
      await request(app)
      .post('/api/signup')
      .send({
        name: 'rodolfho',
        email: 'rodolfhoazevedo@gmail.com',
        password: '123',
        passwordConfirmation: '123'
      })
      .expect(200);
    });
  });

  
  describe('POST /login', () => {
    test('Should return 200 on login', async () => {
      const password = await hash('123', 12);
      await accountsCollection.insertOne({
        name: 'rodolfho',
        email: 'rodolfhoazevedo@gmail.com',
        password
      });
      await request(app)
      .post('/api/login')
      .send({
        email: 'rodolfhoazevedo@gmail.com',
        password: '123'
      })
      .expect(200);
    });

    test('Should return 401 on login', async () => {
      await request(app)
      .post('/api/login')
      .send({
        email: 'rodolfhoazevedo@gmail.com',
        password: '123'
      })
      .expect(401);
    });
  });
});
