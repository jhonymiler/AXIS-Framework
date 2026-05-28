// atoms.jsx — shared primitives

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────
// useInView — IntersectionObserver hook for reveal animations
// ─────────────────────────────────────────────────────────
function useInView(opts = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.05, ...opts }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

// ─────────────────────────────────────────────────────────
// CopyCommand — click-to-copy npx command pill
// ─────────────────────────────────────────────────────────
function CopyCommand({ text, hint, size = "lg" }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
      <button
        type="button"
        onClick={doCopy}
        className={"copy-cmd" + (copied ? " is-copied" : "")}
        style={{ all: "unset", display: "inline-flex", alignItems: "stretch", cursor: "pointer" }}
      >
        <span className="copy-cmd copy-cmd-inner" style={{ display: "inline-flex", alignItems: "stretch" }}>
          <span className="copy-cmd-prompt">$</span>
          <span className="copy-cmd-text">{text}</span>
          <span className="copy-cmd-action">
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{copied === true ? "copied" : copied}</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="4" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M11 4V3a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 2 3v6A1.5 1.5 0 0 0 3.5 10.5H4" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                <span>copy</span>
              </>
            )}
          </span>
        </span>
      </button>
      {hint && (
        <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.02em", paddingLeft: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// IrisOrb — soft iridescent radial glow for hero
// ─────────────────────────────────────────────────────────
function IrisOrb({ motion = 5 }) {
  const animDur = Math.max(8, 28 - motion * 2);
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "32%",
          width: "min(110vw, 1200px)",
          aspectRatio: "1.4 / 1",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(167, 139, 250, 0.55), transparent 55%), radial-gradient(ellipse at 70% 50%, rgba(34, 211, 238, 0.45), transparent 60%), radial-gradient(ellipse at 50% 70%, rgba(96, 165, 250, 0.4), transparent 60%)",
          filter: "blur(80px) saturate(140%)",
          opacity: 0.85,
          animation: motion > 0 ? `float ${animDur}s ease-in-out infinite` : "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "30%",
          width: "min(80vw, 800px)",
          aspectRatio: "1 / 1",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(240, 171, 252, 0.18), transparent 60%)",
          filter: "blur(60px)",
          opacity: 0.7,
          animation: motion > 0 ? `pulse-glow ${animDur / 1.5}s ease-in-out infinite` : "none",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SectionHead — eyebrow + title + sub
// ─────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="section-head">
      {eyebrow && <div className="eyebrow mono">{eyebrow}</div>}
      {title && <h2 className="h-section">{title}</h2>}
      {sub && <p className="lead">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// GradientLine — 1px iridescent line
// ─────────────────────────────────────────────────────────
function GradientLine({ vertical = false, length = "100%", opacity = 0.6 }) {
  return (
    <div
      style={{
        background: vertical
          ? `linear-gradient(180deg, transparent, var(--iris-blue) 50%, transparent)`
          : `linear-gradient(90deg, transparent, var(--iris-blue) 50%, transparent)`,
        width: vertical ? 1 : length,
        height: vertical ? length : 1,
        opacity,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// Logo mark (small SVG, mirrors nav mark)
// ─────────────────────────────────────────────────────────
function LogoMark({ size = 22 }) {
  return (
    <div
      className="nav-logo-mark"
      style={{ width: size, height: size, borderRadius: Math.max(4, size / 4) }}
    />
  );
}

Object.assign(window, {
  useInView,
  CopyCommand,
  IrisOrb,
  SectionHead,
  GradientLine,
  LogoMark,
});
