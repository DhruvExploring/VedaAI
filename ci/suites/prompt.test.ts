import { assert } from '../assert';
import { buildPrompt } from '../../backend/src/services/aiGenerator.ts';
import { AssignmentInput } from '../../backend/src/types';

export const name = 'AI Prompt Builder Tests';

export const tests = {
  testPromptStructure() {
    const input: AssignmentInput = {
      title: 'Quantum Mechanics Finals',
      subject: 'Physics',
      grade: 'College Senior',
      totalMarks: 100,
      duration: 180,
      difficulty: 'hard',
      dueDate: '2026-06-01',
      additionalInstructions: 'Explain derivations where applicable',
      questionTypes: [
        { type: 'mcq', count: 10, marks: 2 },
        { type: 'long', count: 4, marks: 20 }
      ],
      uploadedContent: 'Schrodinger equation describes the wave function of a quantum system.'
    };

    const prompt = buildPrompt(input);

    assert.ok(prompt.includes('Title: Quantum Mechanics Finals'), 'Prompt should include title');
    assert.ok(prompt.includes('Subject: Physics'), 'Prompt should include subject');
    assert.ok(prompt.includes('Grade/Class: College Senior'), 'Prompt should include grade');
    assert.ok(prompt.includes('Total Marks: 100'), 'Prompt should include total marks');
    assert.ok(prompt.includes('Duration: 180 minutes'), 'Prompt should include duration');
    assert.ok(prompt.includes('Difficulty: hard'), 'Prompt should include difficulty');
    assert.ok(prompt.includes('Explain derivations where applicable'), 'Prompt should include custom instructions');
    assert.ok(prompt.includes('Schrodinger equation describes the wave function'), 'Prompt should include uploaded content snippet');
    assert.ok(prompt.includes('10 MCQ questions, 2 marks each'), 'Prompt should include structured question type counts');
    assert.ok(prompt.includes('4 LONG questions, 20 marks each'), 'Prompt should include long question counts');
  },

  testEmptyAdditionalInstructions() {
    const input: AssignmentInput = {
      title: 'Simple Test',
      subject: 'English',
      grade: 'Grade 1',
      totalMarks: 10,
      duration: 15,
      difficulty: 'easy',
      dueDate: '2026-05-25',
      questionTypes: [{ type: 'truefalse', count: 5, marks: 2 }]
    };

    const prompt = buildPrompt(input);
    assert.ok(prompt.includes('Additional Instructions: None'), 'Prompt should fallback to None if empty');
    assert.ok(!prompt.includes('Reference Material'), 'Prompt should exclude Reference Material section if no upload exists');
  }
};
