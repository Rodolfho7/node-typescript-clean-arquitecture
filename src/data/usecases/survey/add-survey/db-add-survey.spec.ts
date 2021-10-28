import { AddSurvey, AddSurveyParams } from "../../../../domain/usecases/survey/add-survey";
import { AddSurveyRepository } from "../../../protocols/db/survey/add-survey-repository";
import { DbAddSurvey } from "./db-add-survey";
import MockDate from 'mockdate';

const makeFakeSurveyData = (): AddSurveyParams => {
  return {
    question: 'any_question',
    answers: [
      {
        answer: 'any_answer',
        image: 'any_image'
      }
    ],
    date: new Date()
  }
}

const makeAddSurveyRepositoryStub = (): AddSurveyRepository => {
  class AddSurveyRepositoryStub implements AddSurveyRepository {
    async add(surveyData: AddSurveyParams): Promise<void> {
      return Promise.resolve();
    }
  }
  return new AddSurveyRepositoryStub();
}

type SutTypes = {
  sut: AddSurvey,
  addSurveyRepositoryStub: AddSurveyRepository
}

const makeSut = (): SutTypes => {
  const addSurveyRepositoryStub = makeAddSurveyRepositoryStub();
  const sut = new DbAddSurvey(addSurveyRepositoryStub);
  return { sut, addSurveyRepositoryStub }
}

describe('DbAddSurvey Usecase', () => {
  beforeAll(() => {
    MockDate.set(new Date());
  });
  afterAll(() => {
    MockDate.reset();
  });

  test('Should call AddSurveyRepository with correct values', async () => {
    const { sut, addSurveyRepositoryStub } = makeSut();

    const addSpy = jest.spyOn(addSurveyRepositoryStub, 'add');
    await sut.add(makeFakeSurveyData());

    expect(addSpy).toHaveBeenCalledWith({
      question: 'any_question',
      answers: [{ answer: 'any_answer', image: 'any_image'}],
      date: new Date()
    });
  });
});
