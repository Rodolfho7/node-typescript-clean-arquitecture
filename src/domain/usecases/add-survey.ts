export type SurveyAnswer = {
  image?: string,
  answer: string
}

export type AddSurveyModel = {
  question: string,
  answers: SurveyAnswer[]
}

export interface AddSurvey {
  add(data: AddSurveyModel): Promise<void>;
}
