export default function OrnateDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 22"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 11 H80 M140 11 H220"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <path
        d="M80 11 C 92 11, 92 3, 104 3 C 110 3, 110 11, 116 11"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.8"
      />
      <path
        d="M116 11 C 122 11, 122 19, 128 19 C 134 19, 134 11, 140 11"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.8"
      />
      <circle cx="110" cy="11" r="2.5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}
