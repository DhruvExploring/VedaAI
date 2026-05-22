export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

function isObject(val: any): boolean {
  return val !== null && typeof val === 'object';
}

function deepEqualCheck(actual: any, expected: any): boolean {
  if (actual === expected) return true;

  if (isObject(actual) && isObject(expected)) {
    const keysA = Object.keys(actual);
    const keysB = Object.keys(expected);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqualCheck(actual[key], expected[key])) return false;
    }
    return true;
  }

  return false;
}

export const assert = {
  equal(actual: any, expected: any, message?: string) {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}`
      );
    }
  },

  ok(value: any, message?: string) {
    if (!value) {
      throw new AssertionError(message || `Expected truthy value, got: ${JSON.stringify(value)}`);
    }
  },

  throws(fn: Function, message?: string) {
    try {
      fn();
    } catch {
      return; // Exception thrown as expected
    }
    throw new AssertionError(message || 'Expected function to throw, but it succeeded');
  },

  deepEqual(actual: any, expected: any, message?: string) {
    if (!deepEqualCheck(actual, expected)) {
      throw new AssertionError(
        message || `Expected deep equality. Expected:\n${JSON.stringify(expected, null, 2)}\nGot:\n${JSON.stringify(actual, null, 2)}`
      );
    }
  }
};
