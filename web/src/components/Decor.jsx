export function Flourish() {
  return (
    <svg className="flourish" viewBox="0 0 64 36" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M32 18 C28 18 26 8 20 8 C14 8 14 18 8 18" />
        <path d="M32 18 C28 18 26 28 20 28 C14 28 14 18 8 18" />
        <path d="M32 18 C36 18 38 8 44 8 C50 8 50 18 56 18" />
        <path d="M32 18 C36 18 38 28 44 28 C50 28 50 18 56 18" />
        <path d="M32 18 C30 12 26 10 22 14" />
        <path d="M32 18 C34 12 38 10 42 14" />
      </g>
      <circle cx="32" cy="18" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function DeerMark() {
  return (
    <div className="mark">
      <svg className="deer" viewBox="0 0 160 200" aria-hidden="true">
        <g fill="#e4c27a">
          <path d="M74 96 L60 52 L44 66 L50 34 L66 48 L64 16 L80 44 L76 68 Z" />
          <path d="M86 96 L100 52 L116 66 L110 34 L94 48 L96 16 L80 44 L84 68 Z" />
          <path d="M70 58 L58 36 L66 40 L62 22 L74 38 Z" />
          <path d="M90 58 L102 36 L94 40 L98 22 L86 38 Z" />
          <polygon points="54,104 40,128 72,114" />
          <polygon points="106,104 120,128 88,114" />
          <polygon points="80,72 50,112 64,164 80,186 96,164 110,112" />
          <polygon points="80,72 110,112 96,146 80,128" opacity="0.78" />
          <polygon points="80,72 50,112 64,146 80,128" opacity="0.9" />
          <polygon points="64,146 80,128 96,146 80,170" opacity="0.72" />
          <polygon points="70,164 80,186 90,164 80,172" opacity="0.55" />
        </g>
      </svg>
      <p>LA CARRIÈRE</p>
    </div>
  );
}

export function SectionTitle({ children, id }) {
  return (
    <h2 className="script-title" id={id}>
      <Flourish />
      <span>{children}</span>
      <Flourish />
    </h2>
  );
}
