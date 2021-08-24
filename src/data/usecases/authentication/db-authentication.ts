import { Authentication, AuthenticationModel } from "../../../domain/usecases/authentication";
import { HashCompare } from "../../protocols/criptography/hash-compare";
import { TokenGenerator } from "../../protocols/criptography/token-generator";
import { LoadAccountByEmailRepository } from "../../protocols/db/load-account-by-email-repository";

export class DbAuthentication implements Authentication {

  constructor(
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly hashCompare: HashCompare,
    private readonly tokenGenerator: TokenGenerator
  ) {}

  async auth(authentication: AuthenticationModel): Promise<string> {
    const account = await this.loadAccountByEmailRepository.load(authentication.email);
    if (account) {
      const isValid = await this.hashCompare.compare(authentication.password, account.password);
      if (!isValid) {
        return null;
      }
      const accessToken = await this.tokenGenerator.generate(account.id);
      return accessToken;
    }
    return null;
  }
}
