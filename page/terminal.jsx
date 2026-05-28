// terminal.jsx — live `axis init` demo

function TerminalLine({ line, isLast, showCursor }) {
  const { kind, text, detail } = line;

  if (kind === "cmd") {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
        <span style={{ color: "var(--iris-cyan)" }}>$</span>
        <span style={{ color: "var(--ink-0)" }}>{text}</span>
        {showCursor && <span className="cursor" style={{ background: "var(--ink-0)" }} />}
      </div>
    );
  }
  if (kind === "info") {
    return (
      <div style={{ color: "var(--ink-2)", paddingLeft: 18 }}>
        <span style={{ color: "var(--ink-3)" }}>·</span> {text}
      </div>
    );
  }
  if (kind === "step") {
    return (
      <div style={{ paddingLeft: 18, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
        <span style={{ color: "var(--iris-violet)" }}>›</span>
        <span style={{ color: "var(--ink-1)", fontWeight: 500 }}>{text}</span>
        {detail && <span style={{ color: "var(--ink-3)" }}>· {detail}</span>}
        {isLast && showCursor && <span className="cursor" style={{ background: "var(--ink-1)" }} />}
      </div>
    );
  }
  if (kind === "ok") {
    return (
      <div style={{ paddingLeft: 30, color: "var(--ok)", display: "flex", gap: 8, alignItems: "baseline" }}>
        <span>✓</span>
        <span style={{ color: "var(--ink-1)" }}>{text}</span>
      </div>
    );
  }
  if (kind === "done") {
    return (
      <div style={{ paddingLeft: 18, marginTop: 6, color: "var(--iris-cyan)", fontWeight: 500 }}>
        {text}
      </div>
    );
  }
  return null;
}

function TerminalDemo({ copy, motion }) {
  const [ref, inView] = useInView();
  const [shown, setShown] = useState(0);
  const [finished, setFinished] = useState(false);
  const lines = copy.lines;

  // Auto-play when in view
  useEffect(() => {
    if (!inView) return;
    setShown(0);
    setFinished(false);
    const speed = Math.max(150, 700 - motion * 60);
    let i = 0;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i < lines.length) {
        // slower for steps, faster for ok
        const next = lines[i]?.kind === "step" ? speed : lines[i]?.kind === "done" ? speed * 1.4 : speed * 0.5;
        timer = setTimeout(tick, next);
      } else {
        setFinished(true);
      }
    };
    let timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [inView, motion, lines.length]);

  const replay = () => {
    setShown(0);
    setFinished(false);
    const speed = Math.max(150, 700 - motion * 60);
    let i = 0;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i < lines.length) {
        const next = lines[i]?.kind === "step" ? speed : lines[i]?.kind === "done" ? speed * 1.4 : speed * 0.5;
        timer = setTimeout(tick, next);
      } else {
        setFinished(true);
      }
    };
    let timer = setTimeout(tick, speed);
  };

  return (
    <section className="section" ref={ref} style={{ position: "relative" }}>
      <div className="wrap">
        <SectionHead eyebrow={copy.eyebrow} title={copy.title} sub={copy.sub} />

        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            position: "relative",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* glow behind */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "20%", right: "20%", top: "50%",
              height: "60%",
              background: "radial-gradient(ellipse, rgba(96,165,250,0.18), transparent 60%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />

          {/* chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 18px",
              borderBottom: "1px solid var(--line-1)",
              background: "rgba(255,255,255,0.015)",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ width: 11, height: 11, borderRadius: 999, background: "#ff5f57", opacity: 0.85 }} />
              <span style={{ width: 11, height: 11, borderRadius: 999, background: "#febc2e", opacity: 0.85 }} />
              <span style={{ width: 11, height: 11, borderRadius: 999, background: "#28c840", opacity: 0.85 }} />
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.04em", flex: 1, textAlign: "center" }}>
              ~/projects/my-app — axis init
            </div>
            <button
              onClick={replay}
              type="button"
              style={{
                appearance: "none",
                border: "1px solid var(--line-2)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--ink-2)",
                padding: "5px 10px",
                borderRadius: 6,
                fontFamily: "var(--ff-mono)",
                fontSize: 11,
                letterSpacing: "0.04em",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M3 5 a5 5 0 1 1 -.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M1 2 L3 5 L6 4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              replay
            </button>
          </div>

          {/* body */}
          <div
            style={{
              padding: "28px 30px 32px",
              minHeight: 420,
              fontFamily: "var(--ff-mono)",
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--ink-1)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {lines.slice(0, shown).map((line, i) => (
              <div
                key={i}
                style={{
                  animation: "fade-up 0.25s cubic-bezier(0.2,0.65,0.2,1) backwards",
                }}
              >
                <TerminalLine
                  line={line}
                  isLast={i === shown - 1}
                  showCursor={i === shown - 1 && !finished && line.kind !== "ok" && line.kind !== "done" && line.kind !== "info"}
                />
              </div>
            ))}
            {shown === 0 && inView && (
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", color: "var(--ink-3)" }}>
                <span style={{ color: "var(--iris-cyan)" }}>$</span>
                <span className="cursor" style={{ background: "var(--ink-1)" }} />
              </div>
            )}
            {finished && (
              <div
                style={{
                  marginTop: 22,
                  paddingTop: 18,
                  borderTop: "1px solid var(--line-1)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                <span className="chip mono" style={{ color: "var(--ok)", borderColor: "rgba(52, 211, 153, 0.3)", background: "rgba(52, 211, 153, 0.08)" }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--ok)" }} />
                  23 files written
                </span>
                <span className="chip mono">12 skills</span>
                <span className="chip mono">7 rules</span>
                <span className="chip mono">5 IDE symlinks</span>
                <span className="chip mono">0 lines of your app touched</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { TerminalDemo });
