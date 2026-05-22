'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Zap, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a1713] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-display font-semibold text-[#1a1713] text-lg">VedaAI</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/assignments" className="text-sm text-[#564e45] hover:text-[#1a1713] transition-colors">
            My Assignments
          </Link>
          <Link
            href="/assignments/create"
            className="text-sm bg-[#1a1713] text-[#faf8f4] px-4 py-2 rounded-lg hover:bg-[#2a2520] transition-colors font-medium"
          >
            Create Paper
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <Zap className="w-3 h-3" />
            AI-Powered Assessment Generation
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-bold text-[#1a1713] leading-[1.05] mb-6">
            Create exam papers{' '}
            <em className="font-display italic text-amber-600 not-italic" style={{ fontStyle: 'italic' }}>
              in seconds
            </em>
          </h1>

          <p className="text-lg text-[#887e6e] max-w-xl mx-auto mb-10 leading-relaxed">
            Describe your requirements, upload reference material, and let AI generate
            a structured, publication-ready question paper with sections, difficulty tags, and marks.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/assignments/create"
              className="group flex items-center gap-2 bg-[#1a1713] text-[#faf8f4] px-7 py-3.5 rounded-xl font-medium hover:bg-[#2a2520] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Your First Paper
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/assignments"
              className="flex items-center gap-2 border border-[#d0ccc0] text-[#564e45] px-7 py-3.5 rounded-xl font-medium hover:border-[#1a1713] hover:text-[#1a1713] transition-all"
            >
              <BookOpen className="w-4 h-4" />
              View Past Assignments
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full"
        >
          {[
            {
              icon: FileText,
              title: 'Structured Sections',
              desc: 'Automatic Section A, B, C grouping by question type and difficulty',
            },
            {
              icon: Zap,
              title: 'Real-time Generation',
              desc: 'WebSocket-powered live progress as AI builds your question paper',
            },
            {
              icon: Sparkles,
              title: 'Export as PDF',
              desc: 'Download a beautifully formatted, print-ready examination paper',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white border border-[#e8e4dc] rounded-2xl p-6 text-left hover:border-[#d0ccc0] hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-[#f0ece4] rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-[#564e45]" />
              </div>
              <h3 className="font-semibold text-[#1a1713] mb-1.5">{feature.title}</h3>
              <p className="text-sm text-[#887e6e] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-[#b0a999]">
        VedaAI Assessment Creator — Built for educators
      </footer>
    </div>
  );
}
