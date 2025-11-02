import React from 'react';

export default function KnowledgeFlowAnimation() {
  return (
    <div className="w-full">
      <div className="hidden md:block" aria-hidden>
        <svg className="w-full h-[400px] text-white/60" viewBox="0 0 240 140" role="img">
          <title>Knowledge aggregation workflow</title>

          <defs>
            {/* Paths for sources flowing into AI aggregation */}
            <path id="kf-source1" d="M 20 20 Q 80 20 100 60" />
            <path id="kf-source2" d="M 50 20 Q 90 30 100 60" />
            <path id="kf-source3" d="M 80 20 Q 95 35 100 60" />
            <path id="kf-source4" d="M 110 20 Q 105 35 100 60" />
            <path id="kf-source5" d="M 140 20 Q 110 30 100 60" />
            <path id="kf-source6" d="M 170 20 Q 120 25 100 60" />
            
            {/* Path from AI to output */}
            <path id="kf-output" d="M 100 75 Q 100 95 120 105" />

            {/* Masks for flowing orbs */}
            <mask id="kf-mask-1"><use href="#kf-source1" strokeWidth="1" stroke="white" fill="none" /></mask>
            <mask id="kf-mask-2"><use href="#kf-source2" strokeWidth="1" stroke="white" fill="none" /></mask>
            <mask id="kf-mask-3"><use href="#kf-source3" strokeWidth="1" stroke="white" fill="none" /></mask>
            <mask id="kf-mask-4"><use href="#kf-source4" strokeWidth="1" stroke="white" fill="none" /></mask>
            <mask id="kf-mask-5"><use href="#kf-source5" strokeWidth="1" stroke="white" fill="none" /></mask>
            <mask id="kf-mask-6"><use href="#kf-source6" strokeWidth="1" stroke="white" fill="none" /></mask>
            <mask id="kf-mask-output"><use href="#kf-output" strokeWidth="1" stroke="white" fill="none" /></mask>

            <radialGradient id="kf-cyan-grad" fx="0.5" fy="0.5">
              <stop offset="0%" stopColor="rgb(102,255,228)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="rgb(102,255,228)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Static connecting lines */}
          <g
            stroke="currentColor"
            fill="none"
            strokeWidth="0.5"
            opacity="0.4"
          >
            <use href="#kf-source1" />
            <use href="#kf-source2" />
            <use href="#kf-source3" />
            <use href="#kf-source4" />
            <use href="#kf-source5" />
            <use href="#kf-source6" />
            <use href="#kf-output" />
          </g>

          {/* Animated orbs flowing from sources to AI */}
          <g mask="url(#kf-mask-1)">
            <circle cx="0" cy="0" r="3" fill="url(#kf-cyan-grad)">
              <animateMotion dur="2.5s" repeatCount="indefinite">
                <mpath href="#kf-source1" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#kf-mask-2)">
            <circle cx="0" cy="0" r="3" fill="url(#kf-cyan-grad)">
              <animateMotion dur="2.3s" repeatCount="indefinite" begin="0.2s">
                <mpath href="#kf-source2" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#kf-mask-3)">
            <circle cx="0" cy="0" r="3" fill="url(#kf-cyan-grad)">
              <animateMotion dur="2.1s" repeatCount="indefinite" begin="0.4s">
                <mpath href="#kf-source3" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#kf-mask-4)">
            <circle cx="0" cy="0" r="3" fill="url(#kf-cyan-grad)">
              <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.6s">
                <mpath href="#kf-source4" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#kf-mask-5)">
            <circle cx="0" cy="0" r="3" fill="url(#kf-cyan-grad)">
              <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.8s">
                <mpath href="#kf-source5" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#kf-mask-6)">
            <circle cx="0" cy="0" r="3" fill="url(#kf-cyan-grad)">
              <animateMotion dur="2.6s" repeatCount="indefinite" begin="1s">
                <mpath href="#kf-source6" />
              </animateMotion>
            </circle>
          </g>

          {/* Orb flowing from AI to output */}
          <g mask="url(#kf-mask-output)">
            <circle cx="0" cy="0" r="4" fill="url(#kf-cyan-grad)">
              <animateMotion dur="1.8s" repeatCount="indefinite">
                <mpath href="#kf-output" />
              </animateMotion>
            </circle>
          </g>

          {/* Source pills at top */}
          <g stroke="currentColor" fill="none" strokeWidth="0.4">
            <g>
              <rect fill="#18181B" x="5" y="15" width="30" height="10" rx="5" />
              <text
                x="20"
                y="22"
                fill="white"
                stroke="none"
                fontSize="4"
                fontWeight="500"
                textAnchor="middle"
              >
                Stack Overflow
              </text>
            </g>
            <g>
              <rect fill="#18181B" x="40" y="15" width="20" height="10" rx="5" />
              <text
                x="50"
                y="22"
                fill="white"
                stroke="none"
                fontSize="4"
                fontWeight="500"
                textAnchor="middle"
              >
                GitHub
              </text>
            </g>
            <g>
              <rect fill="#18181B" x="66" y="15" width="24" height="10" rx="5" />
              <text
                x="78"
                y="22"
                fill="white"
                stroke="none"
                fontSize="4"
                fontWeight="500"
                textAnchor="middle"
              >
                YouTube
              </text>
            </g>
            <g>
              <rect fill="#18181B" x="96" y="15" width="20" height="10" rx="5" />
              <text
                x="106"
                y="22"
                fill="white"
                stroke="none"
                fontSize="4"
                fontWeight="500"
                textAnchor="middle"
              >
                Reddit
              </text>
            </g>
            <g>
              <rect fill="#18181B" x="122" y="15" width="26" height="10" rx="5" />
              <text
                x="135"
                y="22"
                fill="white"
                stroke="none"
                fontSize="4"
                fontWeight="500"
                textAnchor="middle"
              >
                DEV.to
              </text>
            </g>
            <g>
              <rect fill="#18181B" x="154" y="15" width="30" height="10" rx="5" />
              <text
                x="169"
                y="22"
                fill="white"
                stroke="none"
                fontSize="4"
                fontWeight="500"
                textAnchor="middle"
              >
                10+ Sources
              </text>
            </g>
          </g>

          {/* AI Aggregation center pill with pulsing effect */}
          <g stroke="currentColor" fill="none" strokeWidth="0.5">
            <rect fill="#18181B" x="70" y="60" width="60" height="15" rx="7.5" />
            <rect fill="none" stroke="rgb(102,255,228)" strokeWidth="0.6" x="70" y="60" width="60" height="15" rx="7.5" opacity="0.6">
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            </rect>
            <text
              x="100"
              y="70"
              fill="rgb(102,255,228)"
              stroke="none"
              fontSize="5.5"
              fontWeight="600"
              textAnchor="middle"
            >
              AI Aggregation
            </text>
          </g>

          {/* Output pill */}
          <g stroke="currentColor" fill="none" strokeWidth="0.4">
            <rect fill="#18181B" x="80" y="100" width="80" height="15" rx="7.5" />
            <text
              x="120"
              y="110"
              fill="rgb(102,255,228)"
              stroke="none"
              fontSize="5.5"
              fontWeight="600"
              textAnchor="middle"
            >
              Apple-Quality Docs
            </text>
          </g>
        </svg>
      </div>

      {/* Mobile view - simplified vertical layout */}
      <div className="block md:hidden">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex flex-wrap justify-center gap-2">
            {['Stack Overflow', 'GitHub', 'YouTube', 'Reddit', 'DEV.to', '10+ Sources'].map((source) => (
              <div
                key={source}
                className="px-4 py-2 bg-zinc-900 border border-white/20 rounded-full text-xs text-white/90"
              >
                {source}
              </div>
            ))}
          </div>
          
          <svg className="w-8 h-12" viewBox="0 0 24 48">
            <path
              d="M 12 0 L 12 48"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            <circle cx="12" cy="0" r="3" fill="rgb(102,255,228)" opacity="0.8">
              <animate
                attributeName="cy"
                values="0;48;0"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>

          <div className="px-6 py-3 bg-zinc-900 border-2 border-cyan-400/60 rounded-full text-sm text-cyan-400 font-semibold animate-pulse">
            AI Aggregation
          </div>

          <svg className="w-8 h-12" viewBox="0 0 24 48">
            <path
              d="M 12 0 L 12 48"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            <circle cx="12" cy="0" r="3" fill="rgb(102,255,228)" opacity="0.8">
              <animate
                attributeName="cy"
                values="0;48;0"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>

          <div className="px-6 py-3 bg-zinc-900 border border-white/20 rounded-full text-sm text-cyan-400 font-semibold">
            Apple-Quality Docs
          </div>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          svg animate, svg animateMotion { display: none; }
          .animate-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}
