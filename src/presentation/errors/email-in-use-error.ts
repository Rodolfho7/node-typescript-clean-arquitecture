export class EmailInUseError extends Error {
  constructor() {
    super(`the email is already in use`);
    this.name = `Email In use`;
  }
}
