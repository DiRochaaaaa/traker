type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  production: boolean
}

class Logger {
  private config: LogConfig

  constructor() {
    this.config = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      enableConsole: process.env.NODE_ENV !== 'production',
      enableFile: false, // Pode ser implementado depois
      production: process.env.NODE_ENV === 'production'
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex <= currentLevelIndex
  }

  private formatMessage(level: LogLevel, context: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const emoji = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🔍'
    }[level]
    
    let formatted = `${emoji} [${timestamp}] [${context.toUpperCase()}] ${message}`
    
    if (data && !this.config.production) {
      formatted += ` ${JSON.stringify(data, null, 2)}`
    }
    
    return formatted
  }

  error(context: string, message: string, data?: unknown) {
    if (this.shouldLog('error') && this.config.enableConsole) {
      console.error(this.formatMessage('error', context, message, data))
    }
  }

  warn(context: string, message: string, data?: unknown) {
    if (this.shouldLog('warn') && this.config.enableConsole) {
      console.warn(this.formatMessage('warn', context, message, data))
    }
  }

  info(context: string, message: string, data?: unknown) {
    if (this.shouldLog('info') && this.config.enableConsole) {
      console.log(this.formatMessage('info', context, message, data))
    }
  }

  debug(context: string, message: string, data?: unknown) {
    if (this.shouldLog('debug') && this.config.enableConsole) {
      console.log(this.formatMessage('debug', context, message, data))
    }
  }

  // Métodos específicos para diferentes contextos
  api(endpoint: string, action: string, data?: unknown) {
    this.info(`API:${endpoint}`, `${action}`, data)
  }

  facebook(action: string, data?: unknown) {
    this.debug('FACEBOOK', action, data)
  }

  supabase(action: string, data?: unknown) {
    this.debug('SUPABASE', action, data)
  }

  cache(action: string, data?: unknown) {
    this.debug('CACHE', action, data)
  }

  performance(action: string, duration: number, data?: unknown) {
    this.info('PERFORMANCE', `${action} completed in ${duration}ms`, data)
  }
}

export const logger = new Logger()