export interface QuestionType {
  type: 'mcq' | 'short' | 'long' | 'truefalse' | 'fillblank';
  count: number;
  marks: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  totalMarks: number;
  duration: number; // in minutes
  questionTypes: QuestionType[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  additionalInstructions: string;
  uploadedContent?: string; // extracted text from PDF/file
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'short' | 'long' | 'truefalse' | 'fillblank';
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[]; // for MCQ
  answer?: string;
}

export interface Section {
  id: string;
  title: string; // Section A, B, etc.
  instruction: string;
  questions: Question[];
  totalMarks: number;
}

export interface GeneratedPaper {
  id: string;
  assignmentId: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  totalMarks: number;
  dueDate: string;
  sections: Section[];
  generatedAt: string;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobState {
  jobId: string;
  assignmentId: string;
  status: JobStatus;
  progress: number;
  message: string;
  result?: GeneratedPaper;
  error?: string;
}
