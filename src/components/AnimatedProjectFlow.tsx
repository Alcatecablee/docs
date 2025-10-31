import React from 'react';

type AnimatedProjectFlowProps = {
  labels?: [string, string, string, string];
  className?: string;
};

// Animated project workflow SVG adapted for this project
export default function AnimatedProjectFlow({
  labels = ['Backlog', 'In Progress', 'Review', 'Release'],
  className,
}: AnimatedProjectFlowProps) {
  // Ensure we always have exactly 4 labels
  const [l1, l2, l3, l4] = labels;

  return (
    <div className={'w-full ' + (className || '')}>
      <div className="hidden md:block" aria-hidden>
        <svg className="w-full h-[320px] text-white/60" viewBox="0 0 200 100" role="img">
          <title>Project workflow connections</title>

          <defs>
            {/* Paths for masks and motion */}
            <path id="pf-p1" d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10" />
            <path id="pf-p2" d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10" />
            <path id="pf-p3" d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10" />
            <path id="pf-p4" d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10" />

            <mask id="pf-mask-1">
              <use href="#pf-p1" strokeWidth="0.5" stroke="white" fill="none" />
            </mask>
            <mask id="pf-mask-2">
              <use href="#pf-p2" strokeWidth="0.5" stroke="white" fill="none" />
            </mask>
            <mask id="pf-mask-3">
              <use href="#pf-p3" strokeWidth="0.5" stroke="white" fill="none" />
            </mask>
            <mask id="pf-mask-4">
              <use href="#pf-p4" strokeWidth="0.5" stroke="white" fill="none" />
            </mask>

            <radialGradient id="pf-blue-grad" fx="1">
              <stop offset="0%" stopColor="#00A6F5" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Reveal stroke animation */}
          <g
            stroke="currentColor"
            fill="none"
            strokeWidth="0.4"
            strokeDasharray="100 100"
            pathLength={100}
          >
            <use href="#pf-p1" />
            <use href="#pf-p2" />
            <use href="#pf-p3" />
            <use href="#pf-p4" />
            <animate
              attributeName="stroke-dashoffset"
              from="100"
              to="0"
              dur="1s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.25,0.1,0.5,1"
              keyTimes="0; 1"
            />
          </g>

          {/* Moving gradient orbs along the paths */}
          <g mask="url(#pf-mask-1)">
            <circle cx="0" cy="0" r="12" fill="url(#pf-blue-grad)">
              <animateMotion dur="3s" repeatCount="indefinite">
                <mpath href="#pf-p1" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#pf-mask-2)">
            <circle cx="0" cy="0" r="12" fill="url(#pf-blue-grad)">
              <animateMotion dur="2.6s" repeatCount="indefinite">
                <mpath href="#pf-p2" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#pf-mask-3)">
            <circle cx="0" cy="0" r="12" fill="url(#pf-blue-grad)">
              <animateMotion dur="2.2s" repeatCount="indefinite">
                <mpath href="#pf-p3" />
              </animateMotion>
            </circle>
          </g>
          <g mask="url(#pf-mask-4)">
            <circle cx="0" cy="0" r="12" fill="url(#pf-blue-grad)">
              <animateMotion dur="3.4s" repeatCount="indefinite">
                <mpath href="#pf-p4" />
              </animateMotion>
            </circle>
          </g>

          {/* Pills */}
          <g stroke="currentColor" fill="none" strokeWidth="0.4">
            <g>
              <rect fill="#18181B" x="14" y="5" width="34" height="10" rx="5" />
              <text
                x="31"
                y="12"
                fill="white"
                stroke="none"
                fontSize="5"
                fontWeight="500"
                textAnchor="middle"
              >
                {l1}
              </text>
            </g>
            <g>
              <rect fill="#18181B" x="60" y="5" width="34" height="10" rx="5" />
              <text
                x="77"
                y="12"
                fill="white"
                stroke="none"
                fontSize="5"
                fontWeight="500"
                textAnchor="middle"
              >
                {l2}
              </text>
            </g>
            <g>
              <rect fill="#18181B" x="108" y="5" width="38" height="10" rx="5" />
              <text
                x="127"
                y="12"
                fill="white"
                stroke="none"
                fontSize="5"
                fontWeight="500"
                textAnchor="middle"
              >
                {l3}
              </text>
            </g>
            <g>
              <rect fill="#18181B" x="150" y="5" width="40" height="10" rx="5" />
              <text
                x="170"
                y="12"
                fill="white"
                stroke="none"
                fontSize="5"
                fontWeight="500"
                textAnchor="middle"
              >
                {l4}
              </text>
            </g>
          </g>
        </svg>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          svg animate, svg animateMotion { display: none; }
        }
      `}</style>
    </div>
  );
}
