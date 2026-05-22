import mongoose, { Schema, Document } from 'mongoose';
import { JobStatus } from '../types';

// Assignment Model
export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  totalMarks: number;
  duration: number;
  questionTypes: Array<{ type: string; count: number; marks: number }>;
  difficulty: string;
  additionalInstructions: string;
  uploadedContent?: string;
  jobId?: string;
  jobStatus: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    dueDate: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    duration: { type: Number, required: true },
    questionTypes: [
      {
        type: { type: String, required: true },
        count: { type: Number, required: true },
        marks: { type: Number, required: true },
      },
    ],
    difficulty: { type: String, required: true },
    additionalInstructions: { type: String, default: '' },
    uploadedContent: { type: String },
    jobId: { type: String },
    jobStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

// Generated Paper Model
export interface IGeneratedPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  totalMarks: number;
  dueDate: string;
  sections: Array<{
    id: string;
    title: string;
    instruction: string;
    totalMarks: number;
    questions: Array<{
      id: string;
      text: string;
      type: string;
      difficulty: string;
      marks: number;
      options?: string[];
      answer?: string;
    }>;
  }>;
  generatedAt: Date;
}

const GeneratedPaperSchema = new Schema<IGeneratedPaper>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  duration: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  dueDate: { type: String, required: true },
  sections: [
    {
      id: String,
      title: String,
      instruction: String,
      totalMarks: Number,
      questions: [
        {
          id: String,
          text: String,
          type: { type: String },
          difficulty: String,
          marks: Number,
          options: [String],
          answer: String,
        },
      ],
    },
  ],
  generatedAt: { type: Date, default: Date.now },
});

export const GeneratedPaper = mongoose.model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);
