import fs from 'fs';
import path from 'path';
import { assert } from '../assert';
import { logger } from '../../services/logger';

export const name = 'Logger Writing Tests';

const LOGS_DIR = path.resolve(__dirname, '../../../logs');
const COMBINED_LOG = path.join(LOGS_DIR, 'combined.log');
const ERROR_LOG = path.join(LOGS_DIR, 'error.log');

export const tests = {
  testLogFoldersExist() {
    assert.ok(fs.existsSync(LOGS_DIR), `Logs directory should exist at ${LOGS_DIR}`);
  },

  testCombinedLogWrites() {
    const testId = `TEST_TOKEN_${Date.now()}_COMBINED`;
    logger.info(`This is a test info message with token ${testId}`);

    assert.ok(fs.existsSync(COMBINED_LOG), 'combined.log should be created');
    
    const contents = fs.readFileSync(COMBINED_LOG, 'utf8');
    assert.ok(contents.includes(testId), 'combined.log should contain the unique info test token');
    assert.ok(contents.includes('[INFO]'), 'Log format should contain [INFO] level indicator');
  },

  testErrorLogWrites() {
    const errorTestId = `TEST_TOKEN_${Date.now()}_ERROR`;
    const mockError = new Error('Simulated database breakdown error');
    
    logger.error(`This is a simulated critical log with token ${errorTestId}`, mockError);

    assert.ok(fs.existsSync(COMBINED_LOG), 'combined.log should exist');
    assert.ok(fs.existsSync(ERROR_LOG), 'error.log should exist');

    const combinedContents = fs.readFileSync(COMBINED_LOG, 'utf8');
    const errorContents = fs.readFileSync(ERROR_LOG, 'utf8');

    assert.ok(combinedContents.includes(errorTestId), 'combined.log should contain the unique error token');
    assert.ok(errorContents.includes(errorTestId), 'error.log should contain the unique error token');
    assert.ok(errorContents.includes('[ERROR]'), 'Log format should contain [ERROR] level indicator');
    assert.ok(errorContents.includes('Simulated database breakdown error'), 'Log format should log error trace stack');
  }
};
