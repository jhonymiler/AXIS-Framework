// app.jsx — root App + Nav + Tweaks panel

function Nav({ lang, setLang, copy }) {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <div className="nav-left">
          <a className="nav-logo" href="#top">
            <LogoMark size={22} />
            <span>AXIS</span>
            <span style={{ color: "var(--ink-3)", fontWeight: 400, fontSize: 12, letterSpacing: "0.02em" }}>/ bootstrap</span>
          </a>
          <a className="nav-link" href="#framework">{copy.framework}</a>
          <a className="nav-link" href="#docs">{copy.docs}</a>
        </div>
        <div className="nav-right">
          <div className="lang-toggle">
            <button type="button" className={lang === "en" ? "is-active" : ""} onClick={() => setLang("en")}>EN</button>
            <button type="button" className={lang === "pt" ? "is-active" : ""} onClick={() => setLang("pt")}>PT</button>
          </div>
          <a className="nav-link" href="#github" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.34c-2.23.49-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.52-1.03 2.19-.82 2.19-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.74.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            GitHub
          </a>
          <a className="btn btn-prim nav-cta" href="#install" style={{ padding: "9px 14px", fontSize: 12 }}>
            <span style={{ position: "relative", zIndex: 1 }}>{copy.install}</span>
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 740px) {
          .nav-cta { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "en",
  "headline": "B",
  "motion": 6,
  "accent": "iris"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const copy = window.COPY[t.lang] || window.COPY.en;

  // Apply accent palette override
  useEffect(() => {
    const root = document.documentElement;
    if (t.accent === "iris") {
      root.style.setProperty("--iris-violet", "#a78bfa");
      root.style.setProperty("--iris-blue",   "#60a5fa");
      root.style.setProperty("--iris-cyan",   "#22d3ee");
      root.style.setProperty("--iris-pink",   "#f0abfc");
    } else if (t.accent === "warm") {
      root.style.setProperty("--iris-violet", "#f0abfc");
      root.style.setProperty("--iris-blue",   "#fb923c");
      root.style.setProperty("--iris-cyan",   "#fbbf24");
      root.style.setProperty("--iris-pink",   "#f472b6");
    } else if (t.accent === "matrix") {
      root.style.setProperty("--iris-violet", "#34d399");
      root.style.setProperty("--iris-blue",   "#22d3ee");
      root.style.setProperty("--iris-cyan",   "#a3e635");
      root.style.setProperty("--iris-pink",   "#facc15");
    } else if (t.accent === "mono") {
      root.style.setProperty("--iris-violet", "#e5e7eb");
      root.style.setProperty("--iris-blue",   "#cbd5e1");
      root.style.setProperty("--iris-cyan",   "#94a3b8");
      root.style.setProperty("--iris-pink",   "#e5e7eb");
    }
  }, [t.accent]);

  return (
    <>
      <div id="top" />
      <Nav lang={t.lang} setLang={(v) => setTweak("lang", v)} copy={copy.nav} />

      <Hero copy={copy.hero} variant={t.headline} motion={t.motion} />

      <div className="divider" />

      <Layers copy={copy.layers} />

      <TokensSection copy={copy.tokens} />

      <IdesSection copy={copy.ides} motion={t.motion} />

      <TerminalDemo copy={copy.terminal} motion={t.motion} />

      <ResearchSection copy={copy.research} />

      <FinalCTA copy={copy.cta} motion={t.motion} />

      <Footer copy={copy.footer} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Language" />
        <TweakRadio
          label="Language"
          value={t.lang}
          options={[
            { value: "en", label: "EN" },
            { value: "pt", label: "PT" },
          ]}
          onChange={(v) => setTweak("lang", v)}
        />

        <TweakSection label="Hero" />
        <TweakSelect
          label="Headline angle"
          value={t.headline}
          options={[
            { value: "A", label: "A · pain / authority" },
            { value: "B", label: "B · mechanism (recommended)" },
            { value: "C", label: "C · competitive" },
          ]}
          onChange={(v) => setTweak("headline", v)}
        />

        <TweakSection label="Aesthetic" />
        <TweakSelect
          label="Accent palette"
          value={t.accent}
          options={[
            { value: "iris", label: "Iridescent · violet→cyan" },
            { value: "warm", label: "Warm · pink→amber" },
            { value: "matrix", label: "Matrix · green→cyan" },
            { value: "mono", label: "Mono · grayscale" },
          ]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSlider
          label="Motion"
          value={t.motion}
          min={0} max={10} step={1}
          onChange={(v) => setTweak("motion", v)}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
