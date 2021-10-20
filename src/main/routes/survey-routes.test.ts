import request from 'supertest';
import app from '../config/app';
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { Collection } from 'mongodb';

describe('Survey Routes', () => {
  let surveyCollection: Collection;
  let accountCollection: Collection;

  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getCollection('surveys');
    await surveyCollection.deleteMany({});
    accountCollection = await MongoHelper.getCollection('accounts');
    await accountCollection.deleteMany({});
  });

  describe('POST /surveys', () => {
    test('Should return 403 on add survey without accessToken', async () => {
      await request(app)
      .post('/api/surveys')
      .send({
        question: 'Question',
        answers: [
          {
            answer: 'Answer 1',
            image: 'http://image-name.com'
          },
          {
            answer: 'Answer 2'
          }
        ]
      })
      .expect(403);
    });

    test('Should return 204 on add survey with valid accessToken', async () => {
      const res = await accountCollection.insertOne({
        name: 'rodolfho',
        email: 'rodolfhoazevedo@gmail.com',
        password: '123',
        role: 'admin'
      });
      const id = res.ops[0]._id;
      const accessToken = jwt.sign({ id }, env.jwtSecret);
      await accountCollection.updateOne({ _id: id }, { $set: { accessToken } });
      await request(app)
      .post('/api/surveys')
      .set('x-access-token', accessToken)
      .send({
        question: 'Question',
        answers: [
          {
            answer: 'Answer 1',
            image: 'http://image-name.com'
          },
          {
            answer: 'Answer 2'
          }
        ]
      })
      .expect(204);
    });
  });
});
