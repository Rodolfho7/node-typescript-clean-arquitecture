import jwt, { SignOptions } from 'jsonwebtoken';
import { Encrypter } from '../../../data/protocols/criptography/encrypter';
import { JwtAdapter } from './jwt-adapter';

jest.mock('jsonwebtoken', () => {
  return {
    sign(payload: string | Buffer | object, secret?: SignOptions): string {
      return 'valid_token';
    }
  };
});

type SutTypes = {
  sut: Encrypter
}

const makeSut = (): SutTypes => {
  const sut = new JwtAdapter('secret');
  return { sut };
}

describe('Jwt-adapter', () => {
  test('Should call sign with correct values', async () => {
    const { sut } = makeSut();
    const signSpy = jest.spyOn(jwt, 'sign');
    await sut.encrypt('any_id');
    expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, 'secret');
  });

  test('Should return a token on sign succeess', async () => {
    const { sut } = makeSut();
    const accessToken = await sut.encrypt('any_id');
    expect(accessToken).toBe('valid_token');
  });
});
