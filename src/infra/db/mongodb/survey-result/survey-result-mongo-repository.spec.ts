import { SurveyResultMongoRepository } from './survey-result-mongo-repository';
import { MongoHelper } from '../helpers/mongo-helper';
import { SaveSurveyResultModel } from '../../../../domain/usecases/survey-result/save-survey-result';
import { AccountModel } from '../../../../domain/models/account';
import { SurveyModel } from '../../../../domain/models/survey';
import { Collection } from 'mongodb';
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
    const saveSurveyResultData: SaveSurveyResultModel = {
      accountId: account.id,
      surveyId: survey.id,
      answer: survey.answers[0].answer,
      date: new Date()
    };
    const surveyResult = await sut.save(saveSurveyResultData);
    expect(surveyResult).toBeTruthy();
    expect(surveyResult.id).toBeTruthy();
  });

  test('Should add a survey result if its not new', async () => {
    const { sut } = makeSut();
    const survey = await makeSurvey();
    const account = await makeAccount();
    const res = await surveyResultCollection.insertOne({
      accountId: account.id,
      surveyId: survey.id,
      answer: survey.answers[0].answer,
      date: new Date()
    });
    const saveSurveyResultData: SaveSurveyResultModel = {
      accountId: account.id,
      surveyId: survey.id,
      answer: survey.answers[1].answer,
      date: new Date()
    };
    const surveyResult = await sut.save(saveSurveyResultData);
    expect(surveyResult).toBeTruthy();
    expect(surveyResult.id).toEqual(res.ops[0]._id);
    expect(surveyResult.answer).toBe(survey.answers[1].answer);
  });
});
