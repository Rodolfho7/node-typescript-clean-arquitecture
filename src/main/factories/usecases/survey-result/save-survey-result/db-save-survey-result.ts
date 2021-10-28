import { SaveSurveyResult } from "../../../../../domain/usecases/survey-result/save-survey-result";
import { DbSaveSurveyResult } from '../../../../../data/usecases/survey-result/save-survey-result/db-save-survey-result';
import { SurveyResultMongoRepository } from "../../../../../infra/db/mongodb/survey-result/survey-result-mongo-repository";

export const MakeDbSaveSurveyResult = (): SaveSurveyResult => {
  const saveSurveyResultRepository = new SurveyResultMongoRepository();
  return new DbSaveSurveyResult(saveSurveyResultRepository);
}
