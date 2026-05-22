import jsPDF from 'jspdf';
import { GeneratedPaper, Question } from '@/types';

interface StudentInfo {
  studentName?: string;
  rollNo?: string;
  section?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Wrap text and return the new Y position after printing. */
function printWrapped(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

/** Check if we need a new page; if so add one and reset y. */
function checkPageBreak(doc: jsPDF, y: number, needed: number, margin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - margin) {
    doc.addPage();
    return margin + 10;
  }
  return y;
}

// ─── Main export ────────────────────────────────────────────────────────────

export function downloadPaperAsPDF(paper: GeneratedPaper, studentInfo: StudentInfo = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth  = doc.internal.pageSize.getWidth();   // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight();  // 297 mm
  const margin     = 22;   // left / right margin
  const contentW   = pageWidth - margin * 2;

  // ── All text is black, no fills, no strokes ──────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);

  // ── Use Times-Roman for that classic exam-paper feel ─────────────────────
  const BOLD   = 'times' as const;
  const NORMAL = 'times' as const;

  let y = margin;

  // ── 1. School name (centered, bold, 14pt) ───────────────────────────────
  doc.setFont(BOLD, 'bold');
  doc.setFontSize(14);
  doc.text('Delhi Public School, Sector-4, Bokaro', pageWidth / 2, y, { align: 'center' });
  y += 7;

  // ── 2. Paper title (centered, bold, 13pt) ────────────────────────────────
  doc.setFont(BOLD, 'bold');
  doc.setFontSize(13);
  doc.text(paper.title || 'Question Paper', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // ── 3. Subject / Class line (centered, normal, 11pt) ─────────────────────
  doc.setFont(NORMAL, 'normal');
  doc.setFontSize(11);
  doc.text(`Subject: ${paper.subject}          Class: ${paper.grade}`, pageWidth / 2, y, { align: 'center' });
  y += 6;

  // ── 4. Time / Marks line (left-right, normal, 10pt) ──────────────────────
  doc.setFont(NORMAL, 'normal');
  doc.setFontSize(10);
  doc.text(`Time Allowed: ${paper.duration} minutes`, margin, y);
  doc.text(`Maximum Marks: ${paper.totalMarks}`, pageWidth - margin, y, { align: 'right' });
  y += 5;

  // ── 5. Horizontal rule under header ──────────────────────────────────────
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ── 6. Compulsory notice (bold, 10pt) ────────────────────────────────────
  doc.setFont(BOLD, 'bold');
  doc.setFontSize(10);
  doc.text('All questions are compulsory unless stated otherwise.', margin, y);
  y += 6;

  // ── 7. Student details — MS Word blank-line style ────────────────────────
  doc.setFont(NORMAL, 'normal');
  doc.setFontSize(10);

  const nameVal   = studentInfo.studentName  ? studentInfo.studentName  : '';
  const rollVal   = studentInfo.rollNo       ? studentInfo.rollNo       : '';
  const secVal    = studentInfo.section      ? studentInfo.section      : '';

  // Three columns on one row: Name | Roll No. | Section
  const col1X = margin;
  const col2X = margin + contentW * 0.42;
  const col3X = margin + contentW * 0.72;
  const lineY  = y + 5;  // underline y

  doc.text('Name:', col1X, y);
  doc.line(col1X + 13, lineY, col2X - 6, lineY);   // underline for name
  if (nameVal) doc.text(nameVal, col1X + 14, y);

  doc.text('Roll No.:', col2X, y);
  doc.line(col2X + 18, lineY, col3X - 6, lineY);
  if (rollVal) doc.text(rollVal, col2X + 19, y);

  doc.text('Section:', col3X, y);
  doc.line(col3X + 17, lineY, pageWidth - margin, lineY);
  if (secVal) doc.text(secVal, col3X + 18, y);

  y += 10;

  // ── 8. Thin rule under student details ───────────────────────────────────
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ── 9. General Instructions (plain text, no box) ─────────────────────────
  doc.setFont(BOLD, 'bold');
  doc.setFontSize(10);
  doc.text('General Instructions:', margin, y);
  y += 5;

  doc.setFont(NORMAL, 'normal');
  doc.setFontSize(10);
  const instructions = [
    '(i)   Ensure the paper contains all pages before beginning.',
    '(ii)  All answers must be written neatly on the provided answer sheets.',
    '(iii) Write question numbers clearly in the margin before each answer.',
  ];
  instructions.forEach((instr) => {
    doc.text(instr, margin + 3, y);
    y += 5;
  });

  y += 3;
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // ── 10. Sections & Questions ─────────────────────────────────────────────
  paper.sections.forEach((sec, sIdx) => {
    y = checkPageBreak(doc, y, 20, margin);

    // Section title line — bold, 11pt
    doc.setFont(BOLD, 'bold');
    doc.setFontSize(11);
    const sectionLabel = `${sec.title}`;
    doc.text(sectionLabel, margin, y);
    doc.text(`[${sec.totalMarks} Marks]`, pageWidth - margin, y, { align: 'right' });
    y += 4;

    // Section rule
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    // Section instruction (italic, 9pt)
    if (sec.instruction) {
      doc.setFont(NORMAL, 'italic');
      doc.setFontSize(9);
      y = printWrapped(doc, sec.instruction, margin, y, contentW, 4.5);
      y += 3;
    }

    // Questions
    sec.questions.forEach((q: Question, qIdx: number) => {
      y = checkPageBreak(doc, y, 18, margin);

      const num = `${qIdx + 1}.`;

      // Question text — normal 10pt
      doc.setFont(NORMAL, 'normal');
      doc.setFontSize(10);

      // Number
      doc.setFont(BOLD, 'bold');
      doc.text(num, margin, y);

      // Question text (indented, with marks at right)
      doc.setFont(NORMAL, 'normal');
      const diffLabel = q.difficulty ? (q.difficulty === 'easy' ? 'Low' : q.difficulty === 'medium' ? 'Moderate' : 'High') : '';
      const marksText = `[${q.marks} mark${q.marks !== 1 ? 's' : ''}${diffLabel ? ' | ' + diffLabel : ''}]`;
      const textMaxW  = contentW - 14;  // leave room for number + marks
      const qLines    = doc.splitTextToSize(q.text, textMaxW - 18);
      doc.text(qLines, margin + 8, y);
      // Marks right-aligned on first line
      doc.text(marksText, pageWidth - margin, y, { align: 'right' });
      y += qLines.length * 5 + 1;

      // ── MCQ options ──
      if (q.type === 'mcq' && q.options) {
        doc.setFontSize(10);
        doc.setFont(NORMAL, 'normal');
        const half = Math.ceil(q.options.length / 2);
        // Two columns
        q.options.forEach((opt, i) => {
          const col = i < half ? 0 : 1;
          const row = i < half ? i : i - half;
          const optX = margin + 10 + col * (contentW / 2);
          const optY = y + row * 5.5;
          y = checkPageBreak(doc, optY, 6, margin);
          doc.text(`${String.fromCharCode(65 + i)})  ${opt}`, optX, optY);
        });
        y += Math.ceil(q.options.length / 2) * 5.5 + 2;
      }

      // ── True / False ──
      if (q.type === 'truefalse') {
        doc.setFontSize(10);
        doc.setFont(NORMAL, 'normal');
        doc.text('(a)  True                    (b)  False', margin + 10, y);
        y += 6;
      }

      y += 3; // gap between questions
    });

    y += 6; // gap between sections
  });

  // ── 11. End of paper line ────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 12, margin);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setFont(BOLD, 'bold');
  doc.setFontSize(10);
  doc.text('*** End of Question Paper ***', pageWidth / 2, y, { align: 'center' });

  // ── 12. Page footer ──────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setFont(NORMAL, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Page ${pg} of ${totalPages}   |   Generated by VedaAI`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0); // reset
  }

  doc.save(`${paper.title.replace(/\s+/g, '_')}_${paper.subject}.pdf`);
}
