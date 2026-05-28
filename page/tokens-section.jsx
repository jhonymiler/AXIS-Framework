// tokens-section.jsx — animated token budget comparison

function useCountUp(target, inView, duration = 1400, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    const startTimer = setTimeout(() => {
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(target * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
  }, [inView, target, duration, delay]);
  return val;
}

function TokenBar({ label, fixedMin, fixedMax, onDemandMax, accentLine, accentBg, inView, delay, fixedLabel, onDemandLabel, total }) {
  const MAX = 12000; // global scale
  const fixedW = useCountUp((fixedMax / MAX) * 100, inView, 1200, delay);
  const odW = useCountUp((onDemandMax / MAX) * 100, inView, 1200, delay + 200);
  const num = useCountUp(fixedMax, inView, 1500, delay);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {label}
        </span>
        <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>
          <span style={{ color: "var(--ink-0)", fontWeight: 500, fontSize: 13 }}>
            {Math.round(num).toLocaleString()}
          </span>
          {onDemandMax > 0 && (
            <span style={{ color: "var(--ink-3)" }}> + {onDemandMax.toLocaleString()} on-demand</span>
          )}
        </span>
      </div>

      <div
        style={{
          position: "relative",
          height: 38,
          borderRadius: 6,
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--line-1)",
          overflow: "hidden",
        }}
      >
        {/* Fixed portion */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${fixedW}%`,
            background: accentBg,
            transition: "width 0.05s linear",
          }}
        />
        {/* on-demand portion (dashed style) */}
        {onDemandMax > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: `${fixedW}%`,
              width: `${odW}%`,
              background:
                "repeating-linear-gradient(45deg, rgba(34,211,238,0.18) 0 6px, transparent 6px 12px)",
              borderLeft: "1px dashed rgba(34, 211, 238, 0.5)",
              transition: "width 0.05s linear, left 0.05s linear",
            }}
          />
        )}
        {/* End line / glow */}
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `calc(${fixedW + odW}% - 1px)`,
            width: 2,
            background: accentLine,
            boxShadow: `0 0 14px ${accentLine}`,
            opacity: 0.95,
          }}
        />
      </div>

      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.02em", display: "flex", gap: 16 }}>
        <span><span style={{ display: "inline-block", width: 8, height: 8, background: accentBg, borderRadius: 2, marginRight: 6, verticalAlign: "middle" }} />{fixedLabel}</span>
        {onDemandMax > 0 && (
          <span><span style={{ display: "inline-block", width: 8, height: 8, background: "repeating-linear-gradient(45deg, rgba(34,211,238,0.4) 0 2px, transparent 2px 4px)", borderRadius: 2, marginRight: 6, verticalAlign: "middle" }} />{onDemandLabel}</span>
        )}
      </div>
    </div>
  );
}

function TokensSection({ copy }) {
  const [ref, inView] = useInView();
  const drop = useCountUp(90, inView, 1500, 600);

  return (
    <section className="section" ref={ref} style={{ position: "relative" }}>
      <div className="wrap">
        <SectionHead eyebrow={copy.eyebrow} title={copy.title} sub={copy.sub} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 280px",
            gap: 48,
            alignItems: "center",
          }}
          className="tk-grid"
        >
          <div
            className="card"
            style={{
              padding: "36px 36px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 36,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
            }}
          >
            <TokenBar
              label={copy.before}
              fixedMax={11500}
              fixedMin={8000}
              onDemandMax={0}
              accentLine="#f87171"
              accentBg="linear-gradient(90deg, rgba(248,113,113,0.5), rgba(248,113,113,0.25))"
              inView={inView}
              delay={50}
              fixedLabel={`8–12k ${copy.fixed}`}
              total={copy.perSession}
            />
            <TokenBar
              label={copy.after}
              fixedMax={1200}
              fixedMin={800}
              onDemandMax={1600}
              accentLine="#22d3ee"
              accentBg="linear-gradient(90deg, rgba(34,211,238,0.55), rgba(96,165,250,0.35))"
              inView={inView}
              delay={250}
              fixedLabel={`800–1.5k ${copy.fixed}`}
              onDemandLabel={copy.onDemand}
              total={copy.perSession}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
              animation: inView ? "fade-up 0.8s 0.4s cubic-bezier(0.2,0.65,0.2,1) backwards" : "none",
            }}
            className="tk-aside"
          >
            <div className="eyebrow mono">// fixed budget drop</div>
            <div
              style={{
                fontFamily: "var(--ff-sans)",
                fontSize: "clamp(64px, 8vw, 110px)",
                fontWeight: 500,
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                marginTop: 4,
              }}
            >
              <span className="iris">−{Math.round(drop)}<span style={{ fontSize: "0.5em", verticalAlign: "0.15em" }}>%</span></span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.5, maxWidth: 240 }}>
              Same model. Same prompts. Smaller bill. Faster session.
            </div>
            <div style={{ marginTop: 12, paddingTop: 16, borderTop: "1px solid var(--line-1)", width: "100%" }}>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                source · FRAMEWORK.md
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 6 }}>
                Measurable Benefits table
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 820px) {
            .tk-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

Object.assign(window, { TokensSection });
