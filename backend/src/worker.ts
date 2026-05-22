import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { getRedisConnection } from './services/queue';
import { generatePaperWithAI } from './services/aiGenerator';
import { Assignment, GeneratedPaper } from './models';
import { wsManager } from './services/websocket';
import { AssignmentInput, JobState } from './types';
import { logger } from './services/logger';

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-assessment');
  logger.info('Worker: MongoDB connected');
}

export async function startWorker() {
  await connectDB();

  const worker = new Worker(
    'assessment-generation',
    async (job) => {
      const { assignmentId } = job.data;
      logger.info(`Processing job ${job.id} for assignment ${assignmentId}`);

      const emitUpdate = (state: Partial<JobState>) => {
        wsManager.broadcast(assignmentId, {
          jobId: job.id || '',
          assignmentId,
          status: 'processing',
          progress: 0,
          message: '',
          ...state,
        });
      };

      try {
        // Update assignment status
        await Assignment.findByIdAndUpdate(assignmentId, { jobStatus: 'processing' });

        emitUpdate({ status: 'processing', progress: 10, message: 'Starting AI generation...' });
        await job.updateProgress(10);

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) throw new Error('Assignment not found');

        const input: AssignmentInput = {
          title: assignment.title,
          subject: assignment.subject,
          grade: assignment.grade,
          dueDate: assignment.dueDate,
          totalMarks: assignment.totalMarks,
          duration: assignment.duration,
          questionTypes: assignment.questionTypes as AssignmentInput['questionTypes'],
          difficulty: assignment.difficulty as AssignmentInput['difficulty'],
          additionalInstructions: assignment.additionalInstructions,
          uploadedContent: assignment.uploadedContent,
        };

        emitUpdate({ status: 'processing', progress: 30, message: 'Building structured prompt...' });
        await job.updateProgress(30);

        emitUpdate({ status: 'processing', progress: 50, message: 'Generating questions with AI...' });
        await job.updateProgress(50);

        const generatedPaper = await generatePaperWithAI(input, assignmentId);

        emitUpdate({ status: 'processing', progress: 80, message: 'Saving results...' });
        await job.updateProgress(80);

        // Save to MongoDB
        const saved = await GeneratedPaper.create({
          assignmentId,
          title: generatedPaper.title,
          subject: generatedPaper.subject,
          grade: generatedPaper.grade,
          duration: generatedPaper.duration,
          totalMarks: generatedPaper.totalMarks,
          dueDate: generatedPaper.dueDate,
          sections: generatedPaper.sections,
          generatedAt: new Date(generatedPaper.generatedAt),
        });

        await Assignment.findByIdAndUpdate(assignmentId, {
          jobStatus: 'completed',
          jobId: job.id,
        });

        emitUpdate({
          status: 'completed',
          progress: 100,
          message: 'Question paper generated successfully!',
          result: { ...generatedPaper, id: saved._id.toString() },
        });

        return { success: true, paperId: saved._id.toString() };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Generation failed';
        logger.error(`Job ${job.id} failed`, error);

        await Assignment.findByIdAndUpdate(assignmentId, { jobStatus: 'failed' });

        emitUpdate({
          status: 'failed',
          progress: 0,
          message: errMsg,
          error: errMsg,
        });

        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 3,
    }
  );

  worker.on('completed', (job) => logger.info(`Job ${job.id} completed`));
  worker.on('failed', (job, err) => logger.error(`Job ${job?.id} failed`, err));

  logger.info('BullMQ Worker started, waiting for jobs...');
}

if (require.main === module) {
  startWorker().catch(console.error);
}

