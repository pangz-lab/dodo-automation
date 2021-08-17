
export class ChainToken {
  #name;
  #value;
  #symbol;
  #address;

  constructor(props) {
    // const _def = { name: '', value: -1, symbol: '', address: '' };
    // AppConfig.chain().token.collection[name];
    this.#name = props.name;
    this.#value = props.value;
    this.#symbol = props.symbol;
    this.#address = props.address;
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

  valid() {
    return (
      this.#name == '' ||
      this.#address == '' ||
      this.#symbol == '' ||
      this.#value == -1
    );
  }
}