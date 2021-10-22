import { SurveyModel } from '../../../../domain/models/survey';
import { LoadSurveys } from '../../../../domain/usecases/load-surveys';
import { Controller } from '../../../protocols/controller';
import { LoadSurveysController } from './load-surveys-controller';
import MockDate from 'mockdate';

const makeFakeSurveys = (): SurveyModel[] => {
  return [
    {
    id: 'any_id',
    question: 'any_question',
      answers: [
        {
          image: 'any_image',
          answer: 'any_answer'
        }
      ],
      date: new Date()
    },
    {
      id: 'other_id',
      question: 'other_question',
      answers: [
        {
          image: 'other_image',
          answer: 'other_answer'
        }
      ],
      date: new Date()
    }
  ]
}

const makeLoadSurveysStub = (): LoadSurveys => {
  class LoadSurveysStub implements LoadSurveys {
    async load(): Promise<SurveyModel[]> {
      return Promise.resolve(makeFakeSurveys());
    }
  }
  return new LoadSurveysStub();
}

type SutTypes = {
  sut: Controller,
  loadSurveys: LoadSurveys
}

const makeSut = (): SutTypes => {
  const loadSurveys = makeLoadSurveysStub();
  const sut = new LoadSurveysController(loadSurveys);
  return { sut, loadSurveys };
}

describe('LoadSurveys Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date());
  });
  afterAll(() => {
    MockDate.reset();
  });

  test('Should call LoadSurveys', async () => {
    const { sut, loadSurveys } = makeSut();
    const loadSpy = jest.spyOn(loadSurveys, 'load');
    await sut.handle({});
    expect(loadSpy).toHaveBeenCalled();
  });
});