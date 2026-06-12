/* app.jsx — root: state machine, nav, responsive frame chrome, tweaks. */

const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "stacked",
  "accent": "oklch(0.55 0.24 264)"
}/*EDITMODE-END*/;

/* seed history for signed-in users */
const NOW = Date.now();
const SEED = [
  { code: "qx7Lp", shortUrl: "sho.rt/qx7Lp", url: "https://www.notion.so/workspace/Engineering-onboarding-guide-2026-edition-4f2a9c", createdAt: NOW - 2 * DAY, expiresAt: null, clicks: 1284, owner: "me" },
  { code: "mB3kz", shortUrl: "sho.rt/mB3kz", url: "https://github.com/acme/platform/pull/4821/files#diff-aa9", createdAt: NOW - 6 * DAY, expiresAt: null, clicks: 342, owner: "me" },
  { code: "tt9Qw", shortUrl: "sho.rt/tt9Qw", url: "https://docs.google.com/presentation/d/1aZ_q4/edit#slide=id.g12", createdAt: NOW - 9 * DAY, expiresAt: NOW + 4 * DAY, clicks: 58, owner: "me" },
  { code: "vK2np", shortUrl: "sho.rt/vK2np", url: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M", createdAt: NOW - 14 * DAY, expiresAt: NOW + 21 * DAY, clicks: 906, owner: "me" },
  { code: "hZ4rj", shortUrl: "sho.rt/hZ4rj", url: "https://www.figma.com/file/9aB/Design-system?node-id=120-4", createdAt: NOW - 22 * DAY, expiresAt: null, clicks: 71, owner: "me" },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("home");
  const [demo, setDemo] = useState(null);
  const [demoNonce, setDemoNonce] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [links, setLinks] = useState([]);
  const [createCount, setCreateCount] = useState(0);
  const [qrLink, setQrLink] = useState(null);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // apply accent
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  function pushToast(msg) {
    setToast(msg);
    clearTimeout(pushToast._t);
    pushToast._t = setTimeout(() => setToast(null), 2000);
  }

  function navigate(s) { setScreen(s); setDemo(null); setMenuOpen(false); }
  function selectDemo(s, d) { setScreen(s); setDemo(d || null); setDemoNonce(n => n + 1); setMenuOpen(false); }

  // bridge for the preview chrome's States dropdown
  useEffect(() => {
    window.__appSelect = (val) => {
      if (!val) return;
      const [s, d] = val.split("|");
      if (s === "history" && !d) { signIn(); return; }   // filled history needs an account
      selectDemo(s, d);
    };
    return () => { delete window.__appSelect; };
  });

  function createLink({ url, expiresAt }) {
    const count = createCount + 1;
    setCreateCount(count);
    if (!signedIn && count > 5) return { ok: false };
    const link = { code: makeCode(), url, expiresAt, createdAt: Date.now(), clicks: 0, owner: signedIn ? "me" : null };
    link.shortUrl = "sho.rt/" + link.code;
    setLinks(prev => [link, ...prev]);
    return { ok: true, link };
  }

  function signIn() {
    setLinks(prev => prev.map(l => l.owner === null ? { ...l, owner: "me", expiresAt: null } : l));
    setLinks(prev => {
      const have = new Set(prev.map(l => l.code));
      const merged = [...prev];
      SEED.forEach(s => { if (!have.has(s.code)) merged.push(s); });
      return merged;
    });
    setSignedIn(true);
    setScreen("history");
    setDemo(null);
    pushToast("Signed in — links claimed");
  }
  function signOut() {
    setSignedIn(false); setMenuOpen(false); setScreen("home"); setDemo(null);
    setLinks(prev => prev.filter(l => l.owner !== "me" || !SEED.find(s => s.code === l.code) ? l.owner !== "me" : false).filter(l => !SEED.find(s => s.code === l.code)));
    pushToast("Signed out");
  }

  const pendingCount = links.filter(l => l.owner === null).length;

  return (
    <div className="app-canvas" data-screen-label={screen}>
      <div className="shell">
        {/* NAV */}
        <nav className="nav">
          <button className="brand" onClick={() => navigate("home")}>
            <span className="brand-mark"><Icon name="scissors" size={19} /></span>
            sho.rt
          </button>
          <div className="nav-right">
            {signedIn && (
              <button className={"nav-link" + (screen === "history" ? " active" : "")} onClick={() => navigate("history")}>
                <Icon name="link" size={17} /> My links
              </button>
            )}
            {signedIn ? (
              <div style={{ position: "relative" }}>
                <button className="nav-avatar" onClick={() => setMenuOpen(v => !v)} aria-label="Account">AC</button>
                {menuOpen && (
                  <div style={{ position: "absolute", right: 0, top: 46, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "var(--sh-3)", padding: 6, minWidth: 190, zIndex: 50 }}>
                    <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--line)", marginBottom: 4 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>Alex Chen</div>
                      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>alex@acme.co</div>
                    </div>
                    <button className="nav-link" style={{ width: "100%", justifyContent: "flex-start" }} onClick={signOut}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="subtle" onClick={() => navigate("signin")} style={{ height: 40 }}>Sign in</Button>
            )}
          </div>
        </nav>

        {/* SCREENS */}
        {screen === "home" && (
          <HomeScreen key={"home-" + demoNonce} signedIn={signedIn} heroVariant={t.heroVariant}
            demo={demo} onCreate={createLink} onNavigate={navigate} openQR={setQrLink} />
        )}
        {screen === "signin" && <SignInScreen onSignIn={signIn} pendingCount={pendingCount} />}
        {screen === "history" && (
          <HistoryScreen key={"hist-" + demoNonce} links={links} demo={demo}
            onNavigate={navigate} openQR={setQrLink} pushToast={pushToast} />
        )}
        {screen === "404" && <Interstitial kind="404" onNavigate={navigate} />}
        {screen === "410" && <Interstitial kind="410" onNavigate={navigate} />}

        {/* FOOTER */}
        {screen !== "404" && screen !== "410" && (
          <footer className="foot">
            <span>sho.rt — a focused link shortener</span>
            <span className="foot-dots">
              <a href="#" onClick={(e) => e.preventDefault()}>API</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            </span>
          </footer>
        )}
      </div>

      {qrLink && <QRModal link={qrLink} onClose={() => setQrLink(null)} />}
      {toast && <div className="toast"><Icon name="check" size={16} /> {toast}</div>}

      {/* TWEAKS */}
      <TweaksPanel>
        <TweakSection label="Hero" />
        <TweakRadio label="Layout" value={t.heroVariant}
          options={["stacked", "oversized", "split"]}
          onChange={(v) => setTweak("heroVariant", v)} />
        <TweakSection label="Color" />
        <TweakColor label="Accent" value={t.accent}
          options={["oklch(0.55 0.24 264)", "oklch(0.6 0.2 240)", "oklch(0.52 0.26 286)", "oklch(0.58 0.17 224)"]}
          onChange={(v) => setTweak("accent", v)} />
      </TweaksPanel>
    </div>
  );
}

/* ============================================================
   RESPONSIVE PREVIEW FRAME (chrome — outside the scaled app)
   ============================================================ */
const PRESETS = [
  { id: "mobile", w: 375, label: "Mobile", icon: "375" },
  { id: "tablet", w: 768, label: "Tablet", icon: "768" },
  { id: "desktop", w: 1440, label: "Desktop", icon: "1440" },
];
const STATES = [
  { v: "home|default", label: "Home — default" },
  { v: "home|invalid", label: "Home — invalid URL" },
  { v: "home|rate", label: "Home — rate limited" },
  { v: "home|success", label: "Home — success + result" },
  { v: "signin|", label: "Sign in" },
  { v: "history|", label: "History — filled (sign in first)" },
  { v: "history|empty", label: "History — empty" },
  { v: "history|loading", label: "History — loading skeleton" },
  { v: "404|", label: "Redirect — 404 not found" },
  { v: "410|", label: "Redirect — 410 expired" },
];

function Viewer() {
  const [preset, setPreset] = useState("desktop");
  const [width, setWidth] = useState(1440);
  const stageRef = useRef(null);
  const appApiRef = useRef(null);
  const [avail, setAvail] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setAvail({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setAvail({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const fit = preset === "fit";
  const targetW = fit ? Math.max(360, avail.w) : width;
  const pad = 0;
  const scale = targetW > avail.w - pad ? (avail.w - pad) / targetW : 1;
  const frameH = Math.max(480, avail.h / scale);

  function pick(p) { setPreset(p.id); setWidth(p.w); }
  function onSlide(e) { setPreset("custom"); setWidth(+e.target.value); }

  return (
    <div className="viewer">
      <div className="viewer-bar">
        <div className="vb-brand">
          <span className="vb-dot" /> Responsive preview
        </div>
        <div className="vb-seg" role="group" aria-label="Device width">
          {PRESETS.map(p => (
            <button key={p.id} className={"vb-btn" + (preset === p.id ? " on" : "")} onClick={() => pick(p)}>
              {p.label} <span className="vb-px">{p.w}</span>
            </button>
          ))}
          <button className={"vb-btn" + (fit ? " on" : "")} onClick={() => setPreset("fit")}>Fit</button>
        </div>
        <div className="vb-slider">
          <input type="range" min="320" max="1600" step="1" value={fit ? Math.round(avail.w) : width}
            onChange={onSlide} disabled={fit} aria-label="Custom width" />
          <span className="vb-w">{fit ? Math.round(avail.w) : width}px</span>
        </div>
        <label className="vb-states">
          <select onChange={(e) => { window.__appSelect && window.__appSelect(e.target.value); e.target.selectedIndex = 0; }} aria-label="Jump to state">
            <option value="">States ▾</option>
            {STATES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <div className="viewer-stage" ref={stageRef}>
        <div className="frame" style={{ width: targetW, height: frameH, transform: `scale(${scale})` }}>
          <App />
        </div>
      </div>
    </div>
  );
}

/* bridge: the States dropdown calls window.__appSelect, registered by <App/>. */

ReactDOM.createRoot(document.getElementById("root")).render(<Viewer />);
