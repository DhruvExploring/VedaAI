'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Loader2, Bell,
  MoreVertical, Search, Filter, X, Home, BookOpen,
  Library, Sparkles, ChevronDown, ArrowLeft
} from 'lucide-react';
import { getAssignments, deleteAssignment } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import EmptyAssignments from '@/components/EmptyAssignments';
import MobileHeader from '@/components/MobileHeader';
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
  const router = useRouter();
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
        style={{ background: '#F2F2F2', position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
      >
        {/* Floating sidebar */}
        <div
          className="shrink-0"
          style={{
            padding: '12px 0 12px 12px',
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100vh',
            zIndex: 10,
          }}
        >
          <Sidebar />
        </div>

        {/* Right-hand panel */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* Top header bar — using shared SearchBar component */}
          <div style={{ position: 'absolute', left: '327px', top: '12px', width: 'calc(100vw - 351px)', zIndex: 10 }}>
            <SearchBar title="Assignments" />
          </div>

          {/* Main content area */}
          <main 
            className="flex flex-col justify-start items-start p-0 gap-3"
            style={{
              position: 'absolute',
              width: 'calc(100vw - 351px)',
              height: 'calc(100vh - 102px)',
              left: '327px',
              top: '90px',
              isolation: 'isolate',
            }}
          >
            {/* Always-visible layout wrapper */}
            <div className="flex flex-col items-start p-0 gap-3 w-full h-full self-stretch">
                
                {/* SECTION 1: Header */}
                <div 
                  className="flex flex-row items-center px-2 gap-4 w-full h-[50px] flex-none self-stretch z-[5]"
                  style={{ isolation: 'isolate' }}
                >
                  {/* Inner Container */}
                  <div className="flex flex-row items-center p-0 gap-3 w-[333px] h-[50px] flex-none">
                    
                    {/* Green Dot (Ellipse 10) */}
                    <span 
                      className="w-3 h-3 rounded-full bg-[#4BC26D] border-[4px] border-[rgba(75,194,109,0.4)] flex-none"
                      style={{
                        boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)'
                      }}
                    />

                    {/* Text Stack */}
                    <div className="flex flex-col justify-center items-start p-0 gap-[2px] w-[301px] h-[50px] flex-none">
                      {/* Assignments Title */}
                      <h1 
                        className="text-[20px] font-bold tracking-[-0.04em] text-[#303030] leading-[140%] flex items-center"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Assignments
                      </h1>
                      {/* Subtext Description */}
                      <p 
                        className="text-[14px] font-normal tracking-[-0.04em] text-[rgba(94,94,94,0.55)] leading-[140%] flex items-center"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Manage and create assignments for your classes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Search & Filter (Default Container) */}
                <div 
                  className="flex flex-row justify-between items-center px-4 gap-9 w-full h-16 bg-white rounded-[20px] flex-none self-stretch z-[4]"
                >
                  {/* Left: Filter By — full-height clickable zone */}
                  <div className="relative flex flex-row items-center h-full gap-2 cursor-pointer group">
                    {/* Invisible native select covering the full bar height for reliable clicks */}
                    <select 
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="absolute inset-y-0 left-0 w-full opacity-0 cursor-pointer z-10"
                      style={{ height: '64px', top: '-22px' }}
                    >
                      {subjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub === 'All' ? 'All Subjects' : sub}
                        </option>
                      ))}
                    </select>
                    {/* Visual label */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                      className={`w-5 h-5 flex-none transition-colors ${filterSubject !== 'All' ? 'text-[#303030]' : 'text-[#A9A9A9]'}`}>
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span 
                      className={`text-[14px] font-bold tracking-[-0.04em] leading-[140%] select-none transition-colors whitespace-nowrap ${
                        filterSubject !== 'All' ? 'text-[#303030]' : 'text-[#A9A9A9]'
                      }`}
                      style={{ fontFamily: 'Bricolage Grotesque' }}
                    >
                      {filterSubject === 'All' ? 'Filter By' : `${filterSubject}`}
                    </span>
                    {/* Active filter clear pill */}
                    {filterSubject !== 'All' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFilterSubject('All'); }}
                        className="relative z-20 flex items-center justify-center w-4 h-4 rounded-full bg-[#303030] text-white hover:bg-[#555] transition-colors flex-none"
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <line x1="1" y1="1" x2="7" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="7" y1="1" x2="1" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Right: Search Box */}
                  <div className="flex flex-row items-center p-0 gap-3 w-[380px] h-[44px] flex-none">
                    <div className="box-border flex flex-row items-center py-[11px] px-4 gap-[10px] w-[380px] h-[44px] bg-white border border-[rgba(0,0,0,0.2)] rounded-[100px] flex-none grow focus-within:border-[#303030] transition-colors">
                      {/* Search Icon */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-none text-[#A9A9A9] flex-shrink-0">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      {/* Search Input Field */}
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Assignment"
                        className="flex-1 min-w-0 bg-transparent border-none text-[14px] font-medium text-[#303030] placeholder-[#A9A9A9] tracking-[-0.04em] focus:outline-none"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      />
                      {/* Clear button — shown only when typing */}
                      {searchQuery.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A9A9A9] text-white hover:bg-[#303030] transition-colors flex-shrink-0"
                        >
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <line x1="1" y1="1" x2="7" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="7" y1="1" x2="1" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Cards Grid Container */}
                <div 
                  className="flex-1 w-full overflow-y-auto pb-24"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <style dangerouslySetInnerHTML={{ __html: `
                    ::-webkit-scrollbar { display: none !important; }
                  ` }} />

                  {/* State 1: Loading */}
                  {loading && (
                    <div className="w-full flex flex-col items-center justify-center py-24">
                      <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: '#E8450A' }} />
                      <p className="text-sm font-semibold text-[#9B9B9B]" style={{ fontFamily: 'Bricolage Grotesque' }}>Fetching active papers...</p>
                    </div>
                  )}

                  {/* State 2: No assignments at all (true empty state) */}
                  {!loading && assignments.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="w-full flex flex-col justify-center items-center py-24"
                    >
                      <EmptyAssignments />
                    </motion.div>
                  )}

                  {/* State 3: Search/filter returned no results */}
                  {!loading && assignments.length > 0 && filteredAssignments.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full flex flex-col items-center justify-center py-24 gap-3"
                    >
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C8C8C8]">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p
                        className="text-[16px] font-bold tracking-[-0.04em] text-[#9B9B9B]"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        No results found
                      </p>
                      <p
                        className="text-[13px] font-normal tracking-[-0.02em] text-[#C8C8C8]"
                        style={{ fontFamily: 'Bricolage Grotesque' }}
                      >
                        Try a different search term or clear the filter
                      </p>
                    </motion.div>
                  )}

                  {/* State 4: Cards grid */}
                  {!loading && filteredAssignments.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <AnimatePresence>
                        {filteredAssignments.map((a) => {
                          const isMenuOpen = activeMenuId === a._id;

                          return (
                            <motion.div
                              key={a._id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                              className="box-border flex flex-col justify-center items-start p-6 w-full h-[162px] bg-white rounded-[24px] flex-none relative border border-[#EBEBEB] hover:shadow-sm transition-all group"
                            >
                              {/* 3-dot menu — absolute top-right of card (not in title row) */}
                              <div 
                                className="absolute top-6 right-6 z-10"
                                ref={activeMenuId === a._id ? menuRef : undefined}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(isMenuOpen ? null : a._id);
                                  }}
                                  className="w-6 h-6 flex items-center justify-center text-[#A9A9A9] hover:text-[#303030] transition-colors focus:outline-none"
                                >
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                                  </svg>
                                </button>

                                {/* Action Dropdown Menu */}
                                <AnimatePresence>
                                  {isMenuOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                      className="absolute right-0 mt-2 w-[140px] bg-white rounded-[16px] shadow-[0px_16px_48px_rgba(0,0,0,0.2),0px_32px_48px_rgba(0,0,0,0.05)] p-2 gap-1 flex flex-col z-20 border border-[#F6F6F6]"
                                      style={{ top: '30px' }}
                                    >
                                      <Link
                                        href={`/output/${a._id}`}
                                        onClick={() => setActiveMenuId(null)}
                                        className="flex flex-row items-center px-2 gap-[10px] w-full h-8 rounded-[8px] hover:bg-[#F6F6F6] transition-colors"
                                      >
                                        <span
                                          className="text-[14px] font-medium leading-[140%] tracking-[-0.04em] text-[#303030]"
                                          style={{ fontFamily: 'Bricolage Grotesque' }}
                                        >
                                          View Assignment
                                        </span>
                                      </Link>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(a._id);
                                        }}
                                        className="flex flex-row items-center px-2 gap-[10px] w-full h-8 rounded-[8px] bg-[#F6F6F6] hover:bg-red-50 transition-colors text-left"
                                      >
                                        <span
                                          className="text-[14px] font-medium leading-[140%] tracking-[-0.04em] text-[#C53535]"
                                          style={{ fontFamily: 'Bricolage Grotesque' }}
                                        >
                                          Delete
                                        </span>
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Inner Card Content Stack */}
                              <div className="flex flex-col justify-between items-start p-0 gap-10 w-full h-[114px] flex-none self-stretch">
                                
                                {/* Title — full width */}
                                <div className="flex flex-col items-start p-0 gap-1 w-full h-[29px] flex-none self-stretch pr-8">
                                  <Link 
                                    href={`/output/${a._id}`}
                                    className="w-full h-[29px] flex items-center group-hover:opacity-95 transition-all overflow-hidden"
                                  >
                                    <h2
                                      className="w-full h-[29px] font-extrabold text-[24px] leading-[120%] tracking-[-0.04em] text-[#303030] overflow-hidden text-ellipsis whitespace-nowrap"
                                      style={{ fontFamily: 'Bricolage Grotesque' }}
                                    >
                                      {a.title}
                                    </h2>
                                  </Link>
                                </div>

                                {/* Bottom Dates Row */}
                                <div className="flex flex-row justify-between items-center p-0 gap-6 w-full h-[19px] flex-none self-stretch">
                                  <div className="flex flex-row justify-between items-center p-0 gap-[10px] w-full h-[19px] flex-none grow">
                                    <div className="flex flex-row items-center p-0 gap-[11px] flex-none text-[#303030]">
                                      <span
                                        className="font-bold text-[16px] leading-[120%] tracking-[-0.04em] whitespace-nowrap"
                                        style={{ fontFamily: 'Bricolage Grotesque' }}
                                      >
                                        Assigned on : {formatDateString(a.createdAt)}
                                      </span>
                                    </div>
                                    <div className="flex flex-row items-center p-0 gap-[11px] flex-none text-[#303030]">
                                      <span
                                        className="font-bold text-[16px] leading-[120%] tracking-[-0.04em] whitespace-nowrap"
                                        style={{ fontFamily: 'Bricolage Grotesque' }}
                                      >
                                        Due : {a.dueDate ? formatDateString(a.dueDate) : '--'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}

                </div>
              </div>
            </main>
        </div>

        {/* SECTION 4: Frosted Persistent Bottom Bar */}
        <div
          className="absolute bottom-0 left-[315px] h-[73px] flex flex-col justify-center items-center py-[10px] px-0 gap-[10px] z-[8]"
          style={{
            width: 'calc(100vw - 315px)',
            background: 'linear-gradient(176.12deg, rgba(234, 234, 234, 0) 3.17%, rgba(218, 218, 218, 0.85) 81.22%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Primary Button - Dark ("Create Assignment" Pill) */}
          <Link
            href="/assignments/create"
            className="box-border flex flex-row items-center py-3 px-6 gap-1 w-[208px] h-[46px] bg-[#181818] rounded-[48px] justify-center hover:bg-[#2B2B2B] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            {/* Plus Icon */}
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5 flex-none text-white"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {/* Create Assignment Text */}
            <span
              className="text-[16px] font-medium leading-[140%] tracking-[-0.04em] text-white select-none"
              style={{ fontFamily: 'Bricolage Grotesque' }}
            >
              Create Assignment
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden min-h-screen pb-28" style={{ background: '#cecece' }}>
        {/* Sticky premium top floating header */}
        <MobileHeader />

        {/* Centered Mobile Page Header with circular back button */}
        <div className="relative w-full px-4 py-3 flex items-center justify-between no-print mt-1">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.40)] text-[#303030] active:scale-95 transition-all focus:outline-none"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h1 
            className="absolute left-1/2 transform -translate-x-1/2 text-[18px] font-extrabold tracking-[-0.04em] text-[#303030] leading-[120%]"
            style={{ fontFamily: 'Bricolage Grotesque' }}
          >
            Assignments
          </h1>
          {/* Right hidden balance spacer */}
          <div className="w-10 h-10 flex-none" />
        </div>

        {/* Mobile Search and Filter Unified Bar */}
        {assignments.length > 0 && (
          <div className="w-full px-4 py-3 flex justify-center z-10 relative">
            {/* Unified container */}
            <div
              className="flex flex-row justify-between items-center bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.04)]"
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0px 16px',
                width: '373px',
                maxWidth: 'calc(100vw - 32px)',
                height: '64px',
                background: '#FFFFFF',
                borderRadius: '16px',
              }}
            >
              {/* Left Option: Filter Section */}
              <div 
                className="relative flex flex-row items-center cursor-pointer select-none"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '0px',
                  gap: '4px',
                  width: '55px',
                  height: '20px',
                }}
              >
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub === 'All' ? 'All Subjects' : sub}
                    </option>
                  ))}
                </select>

                {/* Filter Icon & Label */}
                <div className="flex flex-row items-center gap-1">
                  <Filter 
                    size={20} 
                    className="text-[#A9A9A9]"
                    style={{
                      width: '20px',
                      height: '20px',
                    }} 
                  />
                  <span
                    style={{
                      width: '31px',
                      height: '20px',
                      fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '140%',
                      display: 'flex',
                      alignItems: 'center',
                      letterSpacing: '-0.04em',
                      color: '#A9A9A9',
                    }}
                  >
                    {filterSubject === 'All' ? 'Filter' : filterSubject.slice(0, 5)}
                  </span>
                </div>
              </div>

              {/* Right Option: Search Pill */}
              <div
                className="box-border flex flex-row items-center py-[11px] px-4 gap-[10px] bg-white border border-[rgba(0,0,0,0.2)] rounded-[100px]"
                style={{
                  width: '228px',
                  height: '44px',
                }}
              >
                {/* icon_line/Search */}
                <Search 
                  size={20} 
                  className="text-[#A9A9A9]"
                  style={{
                    width: '20px',
                    height: '20px',
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Name"
                  className="flex-1 min-w-0 bg-transparent border-none text-[14px] font-normal text-[#303030] placeholder-[#A9A9A9] tracking-[-0.04em] focus:outline-none"
                  style={{
                    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                    lineHeight: '140%',
                  }}
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="flex items-center justify-center w-4 h-4 rounded-full bg-[#A9A9A9] text-white hover:bg-[#303030] transition-colors flex-shrink-0"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile main content area */}
        <main className="px-4 py-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: '#E8450A' }} />
              <p className="text-sm font-semibold text-[#9B9B9B]" style={{ fontFamily: 'Bricolage Grotesque' }}>Fetching active papers...</p>
            </div>
          ) : assignments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center py-6"
            >
              <EmptyAssignments />
            </motion.div>
          ) : filteredAssignments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center justify-center py-16 gap-3"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C8C8C8]">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p
                className="text-[15px] font-bold tracking-[-0.03em] text-[#9B9B9B]"
                style={{ fontFamily: 'Bricolage Grotesque' }}
              >
                No results found
              </p>
              <p
                className="text-[12px] font-medium tracking-[-0.02em] text-[#C8C8C8]"
                style={{ fontFamily: 'Bricolage Grotesque' }}
              >
                Try a different search term or clear the filter
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4 items-center w-full">
              <AnimatePresence>
                {filteredAssignments.map((a) => {
                  const isMenuOpen = activeMenuId === a._id;

                  return (
                    <motion.div
                      key={a._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        padding: '20px',
                        gap: '24px',
                        width: '373px',
                        maxWidth: '100%',
                        height: '116px',
                        background: 'rgba(255, 255, 255, 0.75)',
                        borderRadius: '24px',
                      }}
                      className="relative border border-[rgba(255,255,255,0.4)] shadow-[0px_4px_16px_rgba(0,0,0,0.02)] backdrop-blur-md"
                    >
                      {/* Header Title & Action Dropdown Menu */}
                      <div 
                        className="flex flex-row justify-between items-center w-full gap-[39px]"
                        style={{ height: '25px' }}
                      >
                        {/* Assignment Title */}
                        <Link 
                          href={`/output/${a._id}`}
                          className="flex-1 min-w-0"
                        >
                          <h3 
                            className="font-bold text-[18px] leading-[140%] text-[#303030] tracking-[-0.04em] overflow-hidden text-ellipsis whitespace-nowrap"
                            style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}
                          >
                            {a.title}
                          </h3>
                        </Link>

                        {/* Action 3-dots Menu Button */}
                        <div 
                          className="relative flex-none"
                          ref={activeMenuId === a._id ? menuRef : undefined}
                          style={{ width: '24px', height: '24px' }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : a._id);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-[#000000] hover:bg-[rgba(0,0,0,0.05)] transition-colors focus:outline-none rounded-full"
                          >
                            <MoreVertical size={20} className="stroke-[2.5]" />
                          </button>

                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-0 mt-1.5 w-[140px] bg-white rounded-[16px] shadow-[0px_12px_36px_rgba(0,0,0,0.15)] p-1.5 gap-0.5 flex flex-col z-20 border border-[#F2F2F2]"
                              >
                                <Link
                                  href={`/output/${a._id}`}
                                  onClick={() => setActiveMenuId(null)}
                                  className="flex flex-row items-center px-2.5 h-9 rounded-[8px] hover:bg-[#F6F6F6] transition-colors text-left"
                                >
                                  <span
                                    className="text-[13px] font-semibold tracking-[-0.03em] text-[#303030]"
                                    style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}
                                  >
                                    View Paper
                                  </span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(a._id);
                                  }}
                                  className="flex flex-row items-center px-2.5 h-9 rounded-[8px] bg-red-50 hover:bg-red-100 transition-colors text-left"
                                >
                                  <span
                                    className="text-[13px] font-semibold tracking-[-0.03em] text-[#C53535]"
                                    style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}
                                  >
                                    Delete
                                  </span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Date Metadata Row */}
                      <div
                        className="flex flex-row items-center w-full gap-[10px] whitespace-nowrap"
                        style={{ height: '19px' }}
                      >

                        <div 
                          className="flex flex-row items-center gap-[4px]"
                          style={{
                            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                            fontSize: '13px',
                            fontWeight: 800,
                            letterSpacing: '-0.04em',
                          }}
                        >
                          <span className="text-[#303030]">Assigned on : </span>
                          <span className="text-[#8E8E93] font-medium">{formatDateString(a.createdAt)}</span>
                        </div>


                        <div 
                          className="flex flex-row items-center gap-[4px]"
                          style={{
                            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                            fontSize: '13px',
                            fontWeight: 800,
                            letterSpacing: '-0.04em',
                          }}
                        >
                          <span className="text-[#303030]">Due : </span>
                          <span className="text-[#8E8E93] font-medium">{a.dueDate ? formatDateString(a.dueDate) : '--'}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* Lower action bar holding the plus action button */}
        <div 
          className="fixed left-0 right-0 z-30 flex justify-center no-print"
          style={{ bottom: '88px' }}
        >
          <div
            className="flex flex-row justify-end items-center"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: '0px',
              gap: '10px',
              width: '373px',
              maxWidth: 'calc(100vw - 32px)',
              height: '48px',
            }}
          >
            {/* Plus Action Button */}
            <Link
              href="/assignments/create"
              className="flex flex-row justify-center items-center cursor-pointer transition-all active:scale-95 hover:scale-105"
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0px',
                gap: '10px',
                width: '48px',
                height: '48px',
                background: '#FFFFFF',
                boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)',
                borderRadius: '100px',
              }}
            >
              {/* Custom SVG Plus Icon styled to match Group 33489 and Vector 5/6 */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  width: '20px',
                  height: '20px',
                  flex: 'none',
                  order: 0,
                  flexGrow: 0,
                }}
              >
                {/* Vector 5 (Horizontal Stroke) */}
                <line
                  x1="3"
                  y1="12"
                  x2="21"
                  y2="12"
                  stroke="#FF5623"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Vector 6 (Vertical Stroke) */}
                <line
                  x1="12"
                  y1="3"
                  x2="12"
                  y2="21"
                  stroke="#FF5623"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
          </div>
        </div>

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
    </>
  );
}

