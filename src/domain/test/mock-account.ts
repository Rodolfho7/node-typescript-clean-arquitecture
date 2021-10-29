import { AccountModel } from "../models/account";
import { AddAccountParams } from "../usecases/account/add-account";

export const mockAccountModel = (): AccountModel => {
  return {
    id: 'any_id',
    name: 'any_name',
    email: 'any_mail@mail.com',
    password: 'any_password'
  }
}

export const mockAddAccountParams = (): AddAccountParams => {
  return {
    name: 'any_name',
    email: 'any_mail@mail.com',
    password: 'any_password'
  }
}
