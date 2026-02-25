import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'summaries.json');

type SummaryMeta = {
  meetingId: string;
  meetingTitle: string;
  date: string;
  pdfPath: string;
  expiresAt: string;
};

export function saveSummaryMeta(meta: SummaryMeta) {
  let data: SummaryMeta[] = [];

  if (fs.existsSync(DATA_PATH)) {
    data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  }

  data.push(meta);

  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export function getSummaries() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}
