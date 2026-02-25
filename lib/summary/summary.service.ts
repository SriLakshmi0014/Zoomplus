// lib/summary/summary.service.ts

import { cleanTranscript, formatTranscriptText } from './summary.utils';

type TranscriptItem = {
  text: string;
  timestamp: number;
};

/**
 * Step 2:
 * Prepares transcript for summarization
 */
export function prepareTranscriptForSummary(
  transcript: TranscriptItem[]
): string {
  const cleaned = cleanTranscript(transcript);
  return formatTranscriptText(cleaned);
}

/**
 * Step 3:
 * Generates short meaningful summary
 */
export function generateSummaryFromTranscript(text: string): string {
  if (!text) return '';

  const sentences = text
    .split('.')
    .map(s => s.trim())
    .filter(Boolean);

  const importantKeywords = [
    'learn',
    'topic',
    'important',
    'definition',
    'means',
    'process',
    'system',
    'example',
    'today',
    'we will',
  ];

  const importantSentences = sentences.filter(sentence =>
    importantKeywords.some(keyword =>
      sentence.toLowerCase().includes(keyword)
    )
  );

  const finalSentences =
    importantSentences.length > 0
      ? importantSentences.slice(0, 6)
      : sentences.slice(0, 4);

  return finalSentences.map(s => `• ${s}.`).join('\n');
}
