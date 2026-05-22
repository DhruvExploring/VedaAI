'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Upload, Plus, Sparkles, ArrowLeft, Info, FileText, Calendar,
  BookOpen, Layers, ChevronDown, Bell, Minus, Mic, Menu, X, Home,
  Library
} from 'lucide-react';
import Link from 'next/link';
import { createAssignment } from '@/lib/api';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useWebSocket } from '@/lib/useWebSocket';
import Sidebar from '@/components/Sidebar';
import { AssignmentFormData, QuestionTypeKey, DifficultyLevel } from '@/types';

const QUESTION_TYPES: { key: QuestionTypeKey; label: string }[] = [
  { key: 'mcq', label: 'Multiple Choice Questions' },
  { key: 'short', label: 'Short Questions' },
  { key: 'long', label: 'Diagram/Graph-Based Questions' },
  { key: 'truefalse', label: 'True / False' },
  { key: 'fillblank', label: 'Numerical Problems' },
];

const DIFFICULTIES: { key: DifficultyLevel; label: string; color: string }[] = [
  { key: 'easy', label: 'Easy', color: 'bg-green-50 border-green-200 text-green-700' },
  { key: 'medium', label: 'Medium', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { key: 'hard', label: 'Hard', color: 'bg-red-50 border-red-200 text-red-700' },
  { key: 'mixed', label: 'Mixed', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setJob } = useAssessmentStore();

  // Initialize WebSocket connection when the assignment ID is established
  useWebSocket(assignmentId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    defaultValues: {
      title: '',
      subject: '',
      grade: '',
      dueDate: '',
      totalMarks: 60,
      duration: 90,
      difficulty: 'mixed',
      questionTypes: [
        { type: 'mcq', count: 4, marks: 1 },
        { type: 'short', count: 3, marks: 2 },
        { type: 'long', count: 5, marks: 5 },
        { type: 'fillblank', count: 5, marks: 5 }
      ],
      additionalInstructions: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questionTypes' });
  const selectedDifficulty = watch('difficulty');
  const questionTypes = watch('questionTypes');

  // Perform dynamic calculations for question summaries
  const totalQuestions = questionTypes.reduce((sum, qt) => sum + (Number(qt.count) || 0), 0);
  const totalFromTypes = questionTypes.reduce((sum, qt) => sum + (Number(qt.count) || 0) * (Number(qt.marks) || 0), 0);

  // Synchronize calculated total marks with the internal form state
  useEffect(() => {
    setValue('totalMarks', totalFromTypes);
  }, [totalFromTypes, setValue]);

  const handleIncrement = (index: number, field: 'count' | 'marks') => {
    const currentVal = Number(questionTypes[index][field]) || 0;
    setValue(`questionTypes.${index}.${field}`, currentVal + 1);
  };

  const handleDecrement = (index: number, field: 'count' | 'marks') => {
    const currentVal = Number(questionTypes[index][field]) || 0;
    if (currentVal > 1) {
      setValue(`questionTypes.${index}.${field}`, currentVal - 1);
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    setIsSubmitting(true);
    const generationPromise = new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, val]) => {
          if (key === 'questionTypes') {
            formData.append(key, JSON.stringify(val));
          } else {
            formData.append(key, String(val));
          }
        });
        if (uploadedFile) formData.append('file', uploadedFile);

        const result = await createAssignment(formData);

        if (result.success) {
          const aId = result.assignmentId;
          setAssignmentId(aId);
          setJob({ assignmentId: aId, status: 'pending', progress: 0, message: 'Queued...', jobId: null, result: null, error: null });
          router.push(`/output/${aId}`);
          resolve(aId);
        } else {
          reject(new Error('Failed to generate paper'));
        }
      } catch (err: any) {
        const msg = err?.response?.data?.errors?.join(', ') || 'Failed to create assignment';
        reject(new Error(msg));
      }
    });

    toast.promise(generationPromise, {
      loading: 'Creating assignment and initiating AI generation...',
      success: 'Assignment created successfully! Initiating paper layout generation.',
      error: (err) => err.message,
    }, {
      style: {
        background: '#1a1713',
        color: '#faf8f4',
        border: '1px solid #e8e4dc',
        fontSize: '13px',
      },
    });

    generationPromise.finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] flex">
      {/* Desktop Sidebar Layout */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-white z-40 lg:hidden shadow-xl"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-xl hover:bg-[#faf8f4] text-[#564e45]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Form Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#e8e4dc]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-xl hover:bg-[#faf8f4] text-[#1a1713]"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Brand logo image representation container */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src="/logo.png"
                alt="VedaAI logo"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain',
                  transform: 'scale(1.32) translate(2px, 2px)', // scale up and nudge to center within the clipped container
                  display: 'block',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '1', // keep line-height in check so the flex row doesn't stretch
                letterSpacing: '-0.06em',
                color: '#303030',
                display: 'inline-flex',
                alignItems: 'center',
                transform: 'translateY(-3px)', // nudge Bricolage font up to sit level with the logo
              }}
            >
              VedaAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 rounded-xl hover:bg-[#faf8f4] text-[#887e6e]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e24a2c] rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-[#e24a2c] shadow-sm shrink-0" />
          </div>
        </header>

        {/* Desktop Header bar */}
        <div className="px-6 py-5 border-b border-[#e8e4dc] bg-white hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/assignments" className="p-2 rounded-xl hover:bg-[#faf8f4] text-[#887e6e] hover:text-[#1a1713] transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#e24a2c] rounded-full" />
                <h1 className="font-display text-lg font-bold text-[#1a1713] tracking-tight">Create Assignment</h1>
              </div>
              <p className="text-[10px] text-[#887e6e] mt-0.5">Set up a new assignment for your students.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl hover:bg-[#faf8f4] text-[#887e6e] hover:text-[#1a1713] transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#e24a2c] rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 p-1 px-2 rounded-2xl border border-[#e8e4dc] bg-[#fbfbf9]">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-[#e24a2c] flex items-center justify-center text-white text-xs font-bold shrink-0">
                JD
              </div>
              <span className="text-xs font-bold text-[#1a1713]">John Doe</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#887e6e] shrink-0" />
            </div>
          </div>
        </div>

        {/* Mobile Page Navigation title */}
        <div className="px-4 py-4 lg:hidden">
          <div className="flex items-center gap-3">
            <Link href="/assignments" className="text-[#887e6e]">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-display font-bold text-[#1a1713] text-base">Create Assignment</span>
          </div>
        </div>

        {/* Main form area */}
        <main className="flex-1 px-4 lg:px-8 py-6 max-w-3xl w-full mx-auto space-y-6">
          {/* Progress stepper line */}
          <div className="relative w-full h-1 bg-[#e8e4dc] rounded-full overflow-hidden mb-8">
            <div className="absolute top-0 bottom-0 left-0 bg-[#1a1713] w-2/3 rounded-full transition-all duration-500" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Card Panel Sheet Container */}
            <div className="bg-white border border-[#e8e4dc] rounded-[32px] p-6 lg:p-8 space-y-6 shadow-sm">
              <div>
                <h2 className="font-display font-bold text-lg text-[#1a1713]">Assignment Details</h2>
                <p className="text-[11px] text-[#887e6e] mt-0.5">Basic information about your assignment.</p>
              </div>

              {/* Drag and drop target file upload interface */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#564e45]">Upload Reference Material</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e8e4dc] rounded-2xl p-6 text-center cursor-pointer hover:border-[#b0a999] hover:bg-[#fcfcfb] bg-[#fbfbf9] transition-all group"
                >
                  <Upload className="w-8 h-8 text-[#b0a999] mx-auto mb-2.5 group-hover:text-[#887e6e] transition-colors" />
                  {uploadedFile ? (
                    <div>
                      <p className="text-xs font-bold text-[#1a1713] truncate max-w-md mx-auto">{uploadedFile.name}</p>
                      <p className="text-[10px] text-[#887e6e] mt-0.5">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-[#564e45]">Choose a file or drag & drop it here</p>
                      <p className="text-[10px] text-[#887e6e] mt-1">PDF, TXT, DOC, DOCX up to 10MB</p>
                    </div>
                  )}
                  <button
                    type="button"
                    className="mt-3 px-3 py-1.5 border border-[#e8e4dc] text-[10px] font-bold text-[#564e45] bg-white rounded-lg group-hover:border-[#b0a999] transition-all shadow-sm"
                  >
                    Browse Files
                  </button>
                </div>
                <p className="text-[9px] text-[#887e6e] text-center italic">Upload images or sheets of your preferred reference document</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Title & Subject grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#564e45]">Assignment Title</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    placeholder="e.g. Mid-Term Examination"
                    className="w-full bg-[#fbfbf9] border border-[#e8e4dc] rounded-xl px-3.5 py-2.5 text-xs text-[#1a1713] placeholder-[#887e6e] focus:outline-none focus:border-[#1a1713] font-medium shadow-inner"
                  />
                  {errors.title && <p className="text-[10px] text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#564e45]">Subject</label>
                  <input
                    {...register('subject', { required: 'Subject is required' })}
                    placeholder="e.g. Science"
                    className="w-full bg-[#fbfbf9] border border-[#e8e4dc] rounded-xl px-3.5 py-2.5 text-xs text-[#1a1713] placeholder-[#887e6e] focus:outline-none focus:border-[#1a1713] font-medium shadow-inner"
                  />
                  {errors.subject && <p className="text-[10px] text-red-500">{errors.subject.message}</p>}
                </div>
              </div>

              {/* Class & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#564e45]">Grade / Class</label>
                  <input
                    {...register('grade', { required: 'Grade is required' })}
                    placeholder="e.g. Class 10 / Grade 8"
                    className="w-full bg-[#fbfbf9] border border-[#e8e4dc] rounded-xl px-3.5 py-2.5 text-xs text-[#1a1713] placeholder-[#887e6e] focus:outline-none focus:border-[#1a1713] font-medium shadow-inner"
                  />
                  {errors.grade && <p className="text-[10px] text-red-500">{errors.grade.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#564e45]">Due Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      min={(() => {
                        const d = new Date();
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      })()}
                      {...register('dueDate', {
                        required: 'Due date is required',
                        validate: (val) => {
                          const d = new Date();
                          const todayLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                          return val >= todayLocal || 'Date cannot be in the past';
                        }
                      })}
                      className="w-full bg-[#fbfbf9] border border-[#e8e4dc] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#1a1713] focus:outline-none focus:border-[#1a1713] font-medium shadow-inner"
                    />
                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#887e6e]">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  {errors.dueDate && <p className="text-[10px] text-red-500">{errors.dueDate.message}</p>}
                </div>
              </div>

              {/* Config Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#faf8f4] pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#564e45]">Duration (minutes)</label>
                  <input
                    type="number"
                    {...register('duration', {
                      required: 'Duration is required',
                      min: { value: 1, message: 'Duration must be at least 1 minute' },
                      valueAsNumber: true
                    })}
                    className="w-full bg-[#fbfbf9] border border-[#e8e4dc] rounded-xl px-3.5 py-2.5 text-xs text-[#1a1713] focus:outline-none focus:border-[#1a1713] font-medium shadow-inner"
                  />
                  {errors.duration && <p className="text-[10px] text-red-500">{errors.duration.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#564e45]">Difficulty Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DIFFICULTIES.map((d) => (
                      <label key={d.key} className="cursor-pointer">
                        <input type="radio" value={d.key} {...register('difficulty')} className="sr-only" />
                        <div className={`border rounded-xl py-2 text-[10px] font-bold text-center transition-all ${
                          selectedDifficulty === d.key
                            ? 'bg-[#1a1713] border-[#1a1713] text-white'
                            : 'border-[#e8e4dc] bg-[#fbfbf9] text-[#887e6e] hover:border-[#d0ccc0]'
                        }`}>
                          {d.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Question Types Counters */}
              <div className="space-y-4 border-t border-[#faf8f4] pt-6">
                <div>
                  <h3 className="text-xs font-bold text-[#1a1713]">Question Type</h3>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#fbfbf9] border border-[#e8e4dc] rounded-2xl p-3"
                    >
                      {/* Select dynamic question type value */}
                      <div className="flex-1">
                        <select
                          {...register(`questionTypes.${index}.type`)}
                          className="w-full bg-white border border-[#e8e4dc] rounded-xl px-3 py-2 text-xs text-[#1a1713] focus:outline-none focus:border-[#1a1713] font-semibold cursor-pointer"
                        >
                          {QUESTION_TYPES.map((qt) => (
                            <option key={qt.key} value={qt.key}>{qt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Question parameters numerical controls row */}
                      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 shrink-0 font-sans">
                        {/* Control counter for total questions count */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#887e6e]">Number of Questions:</span>
                          <div className="flex items-center gap-2 bg-white border border-[#e8e4dc] rounded-xl p-1 shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleDecrement(index, 'count')}
                              className="w-6 h-6 rounded-lg bg-[#faf8f4] hover:bg-[#e8e4dc] flex items-center justify-center text-[#564e45] active:scale-90 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-[#1a1713]">
                              {watch(`questionTypes.${index}.count`) || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrement(index, 'count')}
                              className="w-6 h-6 rounded-lg bg-[#faf8f4] hover:bg-[#e8e4dc] flex items-center justify-center text-[#564e45] active:scale-90 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Control counter for question unit marks */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#887e6e]">Marks:</span>
                          <div className="flex items-center gap-2 bg-white border border-[#e8e4dc] rounded-xl p-1 shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleDecrement(index, 'marks')}
                              className="w-6 h-6 rounded-lg bg-[#faf8f4] hover:bg-[#e8e4dc] flex items-center justify-center text-[#564e45] active:scale-90 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-[#1a1713]">
                              {watch(`questionTypes.${index}.marks`) || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrement(index, 'marks')}
                              className="w-6 h-6 rounded-lg bg-[#faf8f4] hover:bg-[#e8e4dc] flex items-center justify-center text-[#564e45] active:scale-90 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Trigger to remove specific question configuration row */}
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="w-8 h-8 rounded-xl bg-white border border-[#e8e4dc] hover:border-red-200 text-[#887e6e] hover:text-red-600 flex items-center justify-center transition-colors shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Question builder summaries */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => append({ type: 'short', count: 5, marks: 2 })}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 border border-[#e8e4dc] hover:bg-[#faf8f4] text-xs font-bold text-[#564e45] rounded-xl transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question Type
                  </button>

                  <div className="text-right text-[10px] text-[#564e45] font-mono leading-relaxed bg-[#faf8f4] border border-[#e8e4dc] rounded-2xl p-3 shrink-0">
                    <div>Total Questions : <span className="font-bold text-[#1a1713]">{totalQuestions}</span></div>
                    <div>Total Marks : <span className="font-bold text-[#1a1713]">{totalFromTypes}</span></div>
                  </div>
                </div>
              </div>

              {/* Additional Information textarea */}
              <div className="space-y-1.5 border-t border-[#faf8f4] pt-6">
                <label className="text-xs font-bold text-[#1a1713] block">Additional Information (For better output)</label>
                <div className="relative">
                  <textarea
                    {...register('additionalInstructions')}
                    rows={4}
                    placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                    className="w-full bg-[#fbfbf9] border border-[#e8e4dc] rounded-2xl px-4 py-3 pb-12 text-xs text-[#1a1713] placeholder-[#887e6e] focus:outline-none focus:border-[#1a1713] resize-none font-medium shadow-inner"
                  />
                  {/* Microphone Icon Button */}
                  <button
                    type="button"
                    onClick={() => toast('Speech-to-text is coming soon!')}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white border border-[#e8e4dc] hover:border-[#1a1713] flex items-center justify-center text-[#887e6e] hover:text-[#1a1713] transition-colors shadow-sm"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Buttons previous / next */}
            <div className="flex items-center justify-between gap-4 py-4">
              <Link
                href="/assignments"
                className="flex items-center gap-1.5 bg-white border border-[#e8e4dc] hover:border-[#1a1713] text-[#564e45] hover:text-[#1a1713] px-5 py-3 rounded-full text-xs font-bold transition-all shadow-sm"
              >
                Previous
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-[#1a1713] hover:bg-[#2a2520] text-white px-6 py-3 rounded-full text-xs font-bold transition-all shadow-md border border-[#e24a2c]/30 disabled:opacity-60"
              >
                {isSubmitting ? 'Generating...' : 'Next'}
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Mobile Sticky bottom menu navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#e8e4dc] z-20 flex items-center justify-around lg:hidden font-sans">
        <Link href="/assignments" className="flex flex-col items-center justify-center text-[#887e6e] hover:text-[#1a1713] transition-colors gap-0.5">
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-medium">Home</span>
        </Link>
        <Link href="/assignments" className="flex flex-col items-center justify-center text-[#e24a2c] transition-colors gap-0.5 font-bold">
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px]">Assignments</span>
        </Link>
        <Link href="#" onClick={() => toast('Library is coming soon!')} className="flex flex-col items-center justify-center text-[#887e6e] hover:text-[#1a1713] transition-colors gap-0.5">
          <Library className="w-5 h-5" />
          <span className="text-[9px] font-medium">Library</span>
        </Link>
        <Link href="#" onClick={() => toast('Toolkit is coming soon!')} className="flex flex-col items-center justify-center text-[#887e6e] hover:text-[#1a1713] transition-colors gap-0.5">
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-medium">AI Toolkit</span>
        </Link>
      </nav>
    </div>
  );
}
