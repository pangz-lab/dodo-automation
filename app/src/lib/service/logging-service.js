/**
 * Author: Pangz
 * Email: pangz.lab@gmail.com
 */
export class LoggingService {
  static starting(message) {
    console.log('[ '+LoggingService._t()+' ][✅] '+message);
  }

  static closing(message) {
    console.log('[ '+LoggingService._t()+' ][♨️ ] '+message);
  }

  static success(message) {
    console.log('[ '+LoggingService._t()+' ][♻️ ] '+message);
  }

  static error(message) {
    console.log('[ '+LoggingService._t()+' ][⛔️] '+message);
  }

  static warning(message) {
    console.log('[ '+LoggingService._t()+' ][⚠️ ] '+message);
  }

  static errorMessage(message) {
    console.log('[⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️]');
    console.error('[ '+LoggingService._t()+' ]   ➜   '+message);
    console.log('[⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️]');
  }

  static processing(message) {
    console.log('[ '+LoggingService._t()+' ][⏳]      ➜  '+message);
  }

  static running(message) {
    console.log('[ '+LoggingService._t()+' ][⚡️⚡️⚡️⚡️⚡️] '+message);
  }

  static _t() {
    const date = new Date();
    const pad = function(v) {
      return v.toString().padStart(2, '0')
    };

    return `${date.getFullYear()}/${pad(date.getMonth())}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}