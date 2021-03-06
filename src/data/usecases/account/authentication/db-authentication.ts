import { Authentication, AuthenticationParams } from "../../../../domain/usecases/account/authentication";
import { HashCompare } from "../../../protocols/criptography/hash-compare";
import { Encrypter } from "../../../protocols/criptography/encrypter";
import { LoadAccountByEmailRepository } from "../../../protocols/db/account/load-account-by-email-repository";
import { UpdateAccessTokenRepository } from "../../../protocols/db/account/update-access-token-repository";

export class DbAuthentication implements Authentication {

  constructor(
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly hashCompare: HashCompare,
    private readonly encrypter: Encrypter,
    private readonly updateAccessTokenRepository: UpdateAccessTokenRepository
  ) {}

  async auth(authentication: AuthenticationParams): Promise<string> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(authentication.email);
    if (account) {
      const isValid = await this.hashCompare.compare(authentication.password, account.password);
      if (!isValid) {
        return null;
      }
      const accessToken = await this.encrypter.encrypt(account.id);
      await this.updateAccessTokenRepository.updateAccessToken(account.id, accessToken);
      return accessToken;
    }
    return null;
  }
}
