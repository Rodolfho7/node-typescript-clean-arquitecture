import request from 'supertest';
import app from '../config/app';
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { Collection } from 'mongodb';

let surveyCollection: Collection;
let accountCollection: Collection;

const makeAccessToken = async (): Promise<string> => {
  const res = await accountCollection.insertOne({
    name: 'rodolfho',
    email: 'rodolfhoazevedo@gmail.com',
    password: '123',
    role: 'admin'
  });
  const id = res.ops[0]._id;
  const accessToken = jwt.sign({ id }, env.jwtSecret);
  await accountCollection.updateOne({ _id: id }, { $set: { accessToken } });

  return accessToken;
}

describe('Survey Routes', () => {
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
      const accessToken = await makeAccessToken();
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

  describe('GET /surveys', () => {
    test('Should return 403 on add survey without accessToken', async () => {
      await request(app)
      .get('/api/surveys')
      .expect(403);
    });

    test('Should return 200 on load surveys with valid accessToken', async () => {
      const accessToken = await makeAccessToken();
      await surveyCollection.insertMany([
        {
          question: 'any_question',
          answers: [
            {
              answer: 'any_answer',
              image: 'any_image'
            }
          ],
          date: new Date()
        }
      ]);
      await request(app)
      .get('/api/surveys')
      .set('x-access-token', accessToken)
      .expect(200);
    });
  });
});
