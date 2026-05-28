// hero.jsx

function HeroBadge({ text }) {
  return (
    <div
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 12px 6px 8px",
        border: "1px solid var(--line-2)",
        borderRadius: 999,
        background: "rgba(255,255,255,0.025)",
        fontSize: 11.5,
        color: "var(--ink-2)",
        letterSpacing: "0.04em",
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        style={{
          width: 6, height: 6, borderRadius: 999,
          background: "var(--iris-cyan)",
          boxShadow: "0 0 10px var(--iris-cyan)",
          animation: "pulse-glow 2.4s ease-in-out infinite",
        }}
      />
      <span>{text}</span>
    </div>
  );
}

function HeroHeadline({ variant, copy }) {
  // variant: 'A' | 'B' | 'C'
  const lines = variant === "A" ? copy.headlineA : variant === "C" ? copy.headlineC : copy.headlineB;

  // Mark word(s) for iridescent treatment per variant
  const renderLine = (text, idx) => {
    let inner = text;
    if (variant === "A") {
      if (idx === 1) inner = <span className="iris">{text}</span>;
    } else if (variant === "B") {
      if (idx === 0 || idx === 1) inner = <span className="iris">{text}</span>;
    } else if (variant === "C") {
      if (idx === 2) inner = <span className="iris">{text}</span>;
    }
    return (
      <span
        key={idx}
        className="fade-up"
        style={{
          display: "block",
          animationDelay: `${0.06 + idx * 0.08}s`,
        }}
      >
        {inner}
      </span>
    );
  };

  return (
    <h1 className="h-display" style={{ marginTop: 28 }}>
      {lines.map(renderLine)}
    </h1>
  );
}

function HeroMeta() {
  return (
    <div
      className="mono"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 22,
        marginTop: 40,
        paddingTop: 22,
        borderTop: "1px solid var(--line-1)",
        fontSize: 11.5,
        color: "var(--ink-3)",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        animation: "fade-up 0.8s 0.6s cubic-bezier(0.2,0.65,0.2,1) backwards",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 14, height: 1, background: "var(--iris-violet)" }} />
        <b style={{ color: "var(--ink-1)", fontWeight: 500 }}>01</b> Spec
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 14, height: 1, background: "var(--iris-blue)" }} />
        <b style={{ color: "var(--ink-1)", fontWeight: 500 }}>02</b> Harness
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 14, height: 1, background: "var(--iris-cyan)" }} />
        <b style={{ color: "var(--ink-1)", fontWeight: 500 }}>03</b> Continuity
      </span>
    </div>
  );
}

// Mini float-block to the side of the headline — a tiny visual specimen
function HeroSpecimen() {
  return (
    <div
      className="mono"
      aria-hidden="true"
      style={{
        position: "absolute",
        right: 0,
        top: 60,
        width: 280,
        maxWidth: "30vw",
        padding: "16px 18px",
        border: "1px solid var(--line-1)",
        borderRadius: 14,
        background: "rgba(10, 12, 18, 0.6)",
        backdropFilter: "blur(20px)",
        fontSize: 11,
        color: "var(--ink-2)",
        lineHeight: 1.7,
        boxShadow: "0 30px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        animation: "fade-up 1s 0.4s cubic-bezier(0.2,0.65,0.2,1) backwards",
        display: "none", // hidden by default; revealed via media query below
      }}
    >
      <div style={{ color: "var(--ink-3)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
        STATE.md · active decisions
      </div>
      <div><span style={{ color: "var(--iris-cyan)" }}>D-014</span> <span style={{ color: "var(--ink-1)" }}>Edge runtime → Node 20</span></div>
      <div><span style={{ color: "var(--iris-cyan)" }}>D-015</span> <span style={{ color: "var(--ink-1)" }}>JWT in httpOnly cookie</span></div>
      <div><span style={{ color: "var(--iris-cyan)" }}>D-016</span> <span style={{ color: "var(--ink-1)" }}>Postgres via Drizzle</span></div>
      <div style={{ marginTop: 8, color: "var(--ink-3)" }}>// curated playbook · ACE</div>
    </div>
  );
}

function Hero({ copy, variant, motion }) {
  return (
    <section
      className="section"
      style={{
        paddingTop: "clamp(56px, 9vw, 120px)",
        paddingBottom: "clamp(72px, 10vw, 140px)",
        position: "relative",
        overflow: "hidden",
        minHeight: "min(900px, 90vh)",
      }}
    >
      <IrisOrb motion={motion} />

      {/* subtle bottom grid lines */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: 0,
          height: 240,
          background:
            "linear-gradient(180deg, transparent, var(--bg-0) 90%), " +
            "repeating-linear-gradient(90deg, var(--line-1) 0 1px, transparent 1px 100px)",
          maskImage: "linear-gradient(180deg, transparent, #000 50%, #000)",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div className="wrap" style={{ position: "relative", zIndex: 3 }}>
        <div style={{ animation: "fade-up 0.7s 0.02s cubic-bezier(0.2,0.65,0.2,1) backwards" }}>
          <HeroBadge text={copy.eyebrow} />
        </div>

        <HeroHeadline variant={variant} copy={copy} />

        <p
          className="lead fade-up"
          style={{
            marginTop: 26,
            maxWidth: "62ch",
            animationDelay: "0.36s",
          }}
        >
          {copy.sub}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
            marginTop: 38,
            animation: "fade-up 0.7s 0.48s cubic-bezier(0.2,0.65,0.2,1) backwards",
          }}
        >
          <CopyCommand text={copy.ctaPrimary} hint={copy.ctaPrimaryHint} />

          <a className="btn" href="#framework" style={{ marginTop: -22 }}>
            <span>{copy.ctaSecondary}</span>
            <svg className="chevron" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <HeroMeta />
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
