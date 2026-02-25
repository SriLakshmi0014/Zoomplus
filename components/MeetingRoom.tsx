'use client';

import SubtitleProvider from './subtitles/subtitleProvider';

import { useState, useEffect, useRef } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

import { AttendanceManager } from '@/lib/attendance/attendanceManager';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const call = useCall();

  const attendanceManagerRef = useRef(new AttendanceManager());

  // ✅ Track member join / leave
  useEffect(() => {
    if (!call) return;

    const handleMemberAdded = (event: any) => {
      const user = event.member?.user;
      if (!user) return;

      attendanceManagerRef.current.handleJoin(
        user.id,
        user.name || 'Unknown'
      );
    };

    const handleMemberRemoved = (event: any) => {
      const user = event.member?.user;
      if (!user) return;

      attendanceManagerRef.current.handleLeave(user.id);
    };

    call.on('call.member_added', handleMemberAdded);
    call.on('call.member_removed', handleMemberRemoved);

    return () => {
      call.off('call.member_added', handleMemberAdded);
      call.off('call.member_removed', handleMemberRemoved);
    };
  }, [call]);

  // ✅ Custom Leave Handler (VERY IMPORTANT)
  const handleLeaveMeeting = async () => {
    if (!call) return;

    // 1️⃣ Finalize attendance BEFORE leaving
    const finalReport =
      attendanceManagerRef.current.finalizeAttendance();

    console.log('Final Attendance Report:', finalReport);

    // 2️⃣ Now leave call
    await call.leave();

    // 3️⃣ Navigate home
    router.push('/');
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return (
          <SpeakerLayout participantsBarPosition="left" />
        );
      default:
        return (
          <SpeakerLayout participantsBarPosition="right" />
        );
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>

        <SubtitleProvider />

        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList
            onClose={() => setShowParticipants(false)}
          />
        </div>
      </div>

      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        {/* ❌ Removed default leave from CallControls */}
        <CallControls onLeave={handleLeaveMeeting} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map(
              (item, index) => (
                <div key={index}>
                  <DropdownMenuItem
                    onClick={() =>
                      setLayout(
                        item.toLowerCase() as CallLayoutType
                      )
                    }
                  >
                    {item}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-dark-1" />
                </div>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        <button
          onClick={() =>
            setShowParticipants((prev) => !prev)
          }
        >
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;