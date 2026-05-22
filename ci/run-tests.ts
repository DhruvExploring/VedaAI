import * as difficultySuite from './suites/difficulty.test.ts';
import * as validationSuite from './suites/validation.test.ts';
import * as loggerSuite from './suites/logger.test.ts';
import * as promptSuite from './suites/prompt.test.ts';

interface TestSuite {
  name: string;
  tests: { [key: string]: () => void };
}

const suites: TestSuite[] = [
  difficultySuite as TestSuite,
  validationSuite as TestSuite,
  loggerSuite as TestSuite,
  promptSuite as TestSuite
];

async function runRunner() {
  console.log('\n\x1b[35m==================================================');
  console.log('         VEDA AI — CI INTEGRATION SUITE');
  console.log('==================================================\x1b[0m\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const startTime = Date.now();

  for (const suite of suites) {
    console.log(`\x1b[1m\x1b[34mSuite: ${suite.name}\x1b[0m`);
    console.log('--------------------------------------------------');

    const testKeys = Object.keys(suite.tests);
    for (const testKey of testKeys) {
      totalTests++;
      const testFn = suite.tests[testKey];
      try {
        await testFn();
        passedTests++;
        console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${testKey}`);
      } catch (err: any) {
        failedTests++;
        console.log(`  \x1b[31m✘ [FAIL]\x1b[0m ${testKey}`);
        console.log(`     \x1b[31mReason:\x1b[0m ${err.message || err}`);
        if (err.stack) {
          // Format stack trace beautifully
          const cleanStack = err.stack
            .split('\n')
            .slice(1, 3)
            .map((line: string) => `       ${line.trim()}`)
            .join('\n');
          console.log(cleanStack);
        }
      }
    }
    console.log('');
  }

  const durationMs = Date.now() - startTime;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';

  console.log('\x1b[35m==================================================');
  console.log('                  CI SUMMARY');
  console.log('==================================================\x1b[0m');
  console.log(`Total Executed : ${totalTests}`);
  console.log(`Passed         : \x1b[32m${passedTests}\x1b[0m`);
  console.log(`Failed         : ${failedTests > 0 ? `\x1b[31m${failedTests}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
  console.log(`Success Rate   : \x1b[36m${successRate}%\x1b[0m`);
  console.log(`Duration       : ${durationMs}ms`);
  console.log('\x1b[35m==================================================\x1b[0m\n');

  if (failedTests > 0) {
    console.log('\x1b[31m\x1b[1mCI Pipeline FAILED! Some integration checks did not pass.\x1b[0m\n');
    process.exit(1);
  } else {
    console.log('\x1b[32m\x1b[1mCI Pipeline PASSED! Everything is running perfectly!\x1b[0m\n');
    process.exit(0);
  }
}

runRunner().catch((err) => {
  console.error('\x1b[31mCritical error inside test runner:\x1b[0m', err);
  process.exit(1);
});
