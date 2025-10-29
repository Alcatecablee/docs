import React from 'react';

interface ResearchSource {
  id: string;
  label: string;
  logo: React.ReactNode;
}

const RESEARCH_SOURCES: ResearchSource[] = [
  {
    id: 'stackoverflow',
    label: 'Stack Overflow',
    logo: (
      <svg className="w-12 h-12" viewBox="0 0 120 120" fill="none">
        <rect x="20" y="60" width="20" height="40" fill="#F48024" />
        <rect x="50" y="40" width="20" height="60" fill="#F48024" />
        <rect x="80" y="20" width="20" height="80" fill="#F48024" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    logo: (
      <svg className="w-12 h-12" viewBox="0 0 120 120" fill="currentColor">
        <path d="M60 12c-26.5 0-48 21.5-48 48 0 21.2 13.7 39.2 32.6 45.5 2.4.5 3.3-1 3.3-2.3 0-1.2-.1-5.1-.1-9.4-13.3 2.9-16.1-6.4-16.1-6.4-2.2-5.6-5.4-7.1-5.4-7.1-4.4-3 .3-3 .3-3 4.9.3 7.5 5 7.5 5 4.3 7.4 11.3 5.3 14.1 4 .4-3.1 1.7-5.3 3.1-6.5-10.8-1.2-22.2-5.4-22.2-24.2 0-5.4 1.9-9.8 5-13.2-.5-1.2-2.2-6.2.5-12.9 0 0 4.1-1.3 13.4 5 3.9-1.1 8.1-1.6 12.2-1.6 4.1 0 8.3.5 12.2 1.6 9.3-6.3 13.4-5 13.4-5 2.7 6.7 1 11.7.5 12.9 3.1 3.4 5 7.8 5 13.2 0 18.8-11.4 23-22.3 24.2 1.8 1.6 3.4 4.6 3.4 9.3 0 6.7-.1 12.1-.1 13.7 0 1.3.9 2.8 3.3 2.3 18.9-6.3 32.6-24.3 32.6-45.5 0-26.5-21.5-48-48-48z" fill="white" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    logo: (
      <svg className="w-12 h-12" viewBox="0 0 120 120" fill="none">
        <path d="M108.5 32C107.4 27.2 103.6 23.4 98.8 22.3C92.4 20.5 60 20.5 60 20.5s-32.4 0-38.8 1.8c-4.8 1.1-8.6 4.9-9.7 9.7C9.5 39.8 9.5 60 9.5 60s0 20.2 1.8 26.5c1.1 4.8 4.9 8.6 9.7 9.7c6.4 1.8 38.8 1.8 38.8 1.8s32.4 0 38.8-1.8c4.8-1.1 8.6-4.9 9.7-9.7c1.8-6.3 1.8-26.5 1.8-26.5s0-20.2-1.8-26.5z" fill="#FF0000" />
        <path d="M49 76.5l25.8-16.5L49 43.5v33z" fill="white" />
      </svg>
    ),
  },
  {
    id: 'reddit',
    label: 'Reddit',
    logo: (
      <svg className="w-12 h-12" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="48" fill="#FF4500" />
        <circle cx="42" cy="48" r="6" fill="white" />
        <circle cx="78" cy="48" r="6" fill="white" />
        <path d="M45 68c0 5.5 7.2 10 16 10s16-4.5 16-10" stroke="white" strokeWidth="3" fill="none" />
      </svg>
    ),
  },
  {
    id: 'devto',
    label: 'DEV.to',
    logo: (
      <svg className="w-12 h-12" viewBox="0 0 120 120" fill="none">
        <rect x="15" y="20" width="90" height="80" rx="8" fill="#0A0E27" />
        <text x="60" y="75" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#FAFBFC" fontFamily="monospace">DEV</text>
      </svg>
    ),
  },
  {
    id: 'codeproject',
    label: 'CodeProject',
    logo: (
      <svg className="w-12 h-12" viewBox="0 0 120 120" fill="none">
        <rect x="20" y="30" width="25" height="25" fill="#FF6B00" />
        <rect x="55" y="30" width="25" height="25" fill="#FF6B00" />
        <rect x="20" y="65" width="25" height="25" fill="#FF6B00" />
        <rect x="55" y="65" width="25" height="25" fill="#FF6B00" />
      </svg>
    ),
  },
  {
    id: 'stackexchange',
    label: 'Stack Exchange',
    logo: (
      <svg className="w-12 h-12" viewBox="0 0 120 120" fill="none">
        <rect x="25" y="35" width="70" height="15" fill="#1E90FF" />
        <rect x="25" y="55" width="70" height="15" fill="#1E90FF" />
        <rect x="25" y="75" width="70" height="15" fill="#1E90FF" />
      </svg>
    ),
  },
  {
    id: 'quora',
    label: 'Quora',
    logo: (
      <svg className="w-12 h-12" viewBox="0 0 120 120" fill="none">
        <path d="M60 15c-24.8 0-45 20.2-45 45s20.2 45 45 45 45-20.2 45-45-20.2-45-45-45zm0 78c-18.2 0-33-14.8-33-33s14.8-33 33-33 33 14.8 33 33-14.8 33-33 33z" fill="#B92B27" />
        <text x="60" y="68" textAnchor="middle" fontSize="36" fontWeight="bold" fill="white" fontFamily="sans-serif">Q</text>
      </svg>
    ),
  },
  {
    id: 'forums',
    label: 'Official Forums',
    logo: (
      <svg className="w-12 h-12" viewBox="0 0 120 120" fill="none">
        <path d="M20 30h80c5.5 0 10 4.5 10 10v40c0 5.5-4.5 10-10 10h-30l-20 15v-15H20c-5.5 0-10-4.5-10-10V40c0-5.5 4.5-10 10-10z" stroke="#16A34A" strokeWidth="3" fill="none" />
        <line x1="30" y1="50" x2="90" y2="50" stroke="#16A34A" strokeWidth="2" />
        <line x1="30" y1="65" x2="90" y2="65" stroke="#16A34A" strokeWidth="2" />
      </svg>
    ),
  },
];

export default function ResearchSourcesCarousel() {
  return (
    <div className="w-full py-8">
      <div className="overflow-hidden relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[rgb(34,38,46)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[rgb(34,38,46)] to-transparent z-10 pointer-events-none" />

        {/* Animated container */}
        <div className="flex gap-8 animate-scroll">
          {/* First set of logos */}
          {RESEARCH_SOURCES.map((source) => (
            <div
              key={`${source.id}-1`}
              className="flex flex-col items-center justify-center gap-2 flex-shrink-0"
              title={source.label}
            >
              <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300 flex items-center justify-center h-16 w-16">
                {source.logo}
              </div>
              <span className="text-xs text-white/60 text-center whitespace-nowrap text-[11px] max-w-16">
                {source.label}
              </span>
            </div>
          ))}

          {/* Duplicate set for seamless loop */}
          {RESEARCH_SOURCES.map((source) => (
            <div
              key={`${source.id}-2`}
              className="flex flex-col items-center justify-center gap-2 flex-shrink-0"
              title={source.label}
            >
              <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300 flex items-center justify-center h-16 w-16">
                {source.logo}
              </div>
              <span className="text-xs text-white/60 text-center whitespace-nowrap text-[11px] max-w-16">
                {source.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll-left 30s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
