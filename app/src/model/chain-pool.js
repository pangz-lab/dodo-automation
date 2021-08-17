import { ChainToken } from "./chain-token.js";

export class ChainPool {
  #name;
  #address;
  #source;
  #target;
  
  constructor(props) {
    this.#name = props.name;
    this.#address = props.address;
    this.#source = props.source;
    this.#target = props.target;
  }

  get name() {
    return this.#name;
  }
  
  get address() {
    return this.#address;
  }

  get source() {
    return this.#source;
  }

  get target() {
    return this.#target;
  }
}