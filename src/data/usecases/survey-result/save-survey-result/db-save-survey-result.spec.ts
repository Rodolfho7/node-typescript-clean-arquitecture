import { SaveSurveyResult, SaveSurveyResultParams } from '../../../../domain/usecases/survey-result/save-survey-result';
import { DbSaveSurveyResult } from './db-save-survey-result';
import { SurveyResultModel } from '../../../../domain/models/survey-result';
import { SaveSurveyResultRepository } from "../../../protocols/db/survey-result/save-survey-result-repository";
import MockDate from 'mockdate';

const makeFakeSurveyResult = (): SurveyResultModel => {
  return {
    surveyId: 'any_survey_id',
    question: 'any_question',
    answers: [
      {
        answer: 'any_answer',
        count: 1,
        percent: 50
      },
      {
        answer: 'other_answer',
        count: 1,
        percent: 50,
        image: 'any_image'
      }
    ],
    date: new Date()
  }
}

const makeFakeSurveyResultData = (): SaveSurveyResultParams => {
  return {
    accountId: 'any_account_id',
    surveyId: 'any_survey_id',
    date: new Date(),
    answer: 'any_answer'
  }
}

const makeSaveSurveyResultRepositoryStub = (): SaveSurveyResultRepository => {
  class SaveSurveyResultRepositoryStub implements SaveSurveyResultRepository {
    async save(data: SaveSurveyResultParams): Promise<SurveyResultModel> {
      return Promise.resolve(makeFakeSurveyResult());
    }
  }
  return new SaveSurveyResultRepositoryStub();
}

type SutTypes = {
  sut: SaveSurveyResult,
  saveSurveyResultRepositoryStub: SaveSurveyResultRepository
}

const makeSut = (): SutTypes => {
  const saveSurveyResultRepositoryStub = makeSaveSurveyResultRepositoryStub();
  const sut = new DbSaveSurveyResult(saveSurveyResultRepositoryStub);
  return { sut, saveSurveyResultRepositoryStub }
}

describe('DbSaveSurveyResult Usecase', () => {
  beforeAll(() => {
    MockDate.set(new Date());
  });
  afterAll(() => {
    MockDate.reset();
  });

  test('Should call SaveSurveyResultRepository with correct values', async () => {
    const { sut, saveSurveyResultRepositoryStub } = makeSut();
    const saveSpy = jest.spyOn(saveSurveyResultRepositoryStub, 'save');
    await sut.save(makeFakeSurveyResultData());
    expect(saveSpy).toHaveBeenCalledWith(makeFakeSurveyResultData());
  });

  test('Should return a surveyResultModel on success', async () => {
    const { sut } = makeSut();
    const surveyResult = await sut.save(makeFakeSurveyResultData());
    expect(surveyResult).toEqual(makeFakeSurveyResult());
  });
});
