'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, CheckCircle, Clock, AlertCircle, Loader2,
  Bell, MoreVertical, Search, Filter, X, Home, BookOpen,
  Library, Sparkles, ChevronDown, LayoutGrid
} from 'lucide-react';
import { getAssignments, deleteAssignment } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  duration: number;
  jobStatus: string;
  createdAt: string;
  dueDate: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  completed: { color: 'text-green-600 bg-green-50', label: 'Completed' },
  processing: { color: 'text-blue-600 bg-blue-50', label: 'Processing' },
  pending: { color: 'text-yellow-600 bg-yellow-50', label: 'Pending' },
  failed: { color: 'text-red-600 bg-red-50', label: 'Failed' },
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadAssignments = () => {
    setLoading(true);
    getAssignments()
      .then((res) => {
        if (res.success) {
          setAssignments(res.assignments || []);
        }
      })
      .catch(() => {
        toast.error('Failed to load assignments');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id: string) => {
    setActiveMenuId(null);
    const deletePromise = deleteAssignment(id).then((res) => {
      if (res.success) {
        setAssignments((prev) => prev.filter((item) => item._id !== id));
        return 'Assignment deleted successfully';
      }
      throw new Error('Failed to delete');
    });

    toast.promise(deletePromise, {
      loading: 'Deleting assignment...',
      success: (msg) => msg,
      error: 'Failed to delete assignment',
    }, {
      style: {
        background: '#1a1713',
        color: '#faf8f4',
        border: '1px solid #e8e4dc',
        fontSize: '13px',
      },
    });
  };

  const subjects = ['All', ...Array.from(new Set(assignments.map((a) => a.subject)))];

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'All' || a.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const formatDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);

      if (isNaN(d.getTime())) {
        return dateStr;
      }

      return d.toLocaleDateString('en-GB').replace(/\//g, '-');
    } catch (error) {
      return dateStr;
    }
  };

  return (
    <>
      {/* Desktop layout */}
      <div
        className="hidden lg:flex min-h-screen"
        style={{ background: '#3B3B3B' }}
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
          {/* Top header bar */}
          <header
            className="flex items-center justify-between shrink-0"
            style={{
              height: '56px',
              borderRadius: '16px',
              paddingLeft: '24px',
              paddingRight: '12px',
              gap: '10px',
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              marginBottom: '12px',
            }}
          >
            {/* Back navigation and breadcrumb */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-1.5 rounded-lg text-[#6b6b6b] hover:text-[#1a1713] hover:bg-black/5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 text-[#6b6b6b]">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Assignment</span>
              </div>
            </div>

            {/* Notification bell and user identity */}
            <div className="flex items-center gap-3">
              <button className="relative p-1.5 rounded-xl text-[#6b6b6b] hover:text-[#1a1713] hover:bg-black/5 transition-all">
                <Bell className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                <span
                  className="absolute"
                  style={{
                    top: '6px',
                    right: '6px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#E8450A',
                    border: '1.5px solid rgba(255,255,255,0.75)',
                  }}
                />
              </button>

              {/* User avatar + name */}
              <div className="flex items-center gap-2">
                <div
                  className="rounded-full shrink-0 overflow-hidden"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #E8450A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="text-white font-bold" style={{ fontSize: '11px' }}>JD</span>
                </div>
                <span className="font-semibold text-[#1a1713]" style={{ fontSize: '13px' }}>
                  John Doe
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6b6b6b]" />
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: '#E8450A' }} />
                <p className="text-sm" style={{ color: '#9B9B9B' }}>Fetching active papers...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center"
                style={{
                  borderRadius: '20px',
                  background: '#F2F2F2',
                }}
              >
                <div className="mb-6 relative">
                  <EmptyStateIllustration />
                </div>

                <h2
                  className="font-semibold text-[#1a1713] mb-2 text-center"
                  style={{ fontSize: '16px' }}
                >
                  No assignments yet
                </h2>
                <p
                  className="text-center max-w-xs mb-8 leading-relaxed"
                  style={{ fontSize: '13px', color: '#6b6b6b' }}
                >
                  Create your first assignment to start collecting and grading student
                  submissions. You can set up rubrics, define marking criteria, and let AI
                  assist with grading.
                </p>

                <Link
                  href="/assignments/create"
                  className="flex items-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: '#1a1713',
                    color: '#ffffff',
                    borderRadius: '100px',
                    padding: '12px 24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Your First Assignment
                </Link>
              </motion.div>
            ) : (
              /* Assignment grid */
              <div className="flex flex-col gap-5 h-full overflow-y-auto">
                {/* Search and filter controls */}
                <div
                  className="flex items-center gap-3 shrink-0"
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '14px',
                    padding: '10px 16px',
                  }}
                >
                  {/* Subject filter dropdown */}
                  <div className="relative w-44 shrink-0">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B9B9B] pointer-events-none" />
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="w-full pl-8 pr-7 py-2 bg-white border border-[#e8e4dc] rounded-xl text-xs text-[#564e45] focus:outline-none appearance-none cursor-pointer font-medium"
                    >
                      {subjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub === 'All' ? 'Filter By Subject' : sub}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9B9B9B] pointer-events-none" />
                  </div>

                  {/* Text search input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B9B9B] pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Assignment"
                      className="w-full pl-9 pr-4 py-2 bg-white border border-[#e8e4dc] rounded-xl text-xs text-[#1a1713] placeholder-[#9B9B9B] focus:outline-none focus:border-[#1a1713] font-medium"
                    />
                  </div>

                  <Link
                    href="/assignments/create"
                    className="flex items-center gap-1.5 shrink-0 transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: '#1a1713',
                      color: '#ffffff',
                      borderRadius: '100px',
                      padding: '8px 18px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    <Plus className="w-3 h-3" />
                    Create
                  </Link>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  <AnimatePresence>
                    {filteredAssignments.map((a) => {
                      const status = statusConfig[a.jobStatus] || statusConfig.pending;
                      const isMenuOpen = activeMenuId === a._id;

                      return (
                        <motion.div
                          key={a._id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-3xl p-6 hover:shadow-md transition-all relative flex flex-col justify-between cursor-pointer group"
                          style={{ minHeight: '192px', border: '1px solid #EBEBEB' }}
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <Link href={`/output/${a._id}`} className="flex-1 min-w-0 pr-6">
                                <h3 className="font-bold text-base text-[#1a1713] truncate group-hover:text-[#E8450A] transition-colors leading-tight">
                                  {a.title}
                                </h3>
                                <p className="text-[11px] text-[#9B9B9B] mt-1 font-medium">
                                  {a.subject} · {a.grade}
                                </p>
                              </Link>

                              {/* Per-card context menu */}
                              <div
                                className="relative"
                                ref={activeMenuId === a._id ? menuRef : undefined}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(isMenuOpen ? null : a._id);
                                  }}
                                  className="p-1 rounded-lg hover:bg-[#f4f4f4] text-[#9B9B9B] hover:text-[#1a1713] transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                <AnimatePresence>
                                  {isMenuOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      className="absolute right-0 mt-1 w-36 bg-white border border-[#EBEBEB] rounded-2xl shadow-lg z-20 overflow-hidden font-sans"
                                    >
                                      <Link
                                        href={`/output/${a._id}`}
                                        className="block w-full text-left px-4 py-2.5 text-xs text-[#1a1713] hover:bg-[#f4f4f4] transition-colors font-medium border-b border-[#EBEBEB]"
                                      >
                                        View Assignment
                                      </Link>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(a._id);
                                        }}
                                        className="block w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors font-bold"
                                      >
                                        Delete
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <div className="mt-3">
                              <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                                <span className="w-1.5 h-1.5 bg-current rounded-full" />
                                {status.label}
                              </span>
                            </div>
                          </div>

                          <Link href={`/output/${a._id}`}>
                            <div className="border-t border-[#f4f4f4] pt-4 flex items-center justify-between text-[10px] text-[#9B9B9B] font-mono font-medium leading-none">
                              <div>
                                Assigned on: <span className="text-[#1a1713]">{formatDateString(a.createdAt)}</span>
                              </div>
                              <div>
                                Due: <span className="text-[#1a1713]">{a.dueDate ? formatDateString(a.dueDate) : '--'}</span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden min-h-screen" style={{ background: '#F2F2F2' }}>
        {/* Sticky top bar */}
        <header
          className="flex items-center justify-between px-4 sticky top-0 z-20"
          style={{
            height: '56px',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Logo mark */}
          <div className="flex items-center gap-2">
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
                  transform: 'scale(1.32) translate(2px, 2px)',
                  display: 'block',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '1',
                letterSpacing: '-0.06em',
                color: '#303030',
                display: 'inline-flex',
                alignItems: 'center',
                transform: 'translateY(-3px)', // nudge Bricolage font up to align with logo baseline
              }}
            >
              VedaAI
            </span>
          </div>

          {/* Header quick actions */}
          <div
            className="flex items-center"
            style={{
              height: '36px',
              background: 'rgba(255,255,255,0.90)',
              borderRadius: '100px',
              padding: '0 8px',
              gap: '4px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
            }}
          >
            {/* Notification bell */}
            <button
              className="relative flex items-center justify-center"
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            >
              <Bell style={{ width: '18px', height: '18px', color: '#303030' }} />
              <span
                className="absolute"
                style={{
                  top: '6px', right: '6px',
                  width: '7px', height: '7px',
                  borderRadius: '50%',
                  background: '#E8450A',
                  border: '1.5px solid white',
                }}
              />
            </button>

            {/* Profile avatar */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(255,255,255,0.8)',
              }}
            >
              {/* Generic avatar SVG — swap for a real <img> when user photos are available */}
              <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
                <circle cx="14" cy="11" r="5" fill="rgba(255,255,255,0.7)" />
                <ellipse cx="14" cy="24" rx="9" ry="6" fill="rgba(255,255,255,0.5)" />
              </svg>
            </div>

            {/* Hamburger menu button */}
            <button
              className="flex flex-col items-center justify-center"
              style={{ width: '32px', height: '32px', gap: '4px' }}
            >
              <span style={{ display: 'block', width: '14px', height: '1.5px', background: '#303030', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '14px', height: '1.5px', background: '#303030', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '14px', height: '1.5px', background: '#303030', borderRadius: '2px' }} />
            </button>
          </div>
        </header>

        {/* Mobile content area */}
        <main className="px-4 py-6 pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: '#E8450A' }} />
              <p className="text-sm text-[#9B9B9B]">Fetching active papers...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="mb-6">
                <EmptyStateIllustration />
              </div>
              <h2 className="font-semibold text-[#1a1713] mb-2" style={{ fontSize: '16px' }}>
                No assignments yet
              </h2>
              <p className="mb-8 leading-relaxed max-w-xs" style={{ fontSize: '13px', color: '#6b6b6b' }}>
                Create your first assignment to start collecting and grading student
                submissions. You can set up rubrics, define marking criteria, and let AI assist
                with grading.
              </p>
              <Link
                href="/assignments/create"
                className="flex items-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: '#1a1713',
                  color: '#ffffff',
                  borderRadius: '100px',
                  padding: '13px 26px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Create Your First Assignment
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredAssignments.map((a) => {
                const status = statusConfig[a.jobStatus] || statusConfig.pending;
                return (
                  <Link
                    key={a._id}
                    href={`/output/${a._id}`}
                    className="block bg-white rounded-2xl p-5 shadow-sm"
                    style={{ border: '1px solid #EBEBEB' }}
                  >
                    <h3 className="font-bold text-[#1a1713] truncate" style={{ fontSize: '15px' }}>
                      {a.title}
                    </h3>
                    <p className="text-[11px] text-[#9B9B9B] mt-0.5">{a.subject} · {a.grade}</p>
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 ${status.color}`}>
                      <span className="w-1.5 h-1.5 bg-current rounded-full" />
                      {status.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </main>

        {/* Floating action button */}
        <div className="fixed z-30" style={{ bottom: '82px', right: '16px' }}>
          <Link
            href="/assignments/create"
            className="flex items-center justify-center transition-all active:scale-95 hover:shadow-xl"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3V17M3 10H17" stroke="#E8450A" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        {/* Bottom tab bar */}
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

/* Empty state illustration shown when no assignments exist */
function EmptyStateIllustration() {
  return (
    <svg
      width="160"
      height="140"
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Document base */}
      <rect x="30" y="10" width="72" height="90" rx="6" fill="#E8E8E8" />
      <rect x="30" y="10" width="72" height="90" rx="6" fill="white" stroke="#D9D9D9" strokeWidth="1.5" />
      {/* Document lines */}
      <rect x="42" y="28" width="48" height="5" rx="2.5" fill="#E0E0E0" />
      <rect x="42" y="40" width="36" height="4" rx="2" fill="#EBEBEB" />
      <rect x="42" y="51" width="42" height="4" rx="2" fill="#EBEBEB" />
      <rect x="42" y="62" width="30" height="4" rx="2" fill="#EBEBEB" />

      {/* Magnifying glass */}
      <circle cx="100" cy="82" r="34" fill="white" stroke="#D9D9D9" strokeWidth="1.5" />
      <circle cx="97" cy="79" r="22" fill="#F4F4F4" stroke="#D0D0D0" strokeWidth="2" />

      {/* X inside the lens */}
      <circle cx="97" cy="79" r="12" fill="#FEE2E2" />
      <path d="M91 73L103 85M103 73L91 85" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />

      {/* Handle */}
      <line x1="114" y1="96" x2="126" y2="108" stroke="#C0C0C0" strokeWidth="4" strokeLinecap="round" />

      {/* Accent dots */}
      <circle cx="32" cy="96" r="3" fill="#93C5FD" opacity="0.8" />
      <circle cx="128" cy="52" r="2.5" fill="#93C5FD" opacity="0.8" />

      {/* Sparkle stars */}
      <path d="M124 38 L125.5 34 L127 38 L131 39.5 L127 41 L125.5 45 L124 41 L120 39.5 Z" fill="#FCA5A5" opacity="0.7" />
      <path d="M22 108 L23 105 L24 108 L27 109 L24 110 L23 113 L22 110 L19 109 Z" fill="#93C5FD" opacity="0.6" />
    </svg>
  );
}
