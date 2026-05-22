import { assert } from '../assert';
import { validateAssignmentInput } from '../../routes/assignments';

export const name = 'Assignment Input Validation Tests';

export const tests = {
  testValidInput() {
    const validBody = {
      title: 'Midterm Exam',
      subject: 'Mathematics',
      grade: 'Grade 10',
      dueDate: new Date().toISOString(),
      totalMarks: 100,
      duration: 120,
      questionTypes: [
        { type: 'mcq', count: 10, marks: 2 },
        { type: 'short', count: 5, marks: 6 },
        { type: 'long', count: 2, marks: 25 }
      ]
    };
    const errors = validateAssignmentInput(validBody as any);
    assert.equal(errors.length, 0, `Expected 0 errors, got: ${errors.join(', ')}`);
  },

  testMissingFields() {
    const invalidBody = {
      title: '  ',
      subject: '',
      grade: undefined,
      dueDate: '',
      totalMarks: 0,
      duration: -5
    };
    const errors = validateAssignmentInput(invalidBody as any);
    
    assert.ok(errors.includes('Title is required'), 'Should report missing title');
    assert.ok(errors.includes('Subject is required'), 'Should report missing subject');
    assert.ok(errors.includes('Grade is required'), 'Should report missing grade');
    assert.ok(errors.includes('Due date is required'), 'Should report missing due date');
    assert.ok(errors.includes('Total marks must be positive'), 'Should report invalid total marks');
    assert.ok(errors.includes('Duration must be positive'), 'Should report invalid duration');
  },

  testInvalidQuestionTypes() {
    const invalidBody = {
      title: 'Test',
      subject: 'Physics',
      grade: 'Grade 11',
      dueDate: new Date().toISOString(),
      totalMarks: 50,
      duration: 60,
      questionTypes: []
    };
    
    let errors = validateAssignmentInput(invalidBody as any);
    assert.ok(errors.includes('At least one question type is required'), 'Should report missing question types');

    const invalidQuestionsBody = {
      ...invalidBody,
      questionTypes: [
        { type: 'mcq', count: -2, marks: 0 },
        { type: 'long', count: 3, marks: -5 }
      ]
    };

    errors = validateAssignmentInput(invalidQuestionsBody as any);
    assert.ok(errors.includes('Question type 1: count must be positive'), 'Should report non-positive count');
    assert.ok(errors.includes('Question type 1: marks must be positive'), 'Should report non-positive marks');
    assert.ok(errors.includes('Question type 2: marks must be positive'), 'Should report negative marks');
  }
};
