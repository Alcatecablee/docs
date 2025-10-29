import React from 'react';
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface ResearchSource {
  id: string;
  label: string;
  image?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
    icon: DocumentTextIcon,
  },
  {
    id: 'quora',
    label: 'Quora',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    id: 'forums',
    label: 'Official Forums',
    icon: GlobeAltIcon,
  },
  {
    id: 'websearch',
    label: 'Web Search',
    icon: MagnifyingGlassIcon,
  },
  {
    id: 'internaldocs',
    label: 'Internal Docs',
    icon: DocumentMagnifyingGlassIcon,
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
              <div className="flex items-center justify-center h-16 w-16">
                {source.image ? (
                  <img
                    src={source.image}
                    alt={source.label}
                    className="h-12 w-12 object-contain"
                  />
                ) : source.icon ? (
                  <source.icon className="h-8 w-8 text-white/70" strokeWidth={1.5} />
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
                ) : source.icon ? (
                  <source.icon className="h-8 w-8 text-white/70" strokeWidth={1.5} />
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
