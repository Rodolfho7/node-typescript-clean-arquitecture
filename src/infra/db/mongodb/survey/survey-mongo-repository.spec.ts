import { Collection } from 'mongodb';
import { MongoHelper } from '../helpers/mongo-helper';
import { SurveyMongoRepository } from './survey-mongo-repository';

const makeSut = (): SurveyMongoRepository => {
  return new SurveyMongoRepository();
}

describe('Account Mongo Repository', () => {
  let surveysCollection: Collection;
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  beforeEach(async () => {
    surveysCollection = await MongoHelper.getCollection('surveys');
    await surveysCollection.deleteMany({});
  });

  describe('add()', () => {
    test('Should return an survey on add success', async () => {
      const sut = makeSut();
      await sut.add({
        question: 'any_question',
        answers: [
          {
            answer: 'any_answer',
            image: 'any_image'
          },
          {
            answer: 'other_answer'
          }
        ],
        date: new Date()
      });
      const survey = await surveysCollection.findOne({ question: 'any_question' });
      expect(survey).toBeTruthy();
    });
  });

  describe('loadAll()', () => {
    test('Should load all surveys on success', async () => {
      surveysCollection.insertMany([
        {
          question: 'any_question',
          answers: [
            {
              answer: 'any_answer',
              image: 'any_image'
            }
          ],
          date: new Date()
        },
        {
          question: 'other_question',
          answers: [
            {
              answer: 'other_answer',
              image: 'other_image'
            }
          ],
          date: new Date()
        }
      ]);
      const sut = makeSut();
      const surveys = await sut.loadAll();
      expect(surveys.length).toBe(2);
    });

    
    test('Should load all surveys on success', async () => {
      const sut = makeSut();
      const surveys = await sut.loadAll();
      expect(surveys.length).toBe(0);
    });
  });
});
