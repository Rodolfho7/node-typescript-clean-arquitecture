import { SurveyResultMongoRepository } from './survey-result-mongo-repository';
import { MongoHelper } from '../helpers/mongo-helper';
import { SaveSurveyResultParams } from '../../../../domain/usecases/survey-result/save-survey-result';
import { AccountModel } from '../../../../domain/models/account';
import { SurveyModel } from '../../../../domain/models/survey';
import { Collection, ObjectId } from 'mongodb';
import MockDate from 'mockdate';

let surveyCollection: Collection;
let surveyResultCollection: Collection;
let accountCollection: Collection;

type SutTypes = {
  sut: SurveyResultMongoRepository
}

const makeSut = (): SutTypes => {
  const sut = new SurveyResultMongoRepository();
  return { sut };
}

const makeSurvey = async (): Promise<SurveyModel> => {
  const res = await surveyCollection.insertOne({
    question: 'any_question',
    answers: [
      {
        answer: 'any_answer',
        image: 'any_image'
      },
      {
        answer: 'other_answer',
        image: 'other_image'
      }
    ],
    date: new Date()
  });
  return MongoHelper.idMapper(res.ops[0]);
}

const makeAccount = async (): Promise<AccountModel> => {
  const res = await accountCollection.insertOne({
    name: 'any_name',
    email: 'any_mail@mail.com',
    password: 'hashed_password'
  });
  return MongoHelper.idMapper(res.ops[0]);
}

describe('save()', () => {
  beforeAll(async () => {
    MockDate.set(new Date());
    await MongoHelper.connect(process.env.MONGO_URL);
    surveyCollection = await MongoHelper.getCollection('surveys');
    surveyResultCollection = await MongoHelper.getCollection('surveyResults');
    accountCollection = await MongoHelper.getCollection('accounts');
  });

  afterAll(async () => {
    MockDate.reset();
    MongoHelper.disconnect();
  });

  beforeEach(async () => {
    await surveyCollection.deleteMany({});
    await surveyResultCollection.deleteMany({});
    await accountCollection.deleteMany({});
  });

  test('Should add a survey result if its new', async () => {
    const { sut } = makeSut();
    const survey = await makeSurvey();
    const account = await makeAccount();
    const saveSurveyResultData: SaveSurveyResultParams = {
      accountId: account.id,
      surveyId: survey.id,
      answer: survey.answers[0].answer,
      date: new Date()
    };
    const surveyResult = await sut.save(saveSurveyResultData);
    expect(surveyResult).toBeTruthy();
    expect(surveyResult.surveyId).toEqual(survey.id);
    expect(surveyResult.answers[0].answer).toBe(survey.answers[0].answer);
    expect(surveyResult.answers[0].count).toBe(1);
    expect(surveyResult.answers[0].percent).toBe(100);
    expect(surveyResult.answers[1].count).toBe(0);
    expect(surveyResult.answers[1].percent).toBe(0);
  });

  test('Should add a survey result if its not new', async () => {
    const { sut } = makeSut();
    const survey = await makeSurvey();
    const account = await makeAccount();
    await surveyResultCollection.insertOne({
      accountId: new ObjectId(account.id),
      surveyId: new ObjectId(survey.id),
      answer: survey.answers[0].answer,
      date: new Date()
    });
    const saveSurveyResultData: SaveSurveyResultParams = {
      accountId: account.id,
      surveyId: survey.id,
      answer: survey.answers[1].answer,
      date: new Date()
    };
    const surveyResult = await sut.save(saveSurveyResultData);
    expect(surveyResult).toBeTruthy();
    expect(surveyResult.surveyId).toEqual(survey.id);
    expect(surveyResult.answers[0].answer).toBe(survey.answers[1].answer);
    expect(surveyResult.answers[0].count).toBe(1);
    expect(surveyResult.answers[0].percent).toBe(100);
    expect(surveyResult.answers[1].count).toBe(0);
    expect(surveyResult.answers[1].percent).toBe(0);
  });
});
