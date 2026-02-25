'use client';

import { useEffect, useRef, useState } from 'react';

type TranscriptItem = {
  text: string;
  timestamp: number;
};

type UseSubtitlesProps = {
  enabled: boolean;
};

export const useSubtitles = ({ enabled }: UseSubtitlesProps) => {
  const [subtitle, setSubtitle] = useState('');

  const recognitionRef = useRef<any>(null);

  // ✅ FIXED TYPE (NO NodeJS)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transcriptRef = useRef<TranscriptItem[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (!text) continue;

        if (result.isFinal) {
          transcriptRef.current.push({
            text,
            timestamp: Date.now(),
          });

          setSubtitle(text);
        } else {
          interimText += text + ' ';
        }
      }

      if (interimText) {
        setSubtitle(interimText.trim());
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      silenceTimerRef.current = setTimeout(() => {
        setSubtitle('');
      }, 2000);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      if (enabled) {
        try {
          recognition.start();
        } catch {}
      }
    };

    try {
      recognition.start();
    } catch {}

    return () => {
      recognition.onend = null;
      recognition.stop();

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [enabled]);

  const getTranscript = () => transcriptRef.current;

  return { subtitle, getTranscript };
};