import { AppConfig } from "../config/app-config.js";

export class ChainToken {

  #name;
  #symbol;
  #address;
  #exist;

  constructor(name) {
    
    this.#name = name;
    const _def = {symbol: '', address: ''};
    let _props = AppConfig.chain().token.collection[this.#name];

    this.#exist = (_props != undefined);
    _props = (this.#exist) ? _props : _def;
    this.#symbol = _props.symbol;
    this.#address = _props.address;
  }

  get name() {
    return this.#name;
  }

  get address() {
    return this.#address;
  }

  get symbol() {
    return this.#symbol;
  }

  exist() {
    return this.#exist;
  }
}