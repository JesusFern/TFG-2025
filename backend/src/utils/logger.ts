import winston from 'winston';

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const emojis: Record<string, string> = {
    error: '❌',
    warn: '⚠️',
    info: '📝',
    debug: '🔍',
    verbose: '🔊',
    silly: '🤪'
  };

  const emoji = emojis[level] || '';
  
  let output = `${timestamp} ${level.toUpperCase()} ${emoji} ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    output += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  
  return output;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    customFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export default logger;