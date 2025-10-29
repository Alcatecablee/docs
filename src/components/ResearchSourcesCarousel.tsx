import React from 'react';

interface ResearchSource {
  id: string;
  label: string;
  image?: string;
  logo?: React.ReactNode;
}

const RESEARCH_SOURCES: ResearchSource[] = [
  {
    id: 'stackoverflow',
    label: 'Stack Overflow',
    image: '/attached_assets/images/Stack-Overflow-Logo-emblem-of-the-programming-community-transparent-png-image.png',
  },
  {
    id: 'github',
    label: 'GitHub Issues',
    image: '/attached_assets/images/toppng.com-github-logo-524x512.png',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    image: '/attached_assets/images/toppng.com-youtube-icon-1024x1024.png',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    image: '/attached_assets/images/toppng.com-reddit-logo-reddit-icon-698x698.png',
  },
  {
    id: 'devto',
    label: 'DEV.to',
    image: '/attached_assets/images/dev-rainbow.png',
  },
  {
    id: 'codeproject',
    label: 'CodeProject',
    image: '/attached_assets/images/toppng.com-custom-software-development-web-application-development-451x333.png',
  },
  {
    id: 'stackexchange',
    label: 'Stack Exchange',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2Faac4e760a8544892bd6e5f6a40054f2c?format=webp&width=800',
  },
  {
    id: 'quora',
    label: 'Quora',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2F3e4b910659394a4ba3676e420f451025?format=webp&width=800',
  },
  {
    id: 'forums',
    label: 'Official Forums',
    logo: (
      <svg viewBox="0 0 120 120" fill="none" className="w-12 h-12">
        <path d="M25 35h70c5.5 0 10 4.5 10 10v40c0 5.5-4.5 10-10 10h-25l-15 12v-12H25c-5.5 0-10-4.5-10-10V45c0-5.5 4.5-10 10-10z" stroke="#16A34A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="35" y1="55" x2="85" y2="55" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="68" x2="85" y2="68" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'websearch',
    label: 'Web Search',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2Fdbf37a3ec2b54b77b7a7c9fb35f3bd73?format=webp&width=800',
  },
  {
    id: 'internaldocs',
    label: 'Internal Docs',
    logo: (
      <svg viewBox="0 0 120 120" fill="none" className="w-12 h-12">
        <path d="M30 25h50c2.2 0 4 1.8 4 4v70c0 2.2-1.8 4-4 4H30c-2.2 0-4-1.8-4-4V29c0-2.2 1.8-4 4-4z" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="40" y1="45" x2="75" y2="45" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="60" x2="75" y2="60" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="75" x2="65" y2="75" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function ResearchSourcesCarousel() {
  return (
    <div className="w-full py-8">
      <div className="overflow-hidden relative">

        {/* Animated container */}
        <div className="flex gap-8 animate-scroll">
          {/* First set of logos */}
          {RESEARCH_SOURCES.map((source) => (
            <div
              key={`${source.id}-1`}
              className="flex flex-col items-center justify-center gap-2 flex-shrink-0"
              title={source.label}
            >
              <div className="flex items-center justify-center h-16 w-16">
                {source.image ? (
                  <img
                    src={source.image}
                    alt={source.label}
                    className="h-12 w-12 object-contain"
                  />
                ) : source.logo ? (
                  source.logo
                ) : null}
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
              <div className="flex items-center justify-center h-16 w-16">
                {source.image ? (
                  <img
                    src={source.image}
                    alt={source.label}
                    className="h-12 w-12 object-contain"
                  />
                ) : source.logo ? (
                  source.logo
                ) : null}
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
          animation: scroll-left 35s linear infinite;
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
