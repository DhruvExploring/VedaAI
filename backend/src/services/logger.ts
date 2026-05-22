import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(__dirname, '../../logs');

// Ensure logging directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const ERROR_LOG = path.join(LOGS_DIR, 'error.log');
const COMBINED_LOG = path.join(LOGS_DIR, 'combined.log');

function formatMessage(level: string, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  let metaStr = '';
  if (meta) {
    if (meta instanceof Error) {
      metaStr = `\n${meta.stack || meta.message}`;
    } else if (typeof meta === 'object') {
      metaStr = ` | ${JSON.stringify(meta)}`;
    } else {
      metaStr = ` | ${meta}`;
    }
  }
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
}

function writeToFile(filePath: string, formattedMsg: string) {
  try {
    fs.appendFileSync(filePath, formattedMsg);
  } catch (err) {
    console.error('Failed to write log to file:', err);
  }
}

export const logger = {
  info(message: string, meta?: any) {
    const formatted = formatMessage('INFO', message, meta);
    console.log(`\x1b[32m[INFO]\x1b[0m ${message}`, meta !== undefined ? meta : '');
    writeToFile(COMBINED_LOG, formatted);
  },
  warn(message: string, meta?: any) {
    const formatted = formatMessage('WARN', message, meta);
    console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`, meta !== undefined ? meta : '');
    writeToFile(COMBINED_LOG, formatted);
  },
  error(message: string, meta?: any) {
    const formatted = formatMessage('ERROR', message, meta);
    console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`, meta !== undefined ? meta : '');
    writeToFile(COMBINED_LOG, formatted);
    writeToFile(ERROR_LOG, formatted);
  },
  debug(message: string, meta?: any) {
    const formatted = formatMessage('DEBUG', message, meta);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[34m[DEBUG]\x1b[0m ${message}`, meta !== undefined ? meta : '');
    }
    writeToFile(COMBINED_LOG, formatted);
  }
};
