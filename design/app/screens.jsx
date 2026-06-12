/* screens.jsx — Home, SignIn, History, Interstitial + helpers. Exports to window. */

/* ---------- utils ---------- */
const BASE62 = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(len = 5) {
  let s = "";
  for (let i = 0; i < len; i++) s += BASE62[Math.floor(Math.random() * BASE62.length)];
  return s;
}
function normalizeUrl(raw) {
  let v = (raw || "").trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  try {
    const u = new URL(v);
    if (!u.hostname.includes(".") || u.hostname.startsWith(".") || u.hostname.endsWith(".")) return null;
    return u.href;
  } catch { return null; }
}
function hostOf(url) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } }
function truncMid(s, max = 52) {
  if (!s) return "";
  s = s.replace(/^https?:\/\//, "");
  if (s.length <= max) return s;
  const head = Math.ceil(max * 0.6), tail = max - head - 1;
  return s.slice(0, head) + "…" + s.slice(s.length - tail);
}
const DAY = 86400000;
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtShort(ts) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function daysLeft(ts) { return Math.ceil((ts - Date.now()) / DAY); }

/* ---------- QR modal ---------- */
function QRModal({ link, onClose }) {
  React.useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="modal-scrim" onMouseDown={onClose}>
      <div className="modal" style={{ position: "relative" }} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="QR code">
        <div className="modal-close">
          <button className="modal-x" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
        </div>
        <h3>Scan to open</h3>
        <p className="msub">{link.shortUrl}</p>
        <div className="qr-big"><QRCode value={"https://" + link.shortUrl} size={220} /></div>
        <Button variant="ghost" block leftIcon="external" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

/* ============================================================
   HOME / SHORTEN
   ============================================================ */
function HomeScreen({ signedIn, onCreate, onNavigate, openQR, demo, heroVariant }) {
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState("idle"); // idle | loading | success | err-invalid | err-rate
  const [result, setResult] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const [showTtl, setShowTtl] = React.useState(false);
  const [ttl, setTtl] = React.useState(signedIn ? "forever" : 30);
  const [customDate, setCustomDate] = React.useState("");
  const inputRef = React.useRef(null);

  // apply forced demo state from the States menu
  React.useEffect(() => {
    if (!demo) return;
    if (demo === "default") { setStatus("idle"); setResult(null); setInput(""); }
    else if (demo === "invalid") { setInput("htp:/not a url"); setStatus("err-invalid"); setResult(null); }
    else if (demo === "rate") { setInput("https://example.com/very/long/path"); setStatus("err-rate"); setResult(null); }
    else if (demo === "success") {
      const link = { code: "k7Pq2", shortUrl: "sho.rt/k7Pq2", url: "https://www.figma.com/design/9aB/Quarterly-roadmap-FY26?node-id=2401-1180", createdAt: Date.now(), expiresAt: signedIn ? null : Date.now() + 30 * DAY, clicks: 0 };
      setResult(link); setStatus("success"); setInput(link.url);
    }
  }, [demo, signedIn]);

  function reset() { setStatus("idle"); setResult(null); setCopied(false); }

  function submit(e) {
    e && e.preventDefault();
    const norm = normalizeUrl(input);
    if (!norm) { setStatus("err-invalid"); return; }
    setStatus("loading");
    setTimeout(() => {
      let expiresAt = null;
      if (ttl === "forever") expiresAt = null;
      else if (ttl === "custom") expiresAt = customDate ? new Date(customDate).getTime() : Date.now() + 30 * DAY;
      else expiresAt = Date.now() + ttl * DAY;
      if (!signedIn && ttl === "forever") expiresAt = Date.now() + 30 * DAY;
      const res = onCreate({ url: norm, expiresAt });
      if (!res.ok) { setStatus("err-rate"); return; }
      setResult(res.link);
      setStatus("success");
      setCopied(false);
    }, 780);
  }

  async function doCopy() {
    try { await navigator.clipboard.writeText("https://" + result.shortUrl); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  const invalid = status === "err-invalid";
  const loading = status === "loading";
  const showResult = status === "success" && result;
  const ttlChips = signedIn
    ? [["forever", "Forever"], [7, "7 days"], [30, "30 days"], [90, "90 days"], ["custom", "Custom"]]
    : [[7, "7 days"], [30, "30 days"], [90, "90 days"], ["custom", "Custom"]];

  const heroTitle = heroVariant === "oversized"
    ? (<><em>Short</em> links,<br/>zero friction.</>)
    : heroVariant === "split"
    ? (<>Paste it. <em>Shorten</em> it.<br/>Share it.</>)
    : (<>Make long links <em>short</em>.</>);

  return (
    <div className={"page hero-page hv-" + heroVariant}>
      <div className="container">
        <section className="hero">
          <div className="hero-inner">
            <span className="eyebrow"><span className="dot" /> Free · No account needed</span>
            <h1>{heroTitle}</h1>
            <p className="sub">Paste a long URL and get a clean, shareable short link instantly — with a QR code and click tracking built in.</p>
          </div>

          {/* shorten box */}
          <form className="shortbox" onSubmit={submit} noValidate>
            <div className="shortbox-row">
              <div className={"field" + (invalid ? " invalid" : "")}>
                <span className="leadicon"><Icon name="link" size={19} /></span>
                <input
                  ref={inputRef}
                  className="input"
                  type="text"
                  inputMode="url"
                  placeholder="Paste a long link…"
                  aria-label="Long URL"
                  aria-invalid={invalid}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); if (status !== "idle" && status !== "success") setStatus("idle"); }}
                />
              </div>
              <Button type="submit" size="lg" disabled={loading || !input.trim()} rightIcon={loading ? undefined : "arrow-right"}>
                {loading ? <span className="spinner" /> : "Shorten"}
              </Button>
            </div>

            {/* TTL options */}
            <div className="shortbox-opts">
              <button type="button" className={"ttl-toggle" + (showTtl ? " open" : "")} onClick={() => setShowTtl(v => !v)}>
                <Icon name="clock" size={16} /> Set expiry {ttl === "forever" ? "· Forever" : ttl === "custom" ? "· Custom" : `· ${ttl} days`}
                <span className="chev"><Icon name="chevron-down" size={15} /></span>
              </button>
            </div>
            {showTtl && (
              <div className="ttl-panel">
                {ttlChips.map(([v, lbl]) => (
                  <button type="button" key={lbl} className={"ttl-chip" + (ttl === v ? " sel" : "")} onClick={() => setTtl(v)}>{lbl}</button>
                ))}
                {ttl === "custom" && (
                  <input className="ttl-date" type="date" value={customDate} min={new Date(Date.now() + DAY).toISOString().slice(0, 10)} onChange={(e) => setCustomDate(e.target.value)} aria-label="Custom expiry date" />
                )}
              </div>
            )}

            {/* inline alerts */}
            {invalid && (
              <div className="alert err" role="alert">
                <span className="ico"><Icon name="alert" size={18} /></span>
                <span><strong>That doesn't look like a valid URL.</strong> Check for typos — links should look like <code>example.com/page</code>.</span>
              </div>
            )}
            {status === "err-rate" && (
              <div className="alert warn" role="alert">
                <span className="ico"><Icon name="alert" size={18} /></span>
                <span><strong>Too many links from your network.</strong> You've hit the rate limit — try again in a few minutes, or <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("signin"); }} style={{ color: "inherit", fontWeight: 600 }}>sign in</a> for a higher limit.</span>
              </div>
            )}
          </form>

          {/* result */}
          {showResult && (
            <div className="result">
              <div className="result-top">
                <div className="result-main">
                  <div className="result-label">
                    Your short link
                    <span className="badge-ok"><Icon name="check" size={12} /> Ready</span>
                  </div>
                  <div className="shorturl">
                    <a href={"https://" + result.shortUrl} onClick={(e) => e.preventDefault()}>{result.shortUrl}</a>
                    <button className={"copy-btn" + (copied ? " copied" : "")} onClick={doCopy} aria-live="polite">
                      <Icon name={copied ? "check" : "copy"} size={17} />
                      <span className="lbl">{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="orig-url"><b>→</b> {truncMid(result.url, 60)}</div>
                  <div className="result-meta">
                    <span className="m"><Icon name="cursor" size={15} /> {result.clicks} clicks</span>
                    <span className="m"><Icon name="calendar" size={15} /> Created {fmtShort(result.createdAt)}</span>
                  </div>
                </div>
                <div className="qr-wrap">
                  <div className="qr-frame"><QRCode value={"https://" + result.shortUrl} size={110} /></div>
                  <button className="qr-cap" onClick={() => openQR(result)} style={{ background: "none", border: 0, cursor: "pointer" }}>
                    <Icon name="qr" size={14} /> Enlarge QR
                  </button>
                </div>
              </div>
              <div className="result-foot">
                {result.expiresAt ? (
                  <span className="expiry-note">
                    <Icon name="clock" size={17} />
                    Expires in {daysLeft(result.expiresAt)} days —{" "}
                    {signedIn ? "manage it in your history." : (<a className="keep" href="#" onClick={(e) => { e.preventDefault(); onNavigate("signin"); }}>sign in to keep it forever</a>)}
                  </span>
                ) : (
                  <span className="expiry-note">
                    <Icon name="infinity" size={17} style={{ color: "var(--accent)" }} />
                    This link never expires.
                  </span>
                )}
                <button className="secondary" onClick={reset}><Icon name="plus" size={16} /> Shorten another</button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* sticky mobile action */}
      <div className={"sticky-action" + (input.trim() && !showResult ? " show" : "")}>
        <Button block size="lg" onClick={submit} disabled={loading || !input.trim()}>
          {loading ? <span className="spinner" /> : "Shorten link"}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   SIGN IN
   ============================================================ */
function SignInScreen({ onSignIn, pendingCount }) {
  const [busy, setBusy] = React.useState(false);
  function go() {
    setBusy(true);
    setTimeout(() => onSignIn(), 900);
  }
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark"><Icon name="scissors" size={26} /></div>
        <h2>Sign in to sho.rt</h2>
        <p className="sub">Save your links, track clicks over time, and keep them from ever expiring.</p>
        <button className="gbtn" onClick={go} disabled={busy}>
          {busy ? <span className="spinner" style={{ borderColor: "rgba(0,0,0,.15)", borderTopColor: "var(--accent)" }} /> : <GoogleG size={20} />}
          {busy ? "Signing in…" : "Continue with Google"}
        </button>
        <div className="claim-note">
          <Icon name="shield" size={18} />
          <span>{pendingCount > 0
            ? <>The <b>{pendingCount} link{pendingCount > 1 ? "s" : ""}</b> you created before signing in will be claimed to your account and kept forever.</>
            : <>Any links you created before signing in will be <b>claimed to your account</b> and kept forever.</>}</span>
        </div>
        <p className="legal">By continuing you agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms</a> and <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.</p>
      </div>
    </div>
  );
}

/* ============================================================
   HISTORY
   ============================================================ */
function ExpiryPill({ expiresAt }) {
  if (!expiresAt) return <span className="pill forever"><Icon name="infinity" size={13} /> Forever</span>;
  const d = daysLeft(expiresAt);
  if (d <= 7) return <span className="pill soon"><Icon name="clock" size={12} /> {d}d left</span>;
  return <span className="pill ok">{fmtShort(expiresAt)}</span>;
}

function HistoryScreen({ links, demo, onNavigate, openQR, pushToast }) {
  const [query, setQuery] = React.useState("");
  const loading = demo === "loading";
  const forceEmpty = demo === "empty";
  const data = forceEmpty ? [] : links;
  const filtered = data.filter(l =>
    l.code.toLowerCase().includes(query.toLowerCase()) || l.url.toLowerCase().includes(query.toLowerCase()));

  async function copy(l) {
    try { await navigator.clipboard.writeText("https://" + l.shortUrl); } catch {}
    pushToast("Link copied");
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="section-head"><div><h2>Your links</h2><p className="lede">Loading your saved links…</p></div></div>
          <div className="tbl-card is-table">
            <table className="links"><thead><tr>
              <th style={{ width: "26%" }}>Short link</th><th>Destination</th><th>Clicks</th><th>Created</th><th>Expires</th><th></th>
            </tr></thead><tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr className="skel-row" key={i}>
                  <td><div className="skel" style={{ height: 22, width: "70%" }} /></td>
                  <td><div className="skel" style={{ height: 14, width: "85%", marginBottom: 6 }} /><div className="skel" style={{ height: 10, width: "40%" }} /></td>
                  <td><div className="skel" style={{ height: 16, width: 40 }} /></td>
                  <td><div className="skel" style={{ height: 14, width: 70 }} /></td>
                  <td><div className="skel" style={{ height: 22, width: 64, borderRadius: 999 }} /></td>
                  <td><div className="skel" style={{ height: 32, width: 80, borderRadius: 8, marginLeft: "auto" }} /></td>
                </tr>
              ))}
            </tbody></table>
          </div>
          <div className="hist-cards">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="hist-card" key={i}>
                <div className="skel" style={{ height: 24, width: 120, marginBottom: 12 }} />
                <div className="skel" style={{ height: 13, width: "90%", marginBottom: 16 }} />
                <div className="skel" style={{ height: 18, width: "60%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty">
            <div className="glyph"><Icon name="link" size={32} /></div>
            <h3>No links yet</h3>
            <p>Links you shorten will show up here with click counts, QR codes, and expiry — all in one place.</p>
            <Button leftIcon="plus" onClick={() => onNavigate("home")}>Shorten your first link</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-head">
          <div>
            <h2>Your links</h2>
            <p className="lede">{data.length} link{data.length > 1 ? "s" : ""} · {data.reduce((a, l) => a + l.clicks, 0).toLocaleString()} total clicks</p>
          </div>
          <div className="hist-tools">
            <div className="search">
              <Icon name="search" size={17} />
              <input placeholder="Search links" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search links" />
            </div>
            <Button leftIcon="plus" onClick={() => onNavigate("home")}>New</Button>
          </div>
        </div>

        {/* table (wide) */}
        <div className="tbl-card is-table">
          <table className="links">
            <thead><tr>
              <th style={{ width: "24%" }}>Short link</th>
              <th>Destination</th>
              <th style={{ width: 96 }}>Clicks</th>
              <th style={{ width: 120 }}>Created</th>
              <th style={{ width: 110 }}>Expires</th>
              <th style={{ width: 96 }}></th>
            </tr></thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.code}>
                  <td><div className="code-cell"><span className="code-chip">{l.code}</span></div></td>
                  <td><div className="dest"><span className="url">{truncMid(l.url, 48)}</span><span className="host">{hostOf(l.url)}</span></div></td>
                  <td><span className="clicks"><Icon name="cursor" size={14} /> {l.clicks.toLocaleString()}</span></td>
                  <td><span className="muted-cell">{fmtDate(l.createdAt)}</span></td>
                  <td><ExpiryPill expiresAt={l.expiresAt} /></td>
                  <td><div className="row-actions">
                    <button className="iconbtn" title="Copy link" aria-label="Copy link" onClick={() => copy(l)}><Icon name="copy" size={16} /></button>
                    <button className="iconbtn" title="Show QR" aria-label="Show QR" onClick={() => openQR(l)}><Icon name="qr" size={16} /></button>
                  </div></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--ink-faint)", padding: "32px" }}>No links match "{query}".</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* cards (narrow) */}
        <div className="hist-cards">
          {filtered.map((l) => (
            <div className="hist-card" key={l.code}>
              <div className="hc-top">
                <span className="code-chip">{l.code}</span>
                <ExpiryPill expiresAt={l.expiresAt} />
              </div>
              <div className="hc-url">{truncMid(l.url, 44)}</div>
              <div className="hc-foot">
                <div className="hc-stats">
                  <span className="clicks"><Icon name="cursor" size={14} /> {l.clicks.toLocaleString()}</span>
                  <span style={{ color: "var(--ink-faint)" }}>{fmtShort(l.createdAt)}</span>
                </div>
                <div className="hc-actions">
                  <button className="iconbtn" aria-label="Copy link" onClick={() => copy(l)}><Icon name="copy" size={16} /></button>
                  <button className="iconbtn" aria-label="Show QR" onClick={() => openQR(l)}><Icon name="qr" size={16} /></button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--ink-faint)", padding: "32px" }}>No links match "{query}".</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INTERSTITIAL (404 / 410)
   ============================================================ */
function Interstitial({ kind, onNavigate }) {
  const expired = kind === "410";
  return (
    <div className="inter">
      <div className={"inter-card" + (expired ? " expired" : "")}>
        <div className={"inter-glyph " + (expired ? "ex" : "nf")}>
          <Icon name={expired ? "clock" : "ghost"} size={30} />
        </div>
        <div className="inter-code">{kind}</div>
        {expired ? (
          <>
            <h2>This link has expired</h2>
            <p>The link <span className="code-shown">sho.rt/x8Kp2</span> was created without an account and passed its 30-day expiry. Links saved to an account never expire.</p>
            <div className="inter-actions">
              <Button leftIcon="scissors" onClick={() => onNavigate("home")}>Shorten a new link</Button>
              <Button variant="ghost" leftIcon="lock" onClick={() => onNavigate("signin")}>Sign in to keep links</Button>
            </div>
          </>
        ) : (
          <>
            <h2>Link not found</h2>
            <p>We couldn't find <span className="code-shown">sho.rt/zzqp9</span>. It may have been mistyped, deleted, or never existed.</p>
            <div className="inter-actions">
              <Button leftIcon="scissors" onClick={() => onNavigate("home")}>Shorten a link</Button>
              <Button variant="ghost" rightIcon="arrow-right" onClick={() => onNavigate("home")}>Go home</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, SignInScreen, HistoryScreen, Interstitial, QRModal, makeCode, normalizeUrl, hostOf, fmtDate, fmtShort, DAY });
