import { AppConfig } from "../config/app-config.js";

export class ChainTokenPair {
  #name;
  #valueRatio;
  #source;
  #target;
  #exist;
  
  constructor(name) {

    this.#name = name;
    const _def = { valueRatio: [], source: '', target: '' };
    let _props = AppConfig.chain().token.pair[this.#name];

    this.#exist = (_props != undefined);
    _props = (this.#exist) ? _props : _def;
    this.#valueRatio = _props.valueRatio;
    this.#source = _props.source;
    this.#target = _props.target;
  }

  get sourceValue() {
    return this.#valueRatio[0];
  }

  get targetValue() {
    return this.#valueRatio[1];
  }

  get source() {
    return this.#source;
  }

  get target() {
    return this.#target;
  }

  exist() {
    return this.#exist;
  }
}