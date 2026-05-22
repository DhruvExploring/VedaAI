import { assert } from '../assert';

// The difficulty mapping function used in preview and PDF export
export function mapDifficulty(difficulty?: string): string {
  if (!difficulty) return '';
  return difficulty === 'easy'
    ? 'Low'
    : difficulty === 'medium'
      ? 'Moderate'
      : 'High';
}

export const name = 'Difficulty Mapping Tests';

export const tests = {
  testEasyDifficulty() {
    assert.equal(mapDifficulty('easy'), 'Low', 'easy should map to Low');
  },

  testMediumDifficulty() {
    assert.equal(mapDifficulty('medium'), 'Moderate', 'medium should map to Moderate');
  },

  testHardDifficulty() {
    assert.equal(mapDifficulty('hard'), 'High', 'hard should map to High');
  },

  testEmptyDifficulty() {
    assert.equal(mapDifficulty(''), '', 'empty string should map to empty string');
    assert.equal(mapDifficulty(undefined), '', 'undefined should map to empty string');
  },

  testUnexpectedDifficulty() {
    assert.equal(mapDifficulty('extremely-hard'), 'High', 'unexpected values should fallback to High');
  }
};
