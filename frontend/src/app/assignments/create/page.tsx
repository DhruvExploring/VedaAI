'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Upload, Plus, Sparkles, ArrowLeft, Calendar, BookOpen, 
  ChevronDown, Bell, Minus, Mic, X, Home, Library
} from 'lucide-react';
import Link from 'next/link';
import { createAssignment } from '@/lib/api';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useWebSocket } from '@/lib/useWebSocket';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import MobileHeader from '@/components/MobileHeader';
import { AssignmentFormData, QuestionTypeKey } from '@/types';

const QUESTION_TYPES: { key: QuestionTypeKey; label: string }[] = [
  { key: 'mcq', label: 'Multiple Choice Questions' },
  { key: 'short', label: 'Short Questions' },
  { key: 'long', label: 'Diagram/Graph-Based Questions' },
  { key: 'truefalse', label: 'True / False' },
  { key: 'fillblank', label: 'Numerical Problems' },
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [desktopDateType, setDesktopDateType] = useState('text');
  const [mobileDateType, setMobileDateType] = useState('text');
  const [isDesktop, setIsDesktop] = useState(true);
  const [isDateInputFocused, setIsDateInputFocused] = useState(false);
  const [mobileStep, setMobileStep] = useState(1);
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
    trigger,
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
  const questionTypes = watch('questionTypes');

  // Perform dynamic calculations for question summaries
  const totalQuestions = questionTypes.reduce((sum, qt) => sum + (Number(qt.count) || 0), 0);
  const totalFromTypes = questionTypes.reduce((sum, qt) => sum + (Number(qt.count) || 0) * (Number(qt.marks) || 0), 0);

  // Synchronize calculated total marks with the internal form state
  useEffect(() => {
    setValue('totalMarks', totalFromTypes);
  }, [totalFromTypes, setValue]);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size cannot exceed 10MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    setIsSubmitting(true);
    
    // Dynamic under-the-hood parsing of variables from instructions & filename
    const instructions = data.additionalInstructions || '';
    let subject = 'General';
    let grade = 'Class 10';
    let duration = 90;
    let title = 'Class Assessment';

    // Simple keyword extraction for subject
    const subjectMatch = instructions.match(/(science|maths|mathematics|history|english|chemistry|physics|biology|geography|civics|social studies)/i);
    if (subjectMatch) {
      subject = subjectMatch[0].charAt(0).toUpperCase() + subjectMatch[0].slice(1);
    }

    // Simple keyword extraction for grade
    const gradeMatch = instructions.match(/(grade\s*\d+|class\s*\d+)/i);
    if (gradeMatch) {
      grade = gradeMatch[0].charAt(0).toUpperCase() + gradeMatch[0].slice(1);
    }

    // Simple keyword extraction for duration (e.g. 3 hour)
    const durationMatch = instructions.match(/(\d+)\s*(hour|hr|min|minute|minutes)/i);
    if (durationMatch) {
      const amount = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      if (unit.startsWith('hour') || unit.startsWith('hr')) {
        duration = amount * 60;
      } else {
        duration = amount;
      }
    }

    // Dynamic title formulation
    if (uploadedFile) {
      title = uploadedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
    } else {
      title = `${subject} ${grade} Assessment`;
    }

    const generationPromise = new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        
        // Populate payload fields matching backend requirements
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('grade', grade);
        formData.append('dueDate', data.dueDate);
        formData.append('totalMarks', String(totalFromTypes));
        formData.append('duration', String(duration));
        formData.append('difficulty', 'mixed');
        formData.append('questionTypes', JSON.stringify(data.questionTypes));
        formData.append('additionalInstructions', instructions);
        
        if (uploadedFile) {
          formData.append('file', uploadedFile);
        }

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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none !important;
          -webkit-appearance: none !important;
        }
      ` }} />
      {/* Desktop layout matching main dashboard structure */}
      <div
        className="hidden lg:flex min-h-screen"
        style={{ background: '#F2F2F2', position: 'relative' }}
      >
        {/* Floating sidebar */}
        <div
          className="shrink-0"
          style={{
            padding: '12px 0 12px 12px',
            position: 'sticky',
            top: 0,
            height: '100vh',
          }}
        >
          <Sidebar />
        </div>

        {/* Right-hand panel */}
        <div className="flex-1 flex flex-col min-w-0" style={{ padding: '12px' }}>
          {/* Top header bar — using shared SearchBar component */}
          <div style={{ marginBottom: '12px' }}>
            <SearchBar title="Create Assignment" icon={<Plus size={20} className="text-[#A9A9A9] flex-none" />} />
          </div>

          {/* Main content area (The "Third Panel") */}
          <main
            className="flex-1 flex flex-col overflow-y-auto"
            style={{
              background: '#F2F2F2',
              borderRadius: '20px',
              padding: '40px 32px 32px 32px',
            }}
          >
            <div className="max-w-[815px] w-full mx-auto flex flex-col gap-8">
              {/* SECTION 1: HEADER */}
              <div className="flex flex-row items-center p-2 gap-4 w-full h-[66px] flex-none self-stretch">
                <div className="flex flex-row items-center gap-3 w-[293px] h-[50px] flex-none">
                  {/* Status Indicator Green Dot */}
                  <span
                    className="w-3 h-3 rounded-full bg-[#4BC26D] border-[4px] border-[rgba(75,194,109,0.4)] flex-none"
                    style={{
                      boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                  {/* Title & Subtitle Stack */}
                  <div className="flex flex-col justify-center items-start gap-[2px] w-[261px] h-[50px] flex-none">
                    <h1
                      className="text-[20px] font-bold tracking-[-0.04em] text-[#303030] leading-[140%] flex items-center"
                      style={{ fontFamily: 'Bricolage Grotesque' }}
                    >
                      Create Assignment
                    </h1>
                    <p
                      className="text-[14px] font-normal tracking-[-0.04em] text-[rgba(94,94,94,0.55)] leading-[140%] flex items-center"
                      style={{ fontFamily: 'Bricolage Grotesque' }}
                    >
                      Set up a new assignment for your students
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PROGRESS STEPPER BAR */}
              <div className="flex flex-col justify-center items-center p-0 gap-[10px] w-full h-0 flex-none self-stretch">
                <div className="flex flex-row items-center p-0 gap-3 w-[815px] h-0 flex-none">
                  {/* Left Segment: Active */}
                  <div className="flex flex-row items-center p-0 gap-2 w-[401.5px] h-0 flex-none grow">
                    <div className="w-full h-0 border-[5px] border-[#5E5E5E] flex-none grow" />
                  </div>
                  {/* Right Segment: Inactive */}
                  <div className="flex flex-row items-center p-0 gap-2 w-[401.5px] h-0 flex-none grow">
                    <div className="w-full h-0 border-[5px] border-[#DADADA] flex-none grow" />
                  </div>
                </div>
              </div>

              {/* Creation Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 w-full">
                {/* SECTION 3: FORM CARD CONTAINER */}
                <div
                  className="flex flex-col items-start p-8 pb-16 gap-8 w-full bg-[rgba(255,255,255,0.5)] rounded-[32px] border border-[#e8e4dc] shadow-[0px_4px_24px_rgba(0,0,0,0.02)]"
                  style={{ minHeight: '1010px' }}
                >
                  {/* Card Header */}
                  <div className="flex flex-col justify-center items-start p-0 gap-[2px] w-[251px] h-[50px] flex-none">
                    <h2
                      className="font-bold text-[20px] leading-[140%] text-[#303030] tracking-[-0.04em] flex items-center"
                      style={{ fontFamily: 'Bricolage Grotesque' }}
                    >
                      Assignment Details
                    </h2>
                    <p
                      className="text-[14px] font-normal leading-[140%] text-[rgba(94,94,94,0.8)] tracking-[-0.04em] flex items-center"
                      style={{ fontFamily: 'Bricolage Grotesque' }}
                    >
                      Basic information about your assignment
                    </p>
                  </div>

                  {/* Form Fields Panel */}
                  <div className="flex flex-col items-start p-0 gap-4 w-full flex-none self-stretch">
                    
                    {/* Sub-section 1: Upload Reference Material Area */}
                    <div className="flex flex-col items-start p-0 gap-3 w-full h-[236px] flex-none self-stretch">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`box-border flex flex-col justify-center items-center p-6 gap-4 w-full h-[202px] bg-white border-[1.75px] border-dashed rounded-[24px] cursor-pointer transition-all group ${
                          isDragOver
                            ? 'border-[#303030] bg-[#fbfbf9]'
                            : 'border-[rgba(0,0,0,0.2)] hover:border-[rgba(0,0,0,0.4)]'
                        }`}
                      >
                        {/* Cloud icon wrapper */}
                        <div className="flex flex-row justify-center items-center p-0 gap-[10px] w-10 h-10 bg-white rounded-lg flex-none border border-[#e8e4dc] shadow-sm">
                          <Upload className="w-6 h-6 text-[#1E1E1E]" strokeWidth={2.5} />
                        </div>
                        
                        {/* Text details stack */}
                        <div className="flex flex-col items-start p-0 gap-1 w-full flex-none self-stretch text-center">
                          {uploadedFile ? (
                            <p className="w-full text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] truncate px-4">
                              {uploadedFile.name}
                            </p>
                          ) : (
                            <>
                              <p
                                className="w-full text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] flex items-center justify-center"
                                style={{ fontFamily: 'Bricolage Grotesque' }}
                              >
                                Choose a file or drag & drop it here
                              </p>
                              <p
                                className="w-full text-[14px] font-normal leading-[140%] text-[#A9A9A9] tracking-[-0.04em] flex items-center justify-center"
                                style={{ fontFamily: 'Bricolage Grotesque' }}
                              >
                                JPEG, PNG, upto 10MB
                              </p>
                            </>
                          )}
                        </div>

                        {/* Browse Files Button pill (Primary Button - White) */}
                        <button
                          type="button"
                          className="flex flex-row items-center py-2 px-6 gap-1 w-[127px] h-9 bg-[#F6F6F6] rounded-[48px] justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm"
                        >
                          <span
                            className="text-[14px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em]"
                            style={{ fontFamily: 'Bricolage Grotesque' }}
                          >
                            Browse Files
                          </span>
                        </button>
                      </div>

                      {/* Bottom subtext caption */}
                      <p
                        className="w-full text-[16px] font-medium leading-[140%] text-[rgba(48,48,48,0.6)] tracking-[-0.04em] text-center"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Upload images of your preferred document/image
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.txt,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('File size cannot exceed 10MB');
                              return;
                            }
                            setUploadedFile(file);
                          }
                        }}
                      />
                    </div>

                    {/* Sub-section 2: Due Date Selector */}
                    <div className="flex flex-col items-start p-0 gap-2 w-[746px] min-h-[74px] h-auto flex-none self-stretch pt-2">
                      <label
                        className="w-[746px] text-[16px] font-bold leading-[140%] text-[#303030] tracking-[-0.04em] flex items-center"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Due Date
                      </label>
                      <div className="relative w-[746px]">
                        {/* Pill Input Container */}
                        <div className="box-border flex flex-row justify-between items-center py-[11px] px-4 gap-[10px] w-[746px] h-11 bg-[#F2F2F2] border-[1.25px] border-[#DADADA] rounded-[100px] shadow-sm relative">
                          {isDesktop && (
                            <input
                              id="dueDateInput"
                              type="date"
                              onFocus={() => setIsDateInputFocused(true)}
                              min={(() => {
                                const d = new Date();
                                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                              })()}
                              className={`flex-1 bg-transparent border-none text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] focus:outline-none w-full cursor-pointer z-10 ${
                                (!watch('dueDate') && !isDateInputFocused) ? 'opacity-0' : 'opacity-100'
                              }`}
                              style={{ fontFamily: 'Bricolage Grotesque' }}
                              {...register('dueDate', {
                                required: 'Due date is required',
                                onBlur: () => setIsDateInputFocused(false),
                              })}
                            />
                          )}

                          {(!watch('dueDate') && !isDateInputFocused) && (
                            <div 
                              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] font-medium leading-[140%] text-[#A9A9A9] tracking-[-0.04em] flex items-center h-[22px] w-[96px]"
                              style={{ fontFamily: 'Bricolage Grotesque' }}
                            >
                              DD-MM-YYYY
                            </div>
                          )}

                          <div 
                            onClick={() => {
                              const el = document.getElementById('dueDateInput') as HTMLInputElement | null;
                              try {
                                el?.showPicker();
                              } catch (err) {
                                el?.focus();
                              }
                            }}
                            className="flex-none text-[#2B2B2B] cursor-pointer hover:scale-105 active:scale-95 transition-transform z-20"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 flex-none">
                              {/* Rectangle 14 (Stroke) */}
                              <rect x="2" y="3" width="20" height="19" rx="3" stroke="#2B2B2B" strokeWidth="2" fill="none" />
                              {/* Vector 8 (Stroke) */}
                              <rect x="7" y="2" width="2" height="5" rx="1" fill="#2B2B2B" />
                              {/* Vector 9 (Stroke) */}
                              <rect x="15" y="2" width="2" height="5" rx="1" fill="#2B2B2B" />
                              {/* Vector (Stroke) - Calendar Plus */}
                              <path d="M12 9V17M8 13H16" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {errors.dueDate && <p className="text-[10px] text-red-500 mt-1 pl-4">{errors.dueDate.message}</p>}
                    </div>

                    {/* Sub-section 3: Question Types Matrix */}
                    <div className="flex flex-col justify-center items-end p-0 gap-4 w-full h-[374px] flex-none border-t border-[#faf8f4] pt-6">
                      <div className="flex flex-row justify-between items-start p-0 w-full h-[314px] flex-none self-stretch">
                        
                        {/* Left Column: Selectors */}
                        <div className="flex flex-col items-start p-0 gap-4 w-[471px] h-[314px] flex-none">
                          <label
                            className="w-full text-[16px] font-bold leading-[140%] text-[#303030] tracking-[-0.04em] flex items-center"
                            style={{ fontFamily: 'Bricolage Grotesque' }}
                          >
                            Question Type
                          </label>
                          
                          <div className="flex flex-col gap-4 w-full">
                            {fields.map((field, index) => (
                              <div key={field.id} className="flex flex-row items-center p-0 gap-3 w-[471px] h-11 flex-none">
                                {/* Selector Pill */}
                                <div className="flex flex-row justify-between items-center py-[11px] px-4 gap-[128px] w-[443px] h-11 bg-white border border-[#DADADA] rounded-[100px] flex-none shadow-sm relative">
                                  {isDesktop && (
                                    <select
                                      {...register(`questionTypes.${index}.type`)}
                                      className="w-full bg-transparent text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] focus:outline-none appearance-none cursor-pointer pr-8 font-semibold"
                                      style={{ fontFamily: 'Bricolage Grotesque' }}
                                    >
                                      {QUESTION_TYPES.map((qt) => (
                                        <option key={qt.key} value={qt.key}>{qt.label}</option>
                                      ))}
                                    </select>
                                  )}
                                  {!isDesktop && (
                                    <span className="w-full bg-transparent text-[16px] font-semibold text-[#303030]" />
                                  )}
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#303030] pointer-events-none" />
                                </div>

                                {/* Delete element button (X) */}
                                <div className="flex justify-center flex-none">
                                  {fields.length > 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => remove(index)}
                                      className="w-4 h-4 text-[#303030] hover:text-red-500 transition-colors flex items-center justify-center border-[1.5px] border-[#303030] rounded-sm p-[1px]"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <div className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Question Type Button */}
                          <div className="flex flex-row items-center p-0 gap-2 w-[164px] h-9 flex-none mt-2">
                            <button
                              type="button"
                              onClick={() => append({ type: 'short', count: 5, marks: 2 })}
                              className="flex flex-row items-center justify-center p-2 gap-1 w-9 h-9 bg-[#2B2B2B] hover:opacity-90 rounded-[48px] flex-none shadow-md transition-all active:scale-90"
                            >
                              <Plus className="w-5 h-5 text-white" />
                            </button>
                            <span
                              className="text-[14px] font-bold leading-[140%] text-[#303030] tracking-[-0.04em] cursor-pointer"
                              style={{ fontFamily: 'Bricolage Grotesque' }}
                              onClick={() => append({ type: 'short', count: 5, marks: 2 })}
                            >
                              Add Question Type
                            </span>
                          </div>
                        </div>

                        {/* Right Column: Counters */}
                        <div className="flex flex-row justify-end items-center p-0 gap-4 w-[275px] h-[262px] flex-none grow">
                          
                          {/* Sub-column 1: No. of Questions */}
                          <div className="flex flex-col items-center p-0 gap-4 w-[116px] h-[262px] flex-none">
                            <span
                              className="text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] text-center"
                              style={{ fontFamily: 'Bricolage Grotesque' }}
                            >
                              No. of Questions
                            </span>
                            
                            <div className="flex flex-col gap-4 w-full">
                              {fields.map((field, index) => (
                                <div
                                  key={field.id}
                                  className="flex flex-row justify-between items-center py-[11px] px-2 w-[100px] h-11 bg-white border border-[#e8e4dc] rounded-[100px] flex-none shadow-sm mx-auto"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleDecrement(index, 'count')}
                                    className="w-6 h-6 flex items-center justify-center text-[#DADADA] hover:text-[#303030] active:scale-75 transition-all font-bold text-base pb-0.5"
                                  >
                                    -
                                  </button>
                                  <span
                                    className="text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em]"
                                    style={{ fontFamily: 'Bricolage Grotesque' }}
                                  >
                                    {watch(`questionTypes.${index}.count`) || 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleIncrement(index, 'count')}
                                    className="w-6 h-6 flex items-center justify-center text-[#DADADA] hover:text-[#303030] active:scale-75 transition-all font-bold text-base"
                                  >
                                    +
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Sub-column 2: Marks */}
                          <div className="flex flex-col items-center p-0 gap-4 w-[100px] h-[262px] flex-none">
                            <span
                              className="text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] text-center"
                              style={{ fontFamily: 'Bricolage Grotesque' }}
                            >
                              Marks
                            </span>
                            
                            <div className="flex flex-col gap-4 w-full">
                              {fields.map((field, index) => (
                                <div
                                  key={field.id}
                                  className="flex flex-row justify-between items-center py-[11px] px-2 w-[100px] h-11 bg-white border border-[#e8e4dc] rounded-[100px] flex-none shadow-sm mx-auto"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleDecrement(index, 'marks')}
                                    className="w-6 h-6 flex items-center justify-center text-[#DADADA] hover:text-[#303030] active:scale-75 transition-all font-bold text-base pb-0.5"
                                  >
                                    -
                                  </button>
                                  <span
                                    className="text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em]"
                                    style={{ fontFamily: 'Bricolage Grotesque' }}
                                  >
                                    {watch(`questionTypes.${index}.marks`) || 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleIncrement(index, 'marks')}
                                    className="w-6 h-6 flex items-center justify-center text-[#DADADA] hover:text-[#303030] active:scale-75 transition-all font-bold text-base"
                                  >
                                    +
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Calculation Summaries */}
                      <div className="flex flex-col items-start p-0 gap-2 w-[150px] h-11 flex-none self-end pr-4 text-right">
                        <div
                          className="w-full text-[16px] font-medium leading-[110%] text-[#303030] tracking-[-0.04em] justify-end"
                          style={{ fontFamily: 'Bricolage Grotesque' }}
                        >
                          Total Questions : {totalQuestions}
                        </div>
                        <div
                          className="w-full text-[16px] font-medium leading-[110%] text-[#303030] tracking-[-0.04em] justify-end"
                          style={{ fontFamily: 'Bricolage Grotesque' }}
                        >
                          Total Marks : {totalFromTypes}
                        </div>
                      </div>
                    </div>

                    {/* Sub-section 4: Additional Information details */}
                    <div className="flex flex-col items-start p-0 gap-2 w-full h-[132px] flex-none self-stretch pt-6 border-t border-[#faf8f4]">
                      <label
                        className="w-[597px] text-[16px] font-bold leading-[140%] text-[#303030] tracking-[-0.04em]"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Additional Information (For better output)
                      </label>
                      <div className="box-border flex flex-col justify-between items-end p-4 gap-[10px] w-full h-[102px] bg-[rgba(255,255,255,0.25)] border-[1.25px] border-dashed border-[#DADADA] rounded-[16px] flex-none self-stretch relative shadow-sm">
                        {isDesktop && (
                          <textarea
                            {...register('additionalInstructions')}
                            rows={2}
                            placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                            className="w-full bg-transparent text-[14px] font-medium leading-[140%] text-[#303030] placeholder-[rgba(48,48,48,0.6)] tracking-[-0.04em] focus:outline-none resize-none"
                            style={{ fontFamily: 'Bricolage Grotesque' }}
                          />
                        )}
                        {/* Microphone speech trigger button */}
                        <button
                          type="button"
                          onClick={() => toast('Speech-to-text is coming soon!')}
                          className="flex flex-row justify-center items-center p-0.5 w-9 h-9 bg-[#F0F0F0] rounded-[18px] flex-none shadow-sm hover:scale-105 active:scale-95 transition-all"
                          style={{
                            boxShadow: '0px 10.9091px 32.7273px rgba(0, 0, 0, 0.12), 0px 21.8182px 32.7273px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          <Mic className="w-[16.36px] h-[16.36px] text-[#303030]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: NAVIGATION BUTTONS */}
                <div className="flex flex-row justify-between items-center p-0 gap-11 w-full h-[46px] flex-none mt-4">
                  {/* Previous Pill (Primary Button - White) */}
                  <Link
                    href="/assignments"
                    className="flex flex-row items-center py-3 px-6 gap-1 w-[134px] h-[46px] bg-[#FFFFFF] border border-[#e8e4dc] rounded-[48px] flex-none shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all hover:bg-[#F9F9F9]"
                  >
                    <ArrowLeft className="w-5 h-5 text-[#303030]" />
                    <span
                      className="text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] text-center"
                      style={{ fontFamily: 'Bricolage Grotesque' }}
                    >
                      Previous
                    </span>
                  </Link>

                  {/* Continue Pill (Primary Button - Dark) */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="box-border flex flex-row items-center py-3 px-6 gap-1 w-[106px] h-[46px] bg-[#181818] hover:bg-[#2B2B2B] text-white rounded-[48px] flex-none shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 justify-center"
                  >
                    <span
                      className="text-[16px] font-medium leading-[140%] text-white tracking-[-0.04em] text-center"
                      style={{ fontFamily: 'Bricolage Grotesque' }}
                    >
                      Continue
                    </span>
                    <Sparkles className="w-5 h-5 text-white" />
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile layout matching dashboard structure */}
      <div className="lg:hidden min-h-screen pb-28" style={{ background: '#cecece' }}>
        {/* Sticky premium top floating header */}
        <MobileHeader />

        {/* Sticky Centered Mobile Page Header with circular back button */}
        <div 
          className="sticky z-30 flex items-center justify-between no-print px-4 py-3 bg-[#cecece]/90 backdrop-blur-md border-b border-[rgba(0,0,0,0.03)]"
          style={{
            top: '72px', // perfectly below floating MobileHeader
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (mobileStep === 2) {
                setMobileStep(1);
              } else {
                router.back();
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.7)] text-[#303030] active:scale-95 transition-all focus:outline-none border border-[#EBEBEB] shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 
            className="absolute left-1/2 transform -translate-x-1/2 text-[18px] font-extrabold tracking-[-0.04em] text-[#303030] leading-[120%]"
            style={{ fontFamily: 'Bricolage Grotesque' }}
          >
            Create Assignment
          </h1>
          {/* Right hidden balance spacer */}
          <div className="w-10 h-10 flex-none" />
        </div>

        {/* Premium progress stepper bar for mobile */}
        <div className="px-4 py-2 mt-1">
          <div className="flex flex-row items-center gap-3 w-full h-[6px] max-w-[349px] mx-auto">
            <div className="flex-1 h-full bg-[#5E5E5E] rounded-full" />
            <div className={`flex-1 h-full rounded-full transition-colors duration-300 ${mobileStep === 2 ? 'bg-[#5E5E5E]' : 'bg-[#DADADA]'}`} />
          </div>
        </div>        {/* Mobile main layout content */}
        <main className="px-4 py-4 flex flex-col items-center">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[349px] flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {mobileStep === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Step 1 Premium form card panel */}
                  <div className="w-full bg-[rgba(255,255,255,0.7)] border border-[#EBEBEB] rounded-[32px] px-4 py-6 flex flex-col gap-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] items-center">
                    {/* Header Details Text */}
                    <div className="flex flex-col gap-1 w-[317px] max-w-full">
                      <h2
                        className="font-extrabold text-[20px] leading-[140%] text-[#303030] tracking-[-0.04em]"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Assignment Details
                      </h2>
                      <p
                        className="text-[14px] font-medium leading-[140%] text-[rgba(94,94,94,0.8)] tracking-[-0.04em]"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Basic information about your assignment
                      </p>
                    </div>

                    {/* Reference Material File upload */}
                    <div className="flex flex-col gap-3 w-[317px] max-w-full pt-4 border-t border-[#F5F5F5]">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="box-border flex flex-col justify-center items-center py-6 px-8 gap-4 w-[317px] h-[202px] bg-[#F6F6F6] border-[1.75px] border-dashed border-[rgba(0,0,0,0.2)] rounded-[24px] cursor-pointer transition-all hover:border-[rgba(0,0,0,0.4)] shadow-sm max-w-full"
                      >
                        {/* Cloud icon wrapper */}
                        <div className="flex flex-row justify-center items-center p-0 gap-[10px] w-10 h-10 bg-white rounded-lg flex-none shadow-sm border border-[#e8e4dc]">
                          <Upload className="w-6 h-6 text-[#1E1E1E]" strokeWidth={2.5} stroke="#1E1E1E" />
                        </div>
                        
                        {/* Text details stack */}
                        <div className="flex flex-col items-center p-0 gap-1 w-full text-center">
                          {uploadedFile ? (
                            <p 
                              className="w-full text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] truncate px-4"
                              style={{ fontFamily: 'Bricolage Grotesque' }}
                            >
                              {uploadedFile.name}
                            </p>
                          ) : (
                            <>
                              <p
                                className="w-full text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] flex items-center justify-center"
                                style={{ fontFamily: 'Bricolage Grotesque' }}
                              >
                                Choose a file or drag & drop it here
                              </p>
                              <p
                                className="w-full text-[14px] font-normal leading-[140%] text-[#A9A9A9] tracking-[-0.04em] flex items-center justify-center"
                                style={{ fontFamily: 'Bricolage Grotesque' }}
                              >
                                JPEG, PNG, upto 10MB
                              </p>
                            </>
                          )}
                        </div>

                        {/* Browse Files Button pill (Primary Button - White) */}
                        <button
                          type="button"
                          className="flex flex-row items-center py-2 px-6 gap-1 w-[127px] h-9 bg-white rounded-[48px] justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm border border-[#EBEBEB]"
                        >
                          <span
                            className="text-[14px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] whitespace-nowrap"
                            style={{ fontFamily: 'Bricolage Grotesque' }}
                          >
                            Browse Files
                          </span>
                        </button>
                      </div>

                      {/* Bottom subtext caption */}
                      <p
                        className="w-[317px] max-w-full text-[16px] font-medium leading-[140%] text-[rgba(48,48,48,0.6)] tracking-[-0.04em] text-center"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Upload images of your preferred document/image
                      </p>
                    </div>

                    {/* Due Date field selector */}
                    <div className="flex flex-col items-start p-0 gap-2 w-[317px] max-w-full pt-4 border-t border-[#F5F5F5]">
                      <label 
                        className="w-[317px] max-w-full text-[16px] font-bold leading-[140%] text-[#303030] tracking-[-0.04em]"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Due Date
                      </label>
                      <div className="relative w-[317px] max-w-full">
                        {/* Pill Input Container */}
                        <div className="box-border flex flex-row justify-between items-center py-[11px] px-4 gap-[10px] w-[317px] h-11 bg-transparent border-[1.25px] border-[#DADADA] rounded-[100px] shadow-sm relative max-w-full">
                          {!isDesktop && (
                            <input
                              id="dueDateMobileInput"
                              type="date"
                              onFocus={() => setIsDateInputFocused(true)}
                              min={(() => {
                                const d = new Date();
                                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                              })()}
                              {...register('dueDate', {
                                required: 'Due date is required',
                                onBlur: () => setIsDateInputFocused(false),
                              })}
                              className={`flex-1 bg-transparent border-none text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] focus:outline-none w-full cursor-pointer z-10 ${
                                (!watch('dueDate') && !isDateInputFocused) ? 'opacity-0' : 'opacity-100'
                              }`}
                              style={{ fontFamily: 'Bricolage Grotesque' }}
                            />
                          )}
                          {isDesktop && (
                            <div className="flex-1 bg-transparent" />
                          )}
                          {(!watch('dueDate') && !isDateInputFocused) && (
                            <div 
                              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] font-medium leading-[140%] text-[#A9A9A9] tracking-[-0.04em] flex items-center h-[22px] w-[96px]"
                              style={{ fontFamily: 'Bricolage Grotesque' }}
                            >
                              DD-MM-YYYY
                            </div>
                          )}
                          <div 
                            onClick={() => {
                              const el = document.getElementById('dueDateMobileInput') as HTMLInputElement | null;
                              try {
                                el?.showPicker();
                              } catch (err) {
                                el?.focus();
                              }
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2B2B] cursor-pointer hover:scale-105 active:scale-95 transition-transform z-20"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 flex-none">
                              {/* Rectangle 14 (Stroke) */}
                              <rect x="2" y="3" width="20" height="19" rx="3" stroke="#2B2B2B" strokeWidth="2" fill="none" />
                              {/* Vector 8 (Stroke) */}
                              <rect x="7" y="2" width="2" height="5" rx="1" fill="#2B2B2B" />
                              {/* Vector 9 (Stroke) */}
                              <rect x="15" y="2" width="2" height="5" rx="1" fill="#2B2B2B" />
                              {/* Vector (Stroke) - Calendar Plus */}
                              <path d="M12 9V17M8 13H16" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {errors.dueDate && (
                        <p 
                          className="text-[11px] text-red-500 pl-2 mt-1"
                          style={{ fontFamily: 'Bricolage Grotesque' }}
                        >
                          {errors.dueDate.message}
                        </p>
                      )}
                    </div>

                    {/* Question dynamic row list */}
                    <div className="flex flex-col justify-center items-end p-0 gap-4 w-[317px] max-w-full pt-4 border-t border-[#F5F5F5]">
                      <div className="flex flex-col items-start p-0 gap-4 w-[317px] max-w-full">
                        <label 
                          className="w-[317px] max-w-full text-[16px] font-bold leading-[140%] text-[#303030] tracking-[-0.04em]"
                          style={{ fontFamily: 'Bricolage Grotesque' }}
                        >
                          Question Type
                        </label>
                        
                        <div className="flex flex-col gap-4 w-[317px] max-w-full">
                          {fields.map((field, index) => (
                            <div key={field.id} className="box-border flex flex-col justify-center items-end p-3 gap-3 w-[317px] min-h-[138px] h-auto bg-white border border-[#EBEBEB] rounded-[24px] relative shadow-sm max-w-full">
                              {/* Top Row: Dropdown select container */}
                              <div className="flex flex-row justify-between items-center p-0 gap-3 w-[293px] h-5 relative max-w-full">
                                {!isDesktop && (
                                  <select
                                    {...register(`questionTypes.${index}.type`)}
                                    className="w-[180px] bg-transparent text-[14px] font-semibold leading-[140%] text-[#303030] tracking-[-0.04em] focus:outline-none appearance-none cursor-pointer pr-5 font-bold"
                                    style={{ fontFamily: 'Bricolage Grotesque' }}
                                  >
                                    {QUESTION_TYPES.map((qt) => (
                                      <option key={qt.key} value={qt.key}>{qt.label}</option>
                                    ))}
                                  </select>
                                )}
                                {isDesktop && (
                                  <span className="w-[180px] bg-transparent" />
                                )}
                                <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-[#303030] pointer-events-none" />
                                {fields.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="w-4 h-4 text-[#303030] hover:text-red-500 transition-colors flex items-center justify-center border-[1.5px] border-[#303030] rounded-sm p-[1px] absolute right-0"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <div className="w-4 h-4 absolute right-0" />
                                )}
                              </div>

                              {/* Bottom Row: Counters block */}
                              <div className="flex flex-row items-start p-2 gap-3 w-full max-w-[293px] h-[82px] bg-[#F0F0F0] rounded-[24px]">
                                {/* Question Count Column */}
                                <div className="flex flex-col items-center p-0 gap-2 flex-1 w-full max-w-[132.5px] h-[66px] grow">
                                  <span 
                                    className="text-[14px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] text-center"
                                    style={{ fontFamily: 'Bricolage Grotesque' }}
                                  >
                                    No. of Questions
                                  </span>
                                  {/* White counter pill */}
                                  <div className="flex flex-row justify-between items-center py-1.5 px-2 w-full h-[38px] bg-white rounded-[100px] shadow-sm">
                                    <button
                                      type="button"
                                      onClick={() => handleDecrement(index, 'count')}
                                      className="w-6 h-6 flex items-center justify-center text-[#5E5E5E] hover:text-[#303030] active:scale-75 transition-all font-bold text-base pb-0.5"
                                    >
                                      -
                                    </button>
                                    <span 
                                      className="text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em]"
                                      style={{ fontFamily: 'Bricolage Grotesque' }}
                                    >
                                      {watch(`questionTypes.${index}.count`) || 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleIncrement(index, 'count')}
                                      className="w-6 h-6 flex items-center justify-center text-[#5E5E5E] hover:text-[#303030] active:scale-75 transition-all font-bold text-base"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Question Marks Column */}
                                <div className="flex flex-col items-center p-0 gap-2 flex-1 w-full max-w-[132.5px] h-[66px] grow">
                                  <span 
                                    className="text-[14px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] text-center"
                                    style={{ fontFamily: 'Bricolage Grotesque' }}
                                  >
                                    Marks
                                  </span>
                                  {/* White counter pill */}
                                  <div className="flex flex-row justify-between items-center py-1.5 px-2 w-full h-[38px] bg-white rounded-[100px] shadow-sm">
                                    <button
                                      type="button"
                                      onClick={() => handleDecrement(index, 'marks')}
                                      className="w-6 h-6 flex items-center justify-center text-[#5E5E5E] hover:text-[#303030] active:scale-75 transition-all font-bold text-base pb-0.5"
                                    >
                                      -
                                    </button>
                                    <span 
                                      className="text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em]"
                                      style={{ fontFamily: 'Bricolage Grotesque' }}
                                    >
                                      {watch(`questionTypes.${index}.marks`) || 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleIncrement(index, 'marks')}
                                      className="w-6 h-6 flex items-center justify-center text-[#5E5E5E] hover:text-[#303030] active:scale-75 transition-all font-bold text-base"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Question Type Button */}
                        <div className="flex flex-row items-center p-0 gap-2 w-[164px] h-[36px] mt-2">
                          <button
                            type="button"
                            onClick={() => append({ type: 'short', count: 5, marks: 2 })}
                            className="flex flex-row items-center justify-center p-2 gap-1 w-9 h-9 bg-[#2B2B2B] hover:opacity-90 rounded-[48px] flex-none shadow-md transition-all active:scale-90"
                          >
                            <Plus className="w-5 h-5 text-white" />
                          </button>
                          <span
                            className="text-[14px] font-bold leading-[140%] text-[#303030] tracking-[-0.04em] cursor-pointer"
                            style={{ fontFamily: 'Bricolage Grotesque' }}
                            onClick={() => append({ type: 'short', count: 5, marks: 2 })}
                          >
                            Add Question Type
                          </span>
                        </div>
                      </div>

                      {/* Summary calculations */}
                      <div className="flex flex-col items-start p-0 gap-2 w-[150px] h-[44px] self-end text-right pr-2 mt-2">
                        <div
                          className="w-[150px] text-[16px] font-medium leading-[110%] text-[#303030] tracking-[-0.04em]"
                          style={{ fontFamily: 'Bricolage Grotesque' }}
                        >
                          Total Questions : {totalQuestions}
                        </div>
                        <div
                          className="w-[150px] text-[16px] font-medium leading-[110%] text-[#303030] tracking-[-0.04em]"
                          style={{ fontFamily: 'Bricolage Grotesque' }}
                        >
                          Total Marks : {totalFromTypes}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Navigation Buttons */}
                  <div className="flex flex-row justify-center items-center p-0 gap-[13px] w-[253px] h-[46px] mx-auto mt-4">
                    {/* Previous Pill (Primary Button - White) */}
                    <Link
                      href="/assignments"
                      className="flex flex-row items-center py-3 px-6 gap-1 w-[134px] h-[46px] bg-white border border-[#e8e4dc] rounded-[48px] flex-none shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all hover:bg-[#F9F9F9] justify-center"
                    >
                      <ArrowLeft className="w-5 h-5 text-[#303030]" />
                      <span
                        className="text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] text-center"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Previous
                      </span>
                    </Link>

                    {/* Continue Pill (Primary Button - Dark) */}
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        const isValid = await trigger(['dueDate']);
                        if (isValid) {
                          setMobileStep(2);
                        } else {
                          toast.error('Please specify a valid due date');
                        }
                      }}
                      className="box-border flex flex-row items-center py-3 px-6 gap-1 w-[106px] h-[46px] bg-[#181818] hover:bg-[#2B2B2B] text-white rounded-[48px] flex-none shadow-[0px_16px_48px_rgba(0,0,0,0.12),0px_32px_48px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all justify-center"
                    >
                      <span
                        className="text-[16px] font-medium leading-[140%] text-white tracking-[-0.04em] text-center"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Continue
                      </span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white flex-none">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Step 2 Premium form card panel */}
                  <div className="w-full bg-[rgba(255,255,255,0.7)] border border-[#EBEBEB] rounded-[32px] px-4 py-6 flex flex-col gap-6 shadow-[0px_4px_24px_rgba(0,0,0,0.02)] items-center">
                    {/* Header Details Text */}
                    <div className="flex flex-col gap-1 w-[317px] max-w-full">
                      <h2
                        className="font-extrabold text-[20px] leading-[140%] text-[#303030] tracking-[-0.04em]"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Additional Information
                      </h2>
                      <p
                        className="text-[14px] font-medium leading-[140%] text-[rgba(94,94,94,0.8)] tracking-[-0.04em]"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Add context or instructions for higher quality AI output
                      </p>
                    </div>

                    {/* Instructions Text Area Input */}
                    <div className="space-y-3 pt-4 border-t border-[#F5F5F5] w-[317px] max-w-full">
                      <div className="box-border flex flex-col justify-between items-end p-4 gap-3 w-full min-h-[140px] bg-[rgba(48,48,48,0.02)] border border-dashed border-[#DADADA] rounded-[16px] relative shadow-sm max-w-full">
                        {!isDesktop && (
                          <textarea
                            {...register('additionalInstructions')}
                            rows={4}
                            placeholder="e.g. Generate a question paper for 3 hour exam duration containing 5 MCQ questions..."
                            className="w-full bg-transparent text-[14px] font-bold leading-[140%] text-[#303030] placeholder-[rgba(48,48,48,0.45)] tracking-[-0.03em] focus:outline-none resize-none"
                            style={{ fontFamily: 'Bricolage Grotesque' }}
                          />
                        )}
                        {isDesktop && (
                          <div className="w-full h-full bg-transparent" />
                        )}
                        {/* Speech input button trigger */}
                        <button
                          type="button"
                          onClick={() => toast('Speech-to-text is coming soon!')}
                          className="flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all border border-[#EBEBEB]"
                        >
                          <Mic className="w-4 h-4 text-[#303030]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Navigation Buttons */}
                  <div className="flex flex-row justify-center items-center p-0 gap-[13px] w-[253px] h-[46px] mx-auto mt-4">
                    <button
                      type="button"
                      onClick={() => setMobileStep(1)}
                      className="flex flex-row items-center py-3 px-6 gap-1 w-[134px] h-[46px] bg-white border border-[#e8e4dc] rounded-[48px] flex-none shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all hover:bg-[#F9F9F9] justify-center"
                    >
                      <ArrowLeft className="w-5 h-5 text-[#303030]" />
                      <span
                        className="text-[16px] font-medium leading-[140%] text-[#303030] tracking-[-0.04em] text-center"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Previous
                      </span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="box-border flex flex-row items-center py-3 px-6 gap-1 w-[106px] h-[46px] bg-[#181818] hover:bg-[#2B2B2B] text-white rounded-[48px] flex-none shadow-[0px_16px_48px_rgba(0,0,0,0.12),0px_32px_48px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 justify-center"
                    >
                      <span
                        className="text-[16px] font-medium leading-[140%] text-white tracking-[-0.04em] text-center"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Continue
                      </span>
                      <Sparkles className="w-5 h-5 text-white flex-none" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </main>

        {/* Premium bottom tab navigation bar */}
        <div
          className="fixed left-0 right-0 z-20 flex justify-center"
          style={{ bottom: '12px' }}
        >
          <nav
            className="flex items-center"
            style={{
              width: '373px',
              maxWidth: 'calc(100vw - 24px)',
              height: '64px',
              background: '#1C1C1E',
              borderRadius: '32px',
              padding: '6px',
              gap: '0',
              boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.3)',
            }}
          >
            {[
              { label: 'Home', icon: Home, href: '/assignments', active: false },
              { label: 'My Groups', icon: BookOpen, href: '/assignments', active: true },
              { label: 'Library', icon: Library, href: '#', active: false },
              { label: 'AI Toolkit', icon: Sparkles, href: '#', active: false },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex-1 flex flex-col items-center justify-center transition-all relative"
                  style={{
                    height: '52px',
                    borderRadius: '26px',
                    background: item.active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  }}
                  onClick={(e) => {
                    if (item.href === '#') {
                      e.preventDefault();
                      toast(item.label + ' is coming soon!', {
                        style: {
                          background: '#1a1713',
                          color: '#faf8f4',
                          border: '1px solid #e8e4dc',
                          fontSize: '13px',
                        },
                      });
                    }
                  }}
                >
                  <Icon
                    style={{
                      width: '20px',
                      height: '20px',
                      color: item.active ? '#FFFFFF' : 'rgba(255,255,255,0.40)',
                      marginBottom: '2px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: item.active ? 700 : 500,
                      color: item.active ? '#FFFFFF' : 'rgba(255,255,255,0.40)',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
