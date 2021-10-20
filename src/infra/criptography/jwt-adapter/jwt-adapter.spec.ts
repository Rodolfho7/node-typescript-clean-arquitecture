import jwt, { SignOptions } from 'jsonwebtoken';
import { Encrypter } from '../../../data/protocols/criptography/encrypter';
import { JwtAdapter } from './jwt-adapter';

jest.mock('jsonwebtoken', () => {
  return {
    sign(payload: string | Buffer | object, secret?: SignOptions): string {
      return 'valid_token';
    },
    async verify(value: string): Promise<string> {
      return Promise.resolve('any_decrypted_value');
    }
  };
});

type SutTypes = {
  sut: JwtAdapter
}

const makeSut = (): SutTypes => {
  const sut = new JwtAdapter('secret');
  return { sut };
}

describe('Jwt-adapter', () => {
  describe('Encrypter', () => {
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

    test('Should throws if encrypt throws', async () => {
      const { sut } = makeSut();
      jest.spyOn(jwt, 'sign').mockImplementationOnce(() => Promise.reject(new Error()));
      const promise = sut.encrypt('any_id');
      expect(promise).rejects.toThrow();
    });
  });

  describe('verify', () => {
    test('Should call verify with correct values', async () => {
      const { sut } = makeSut();
      const verifySpy = jest.spyOn(jwt, 'verify');
      await sut.decrypt('any_token');
      expect(verifySpy).toHaveBeenCalledWith('any_token', 'secret');
    });

    test('Should return a value on verify success', async () => {
      const { sut } = makeSut();
      const value = await sut.decrypt('any_value');
      expect(value).toBe('any_decrypted_value');
    });

    test('Should throws if encrypt throws', async () => {
      const { sut } = makeSut();
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => { throw new Error() });
      const promise = sut.decrypt('any_value');
      expect(promise).rejects.toThrow();
    });
  });
});
