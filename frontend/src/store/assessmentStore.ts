import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AssignmentFormData, GeneratedPaper, JobStatus } from '@/types';

interface JobState {
  jobId: string | null;
  assignmentId: string | null;
  status: JobStatus | null;
  progress: number;
  message: string;
  result: GeneratedPaper | null;
  error: string | null;
}

interface AssessmentStore {
  // Form state
  formData: Partial<AssignmentFormData>;
  setFormData: (data: Partial<AssignmentFormData>) => void;
  resetForm: () => void;

  // Job/generation state
  job: JobState;
  setJob: (update: Partial<JobState>) => void;
  resetJob: () => void;

  // Saved papers
  papers: GeneratedPaper[];
  addPaper: (paper: GeneratedPaper) => void;

  // WebSocket
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

const defaultJob: JobState = {
  jobId: null,
  assignmentId: null,
  status: null,
  progress: 0,
  message: '',
  result: null,
  error: null,
};

export const useAssessmentStore = create<AssessmentStore>()(
  devtools(
    persist(
      (set) => ({
        formData: {},
        setFormData: (data) =>
          set((state) => ({ formData: { ...state.formData, ...data } })),
        resetForm: () => set({ formData: {} }),

        job: defaultJob,
        setJob: (update) =>
          set((state) => ({ job: { ...state.job, ...update } })),
        resetJob: () => set({ job: defaultJob }),

        papers: [],
        addPaper: (paper) =>
          set((state) => ({
            papers: [paper, ...state.papers.filter((p) => p._id !== paper._id)],
          })),

        wsConnected: false,
        setWsConnected: (connected) => set({ wsConnected: connected }),
      }),
      {
        name: 'assessment-store',
        partialize: (state) => ({ papers: state.papers }),
      }
    )
  )
);
