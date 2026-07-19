const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs/promises');
const path = require('path');

/**
 * Attendance Form generation (Coordinator-owned). The PDF is written to the
 * server filesystem; MongoDB stores ONLY a reference + metadata on
 * trainings.attendanceForm — never the binary.
 */
const STORAGE_DIR = path.resolve(process.cwd(), 'storage', 'documents');

async function ensureDir() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Generate + persist the Attendance Form; returns the stored reference. */
async function generateAttendanceForm(training, student, generatedBy = 'system') {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const left = 56;
  let y = 786;
  const line = (text, opts = {}) => {
    page.drawText(String(text), {
      x: left,
      y,
      size: opts.heading ? 13 : 10.5,
      font: opts.heading ? bold : font,
      color: rgb(0.13, 0.13, 0.13),
    });
    y -= opts.heading ? 24 : 18;
  };

  page.drawText('Parul University', { x: left, y, size: 18, font: bold, color: rgb(0.11, 0.18, 0.45) });
  y -= 22;
  page.drawText('Training Attendance Form', { x: left, y, size: 12, font, color: rgb(0.35, 0.35, 0.35) });
  y -= 34;

  line('Trainee', { heading: true });
  line(`Name: ${(student && (student.studentName || student.name)) || '—'}`);
  line(`Enrollment No: ${(student && student.enrollmentNumber) || '—'}`);
  line('');
  line('Training', { heading: true });
  line(`Module: ${training.trainingModule || '—'}`);
  line(`Mentor: ${training.mentorName || '—'}`);
  line(`Location: ${training.reportingLocation || '—'}`);
  line(`Start: ${fmtDate(training.joiningDate || training.startDate)}`);
  line(`Reporting Time: ${training.reportingTime || '—'}`);
  line(`Duration: ${training.duration || '—'}`);
  y -= 8;
  line('Attendance Record', { heading: true });
  page.drawText('Date            Session            Signature', { x: left, y, size: 10, font: bold });
  y -= 8;
  for (let i = 0; i < 12 && y > 60; i++) {
    y -= 22;
    page.drawLine({ start: { x: left, y }, end: { x: 540, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  }

  const bytes = await pdf.save();
  await ensureDir();
  const fileName = `attendance_${training.id}.pdf`;
  await fs.writeFile(path.join(STORAGE_DIR, fileName), bytes);

  return {
    fileName,
    storagePath: fileName,
    mimeType: 'application/pdf',
    sizeBytes: bytes.length,
    generatedAt: new Date().toISOString(),
    generatedBy,
  };
}

async function readDocument(ref) {
  return fs.readFile(path.join(STORAGE_DIR, ref.storagePath));
}

module.exports = { generateAttendanceForm, readDocument, STORAGE_DIR };
