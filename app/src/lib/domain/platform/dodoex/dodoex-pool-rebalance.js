/**
 * Author: Pangz
 * Email: pangz.lab@gmail.com
 */
import { LoggingService } from "../../../service/logging-service.js";

export class DodoExPoolRebalance {
  #service;
  #pptrService;
  #selectors;
  #page;
  #pool;
  #rebalanceFormSelector;
  #setting;
  #generalSetting;

  constructor(setting, service) {
    this.#service = service;
    this.#setting = setting;
    this.#pptrService = service.puppeteerService;
    this.#generalSetting = this.#setting.generalSetting().poolRebalance;
    this.#selectors = this.#setting.poolRebalanceSelectors();
    this.#rebalanceFormSelector = this.#selectors.rebalanceForm;
  }

  async prepare(page, pool) {
    LoggingService.processing("Preparing rebalance...");
    this.#page = page;
    this.#pool = pool;

    try {
      const _selectors = this.#selectors;
      const _pptrService = this.#pptrService;
      await page.waitForSelector(_selectors.modifyParametersButton);

      const _allowedRetry = 10;
      const _isDisabled = await _pptrService
      .isElementDisabledWithRetry(
        page,
        _selectors.modifyParametersButton,
        _allowedRetry
      );

      if(_isDisabled) {
        const _message = "Pool parameters cannot be updated";
        LoggingService.error(_message);
        LoggingService.errorMessag("Failed to initialize pool rebalance");
        throw new Error(_message);
      }

      LoggingService.processing("Initializing rebalance maintenance page...");
      await page.click(_selectors.modifyParametersButton);
      await this._acceptDisclaimerAgreement();
      await this._checkTokenPair();

      return await Promise.resolve(true);

    } catch(e) {
      const _message = "Error occured during pool rebalance preparation.";
      LoggingService.errorMessage(_message);
      throw new Error(e);
    }
  }

  async allowOperation() {
    LoggingService.processing(`Checking if operation is allowed...`);
    const _genSetting = this.#generalSetting;
    const _validForUpdate = await this._validateTokenPairValue();
    const _allow = _validForUpdate || _genSetting.alwaysPerformRebalance;
    const _messageValid = _validForUpdate? "valid" : "not valid";
    const _messageAllowed = _allow? "permitted" : "not permitted";

    LoggingService.processing(`Token balances ${_messageValid} for update`);
    LoggingService.processing(`Override flag : ${_genSetting.alwaysPerformRebalance}`);
    LoggingService.processing(`Rebalance operation is ${_messageAllowed}`);

    return _allow
  }

  async execute() {
    try {
      LoggingService.success("Executing pool rebalance...");
      const page = this.#page;
      const _genSetting = this.#generalSetting;
      const _selectors = this.#rebalanceFormSelector;
      await page.waitForSelector(_selectors.preConfirmButton);

      LoggingService.processing("Setting amount...");
      await this._setTokenAmount();
      await page.click(_selectors.preConfirmButton);

      LoggingService.processing("Checking if screenshot is required...");
      if(_genSetting.getConfirmationScreenshot) {
        await page.waitForTimeout(1000);
        await this._takeConfirmationScreenshot();
      }

      await page.waitForTimeout(1000);
      await page.waitForSelector(_selectors.confirmButton);
      LoggingService.processing("Confirming the rebalance...");
      await page.click(_selectors.confirmButton);
      
      return await Promise.resolve(true);

    } catch(e) {
      LoggingService.errorMessage("Failed to complete the operation");
      throw new Error(e);
    }
  }

  async _takeConfirmationScreenshot() {
    const _genSetting = this.#generalSetting;
    const _name = Date.now((new Date()))+'.png';
    const _scPath = _genSetting.screenshotPath+'/'+_name;

    LoggingService.processing("Taking screenshot...");
    await this.#page.screenshot({ path: _scPath});
    LoggingService.processing(`Saved to ${_scPath}`);
  }

  async _acceptDisclaimerAgreement() {
    LoggingService.processing("Processing disclaimer agreement...");
    const _selectors = this.#selectors;
    const page = this.#page;
    
    try {
      await page.waitForSelector(
        _selectors.discalimer.agreeCheckbox,
        {timeout: 2000}
      );

    } catch (e) {
      LoggingService.processing("No disclaimer agreement posted...");
      LoggingService.success("Proceeding with the operation...");
      return await Promise.resolve(true);
    }

    LoggingService.processing("Accepting disclaimer agreement...");
    await page.waitForTimeout(1000);
    await page.click(_selectors.discalimer.agreeCheckbox);
    await page.waitForTimeout(1000);
    await page.click(_selectors.discalimer.continueButton);
    LoggingService.success("Disclaimer agreement accepted...");
  }

