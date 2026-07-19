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

/**
 * Build the "INTERNSHIP TRAINING APPLICATION" letter as a PDF, filled with the
 * student's details. Generated on-the-fly (not stored) — always reflects the
 * current data. Layout mirrors the official form: centered underlined title,
 * To/Subject/Respected block, two filled body paragraphs (justified), fixed
 * assurance paragraphs, signature row, and a FOR OFFICE USE ONLY section.
 * Returns the raw PDF bytes.
 */
async function buildTrainingApplicationForm(data = {}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const PW = 595.28;
  const LEFT = 64;
  const RIGHT = 64;
  const MAXW = PW - LEFT - RIGHT;
  const ink = rgb(0.1, 0.1, 0.1);
  let y = 800;

  const widthOf = (t, f, s) => f.widthOfTextAtSize(String(t), s);

  const titleCentered = (text, size) => {
    const w = widthOf(text, bold, size);
    const x = (PW - w) / 2;
    page.drawText(text, { x, y, size, font: bold, color: ink });
    page.drawLine({ start: { x, y: y - 3 }, end: { x: x + w, y: y - 3 }, thickness: 1, color: ink });
    y -= size + 20;
  };

  const drawLine = (text, opts = {}) => {
    const size = opts.size || 11.5;
    page.drawText(String(text), { x: opts.x || LEFT, y, size, font: opts.bold ? bold : font, color: ink });
    y -= size + (opts.leading != null ? opts.leading : 6);
  };

  // Justified, word-wrapped paragraph from mixed bold/normal segments.
  const paragraph = (segments, opts = {}) => {
    const size = opts.size != null ? opts.size : 11.5;
    const justify = opts.justify !== false;
    const leading = opts.leading != null ? opts.leading : 7;
    const spaceW = widthOf(' ', font, size);
    const words = [];
    for (const seg of segments) {
      String(seg.text)
        .split(/\s+/)
        .filter(Boolean)
        .forEach((t) => words.push({ text: t, bold: !!seg.bold, w: widthOf(t, seg.bold ? bold : font, size) }));
    }
    const lineWidth = (arr) => arr.reduce((a, w) => a + w.w, 0) + spaceW * Math.max(0, arr.length - 1);
    let line = [];
    const flush = (isLast) => {
      if (!line.length) return;
      const natural = lineWidth(line);
      const extra = justify && !isLast && line.length > 1 ? Math.max(0, (MAXW - natural) / (line.length - 1)) : 0;
      let x = LEFT;
      line.forEach((w) => {
        page.drawText(w.text, { x, y, size, font: w.bold ? bold : font, color: ink });
        x += w.w + spaceW + extra;
      });
      y -= size + leading;
      line = [];
    };
    for (const wd of words) {
      if (lineWidth([...line, wd]) > MAXW && line.length) flush(false);
      line.push(wd);
    }
    flush(true);
    y -= opts.gap != null ? opts.gap : 6;
  };

  const V = (v) => (v == null || String(v).trim() === '' ? '—' : String(v));

  titleCentered('INTERNSHIP TRAINING APPLICATION', 14);
  y -= 6;

  drawLine('To,', { bold: true });
  y -= 44; // blank space for the addressed authority

  paragraph(
    [{ text: 'Subject: ', bold: true }, { text: 'Request for Approval of Internship Training Period and Attendance', bold: true }],
    { justify: false, gap: 12 },
  );

  drawLine('Respected Sir/Madam,', { bold: true, leading: 12 });

  paragraph(
    [
      { text: 'I, Mr./Ms. ' }, { text: V(data.name), bold: true },
      { text: ', Enrollment No. ' }, { text: V(data.enrollmentNumber), bold: true },
      { text: ', student of ' }, { text: V(data.program), bold: true },
      { text: ', Semester ' }, { text: V(data.semester), bold: true },
      { text: ', hereby inform that I am currently undergoing an internship at ' }, { text: V(data.internshipAt), bold: true },
      { text: '.' },
    ],
    { gap: 12 },
  );

  paragraph(
    [
      { text: 'I request you to kindly grant permission and approve my internship training period from ' },
      { text: V(data.fromDate), bold: true }, { text: ' to ' }, { text: V(data.toDate), bold: true },
      { text: '. I also request you to kindly approve my attendance for the above-mentioned internship period.' },
    ],
    { gap: 12 },
  );

  paragraph(
    [{ text: 'I assure you that I shall abide by all the rules and regulations of the institute and will submit all required documents related to the internship upon completion.' }],
    { gap: 12 },
  );

  paragraph([{ text: 'Kindly consider my request and do the needful.' }], { justify: false, gap: 14 });

  drawLine('Thanking You.', { leading: 10 });
  drawLine('Yours faithfully,');
  y -= 50; // signature space

  page.drawText('Signature of Student', { x: LEFT, y, size: 11.5, font: bold, color: ink });
  const sra = 'Signature of Reporting Authority';
  page.drawText(sra, { x: PW - RIGHT - widthOf(sra, bold, 11.5), y, size: 11.5, font: bold, color: ink });
  y -= 28;

  page.drawLine({ start: { x: LEFT, y }, end: { x: PW - RIGHT, y }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });
  y -= 28;

  drawLine('FOR OFFICE USE ONLY', { bold: true, size: 13, leading: 12 });
  drawLine('Recommended / Not Recommended', { bold: true, leading: 14 });

  const rLabel = 'Remarks: ';
  page.drawText(rLabel, { x: LEFT, y, size: 11.5, font: bold, color: ink });
  const rx = LEFT + widthOf(rLabel, bold, 11.5);
  page.drawLine({ start: { x: rx, y: y - 2 }, end: { x: PW - RIGHT, y: y - 2 }, thickness: 0.6, color: rgb(0.5, 0.5, 0.5) });
  y -= 44;

  drawLine('Internship Cell', { bold: true });

  return pdf.save();
}

async function readDocument(ref) {
  return fs.readFile(path.join(STORAGE_DIR, ref.storagePath));
}

module.exports = { generateAttendanceForm, buildTrainingApplicationForm, readDocument, STORAGE_DIR, fmtDate };
