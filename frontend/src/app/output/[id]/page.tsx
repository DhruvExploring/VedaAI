'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, RefreshCw, Sparkles, CheckCircle,
  XCircle, Loader2, Clock, BookOpen, Bell, ChevronDown, Menu, X,
  Home, Library, FileText
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useWebSocket } from '@/lib/useWebSocket';
import { getGeneratedPaper, regeneratePaper } from '@/lib/api';
import { GeneratedPaper, Question } from '@/types';
import { downloadPaperAsPDF } from '@/lib/pdfExport';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import MobileHeader from '@/components/MobileHeader';

export default function OutputPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const { job, setJob, addPaper } = useAssessmentStore();
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [section, setSection] = useState('');

  useWebSocket(assignmentId);

  // Retrieve paper representation if processing has already concluded
  useEffect(() => {
    setPaper(null);
    if (job.result && job.assignmentId === assignmentId) {
      setPaper(job.result);
      return;
    } else if (job.assignmentId !== assignmentId) {
      setJob({ jobId: null, assignmentId, status: 'pending', progress: 0, message: 'Connecting...', result: null, error: null });
    }
    // Request paper details from the remote API service
    getGeneratedPaper(assignmentId)
      .then((res) => {
        if (res.success) {
          setPaper(res.paper);
          setJob({ status: 'completed', progress: 100, result: res.paper });
        }
      })
      .catch(() => {
        // Await real-time WebSocket updates if resource is pending
      });
  }, [assignmentId]);

  // Apply WebSocket payload updates once generation resolves
  useEffect(() => {
    if (job.result && job.assignmentId === assignmentId) {
      setPaper(job.result);
    }
  }, [job.result]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const regenPromise = regeneratePaper(assignmentId).then((res) => {
      if (res.success) {
        setPaper(null);
        setJob({ status: 'pending', progress: 0, message: 'Regeneration queued...', jobId: null, result: null, error: null });
        return 'Regeneration queued successfully';
      }
      throw new Error('Failed to regenerate');
    });

    toast.promise(regenPromise, {
      loading: 'Requesting AI paper regeneration...',
      success: (msg) => msg,
      error: 'Failed to request regeneration',
    }, {
      style: {
        background: '#1a1713',
        color: '#faf8f4',
        border: '1px solid #e8e4dc',
        fontSize: '13px',
      },
    });

    regenPromise.finally(() => setIsRegenerating(false));
  };

  const handleDownloadPDF = () => {
    if (!paper) return;
    downloadPaperAsPDF(paper, { studentName, rollNo, section });
    toast.success('PDF document downloaded successfully!', {
      style: {
        background: '#1a1713',
        color: '#faf8f4',
        border: '1px solid #e8e4dc',
        fontSize: '13px',
      },
    });
  };

  const isLoading = !paper && job.status !== 'failed';
  const isFailed = job.status === 'failed';

  return (
    <div className="h-screen flex bg-[#cecece] lg:bg-[#3B3B3B] relative overflow-hidden">
      {/* Desktop Sidebar Layout */}
      <div
        className="hidden lg:block shrink-0"
        style={{
          padding: '12px 0 12px 12px',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <Sidebar />
      </div>

      {/* Main Content Area — flex column, fills remaining width, clips overflow */}
      <div className="flex-1 flex flex-col min-w-0 lg:p-3 lg:h-screen lg:overflow-hidden">
        {/* Sticky premium top floating header */}
        <div className="lg:hidden">
          <MobileHeader />
        </div>

        {/* Desktop Header bar — using shared SearchBar component */}
        <div className="hidden lg:block mb-3 no-print">
          <SearchBar title="Assignment Output" icon={<FileText className="w-5 h-5 text-[#A9A9A9] flex-none" />} />
        </div>

        {/* Mobile Page Navigation title */}
        <div className="px-4 py-2 lg:hidden no-print">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="text-[#303030] focus:outline-none"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span 
              className="font-extrabold text-[#1a1713] text-[18px] tracking-[-0.04em]"
              style={{ fontFamily: 'Bricolage Grotesque' }}
            >
              Assignment Output
            </span>
          </div>
        </div>

        {/* Presentation Viewport Pane */}
        <div
          className={`flex-1 overflow-y-auto lg:bg-[#F2F2F2] pb-28 lg:pb-0 ${
            paper ? 'lg:rounded-t-[20px] lg:rounded-b-none' : 'lg:rounded-[20px]'
          }`}
          id="paper-scroll-area"
        >
          <main className="px-4 lg:px-8 py-4 max-w-4xl w-full mx-auto space-y-6">
            <AnimatePresence mode="wait">
              {/* Loading / Progress State */}
              {isLoading && !paper && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 bg-white border border-[#e8e4dc] rounded-[32px] p-8 shadow-sm"
                >
                  <div className="w-20 h-20 bg-[#faf8f4] border border-[#e8e4dc] rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="w-8 h-8 text-[#e24a2c] animate-spin" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[#1a1713] mb-2">
                    {job.status === 'processing' ? 'Generating your paper...' : 'Preparing...'}
                  </h2>
                  <p className="text-xs text-[#887e6e] mb-8 font-medium">{job.message || 'AI is crafting your questions'}</p>

                  {/* Progress bar */}
                  <div className="w-72 bg-[#e8e4dc] rounded-full h-2 overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full bg-[#e24a2c] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[10px] text-[#887e6e] mt-2 font-mono font-bold">{job.progress}%</p>

                  {/* Steps */}
                  <div className="mt-8 space-y-2.5 w-60 border-t border-[#faf8f4] pt-6">
                    {[
                      { label: 'Assignment created', done: (job.progress || 0) >= 10 },
                      { label: 'Building prompt structure', done: (job.progress || 0) >= 30 },
                      { label: 'AI generating questions', done: (job.progress || 0) >= 50 },
                      { label: 'Parsing & validating output', done: (job.progress || 0) >= 80 },
                      { label: 'Saving results', done: (job.progress || 0) >= 100 },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          step.done ? 'bg-green-100' : 'bg-[#e8e4dc]'
                        }`}>
                          {step.done && <CheckCircle className="w-3 h-3 text-green-600" />}
                        </div>
                        <span className={`text-[11px] font-medium ${step.done ? 'text-[#564e45]' : 'text-[#b0a999]'}`}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Failed State */}
              {isFailed && !paper && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 bg-white border border-[#e8e4dc] rounded-[32px] p-8 text-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#1a1713] mb-2">Generation Failed</h2>
                  <p className="text-xs text-[#887e6e] max-w-sm mb-6">{job.error || 'Something went wrong during model inference'}</p>
                  <button
                    onClick={handleRegenerate}
                    className="flex items-center gap-2 bg-[#1a1713] hover:bg-[#2a2520] text-white px-6 py-3 rounded-full text-xs font-bold transition-all shadow-md"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </motion.div>
              )}

              {/* Completed Paper Layout */}
              {paper && (
                <>
                  {/* DESKTOP LAYOUT (Unchanged & Perfect) */}
                  <motion.div
                    key="paper-desktop"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden lg:flex flex-col items-center p-5 gap-4 w-full bg-[#303030] rounded-[32px] shadow-sm no-print"
                  >
                    {/* Success and Actions Banner Card */}
                    <div
                      className="flex flex-col justify-center items-start py-6 px-8 gap-5 w-full rounded-[32px] text-left"
                      style={{
                        background: "#303030",
                      }}
                    >
                      {/* Banner Indicator */}
                      <div className="flex flex-col items-start p-0 gap-3 w-full">
                        {/* Text Stack */}
                        <div className="flex flex-col items-start p-0 gap-1 w-full text-left">
                          <h2
                            className="text-[20px] font-bold tracking-[-0.04em] text-white leading-[140%] flex items-center"
                            style={{ fontFamily: "Bricolage Grotesque" }}
                          >
                            Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade {paper.grade} {paper.subject} classes on the NCERT chapters:
                          </h2>
                        </div>
                      </div>

                      {/* CTA Actions */}
                      <div className="flex flex-row items-center p-0 gap-3 w-full mt-1">
                        <div className="flex flex-row items-center gap-4">
                          <button
                            onClick={handleDownloadPDF}
                            className="flex flex-row justify-center items-center py-2.5 px-4 gap-2 h-11 bg-white hover:bg-[#faf8f4] active:scale-95 transition-all text-[#303030] rounded-[100px] shadow-sm font-semibold cursor-pointer shrink-0 w-[200px]"
                          >
                            <div className="relative w-6 h-6 flex-none">
                              <Download 
                                className="absolute text-[#303030] flex-none" 
                                style={{
                                  width: "17.19px",
                                  height: "19.19px",
                                  left: "2.81px",
                                  top: "3px",
                                }}
                                strokeWidth={2.5} 
                              />
                            </div>
                            <span
                              className="text-[14.5px] font-medium leading-[22px] tracking-[-0.04em] text-[#303030] whitespace-nowrap"
                              style={{ fontFamily: "Bricolage Grotesque" }}
                            >
                              Download as PDF
                            </span>
                          </button>

                          <button
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="flex flex-row justify-center items-center py-2.5 px-4 gap-2 h-11 bg-white hover:bg-[#faf8f4] active:scale-95 transition-all text-[#303030] rounded-[100px] shadow-sm font-semibold cursor-pointer shrink-0 w-[200px]"
                          >
                            <div className="relative w-6 h-6 flex-none">
                              <RefreshCw 
                                className={`absolute text-[#303030] flex-none ${isRegenerating ? "animate-spin" : ""}`}
                                style={{
                                  width: "17.19px",
                                  height: "17.19px",
                                  left: "3.4px",
                                  top: "3.4px",
                                }}
                                strokeWidth={2.5} 
                              />
                            </div>
                            <span
                              className="text-[14.5px] font-medium leading-[22px] tracking-[-0.04em] text-[#303030] whitespace-nowrap"
                              style={{ fontFamily: "Bricolage Grotesque" }}
                            >
                              Regenerate Paper
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* High-Fidelity Paper Sheet Canvas */}
                    <div
                      className="bg-white shadow-md relative w-full flex flex-col items-center"
                      style={{
                        border: '1px solid #d0d0d0',
                        padding: '48px 56px',
                        fontFamily: "'Times New Roman', Times, serif",
                        color: '#000000',
                        borderRadius: '32px',
                      }}
                    >
                      {/* School name */}
                      <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        Delhi Public School, Sector-4, Bokaro
                      </h2>

                      {/* Paper title */}
                      <h3 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px', marginBottom: '6px' }}>
                        {paper.title || 'Question Paper'}
                      </h3>

                      {/* Subject / Class */}
                      <p style={{ textAlign: 'center', fontSize: '13px', marginBottom: '4px' }}>
                        Subject: {paper.subject}&nbsp;&nbsp;&nbsp;&nbsp;Class: {paper.grade}
                      </p>

                      {/* Time / Marks row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginTop: '8px', paddingTop: '8px', borderTop: '1.5px solid #000', width: '100%' }}>
                        <span>Time Allowed: {paper.duration} minutes</span>
                        <span>Maximum Marks: {paper.totalMarks}</span>
                      </div>
                      <hr style={{ borderTop: '1.5px solid #000', margin: '0', width: '100%' }} />

                      {/* Compulsory notice */}
                      <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '10px 0 8px', width: '100%' }}>
                        All questions are compulsory unless stated otherwise.
                      </p>

                      {/* Student details — MS Word underline style */}
                      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginBottom: '12px', flexWrap: 'wrap', fontSize: '13px', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flex: 1, minWidth: '200px' }}>
                          <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Name:</span>
                          <div style={{ flex: 1, borderBottom: '1px solid #000', height: '18px', minWidth: '140px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                          <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Roll No.:</span>
                          <div style={{ width: '90px', borderBottom: '1px solid #000', height: '18px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                          <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Section:</span>
                          <div style={{ width: '60px', borderBottom: '1px solid #000', height: '18px' }} />
                        </div>
                      </div>
                      <hr style={{ borderTop: '0.5px solid #000', marginBottom: '10px', width: '100%' }} />

                      {/* General Instructions — plain text, no box */}
                      <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', alignSelf: 'flex-start' }}>General Instructions:</p>
                      <div style={{ fontSize: '12px', paddingLeft: '4px', marginBottom: '14px', lineHeight: '1.7', alignSelf: 'flex-start' }}>
                        <div>(i)&nbsp;&nbsp;&nbsp;Ensure the paper contains all pages before beginning.</div>
                        <div>(ii)&nbsp;&nbsp;All answers must be written neatly on the provided sheets.</div>
                        <div>(iii)&nbsp;Write question numbers clearly in the margin before each answer.</div>
                      </div>

                      {/* Sections */}
                      <div style={{ marginTop: '8px', width: '100%' }}>
                        {paper.sections.map((section, sIdx) => (
                          <div key={section.id} style={{ marginBottom: '24px', width: '100%' }}>
                            {/* Section header — bold title + marks, bottom rule */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                {section.title}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>[{section.totalMarks} Marks]</span>
                            </div>
                            {section.instruction && (
                              <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#333', marginBottom: '8px' }}>{section.instruction}</p>
                            )}

                            {/* Questions */}
                            <div>
                              {section.questions.map((question: Question, qIdx: number) => (
                                <div key={question.id} style={{ marginBottom: '12px' }}>
                                  {/* Question row: number + text + marks */}
                                  <div style={{ display: 'flex', gap: '6px', fontSize: '12.5px', lineHeight: '1.6' }}>
                                    <span style={{ fontWeight: 'bold', minWidth: '20px', flexShrink: 0 }}>{qIdx + 1}.</span>
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                      <span style={{ textAlign: 'left' }}>{question.text}</span>
                                      <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        [{question.marks} Mark{question.marks !== 1 ? 's' : ''}
                                        {question.difficulty ? ` | ${question.difficulty === 'easy' ? 'Low' : question.difficulty === 'medium' ? 'Moderate' : 'High'}` : ''}]
                                      </span>
                                    </div>
                                  </div>

                                  {/* MCQ options — 2-column grid */}
                                  {question.type === 'mcq' && question.options && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', paddingLeft: '26px', marginTop: '4px', fontSize: '12px' }}>
                                      {question.options.map((opt, oIdx) => (
                                        <div key={oIdx}>{String.fromCharCode(65 + oIdx)})&nbsp;&nbsp;{opt}</div>
                                      ))}
                                    </div>
                                  )}

                                  {/* True / False */}
                                  {question.type === 'truefalse' && (
                                    <div style={{ paddingLeft: '26px', marginTop: '4px', fontSize: '12px' }}>
                                      (a)&nbsp;True&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(b)&nbsp;False
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* End of paper */}
                      <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginTop: '32px', paddingTop: '12px', borderTop: '1px solid #000', width: '100%' }}>
                        *** End of Question Paper ***
                      </p>

                      {/* Answer Key Block */}
                      <div
                        className="w-full text-[#303030] font-normal text-[14px] tracking-[-0.04em] mt-6 border-t border-dashed border-[#d0d0d0] pt-6"
                        style={{
                          fontFamily: "Inter",
                          lineHeight: "220%",
                        }}
                      >
                        <h3
                          className="text-[18px] font-semibold tracking-[-0.04em] mb-4 text-center border-b border-[#303030] pb-2"
                          style={{ fontFamily: "Inter" }}
                        >
                          Answer Key
                        </h3>
                        {paper.sections.map((sec, sIdx) => (
                          <div key={`ans-sec-${sIdx}`} className="mb-6">
                            <h4 className="font-semibold text-[15px] mb-2">{sec.title} Answers</h4>
                            {sec.questions.map((q: Question, qIdx: number) => (
                              <div key={`ans-q-${q.id}`} className="mb-3 pl-4">
                                <span className="font-semibold">{qIdx + 1}. </span>
                                <span>{q.answer || "Answer explanation not generated."}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* MOBILE LAYOUT */}
                  <motion.div
                    key="paper-mobile"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex lg:hidden flex-col items-center gap-6 w-full no-print"
                  >
                    {/* Success Banner Card */}
                    <div
                      style={{
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        padding: '24px 16px',
                        gap: '12px',
                        width: '355px',
                        maxWidth: '100%',
                        height: '147px',
                        background: '#303030',
                        boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)',
                        borderRadius: '32px',
                      }}
                    >
                      {/* Banner text stack wrapper */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '0px',
                          gap: '16px',
                          width: '323px',
                          maxWidth: '100%',
                          height: '51px',
                        }}
                      >
                        <span
                          style={{
                            width: '323px',
                            maxWidth: '100%',
                            height: '51px',
                            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                            fontStyle: 'normal',
                            fontWeight: 700,
                            fontSize: '14px',
                            lineHeight: '17px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '-0.04em',
                            color: '#F0F0F0',
                          }}
                        >
                          Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade {paper.grade} {paper.subject} classes on the NCERT chapters:
                        </span>
                      </div>

                      {/* Action Buttons Wrapper */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: '0px',
                          gap: '12px',
                          height: '36px',
                        }}
                      >
                        {/* Circular semi-transparent download pill */}
                        <button
                          type="button"
                          onClick={handleDownloadPDF}
                          className="flex flex-row justify-center items-center cursor-pointer hover:opacity-85 transition-opacity"
                          style={{
                            width: '36px',
                            height: '36px',
                            background: 'rgba(246, 246, 246, 0.1)',
                            borderRadius: '100px',
                            border: 'none',
                          }}
                        >
                          <Download 
                            style={{
                              width: '20px',
                              height: '20px',
                              color: '#FFFFFF',
                            }} 
                            strokeWidth={2.5}
                          />
                        </button>

                        {/* Circular semi-transparent regenerate pill */}
                        <button
                          type="button"
                          onClick={handleRegenerate}
                          disabled={isRegenerating}
                          className="flex flex-row justify-center items-center cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
                          style={{
                            width: '36px',
                            height: '36px',
                            background: 'rgba(246, 246, 246, 0.1)',
                            borderRadius: '100px',
                            border: 'none',
                          }}
                        >
                          <RefreshCw 
                            className={isRegenerating ? "animate-spin" : ""}
                            style={{
                              width: '18px',
                              height: '18px',
                              color: '#FFFFFF',
                            }} 
                            strokeWidth={2.5}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Actual Paper Container */}
                    <div
                      style={{
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        padding: '24px 16px',
                        gap: '24px',
                        width: '355px',
                        maxWidth: '100%',
                        background: '#F6F6F6',
                        borderRadius: '32px',
                      }}
                    >
                      {/* School Name Heading (Message) */}
                      <h2
                        style={{
                          width: '323px',
                          maxWidth: '100%',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontStyle: 'normal',
                          fontWeight: 700,
                          fontSize: '20px',
                          lineHeight: '130%',
                          textAlign: 'center',
                          letterSpacing: '-0.04em',
                          color: '#303030',
                          margin: '0 auto',
                        }}
                      >
                        Delhi Public School, Sector-4, Bokaro
                      </h2>

                      {/* Subject & Class Centered Detail */}
                      <div className="text-center -mt-2">
                        <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: '#303030' }}>
                          Subject: {paper.subject}
                        </p>
                        <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: '#303030' }}>
                          Class: {paper.grade}
                        </p>
                      </div>

                      {/* Time and Max Marks Metadata Block */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '0px',
                          gap: '10px',
                          width: '323px',
                          maxWidth: '100%',
                        }}
                      >
                        <span
                          style={{
                            height: '22px',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '160%',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '-0.04em',
                            color: '#303030',
                          }}
                        >
                          Time Allowed: {paper.duration} minutes
                        </span>
                        <span
                          style={{
                            height: '22px',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '160%',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '-0.04em',
                            color: '#303030',
                          }}
                        >
                          Maximum Marks: {paper.totalMarks}
                        </span>
                      </div>

                      {/* Compulsory notice row */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0px',
                          gap: '10px',
                          width: '323px',
                          maxWidth: '100%',
                          height: '44px',
                        }}
                      >
                        <span
                          style={{
                            margin: '0 auto',
                            width: '323px',
                            height: '44px',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '160%',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '-0.04em',
                            color: '#303030',
                          }}
                        >
                          All questions are compulsory unless stated otherwise.
                        </span>
                      </div>

                      {/* Student info fillers block */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '0px',
                          width: '323px',
                          maxWidth: '100%',
                          height: '66px',
                        }}
                      >
                        <span
                          style={{
                            width: '230px',
                            height: '22px',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '160%',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '-0.04em',
                            color: '#303030',
                          }}
                        >
                          Name: ______________________
                        </span>
                        <span
                          style={{
                            width: '232px',
                            height: '22px',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '160%',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '-0.04em',
                            color: '#303030',
                          }}
                        >
                          Roll Number: ________________
                        </span>
                        <span
                          style={{
                            width: '232px',
                            height: '22px',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '160%',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '-0.04em',
                            color: '#303030',
                          }}
                        >
                          Class: {paper.grade} Section: __________
                        </span>
                      </div>

                      {/* Dynamic Loop for Sections */}
                      <div className="w-full flex flex-col gap-6">
                        {paper.sections.map((section, sIdx) => (
                          <div key={section.id} className="w-full flex flex-col gap-4">
                            
                            {/* Section announcement */}
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '0px',
                                gap: '10px',
                                width: '323px',
                                maxWidth: '100%',
                                height: '26px',
                                borderBottom: '1px solid #303030',
                                paddingBottom: '4px'
                              }}
                            >
                              <span
                                style={{
                                  width: '323px',
                                  height: '26px',
                                  fontFamily: "'Inter', system-ui, sans-serif",
                                  fontStyle: 'normal',
                                  fontWeight: 600,
                                  fontSize: '16px',
                                  lineHeight: '160%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textAlign: 'center',
                                  letterSpacing: '-0.04em',
                                  color: '#303030',
                                }}
                              >
                                {section.title}
                              </span>
                            </div>

                            {/* Section Instructions */}
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0px',
                                gap: '10px',
                                width: '323px',
                                maxWidth: '100%',
                                minHeight: '44px',
                              }}
                            >
                              <span
                                style={{
                                  margin: '0 auto',
                                  width: '323px',
                                  fontFamily: "'Inter', system-ui, sans-serif",
                                  fontStyle: 'normal',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  lineHeight: '160%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  letterSpacing: '-0.04em',
                                  color: '#303030',
                                }}
                              >
                                {section.instruction || `Short Answer Questions. Attempt all questions. Each question carries 2 marks.`}
                              </span>
                            </div>

                            {/* Question block lines */}
                            <div
                              style={{
                                width: '323px',
                                maxWidth: '100%',
                                fontFamily: "'Inter', system-ui, sans-serif",
                                fontStyle: 'normal',
                                fontWeight: 400,
                                fontSize: '16px',
                                lineHeight: '150%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                letterSpacing: '-0.04em',
                                color: '#303030',
                              }}
                            >
                              {section.questions.map((question: Question, qIdx: number) => (
                                <div key={question.id} className="flex flex-col gap-1 text-left">
                                  <div className="flex justify-between items-start gap-4">
                                    <span>
                                      {qIdx + 1}. [{question.difficulty ? question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) : 'Mixed'}] {question.text}
                                    </span>
                                    <span className="font-semibold whitespace-nowrap shrink-0">
                                      [{question.marks} Mark{question.marks !== 1 ? 's' : ''}]
                                    </span>
                                  </div>

                                  {/* MCQ options */}
                                  {question.type === 'mcq' && question.options && (
                                    <div className="grid grid-cols-1 gap-1.5 pl-6 mt-1 text-[14px]">
                                      {question.options.map((opt, oIdx) => (
                                        <div key={oIdx}>{String.fromCharCode(65 + oIdx)})&nbsp;&nbsp;{opt}</div>
                                      ))}
                                    </div>
                                  )}

                                  {/* True / False */}
                                  {question.type === 'truefalse' && (
                                    <div className="pl-6 mt-1 text-[14px]">
                                      (a)&nbsp;True&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(b)&nbsp;False
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                          </div>
                        ))}
                      </div>

                      {/* End of paper separator */}
                      <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', marginTop: '12px', borderTop: '1px solid #303030', paddingTop: '12px', width: '100%', fontFamily: 'Inter' }}>
                        *** End of Question Paper ***
                      </p>

                      {/* Answer Key Section */}
                      <div
                        style={{
                          width: '323px',
                          maxWidth: '100%',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontStyle: 'normal',
                          fontWeight: 400,
                          fontSize: '16px',
                          lineHeight: '150%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          letterSpacing: '-0.04em',
                          color: '#303030',
                          borderTop: '1.5px dashed #d0d0d0',
                          paddingTop: '20px',
                        }}
                      >
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #303030', paddingBottom: '6px' }}>
                          Answer Key
                        </h3>
                        {paper.sections.map((sec, sIdx) => (
                          <div key={`ans-sec-mob-${sIdx}`} className="mb-4 text-left">
                            <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>{sec.title} Answers</h4>
                            {sec.questions.map((q: Question, qIdx: number) => (
                              <div key={`ans-q-mob-${q.id}`} className="mb-2 pl-4">
                                <span style={{ fontWeight: 600 }}>{qIdx + 1}. </span>
                                <span>{q.answer || "Answer explanation not generated."}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Fixed action toolbar viewport (Desktop Only) */}
        {paper && (
          <div className="hidden lg:flex flex-shrink-0 flex-row items-center justify-between gap-3 px-6 py-3 bg-white border-t border-[#e8e4dc] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] no-print font-sans z-10 lg:rounded-b-[20px] lg:border-t lg:border-[#e8e4dc]">
            <div className="text-xs text-[#887e6e] font-semibold">
              Total:&nbsp;
              <span className="text-[#1a1713]">
                {paper.sections.reduce((s, sec) => s + sec.questions.length, 0)} questions
              </span>
              &nbsp;across {paper.sections.length} sections.
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center justify-center gap-1.5 bg-white border border-[#e8e4dc] hover:border-[#1a1713] text-[#564e45] hover:text-[#1a1713] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                Regenerate Paper
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-1.5 bg-[#1a1713] hover:bg-[#2a2520] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border border-[#e24a2c]/30"
              >
                <Download className="w-3.5 h-3.5 text-[#e24a2c]" />
                Download PDF
              </button>
            </div>
          </div>
        )}

        {/* Premium bottom tab navigation bar for mobile */}
        <div
          className="fixed left-0 right-0 z-20 flex justify-center lg:hidden"
          style={{ bottom: '12px' }}
        >
          <nav
            className="flex items-center shadow-[0px_16px_48px_rgba(0,0,0,0.3)]"
            style={{
              width: '373px',
              maxWidth: 'calc(100vw - 24px)',
              height: '64px',
              background: '#1C1C1E',
              borderRadius: '32px',
              padding: '6px',
              gap: '0',
            }}
          >
            {[
              { label: 'Home', icon: Home, href: '/assignments', active: false },
              { label: 'Assignments', icon: BookOpen, href: '/assignments', active: true },
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
    </div>
  );
}
