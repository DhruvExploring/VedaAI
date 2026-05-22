import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Assignment, GeneratedPaper } from '../models';
import { addGenerationJob } from '../services/queue';
import { AssignmentInput } from '../types';
import { logger } from '../services/logger';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Validation helper
export function validateAssignmentInput(body: Partial<AssignmentInput>): string[] {
  const errors: string[] = [];

  if (!body.title?.trim()) errors.push('Title is required');
  if (!body.subject?.trim()) errors.push('Subject is required');
  if (!body.grade?.trim()) errors.push('Grade is required');
  if (!body.dueDate) errors.push('Due date is required');
  if (!body.totalMarks || body.totalMarks <= 0) errors.push('Total marks must be positive');
  if (!body.duration || body.duration <= 0) errors.push('Duration must be positive');
  if (!body.questionTypes || !Array.isArray(body.questionTypes) || body.questionTypes.length === 0) {
    errors.push('At least one question type is required');
  } else {
    body.questionTypes.forEach((qt, i) => {
      if (!qt.count || qt.count <= 0) errors.push(`Question type ${i + 1}: count must be positive`);
      if (!qt.marks || qt.marks <= 0) errors.push(`Question type ${i + 1}: marks must be positive`);
    });
  }

  return errors;
}

// POST /api/assignments - Create assignment and queue generation
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const body: Partial<AssignmentInput> = {
      ...req.body,
      totalMarks: Number(req.body.totalMarks),
      duration: Number(req.body.duration),
      questionTypes: typeof req.body.questionTypes === 'string'
        ? JSON.parse(req.body.questionTypes)
        : req.body.questionTypes,
    };

    const errors = validateAssignmentInput(body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Extract text from uploaded file if any
    let uploadedContent: string | undefined;
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        try {
          const pdfParse = await import('pdf-parse');
          const data = await pdfParse.default(req.file.buffer);
          uploadedContent = data.text.substring(0, 5000);
        } catch {
          uploadedContent = 'PDF content could not be extracted';
        }
      } else {
        uploadedContent = req.file.buffer.toString('utf-8').substring(0, 5000);
      }
    }

    const assignment = await Assignment.create({
      ...body,
      uploadedContent,
      jobStatus: 'pending',
    });

    // Add to queue
    const job = await addGenerationJob(assignment._id.toString(), body);

    await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

    return res.status(201).json({
      success: true,
      assignmentId: assignment._id.toString(),
      jobId: job.id,
      message: 'Assignment created. AI generation started.',
    });
  } catch (error) {
    logger.error('Create assignment error', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/assignments - List all assignments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, assignments });
  } catch (error) {
    logger.error('List assignments error', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/assignments/debug/papers - Debug route to list papers
router.get('/debug/papers', async (_req, res) => {
  try {
    const papers = await GeneratedPaper.find();
    return res.json({ count: papers.length, papers });
  } catch (error: any) {
    logger.error('Debug papers route error', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/assignments/:id - Get single assignment
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, assignment });
  } catch (error) {
    logger.error(`Get assignment details error for ID ${req.params.id}`, error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/assignments/:id/paper - Get generated paper
router.get('/:id/paper', async (req: Request, res: Response) => {
  try {
    const paper = await GeneratedPaper.findOne({ assignmentId: req.params.id }).sort({ generatedAt: -1 });
    if (!paper) return res.status(404).json({ success: false, error: 'Paper not yet generated' });
    return res.json({ success: true, paper });
  } catch (error) {
    logger.error(`Get paper error for assignment ID ${req.params.id}`, error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/assignments/:id/regenerate - Regenerate paper
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' });

    await Assignment.findByIdAndUpdate(req.params.id, { jobStatus: 'pending' });

    const job = await addGenerationJob(req.params.id, {
      title: assignment.title,
      subject: assignment.subject,
      grade: assignment.grade,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      duration: assignment.duration,
      questionTypes: assignment.questionTypes,
      difficulty: assignment.difficulty,
      additionalInstructions: assignment.additionalInstructions,
    });

    return res.json({ success: true, jobId: job.id, message: 'Regeneration started' });
  } catch (error) {
    logger.error('Regenerate assignment error', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /api/assignments/:id - Delete assignment and generated paper
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    await GeneratedPaper.findOneAndDelete({ assignmentId: req.params.id });
    return res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    logger.error('Delete assignment error', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
