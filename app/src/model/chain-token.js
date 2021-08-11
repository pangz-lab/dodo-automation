import { AppConfig } from "../config/app-config.js";

export class ChainToken {
  #name;
  #value;
  #symbol;
  #address;
  #exist;

  constructor(name, value) {
    const _def = { symbol: '', address: '' };
    let _props = AppConfig.chain().token.collection[name];

    this.#exist = (_props != undefined);
    _props = (this.#exist) ? _props : _def;
    this.#name = name;
    this.#value = value;
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

  get value() {
    return this.#value;
  }

  exist() {
    return this.#exist;
  }
}