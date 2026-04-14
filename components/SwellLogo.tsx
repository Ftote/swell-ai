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
      <rect width="40" height="40" rx="10" fill="url(#bg-grad)" />

      {/*
        Both waves: x from 3 to 37 (width=34), 1.5 cycles → 3 half-cycles
        half-period = 34/3 ≈ 11.33
        Bézier control offset = 11.33 * 0.36 ≈ 4.1
        Using S (smooth) for perfect continuity — CP is auto-reflected
      */}

      {/* Wave 1 — center y=15, amplitude=5 */}
      <path
        d="M3,15 C7.1,10 10.2,10 14.3,15 S21.6,20 25.7,15 S32.9,10 37,15"
        stroke="#00d2b4"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Wave 2 — center y=26, amplitude=4, lighter */}
      <path
        d="M3,26 C7.1,22 10.2,22 14.3,26 S21.6,30 25.7,26 S32.9,22 37,26"
        stroke="#00d2b4"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      <defs>
        <linearGradient id="bg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a2438" />
          <stop offset="100%" stopColor="#061520" />
        </linearGradient>
      </defs>
    </svg>
  );
}