  async _setTokenAmount() {
    LoggingService.processing("Setting token amount...");
    const page = this.#page;
    const pool = this.#pool;
    const _selectors = this.#rebalanceFormSelector;
    const _sourceTokenAmount = pool.source.value.toString();
    const _targetTokenAmount = pool.target.value.toString();
    await page.waitForSelector(_selectors.sourceTokenInputField);
    await page.waitForSelector(_selectors.targetTokenInputField);

    /**
     * "page.keyboard.type" is used here as the selector reference changes for the
     * amount fields. When reset is called, the reference changes and the old
     * selector used during the reset is gone. 
     * 
     * To effectively type a value, instead of using the
     * usual "page.type" in a input selector, "page.keyboard.type" is preferred as
     * this manages perfectly the changes of the selector. "page.keyboard.type" just
     * types value into whichever element it is currently parked on. Since reset
     * is being called first before typing, which focuses the cursor to
     * the target element, we can assure this method types the value
     * to the expected element.
     */
    LoggingService.processing(`Setting source token amount: ${_sourceTokenAmount}`);
    await this.#pptrService.clearInput(page, _selectors.sourceTokenInputField);
    await page.keyboard.type(_sourceTokenAmount, {delay: 100});
    
    LoggingService.processing(`Setting target token amount: ${_targetTokenAmount}`);
    await this.#pptrService.clearInput(page, _selectors.targetTokenInputField);
    await page.keyboard.type(_targetTokenAmount, {delay: 100});
  }

  async _checkTokenPair() {
    LoggingService.processing("Checking token pair symbol...");
    const page = this.#page;
    const pool = this.#pool;
    const _tokenSymbol = await this._getTokenPairSymbol(page);
    const _pairMatched =  (
      pool.source.symbol.trim() == _tokenSymbol.source.trim() &&
      pool.target.symbol.trim() == _tokenSymbol.target.trim()
    );

    if(!_pairMatched) {
      const _message = "Token pair mismatched. Check your chain config or pool and try again.";
      LoggingService.errorMessage(_message);
      throw new Error(_message);
    }
  }

  async _validateTokenPairValue() {
    LoggingService.processing("Checking token pair value...");
    const pool = this.#pool;
    const _poolTokenValue = await this._getTokenPairValue();
    const _tradeSpeed = this._getTradeSpeedValue();
    const _source = {
      min: parseFloat(pool.source.value)-_tradeSpeed.source,
      max: parseFloat(pool.source.value)+_tradeSpeed.source,
    };

    const _target = {
      min: parseFloat(pool.target.value)-_tradeSpeed.target,
      max: parseFloat(pool.target.value)+_tradeSpeed.target,
    };

    LoggingService.processing(`_ Pool token pair value ${JSON.stringify(_poolTokenValue)}`);
    LoggingService.processing(`_ Source token min/max ${JSON.stringify(_source)}`);
    LoggingService.processing(`_ Target token min/max ${JSON.stringify(_target)}`);
    LoggingService.processing(`_ Trade speed ${JSON.stringify(_tradeSpeed)}`);

    return !(
      this._valueInRange(_poolTokenValue.source, _source.min, _source.max) &&
      this._valueInRange(_poolTokenValue.target, _target.min, _target.max)
    );
  }
  
  async _getTokenPairSymbol() {
    LoggingService.processing("Getting token pair symbol...");
    const page = this.#page;
    const _selectors = this.#rebalanceFormSelector;
    const _sourceToken = _selectors.sourceTokenText;
    const _targetToken = _selectors.targetTokenText;
    return {
      source: await this.#pptrService.getInnerHTML(page, _sourceToken),
      target: await this.#pptrService.getInnerHTML(page, _targetToken),
    };
  }

  async _getTokenPairValue() {
    LoggingService.processing("Getting token pair value...");
    const page = this.#page;
    const _selectors = this.#rebalanceFormSelector;
    const _sourceToken = _selectors.sourceTokenInputField;
    const _targetToken = _selectors.targetTokenInputField;
    return {
      source: parseFloat(await this.#pptrService.getValue(page, _sourceToken)),
      target: parseFloat(await this.#pptrService.getValue(page, _targetToken)),
    };
  }

  _valueInRange(value, min, max) {
    return (
      value >= min &&
      value <= max
    );
  }

  _getTradeSpeedValue() {
    const pool = this.#pool;
    return {
      source: parseFloat(pool.source.value)*(parseInt(pool.tradeSpeedPercent)/100),
      target: parseFloat(pool.target.value)*(parseInt(pool.tradeSpeedPercent)/100),
    };
  }
}