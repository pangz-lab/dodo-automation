export class LoggingService {
  static starting(message) {
    console.log('[✅] '+message);
  }

  static closing(message) {
    console.log('[♨️ ] '+message);
  }

  static success(message) {
    console.log('[♻️ ] '+message);
  }

  static error(message) {
    console.log('[⛔️] '+message);
  }

  static processing(message) {
    console.log('[⏳]        ➜  '+message);
  }
}