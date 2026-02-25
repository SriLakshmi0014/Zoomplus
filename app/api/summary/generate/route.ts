export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { generateSummaryFromTranscript } from '@/lib/summary/summary.service';
import { generateSummaryPdf } from '@/lib/summary/pdf.service';
import { saveSummaryMeta } from '@/lib/summary/storage/summary.store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcript, meetingTitle, meetingId } = body;

    // 🔒 STRICT VALIDATION — NO RANDOM IDS EVER
    if (!transcript || !meetingId) {
      return NextResponse.json(
        { error: 'transcript and meetingId are required' },
        { status: 400 }
      );
    }

    // 🧠 Generate summary text
    const summary = generateSummaryFromTranscript(transcript);

const pdfBytes = await generateSummaryPdf({
  title: meetingTitle || 'Class Transcript',
  date: new Date().toLocaleDateString(),
  fullText: transcript,   // ✅ FULL TRANSCRIPT
  summary,                // ✅ OPTIONAL SUMMARY
});

    // 📁 Save PDF using REAL meetingId
    const pdfDir = path.join(process.cwd(), 'public', 'summaries');
    const fileName = `${meetingId}.pdf`;
    const pdfPath = path.join(pdfDir, fileName);

    fs.mkdirSync(pdfDir, { recursive: true });
    fs.writeFileSync(pdfPath, pdfBytes);

    // 🗂 Save metadata with SAME meetingId
    saveSummaryMeta({
      meetingId, // ✅ STREAM CALL ID
      meetingTitle: meetingTitle || 'Meeting Summary',
      date: new Date().toISOString(),
      pdfPath: `/summaries/${fileName}`,
      expiresAt: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

    return NextResponse.json({
      success: true,
      meetingId,
      pdfPath: `/summaries/${fileName}`,
    });
  } catch (error) {
    console.error('SUMMARY GENERATION ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
console.log('SUMMARY FILE PATH:', process.cwd() + '/data/summaries.json');
