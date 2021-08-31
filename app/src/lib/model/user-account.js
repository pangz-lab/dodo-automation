export class UserAccount {
  #username;
  #password;
  constructor(username, password) {
    this.#username = username;
    this.#password = password;
  }

  get username() {
    return this.#username;
  }

  get password() {
    return this.#password;
  }
}