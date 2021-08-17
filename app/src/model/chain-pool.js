import { ChainToken } from "./chain-token.js";

export class ChainPool {
  #name;
  #source;
  #target;
  #exist;
  #valueRatio;
  
  constructor(name) {
    const _def = { valueRatio: [], source: '', target: '' };
    let _props = AppConfig.chain().token.pair[name];

    this.#exist = (_props != undefined);
    _props = (this.#exist) ? _props : _def;
    this.#name = name;
    this.#valueRatio = _props.valueRatio;
    this.#source = new ChainToken(_props.source, this.#valueRatio[0]);
    this.#target = new ChainToken(_props.target, this.#valueRatio[1]);
  }
}