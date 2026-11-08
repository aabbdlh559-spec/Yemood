// Yemood brand pieces: the logo mark and the wordmark used in headers.
import { useId } from "react";

export interface YemoodMarkProps {
  /** Rendered square size in px. */
  size?: number;
}

/** The Yemood logo: a smiling speech bubble on a teal-to-navy tile. Decorative on its own. */
export function YemoodMark({ size = 56 }: YemoodMarkProps) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#19C2B0" />
          <stop offset="1" stopColor="#0B3C5D" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${gradientId})`} />
      <path
        d="M237.9 374.7 A130 130 0 1 0 172.4 345.6 L126 416 Z"
        fill="#FFC83D"
        stroke="#0B2540"
        strokeWidth="14"
        strokeLinejoin="round"
      />
      <ellipse cx="216" cy="230" rx="13" ry="21" fill="#0B2540" />
      <ellipse cx="296" cy="230" rx="13" ry="21" fill="#0B2540" />
      <circle cx="182" cy="282" r="15" fill="#FF6B57" fillOpacity="0.55" />
      <circle cx="330" cy="282" r="15" fill="#FF6B57" fillOpacity="0.55" />
      <path
        d="M200 278 Q256 342 312 278"
        fill="none"
        stroke="#0B2540"
        strokeWidth="15"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface YemoodWordmarkProps {
  /** Marker text size in px; the logo is drawn about as tall as the text line. */
  fontSize?: number;
}

/** The logo next to the name, with the name on a highlighter stroke. */
export function YemoodWordmark({ fontSize = 56 }: YemoodWordmarkProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <YemoodMark size={Math.round(fontSize * 1.07)} />
      <div style={{ position: "relative", padding: "0 8px" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 6,
            height: Math.round(fontSize * 0.46),
            background: "var(--opg-highlight)",
            borderRadius: 6,
            transform: "rotate(-1deg)",
          }}
        />
        <div
          className="opg-marker"
          style={{ position: "relative", fontSize, lineHeight: 1.1 }}
        >
          Yemood
        </div>
      </div>
    </div>
  );
}
