/* components.jsx — icons, primitives, QR. Exports to window. */

/* ---------- Icons (1.5px stroke, currentColor) ---------- */
function Icon({ name, size = 20, stroke = 1.6, fill = false, style }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round",
    strokeLinejoin: "round", style, "aria-hidden": true };
  switch (name) {
    case "link": return (<svg {...p}><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>);
    case "scissors": return (<svg {...p}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>);
    case "copy": return (<svg {...p}><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
    case "check": return (<svg {...p}><path d="m20 6-11 11-5-5"/></svg>);
    case "qr": return (<svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h4v-4M21 17v.01"/></svg>);
    case "arrow-right": return (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case "alert": return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v4.5M12 16h.01"/></svg>);
    case "clock": return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>);
    case "chevron-down": return (<svg {...p}><path d="m6 9 6 6 6-6"/></svg>);
    case "x": return (<svg {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>);
    case "external": return (<svg {...p}><path d="M15 3h6v6M21 3l-9 9M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg>);
    case "calendar": return (<svg {...p}><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>);
    case "search": return (<svg {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>);
    case "cursor": return (<svg {...p}><path d="m4 4 7 16 2-7 7-2z"/></svg>);
    case "plus": return (<svg {...p}><path d="M12 5v14M5 12h14"/></svg>);
    case "shield": return (<svg {...p}><path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6z"/></svg>);
    case "infinity": return (<svg {...p}><path d="M7 9c-2 0-3.5 1.4-3.5 3s1.5 3 3.5 3c3 0 4-6 7-6 2 0 3.5 1.4 3.5 3s-1.5 3-3.5 3c-3 0-4-6-7-6z"/></svg>);
    case "ghost": return (<svg {...p}><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v11l3-2 3 2 2-2 2 2 3-2V10a8 8 0 0 0-8-8z"/></svg>);
    case "trash": return (<svg {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>);
    case "spark": return (<svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>);
    case "menu": return (<svg {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>);
    case "lock": return (<svg {...p}><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>);
    default: return null;
  }
}

function GoogleG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7C13.42 13.62 18.27 9.75 24 9.75z"/>
    </svg>
  );
}

/* ---------- QR code (real, scannable) ---------- */
function QRCode({ value, size = 220, fg = "#16151c" }) {
  const svg = React.useMemo(() => {
    if (!window.qrcode || !value) return null;
    try {
      const qr = window.qrcode(0, "M");
      qr.addData(value);
      qr.make();
      const n = qr.getModuleCount();
      let rects = "";
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (qr.isDark(r, c)) rects += `<rect x="${c}" y="${r}" width="1" height="1" rx="0.12"/>`;
        }
      }
      return { n, rects };
    } catch (e) { return null; }
  }, [value]);

  if (!svg) {
    return <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#bbb", fontSize: 11 }}>QR</div>;
  }
  return (
    <svg viewBox={`0 0 ${svg.n} ${svg.n}`} width={size} height={size}
      shapeRendering="crispEdges" role="img" aria-label={`QR code for ${value}`}>
      <g fill={fg} dangerouslySetInnerHTML={{ __html: svg.rects }} />
    </svg>
  );
}

/* ---------- Button ---------- */
function Button({ variant = "", size = "", block, children, leftIcon, rightIcon, ...rest }) {
  const cls = ["btn", variant, size, block ? "block" : ""].filter(Boolean).join(" ");
  return (
    <button className={cls} {...rest}>
      {leftIcon && <Icon name={leftIcon} size={18} />}
      {children}
      {rightIcon && <Icon name={rightIcon} size={18} />}
    </button>
  );
}

Object.assign(window, { Icon, GoogleG, QRCode, Button });
