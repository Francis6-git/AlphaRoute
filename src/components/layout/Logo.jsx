export default function AlphaRouteLogo({ className = "w-10 h-10" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Glow */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* The "Route" Path (Blue) */}
      <path
        d="M20 70C20 70 40 30 80 30"
        stroke="#3b82f6"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.6"
      />

      <path
        d="M30 65C30 55 45 40 60 40C75 40 75 60 60 60C45 60 30 75 30 85M60 40L85 15"
        stroke="#00ffbd"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* Node Points */}
      <circle cx="85" cy="15" r="4" fill="#00ffbd" className="animate-pulse" />
    </svg>
  );
}
