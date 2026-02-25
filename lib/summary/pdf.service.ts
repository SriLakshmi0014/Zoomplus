import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type PdfInput = {
  title: string;
  date: string;
  fullText: string;
  summary?: string;
};

export async function generateSummaryPdf({
  title,
  date,
  fullText,
  summary,
}: PdfInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]);
  let y = 800;

  const addPageIfNeeded = () => {
    if (y < 60) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }
  };

  // Title
  page.drawText(title, { x: 50, y, size: 20, font: boldFont });
  y -= 30;

  // Date
  page.drawText(`Date: ${date}`, { x: 50, y, size: 12, font });
  y -= 40;

  // Optional summary section
  if (summary) {
    page.drawText('Summary:', {
      x: 50,
      y,
      size: 14,
      font: boldFont,
    });
    y -= 20;

    for (const line of summary.split('\n')) {
      addPageIfNeeded();
      page.drawText(line, {
        x: 50,
        y,
        size: 12,
        font,
        maxWidth: 500,
      });
      y -= 18;
    }

    y -= 30;
  }

  // FULL TRANSCRIPT
  page.drawText('Full Lecture Transcript:', {
    x: 50,
    y,
    size: 14,
    font: boldFont,
  });
  y -= 20;

  for (const line of fullText.split('\n')) {
    addPageIfNeeded();
    page.drawText(line, {
      x: 50,
      y,
      size: 12,
      font,
      maxWidth: 500,
      lineHeight: 16,
    });
    y -= 18;
  }

  return await pdfDoc.save();
}
