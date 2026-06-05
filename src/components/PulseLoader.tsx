interface PulseLoaderProps {
  className?: string;
}

export default function PulseLoader({ className = "h-6 w-6" }: PulseLoaderProps) {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path
          d="M22 12h-4l-3 9L9 3l-3 9H2"
          style={{
            strokeDasharray: 60,
            strokeDashoffset: 60,
            animation: "heartbeat-sweep 1.8s cubic-bezier(0.21, 0.85, 0.35, 1) infinite"
          }}
        />
      </svg>
      <style>{`
        @keyframes heartbeat-sweep {
          0%   { stroke-dashoffset: 60; }
          40%  { stroke-dashoffset: 0; }
          70%  { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: -60; opacity: 0.1; }
        }
      `}</style>
    </>
  );
}
