// closing.jsx — research grounding + final CTA + footer

function ResearchSection({ copy }) {
  const [ref, inView] = useInView();
  return (
    <section className="section" ref={ref}>
      <div className="wrap">
        <SectionHead eyebrow={copy.eyebrow} title={copy.title} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 0,
            border: "1px solid var(--line-1)",
            borderRadius: 16,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
          }}
        >
          {copy.items.map((it, i) => (
            <div
              key={i}
              style={{
                padding: "36px 32px 32px",
                borderRight: i < copy.items.length - 1 ? "1px solid var(--line-1)" : "none",
                position: "relative",
                animation: inView ? `fade-up 0.7s ${0.1 + i * 0.12}s cubic-bezier(0.2,0.65,0.2,1) backwards` : "none",
              }}
              className="research-cell"
            >
              <div
                className="mono"
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  marginBottom: 22,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: ["var(--iris-violet)", "var(--iris-blue)", "var(--iris-cyan)"][i] }} />
                {it.tag}
              </div>
              <div
                style={{
                  fontSize: "clamp(40px, 5vw, 64px)",
                  fontWeight: 500,
                  letterSpacing: "-0.035em",
                  lineHeight: 0.95,
                  marginBottom: 22,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span className="iris">{it.stat}</span>
              </div>
              <p style={{ color: "var(--ink-1)", fontSize: 15, lineHeight: 1.55, margin: 0, marginBottom: 18 }}>
                {it.claim}
              </p>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: "0.02em",
                  paddingTop: 14,
                  borderTop: "1px solid var(--line-1)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M7 9 L4 12 a2.83 2.83 0 1 1 -4-4 L3 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M9 7 L12 4 a2.83 2.83 0 1 1 4 4 L13 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {it.source}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 920px) {
            .research-cell { border-right: 0 !important; border-bottom: 1px solid var(--line-1); }
            .research-cell:last-child { border-bottom: 0; }
          }
        `}</style>
      </div>
    </section>
  );
}

function FinalCTA({ copy, motion }) {
  const [ref, inView] = useInView();
  return (
    <section
      className="section"
      ref={ref}
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBottom: "clamp(120px, 14vw, 200px)",
      }}
    >
      <IrisOrb motion={motion} />

      <div className="wrap" style={{ position: "relative", zIndex: 3, textAlign: "center" }}>
        <div className="eyebrow mono" style={{ justifyContent: "center", marginBottom: 24 }}>
          {copy.eyebrow}
        </div>

        <div style={{ maxWidth: "32ch", margin: "0 auto", marginBottom: 38 }}>
          {copy.lines.map((line, i) => (
            <p
              key={i}
              className="fade-up"
              style={{
                fontFamily: "var(--ff-sans)",
                fontSize: "clamp(20px, 2.4vw, 30px)",
                fontWeight: 400,
                letterSpacing: "-0.018em",
                lineHeight: 1.25,
                color: i === 0 ? "var(--ink-0)" : "var(--ink-2)",
                margin: "0 0 4px",
                textWrap: "balance",
                animationDelay: `${0.1 + i * 0.1}s`,
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 38,
            animation: "fade-up 0.8s 0.6s cubic-bezier(0.2,0.65,0.2,1) backwards",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              padding: "8px 16px",
              border: "1px solid var(--line-2)",
              borderRadius: 999,
              background: "rgba(255,255,255,0.025)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ width: 26, height: 1, background: "var(--iris-blue)" }} />
            <span className="mono iris" style={{ fontSize: 13, letterSpacing: "0.02em", fontWeight: 500 }}>
              {copy.or}
            </span>
            <span style={{ width: 26, height: 1, background: "var(--iris-cyan)" }} />
          </div>
        </div>

        <div style={{ display: "inline-flex", animation: "fade-up 0.8s 0.7s cubic-bezier(0.2,0.65,0.2,1) backwards" }}>
          <CopyCommand text={copy.command} hint={copy.hint} />
        </div>
      </div>
    </section>
  );
}

function Footer({ copy }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <LogoMark size={28} />
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "0.03em", color: "var(--ink-0)" }}>
                {copy.tag}
              </div>
            </div>
            <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.55, maxWidth: 280, margin: 0 }}>
              {copy.desc}
            </p>
          </div>
          {copy.cols.map((col, i) => (
            <div className="footer-col" key={i}>
              <h4>{col.h}</h4>
              <ul>
                {col.items.map((it, j) => (
                  <li key={j}>
                    <a href="#" onClick={(e) => e.preventDefault()}>{it}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-legal">
          <div>{copy.legal}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--ok)", boxShadow: "0 0 8px var(--ok)" }} />
            recursive · self-bootstrapped
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { ResearchSection, FinalCTA, Footer });
