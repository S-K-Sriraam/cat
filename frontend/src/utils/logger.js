/**
 * Logger utility for debugging
 * Provides structured logging with different log levels
 */
class Logger {
  constructor(namespace = 'CAT') {
    this.namespace = namespace;
    this.isDevelopment = import.meta.env.MODE === 'development';
  }

  log(message, data = null) {
    console.log(`[${this.namespace}] ℹ️ ${message}`, data || '');
  }

  info(message, data = null) {
    console.info(`[${this.namespace}] ℹ️ ${message}`, data || '');
  }

  success(message, data = null) {
    console.log(`[${this.namespace}] ✅ ${message}`, data || '');
  }

  warn(message, data = null) {
    console.warn(`[${this.namespace}] ⚠️  ${message}`, data || '');
  }

  error(message, error = null) {
    console.error(`[${this.namespace}] ❌ ${message}`, error || '');
  }

  debug(message, data = null) {
    if (this.isDevelopment) {
      console.debug(`[${this.namespace}] 🔍 ${message}`, data || '');
    }
  }

  group(label) {
    console.group(`[${this.namespace}] 📦 ${label}`);
  }

  groupEnd() {
    console.groupEnd();
  }
}

// Create singleton loggers
export const logger = new Logger('CAT');
export const apiLogger = new Logger('API');
export const authLogger = new Logger('AUTH');

export default logger;
