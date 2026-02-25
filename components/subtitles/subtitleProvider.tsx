'use client';

import {
  CallingState,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';

import { useSubtitles } from './useSubtitles';
import SubtitleOverlay from './subtitleOverlay';
import { useEffect } from 'react';
import { prepareTranscriptForSummary } from '@/lib/summary/summary.service';

const SubtitleProvider = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const call = useCall(); // ✅ correct usage

  const enabled = callingState === CallingState.JOINED;
  const { subtitle, getTranscript } = useSubtitles({ enabled });

  // 🔥 Runs when meeting ENDS
  useEffect(() => {
    return () => {
      if (!call?.id) {
        console.warn('❌ No call id, summary not generated');
        return;
      }

      const rawTranscript = getTranscript();
      const cleanedText = prepareTranscriptForSummary(rawTranscript);

      if (!cleanedText) {
        console.warn('❌ Empty transcript, summary not generated');
        return;
      }

      fetch('/api/summary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: call.id,
          meetingTitle:
            call.state?.custom?.description || 'Meeting Summary',
          transcript: cleanedText,
        }),
      })
        .then(res => res.json())
        .then(() =>
          console.log('✅ Summary generated for', call.id)
        )
        .catch(err =>
          console.error('❌ Summary generation failed:', err)
        );
    };
  }, []);

  return <SubtitleOverlay text={subtitle} />;
};

export default SubtitleProvider;
