'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, RefreshCw, Sparkles, CheckCircle,
  XCircle, Loader2, Clock, BookOpen, Bell, ChevronDown, Menu, X,
  Home, Library
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useWebSocket } from '@/lib/useWebSocket';
import { getGeneratedPaper, regeneratePaper } from '@/lib/api';
import { GeneratedPaper, Question } from '@/types';
import { downloadPaperAsPDF } from '@/lib/pdfExport';
import Sidebar from '@/components/Sidebar';

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
    <div className="h-screen overflow-hidden bg-[#faf8f4] flex">
      {/* Desktop Sidebar Layout */}
      <div
        className="hidden lg:flex shrink-0"
        style={{
          padding: '12px 0 12px 12px',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
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

      {/* Main Content Area — flex column, fills remaining width, clips overflow */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#e8e4dc]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-xl hover:bg-[#faf8f4] text-[#1a1713]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
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
        <div className="px-6 py-5 border-b border-[#e8e4dc] bg-white hidden lg:flex items-center justify-between no-print">
          <div className="flex items-center gap-4">
            <Link href="/assignments" className="p-2 rounded-xl hover:bg-[#faf8f4] text-[#887e6e] hover:text-[#1a1713] transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <h1 className="font-display text-lg font-bold text-[#1a1713] tracking-tight">Assignment Output</h1>
              </div>
              <p className="text-[10px] text-[#887e6e] mt-0.5">Custom question paper sheet created by VedaAI.</p>
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

        {/* Mobile Page back navigation */}
        <div className="px-4 py-4 lg:hidden no-print">
          <div className="flex items-center gap-3">
            <Link href="/assignments" className="text-[#887e6e]">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-display font-bold text-[#1a1713] text-base">Assignment Output</span>
          </div>
        </div>

        {/* Presentation Viewport Pane */}
        <div className="flex-1 overflow-y-auto" id="paper-scroll-area">
          <main className="px-4 lg:px-8 py-6 max-w-4xl w-full mx-auto space-y-6 pb-24">
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
              <motion.div
                key="paper"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Elevated Black Toast Confirmation Banner */}
                <div className="bg-[#1a1713] border border-[#e8e4dc] rounded-[24px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg text-left font-sans no-print">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-bold text-[#e24a2c] tracking-wider uppercase mb-1">Success</p>
                    <p className="text-[11px] sm:text-xs text-white leading-relaxed font-semibold">
                      Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade {paper.grade} {paper.subject} classes on the NCERT chapters:
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 bg-white hover:bg-[#faf8f4] text-[#1a1713] px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-[#e24a2c]" />
                    Download as PDF
                  </button>
                </div>

                {/* MS Word-style paper sheet */}
                <div
                  className="bg-white shadow-md relative"
                  style={{
                    border: '1px solid #d0d0d0',
                    padding: '48px 56px',
                    fontFamily: "'Times New Roman', Times, serif",
                    color: '#000000',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginTop: '8px', paddingTop: '8px', borderTop: '1.5px solid #000' }}>
                      <span>Time Allowed: {paper.duration} minutes</span>
                      <span>Maximum Marks: {paper.totalMarks}</span>
                    </div>
                    <hr style={{ borderTop: '1.5px solid #000', margin: '0' }} />

                    {/* Compulsory notice */}
                    <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '10px 0 8px' }}>
                      All questions are compulsory unless stated otherwise.
                    </p>

                    {/* Student details — MS Word underline style */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginBottom: '12px', flexWrap: 'wrap', fontSize: '13px' }}>
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
                    <hr style={{ borderTop: '0.5px solid #000', marginBottom: '10px' }} />

                    {/* General Instructions — plain text, no box */}
                    <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>General Instructions:</p>
                    <div style={{ fontSize: '12px', paddingLeft: '4px', marginBottom: '14px', lineHeight: '1.7' }}>
                      <div>(i)&nbsp;&nbsp;&nbsp;Ensure the paper contains all pages before beginning.</div>
                      <div>(ii)&nbsp;&nbsp;All answers must be written neatly on the provided sheets.</div>
                      <div>(iii)&nbsp;Write question numbers clearly in the margin before each answer.</div>
                    </div>

                    {/* Sections */}
                    <div style={{ marginTop: '8px' }}>
                      {paper.sections.map((section, sIdx) => (
                        <div key={section.id} style={{ marginBottom: '24px' }}>
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
                  <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginTop: '32px', paddingTop: '12px', borderTop: '1px solid #000' }}>
                    *** End of Question Paper ***
                  </p>
                </div>

                {/* Bottom Desktop Actions wrapper */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 bg-white border border-[#e8e4dc] rounded-[24px] shadow-sm no-print font-sans">
                  <div className="text-xs text-[#887e6e] font-semibold leading-relaxed">
                    Total :{' '}
                    <span className="text-[#1a1713]">
                      {paper.sections.reduce((s, sec) => s + sec.questions.length, 0)} questions
                    </span>{' '}
                    across {paper.sections.length} sections.
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
              </motion.div>
            )}
          </AnimatePresence>
          </main>
        </div>

        {/* Fixed action toolbar viewport */}
        {paper && (
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 bg-white border-t border-[#e8e4dc] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] no-print font-sans z-10">
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

      {/* Mobile Sticky bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#e8e4dc] z-20 flex items-center justify-around lg:hidden font-sans no-print">
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
  </div>
  );
}
