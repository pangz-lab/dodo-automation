/**
 * Author: Pangz
 * Email: pangz.lab@gmail.com
 */
export class ChainTokenPair {
  #name;
  #source;
  #target;
  #valid;
  
  constructor(param) {
    this.#name = param.name;
    this.#source = param.source;
    this.#target = param.target;
    this.#valid = (
      param.source != undefined ||
      param.target != undefined
    );
  }

  get name() {
    return this.#name;
  }

  get source() {
    return this.#source;
  }

  get target() {
    return this.#target;
  }

  valid() {
    return this.#valid;
  }
}