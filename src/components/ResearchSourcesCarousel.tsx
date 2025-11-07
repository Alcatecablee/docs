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
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2F8b7f4b5c9a0e4d3d8c7b6a5f4e3d2c1b?format=webp&width=100',
  },
  {
    id: 'github',
    label: 'GitHub Issues',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2F5c9a0e4d3d8c7b6a5f4e3d2c1b8b7f4b?format=webp&width=100',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2F4d3d8c7b6a5f4e3d2c1b8b7f4b5c9a0e?format=webp&width=100',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2F3d8c7b6a5f4e3d2c1b8b7f4b5c9a0e4d?format=webp&width=100',
  },
  {
    id: 'devto',
    label: 'DEV.to',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2F8c7b6a5f4e3d2c1b8b7f4b5c9a0e4d3d?format=webp&width=100',
  },
  {
    id: 'codeproject',
    label: 'CodeProject',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2F7b6a5f4e3d2c1b8b7f4b5c9a0e4d3d8c?format=webp&width=100',
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
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2Fb8216429200747eaa3c51c29f593a569?format=webp&width=800',
  },
  {
    id: 'brave',
    label: 'Brave',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2F73189a81a7514d5190723e50a3e5b864?format=webp&width=800',
  },
  {
    id: 'websearch',
    label: 'Web Search',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2Fdbf37a3ec2b54b77b7a7c9fb35f3bd73?format=webp&width=800',
  },
  {
    id: 'bing',
    label: 'Bing',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2Fdc9e8a8adf084bb7b32199a93a57db51?format=webp&width=800',
  },
  {
    id: 'yandex',
    label: 'Yandex',
    image: 'https://cdn.builder.io/api/v1/image/assets%2Fc524d11d3a984ad6ba413cc77a150641%2F103fe0a5d65341158d873c6e52ff4d3a?format=webp&width=800',
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
