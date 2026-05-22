export type QuestionTypeKey = 'mcq' | 'short' | 'long' | 'truefalse' | 'fillblank';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface QuestionTypeConfig {
  type: QuestionTypeKey;
  count: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  totalMarks: number;
  duration: number;
  questionTypes: QuestionTypeConfig[];
  difficulty: DifficultyLevel;
  additionalInstructions: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionTypeKey;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
  answer?: string;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
  totalMarks: number;
}

export interface GeneratedPaper {
  _id: string;
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

export interface JobUpdate {
  type: 'job_update' | 'connected';
  data?: {
    jobId: string;
    assignmentId: string;
    status: JobStatus;
    progress: number;
    message: string;
    result?: GeneratedPaper;
    error?: string;
  };
}
