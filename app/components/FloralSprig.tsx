export default function FloralSprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="80"
      height="60"
      viewBox="0 0 80 60"
      fill="none"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M2 30 C 20 20, 30 15, 45 10 M45 10 C 40 16, 42 22, 48 24 M45 10 C 50 12, 54 10, 55 4"
        stroke="#B08D57"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M2 30 C 18 34, 28 38, 40 42 M40 42 C 36 36, 38 30, 44 30"
        stroke="#B08D57"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="55" cy="4" r="2.5" fill="none" stroke="#B08D57" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}