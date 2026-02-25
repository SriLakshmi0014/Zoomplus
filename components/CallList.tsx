'use client';

import { Call, CallRecording } from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Loader from './Loader';
import { useGetCalls } from '@/hooks/useGetCalls';
import MeetingCard from './MeetingCard';

/* 🔹 Summary metadata */
type SummaryMeta = {
  meetingId: string;
  meetingTitle: string;
  date: string;
  pdfPath: string;
};

const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) => {
  const router = useRouter();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } =
    useGetCalls();

  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [summaries, setSummaries] = useState<SummaryMeta[]>([]);

  /* 🔹 Fetch summaries ONCE */
  useEffect(() => {
    fetch('/api/summary/list')
      .then(res => res.json())
      .then(data => {
        console.log('📄 summaries from API', data);
        setSummaries(data);
      })
      .catch(err => console.error('Failed to load summaries', err));
  }, []);

  /* 🔹 Index summaries by meetingId */
  const summaryByMeetingId = summaries.reduce<Record<string, SummaryMeta>>(
    (acc, s) => {
      acc[s.meetingId] = s;
      return acc;
    },
    {}
  );

  const getCalls = () => {
    switch (type) {
      case 'ended':
        return endedCalls;
      case 'recordings':
        return recordings;
      case 'upcoming':
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case 'ended':
        return 'No Previous Calls';
      case 'upcoming':
        return 'No Upcoming Calls';
      case 'recordings':
        return 'No Recordings';
      default:
        return '';
    }
  };

  /* 🔹 Fetch recordings (unchanged logic) */
  useEffect(() => {
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        callRecordings?.map(meeting => meeting.queryRecordings()) ?? []
      );

      const recordings = callData
        .filter(call => call.recordings.length > 0)
        .flatMap(call => call.recordings);

      setRecordings(recordings);
    };

    if (type === 'recordings') fetchRecordings();
  }, [type, callRecordings]);

  if (isLoading) return <Loader />;

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => {
          /* ✅ FINAL FIX: ONLY Call.id */
          if (!('id' in meeting)) return null;

          const meetingId = meeting.id;
          const summary =
            type === 'ended'
              ? summaryByMeetingId[meetingId]
              : undefined;

          console.log('🧩 meetingId:', meetingId, 'summary:', summary);

          return (
            <MeetingCard
              key={meetingId}
              icon={
                type === 'ended'
                  ? '/icons/previous.svg'
                  : type === 'upcoming'
                  ? '/icons/upcoming.svg'
                  : '/icons/recordings.svg'
              }
              title={
                meeting.state?.custom?.description ||
                'No Description'
              }
              date={
                meeting.state?.startsAt?.toLocaleString() ||
                ''
              }
              isPreviousMeeting={type === 'ended'}
              link={`/meeting/${meetingId}`}
              buttonText="Start"
              handleClick={() => router.push(`/meeting/${meetingId}`)}
              summary={summary}   /* 🔥 THIS WILL NOW MATCH */
            />
          );
        })
      ) : (
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
