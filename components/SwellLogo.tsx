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

      {/* Sine wave 1 — upper */}
      <path
        d="M4 17 C7 10, 11 10, 14 17 C17 24, 21 24, 24 17 C27 10, 31 10, 34 17 C37 24, 38 24, 38 21"
        stroke="#00d2b4"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Sine wave 2 — lower */}
      <path
        d="M4 25 C7 18, 11 18, 14 25 C17 32, 21 32, 24 25 C27 18, 31 18, 34 25 C37 32, 38 32, 38 29"
        stroke="#00d2b4"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
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
