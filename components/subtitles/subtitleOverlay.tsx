'use client';

type Props = {
  text: string;
};

const SubtitleOverlay = ({ text }: Props) => {
  if (!text) return null;

  return (
    <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 w-full max-w-[900px] -translate-x-1/2 px-4">
      <div className="rounded-lg bg-black/70 px-4 py-2 text-center text-sm text-white backdrop-blur-sm">
        {text}
      </div>
    </div>
  );
};

export default SubtitleOverlay;
