// layers.jsx — three-layer diagram

const LAYER_ACCENTS = [
  { glow: "rgba(167, 139, 250, 0.6)", line: "var(--iris-violet)" }, // Spec
  { glow: "rgba(96, 165, 250, 0.6)",  line: "var(--iris-blue)"   }, // Harness
  { glow: "rgba(34, 211, 238, 0.6)",  line: "var(--iris-cyan)"   }, // Continuity
];

function LayerVisual({ idx }) {
  // Each layer gets a distinct mini-glyph
  if (idx === 0) {
    // Spec — stacked progressive-disclosure document
    return (
      <svg viewBox="0 0 220 110" width="100%" height="110" style={{ display: "block" }}>
        <defs>
          <linearGradient id="lg-spec" x1="0" x2="1">
            <stop offset="0" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="1" stopColor="#60a5fa" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {/* lines */}
        {[0,1,2,3,4,5,6].map(i => (
          <rect key={i} x="20" y={14 + i * 12} width={140 - i * 12} height="3" rx="1.5"
            fill={i < 2 ? "url(#lg-spec)" : "rgba(255,255,255,0.18)"}
            opacity={i < 2 ? 1 : 0.5 - i * 0.05}
          />
        ))}
        {/* skill cards on right */}
        {[0,1,2].map(i => (
          <g key={i}>
            <rect x={170} y={14 + i * 22} width="36" height="14" rx="2" fill="rgba(255,255,255,0.04)" stroke="rgba(167,139,250,0.4)" />
            <rect x={174} y={19 + i * 22} width="20" height="2" rx="1" fill="rgba(167,139,250,0.7)" />
            <rect x={174} y={23 + i * 22} width="14" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
          </g>
        ))}
      </svg>
    );
  }
  if (idx === 1) {
    // Harness — gear / control hooks
    return (
      <svg viewBox="0 0 220 110" width="100%" height="110" style={{ display: "block" }}>
        <defs>
          <linearGradient id="lg-harn" x1="0" x2="1">
            <stop offset="0" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {/* central rail */}
        <line x1="20" y1="55" x2="200" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 3" />
        {/* tool-call nodes */}
        {[40, 90, 140, 190].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy="55" r="9" fill="rgba(96,165,250,0.10)" stroke="url(#lg-harn)" strokeWidth="1.2" />
            <circle cx={x} cy="55" r="3" fill="url(#lg-harn)" />
            {/* pre-hook */}
            <rect x={x - 16} y="25" width="32" height="14" rx="2.5" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.35)" strokeWidth="0.8" />
            <text x={x} y="35" textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace" fill="rgba(214,217,225,0.7)" letterSpacing="0.04em">pre</text>
            {/* post-hook */}
            <rect x={x - 16} y="73" width="32" height="14" rx="2.5" fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.35)" strokeWidth="0.8" />
            <text x={x} y="83" textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace" fill="rgba(214,217,225,0.7)" letterSpacing="0.04em">post</text>
            {/* connections */}
            <line x1={x} y1="39" x2={x} y2="46" stroke="rgba(96,165,250,0.5)" strokeWidth="0.8" />
            <line x1={x} y1="64" x2={x} y2="73" stroke="rgba(34,211,238,0.5)" strokeWidth="0.8" />
          </g>
        ))}
      </svg>
    );
  }
  // idx === 2 — Continuity — timeline with surviving decisions
  return (
    <svg viewBox="0 0 220 110" width="100%" height="110" style={{ display: "block" }}>
      <defs>
        <linearGradient id="lg-cont" x1="0" x2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* timeline arc */}
      <path d="M 14 86 Q 110 12 206 86" fill="none" stroke="url(#lg-cont)" strokeWidth="1.4" strokeDasharray="3 3" />
      {/* session nodes */}
      {[
        { x: 20, y: 80, label: "S1" },
        { x: 75, y: 36, label: "S2" },
        { x: 145, y: 36, label: "S3" },
        { x: 200, y: 80, label: "S∞" },
      ].map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r="10" fill="rgba(34,211,238,0.10)" stroke="url(#lg-cont)" strokeWidth="1.2" />
          <text x={s.x} y={s.y + 3} textAnchor="middle" fontSize="8" fontFamily="ui-monospace, monospace" fill="#d6d9e1" letterSpacing="0.04em">{s.label}</text>
        </g>
      ))}
      {/* central STATE.md core */}
      <rect x="86" y="58" width="48" height="20" rx="3" fill="rgba(34,211,238,0.07)" stroke="url(#lg-cont)" strokeWidth="1" />
      <text x="110" y="72" textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="#f7f8fb" letterSpacing="0.04em">STATE.md</text>
    </svg>
  );
}

function LayerCard({ card, idx, accent, inView, delay }) {
  return (
    <article
      className="card"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: 0,
        animation: inView ? `fade-up 0.7s ${delay}s cubic-bezier(0.2,0.65,0.2,1) backwards` : "none",
      }}
    >
      {/* top accent line */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accent.line}, transparent)`,
          opacity: 0.85,
        }}
      />
      {/* corner glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -60, right: -60,
          width: 240, height: 240,
          background: `radial-gradient(circle, ${accent.glow}, transparent 70%)`,
          filter: "blur(40px)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
      <div style={{ padding: "26px 28px 28px", position: "relative" }}>
        <div className="card-eyebrow">
          <span className="card-n">{card.n}</span>
          <span className="card-tag">{card.tag}</span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16 }}>
          <h3 className="h-card" style={{ fontSize: 30 }}>
            <span
              style={{
                background: `linear-gradient(95deg, ${accent.line}, var(--iris-cyan))`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {card.name}
            </span>
          </h3>
        </div>

        <div style={{ marginBottom: 22 }}>
          <LayerVisual idx={idx} />
        </div>

        <p style={{ color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>
          {card.body}
        </p>

        <div className="chip-row" style={{ marginTop: 18 }}>
          {card.tokens.map((t, i) => (
            <span key={i} className="chip">
              <span style={{ width: 4, height: 4, borderRadius: 2, background: accent.line, opacity: 0.8 }} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Layers({ copy }) {
  const [ref, inView] = useInView();
  return (
    <section id="framework" className="section" ref={ref}>
      <div className="wrap">
        <SectionHead eyebrow={copy.eyebrow} title={copy.title} sub={copy.sub} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {copy.cards.map((card, i) => (
            <LayerCard
              key={i}
              card={card}
              idx={i}
              accent={LAYER_ACCENTS[i]}
              inView={inView}
              delay={0.1 + i * 0.12}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Layers });
