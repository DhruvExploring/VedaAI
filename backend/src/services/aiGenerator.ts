import OpenAI from 'openai';
import { AssignmentInput, GeneratedPaper, Section, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function buildPrompt(input: AssignmentInput): string {
  const questionBreakdown = input.questionTypes
    .map((qt) => `  - ${qt.count} ${qt.type.toUpperCase()} questions, ${qt.marks} marks each`)
    .join('\n');

  const totalFromTypes = input.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  return `You are an expert educator creating a formal exam paper. Generate a structured question paper in valid JSON format.

Assignment Details:
- Title: ${input.title}
- Subject: ${input.subject}
- Grade/Class: ${input.grade}
- Total Marks: ${input.totalMarks}
- Duration: ${input.duration} minutes
- Difficulty: ${input.difficulty}
- Due Date: ${input.dueDate}

Question Requirements:
${questionBreakdown}

Additional Instructions: ${input.additionalInstructions || 'None'}

${input.uploadedContent ? `Reference Material (use this to create relevant questions):\n${input.uploadedContent.substring(0, 3000)}` : ''}

Create sections logically:
- Section A: Objective/short questions (MCQ, True/False, Fill in blanks)
- Section B: Short answer questions
- Section C: Long answer / descriptive questions (if applicable)

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact structure:
{
  "sections": [
    {
      "id": "section-a",
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries [X] marks.",
      "totalMarks": 20,
      "questions": [
        {
          "id": "q1",
          "text": "Question text here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option A"
        }
      ]
    }
  ]
}

Rules:
1. id fields must be unique strings
2. type must be one of: mcq, short, long, truefalse, fillblank
3. difficulty must be one of: easy, medium, hard
4. options array only for mcq type
5. Make questions academically rigorous and appropriate for ${input.grade}
6. Ensure total marks across all sections = ${input.totalMarks}
7. Questions must be meaningful, not placeholder text`;
}

export async function generatePaperWithAI(input: AssignmentInput, assignmentId: string): Promise<GeneratedPaper> {
  const prompt = buildPrompt(input);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
  });

  const rawText = response.choices[0]?.message?.content || '';

  // Parse and validate the response
  let parsed: { sections: Section[] };
  try {
    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('AI returned invalid JSON. Please try again.');
  }

  // Validate and sanitize sections
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid paper structure from AI.');
  }

  const sanitizedSections: Section[] = parsed.sections.map((section, sIdx) => {
    const questions: Question[] = (section.questions || []).map((q, qIdx) => ({
      id: q.id || `q-${sIdx}-${qIdx}-${uuidv4().slice(0, 8)}`,
      text: String(q.text || ''),
      type: ['mcq', 'short', 'long', 'truefalse', 'fillblank'].includes(q.type) ? q.type : 'short',
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      marks: Math.max(1, Number(q.marks) || 1),
      options: q.options && Array.isArray(q.options) ? q.options.map(String) : undefined,
      answer: q.answer ? String(q.answer) : undefined,
    }));

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    return {
      id: section.id || `section-${sIdx}`,
      title: section.title || `Section ${String.fromCharCode(65 + sIdx)}`,
      instruction: section.instruction || 'Attempt all questions.',
      questions,
      totalMarks,
    };
  });

  const paper: GeneratedPaper = {
    id: uuidv4(),
    assignmentId,
    title: input.title,
    subject: input.subject,
    grade: input.grade,
    duration: input.duration,
    totalMarks: input.totalMarks,
    dueDate: input.dueDate,
    sections: sanitizedSections,
    generatedAt: new Date().toISOString(),
  };

  return paper;
}
