import { getSummaries } from '@/lib/summary/storage/summary.store';

export async function GET() {
  const summaries = getSummaries();
  return Response.json(summaries);
}
