import { AddSurvey, AddSurveyModel } from "../../../domain/usecases/add-survey";
import { AddSurveyRepository } from "../../protocols/db/survey/add-survey-repository";
import { DbAddSurvey } from "./db-add-survey";

const makeFakeSurveyData = (): AddSurveyModel => {
  return {
    question: 'any_question',
    answers: [{ answer: 'any_answer', image: 'any_image'}]
  }
}

const makeAddSurveyRepositoryStub = (): AddSurveyRepository => {
  class AddSurveyRepositoryStub implements AddSurveyRepository {
    async add(surveyData: AddSurveyModel): Promise<void> {
      return Promise.resolve();
    }
  }
  return new AddSurveyRepositoryStub();
}

type SutTypes = {
  sut: AddSurvey,
  AddSurveyRepositoryStub: AddSurveyRepository
}

const makeSut = (): SutTypes => {
  const AddSurveyRepositoryStub = makeAddSurveyRepositoryStub();
  const sut = new DbAddSurvey(AddSurveyRepositoryStub);
  return { sut, AddSurveyRepositoryStub }
}

describe('DbAddSurvey Usecase', () => {
  test('Should call AddSurveyRepository with correct values', async () => {
    const { sut, AddSurveyRepositoryStub } = makeSut();

    const addSpy = jest.spyOn(AddSurveyRepositoryStub, 'add');
    await sut.add(makeFakeSurveyData());

    expect(addSpy).toHaveBeenCalledWith({
      question: 'any_question',
      answers: [{ answer: 'any_answer', image: 'any_image'}]
    });
  });
});
