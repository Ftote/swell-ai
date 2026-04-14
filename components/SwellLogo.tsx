export default function SwellLogo({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Background square with rounded corners */}
      <rect width="40" height="40" rx="10" fill="#060f1a" />
      <rect width="40" height="40" rx="10" fill="url(#bg-grad)" />

      {/* Sine wave — 1.5 cycles, centered */}
      <path
        d="M4 20 C7 13, 11 13, 14 20 C17 27, 21 27, 24 20 C27 13, 31 13, 34 20 C35.5 23.5, 36.5 23.5, 38 22"
        stroke="#00d2b4"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Subtle glow dot at the end of wave */}
      <circle cx="38" cy="22" r="1.8" fill="#00d2b4" opacity="0.9" />

      <defs>
        <linearGradient id="bg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a2438" />
          <stop offset="100%" stopColor="#061520" />
        </linearGradient>
      </defs>
    </svg>
  );
}
