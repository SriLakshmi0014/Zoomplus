// lib/summary/summary.utils.ts

type TranscriptItem = {
  text: string;
  timestamp: number;
};

/**
 * Cleans raw transcript data:
 * - removes duplicates
 * - removes short noise words
 * - capitalizes sentences
 */
export function cleanTranscript(
  transcript: TranscriptItem[]
): string[] {
  if (!transcript || transcript.length === 0) return [];

  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const item of transcript) {
    const sentence = item.text.trim().toLowerCase();

    // Ignore very short/noise text
    if (sentence.length < 3) continue;

    // Ignore duplicates
    if (seen.has(sentence)) continue;

    seen.add(sentence);

    // Capitalize first letter
    const formatted =
      sentence.charAt(0).toUpperCase() + sentence.slice(1);

    cleaned.push(formatted);
  }

  return cleaned;
}

/**
 * Converts cleaned sentences into a single paragraph
 */
export function formatTranscriptText(sentences: string[]): string {
  return sentences.map(s => s.endsWith('.') ? s : s + '.').join(' ');
}
