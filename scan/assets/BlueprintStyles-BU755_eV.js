import{j as e}from"./vendor-motion-Bb7jJ0MV.js";const n=()=>e.jsx("style",{children:`
    /* === Blueprint visual system — Editorial Comic-Grid === */
    :root {
      --bp-ink: #1A1A1A;
      --bp-muted: #6B6861;
      --bp-paper: #F4EFE8;
      --bp-paper-deep: #ECE5D9;
      --bp-sage: #2A8F65;
      --bp-sage-tint: rgba(42,143,101,0.08);
      --bp-sage-mid: rgba(42,143,101,0.18);
      --bp-rule: rgba(26,26,26,0.10);
    }
    .blueprint-content { color: var(--bp-ink); }
    .blueprint-content > article { display: block; }

    /* Hero */
    .blueprint-content .bp-hero { padding: 1.4rem 0 2.4rem; border-bottom: 1px solid var(--bp-rule); margin-bottom: 2.4rem; animation: bpFadeUp 0.55s ease-out both; }
    .blueprint-content .bp-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bp-sage); margin: 0 0 0.6rem; }
    .blueprint-content h1 { font-family: 'DM Serif Display', serif; font-style: italic; font-size: 3.2rem; line-height: 1.04; letter-spacing: -0.02em; margin: 0 0 0.4rem; }
    .blueprint-content .bp-hero-sub { color: var(--bp-muted); font-size: 0.92rem; margin: 0; font-family: 'IBM Plex Mono', monospace; }

    /* Sections */
    .blueprint-content .bp-section { position: relative; padding: 2.4rem 0 0.6rem; animation: bpFadeUp 0.55s ease-out both; }
    .blueprint-content .bp-section:nth-of-type(2) { animation-delay: 0.08s; }
    .blueprint-content .bp-section:nth-of-type(3) { animation-delay: 0.16s; }
    .blueprint-content .bp-section:nth-of-type(4) { animation-delay: 0.24s; }
    .blueprint-content .bp-section:nth-of-type(5) { animation-delay: 0.32s; }
    .blueprint-content .bp-section:nth-of-type(6) { animation-delay: 0.40s; }
    .blueprint-content .bp-section:nth-of-type(7) { animation-delay: 0.48s; }
    .blueprint-content .bp-numeral { font-family: 'DM Serif Display', serif; font-style: italic; font-size: 1.15rem; color: var(--bp-sage); margin: 0 0 0.2rem; letter-spacing: -0.01em; }
    .blueprint-content h2 { font-family: 'DM Serif Display', serif; font-style: italic; font-size: 2.05rem; line-height: 1.1; margin: 0 0 1.1rem; letter-spacing: -0.015em; }
    .blueprint-content h3 { font-family: 'IBM Plex Mono', monospace; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.18em; color: var(--bp-muted); margin: 1.2rem 0 0.5rem; font-weight: 700; }

    /* Prose */
    .blueprint-content p { margin: 0.6rem 0 0.9rem; max-width: 68ch; line-height: 1.62; font-size: 1.02rem; }
    .blueprint-content strong { font-weight: 700; color: var(--bp-ink); }
    .blueprint-content em { font-family: 'DM Serif Display', serif; font-style: italic; font-weight: 400; }
    .blueprint-content code { font-family: 'IBM Plex Mono', monospace; font-size: 0.92em; background: var(--bp-paper-deep); padding: 1px 5px; border-radius: 2px; }
    .blueprint-content ul { margin: 0.7rem 0; padding-left: 1.2rem; max-width: 68ch; }
    .blueprint-content li { margin: 0.4rem 0; line-height: 1.55; }
    .blueprint-content li::marker { color: var(--bp-sage); }

    /* TL;DR pull-quote card */
    .blueprint-content .bp-tldr {
      font-family: 'DM Serif Display', serif; font-style: italic; font-size: 1.3rem; line-height: 1.35;
      color: var(--bp-ink); padding: 0.9rem 1.4rem; margin: 0.8rem 0 1.4rem;
      border-left: 3px solid var(--bp-sage); background: var(--bp-sage-tint); max-width: 64ch;
    }
    .blueprint-content .bp-lead { color: var(--bp-muted); font-size: 0.95rem; margin: 0.6rem 0 1.2rem; max-width: 64ch; }

    /* 60/25/15 stacked bar — bullets in even cols below since the bar already shows the proportion */
    .blueprint-content .bp-stacked-bar {
      display: flex; height: 56px; border-radius: 2px; overflow: hidden;
      margin: 1.4rem 0 1.6rem; border: 1px solid var(--bp-rule);
    }
    .blueprint-content .bp-band {
      display: flex; align-items: center; justify-content: center; padding: 0 1rem;
      font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em;
      width: 0%; animation: bpBandReveal 0.9s 0.3s ease-out both;
    }
    .blueprint-content .bp-band-agent { background: var(--bp-sage); color: var(--bp-paper); animation-delay: 0.3s; }
    .blueprint-content .bp-band-augmented { background: var(--bp-sage-mid); color: var(--bp-ink); animation-delay: 0.42s; }
    .blueprint-content .bp-band-human { background: var(--bp-paper-deep); color: var(--bp-ink); animation-delay: 0.54s; }
    .blueprint-content .bp-map-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.6rem; margin: 1.4rem 0 0.5rem; }
    .blueprint-content .bp-map-col h3 { margin-top: 0; }
    .blueprint-content .bp-map-col li { font-size: 0.94rem; }

    /* 90-day timeline */
    .blueprint-content .bp-axis-pill {
      display: inline-block; padding: 0.5rem 0.9rem; background: var(--bp-sage-tint);
      border-left: 2px solid var(--bp-sage); font-size: 0.92rem; margin: 0.5rem 0 1.2rem;
    }
    .blueprint-content .bp-axis-pill strong { color: var(--bp-sage); letter-spacing: 0.04em; }
    .blueprint-content .bp-timeline { list-style: none; padding: 0; margin: 1rem 0 0; position: relative; }
    .blueprint-content .bp-timeline::before {
      content: ''; position: absolute; left: 19px; top: 6px; bottom: 6px; width: 1px;
      background: linear-gradient(to bottom, var(--bp-sage), var(--bp-sage-mid));
    }
    .blueprint-content .bp-phase { position: relative; padding: 0.4rem 0 1.6rem 3rem; }
    .blueprint-content .bp-phase-marker {
      position: absolute; left: 0; top: 0.35rem; width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      background: var(--bp-paper); border: 1.5px solid var(--bp-sage); border-radius: 50%;
      font-family: 'DM Serif Display', serif; font-style: italic; font-size: 1.2rem; color: var(--bp-sage);
      animation: bpMarkerPop 0.5s ease-out both;
    }
    .blueprint-content .bp-phase:nth-child(1) .bp-phase-marker { animation-delay: 0.5s; }
    .blueprint-content .bp-phase:nth-child(2) .bp-phase-marker { animation-delay: 0.65s; }
    .blueprint-content .bp-phase:nth-child(3) .bp-phase-marker { animation-delay: 0.8s; }
    .blueprint-content .bp-phase-days { font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--bp-sage); margin: 0 0 0.3rem; }
    .blueprint-content .bp-phase h3 {
      font-family: 'DM Serif Display', serif; font-style: italic; font-size: 1.35rem;
      text-transform: none; letter-spacing: -0.005em; color: var(--bp-ink); margin: 0 0 0.6rem; font-weight: 400;
    }
    .blueprint-content .bp-phase-impact {
      margin: 0.6rem 0 0; padding: 0.5rem 0.8rem; background: var(--bp-paper-deep); border-radius: 2px;
      font-size: 0.92rem; max-width: 64ch;
    }
    .blueprint-content .bp-impact-label {
      font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em;
      color: var(--bp-sage); font-weight: 700; margin-right: 0.5rem;
    }

    /* Quick-win tiles */
    .blueprint-content .bp-wins-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.9rem; margin: 1.2rem 0; }
    .blueprint-content .bp-win {
      padding: 1rem 1.1rem; background: var(--bp-paper); border: 1px solid var(--bp-rule);
      border-left: 3px solid var(--bp-sage); transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .blueprint-content .bp-win:hover { transform: translateY(-1px); box-shadow: 0 6px 16px -8px rgba(26,26,26,0.18); }
    .blueprint-content .bp-win-meta {
      font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em;
      color: var(--bp-muted); margin: 0 0 0.4rem;
    }
    .blueprint-content .bp-win h3 {
      font-family: 'DM Serif Display', serif; font-style: italic; font-size: 1.15rem;
      text-transform: none; letter-spacing: -0.005em; color: var(--bp-ink); margin: 0 0 0.5rem; font-weight: 400;
    }
    .blueprint-content .bp-win-impact { font-size: 0.88rem; color: var(--bp-muted); margin: 0; }

    /* Costed gaps */
    .blueprint-content .bp-precondition-explainer { padding: 1.1rem 1.4rem; margin: 0.8rem 0 1rem; background: var(--bp-paper-deep); border-left: 2px solid var(--bp-sage); border-radius: 2px; }
    .blueprint-content .bp-pre-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bp-sage); margin: 0 0 0.5rem; }
    .blueprint-content .bp-precondition-explainer p { margin: 0 0 0.6rem; max-width: 70ch; font-size: 0.95rem; }
    .blueprint-content .bp-pre-list { list-style: none; padding: 0; margin: 0.6rem 0 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.55rem 1.4rem; }
    .blueprint-content .bp-pre-list li { font-size: 0.88rem; line-height: 1.5; padding-left: 0; margin: 0; }
    .blueprint-content .bp-pre-list strong { color: var(--bp-sage); font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; }
    .blueprint-content .bp-sev-legend { display: flex; align-items: center; gap: 0.6rem; margin: 0.8rem 0 0.5rem; font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--bp-muted); }
    .blueprint-content .bp-sev-legend-bar { display: inline-block; width: 80px; height: 4px; background: var(--bp-paper-deep); border-radius: 2px; overflow: hidden; position: relative; }
    .blueprint-content .bp-sev-legend-fill { display: block; height: 100%; width: 100%; background: linear-gradient(to right, var(--bp-sage-mid), var(--bp-sage)); }
    .blueprint-content .bp-gaps-list { list-style: none; padding: 0; margin: 1rem 0; }
    .blueprint-content .bp-gap { padding: 1rem 1.2rem; margin: 0.7rem 0; background: var(--bp-paper); border: 1px solid var(--bp-rule); border-left-width: 4px; border-left-color: var(--bp-sage-mid); }
    .blueprint-content .bp-gap.bp-sev-3 { border-left-color: var(--bp-sage); }
    .blueprint-content .bp-gap.bp-sev-2 { border-left-color: var(--bp-sage-mid); }
    .blueprint-content .bp-gap.bp-sev-1 { border-left-color: var(--bp-paper-deep); }
    .blueprint-content .bp-pre-pill { display: inline-block; padding: 2px 8px; background: var(--bp-paper-deep); font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--bp-muted); margin-bottom: 0.4rem; }
    .blueprint-content .bp-gap h3 { font-family: 'DM Serif Display', serif; font-style: italic; font-size: 1.18rem; text-transform: none; letter-spacing: -0.005em; color: var(--bp-ink); margin: 0.3rem 0 0.6rem; font-weight: 400; }
    .blueprint-content .bp-sev-bar { height: 4px; background: var(--bp-paper-deep); border-radius: 2px; overflow: hidden; margin: 0.5rem 0; }
    .blueprint-content .bp-sev-fill { height: 100%; background: var(--bp-sage); border-radius: 2px; width: 0%; animation: bpBandReveal 0.8s 0.4s ease-out both; }
    .blueprint-content .bp-gap-cost { font-family: 'IBM Plex Mono', monospace; font-size: 0.92rem; margin: 0.5rem 0 0.4rem; }
    .blueprint-content .bp-gap-cost strong { color: var(--bp-sage); font-size: 1.1rem; }
    .blueprint-content .bp-gap-cost span { color: var(--bp-muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.12em; margin-left: 0.4rem; }
    .blueprint-content .bp-gap-fix { margin: 0.4rem 0 0; font-size: 0.94rem; color: var(--bp-ink); }
    .blueprint-content .bp-fix-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: var(--bp-sage); font-weight: 700; margin-right: 0.5rem; }

    /* Engagement fit hero card */
    .blueprint-content .bp-fit { padding: 2rem 1.6rem; margin: 2.5rem 0 1.5rem; background: linear-gradient(135deg, var(--bp-sage-tint), var(--bp-paper-deep)); border: 1px solid var(--bp-sage-mid); border-radius: 2px; position: relative; }
    .blueprint-content .bp-fit-eyebrow { color: var(--bp-sage); margin-bottom: 0.5rem; }
    .blueprint-content .bp-fit-name { font-family: 'DM Serif Display', serif; font-style: italic; font-size: 2.4rem; margin: 0.2rem 0 0.6rem; line-height: 1.1; letter-spacing: -0.02em; }
    .blueprint-content .bp-fit-price { display: inline-block; padding: 6px 14px; background: var(--bp-ink); color: var(--bp-paper); font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: 0.06em; margin: 0 0 1rem; border-radius: 2px; }
    .blueprint-content .bp-fit-reason p { margin: 0.5rem 0; font-size: 1.02rem; max-width: 64ch; }

    /* Pace section */
    .blueprint-content .bp-pace { background: var(--bp-paper-deep); padding: 1.6rem 1.6rem 1.4rem; margin-top: 2.4rem; border-radius: 2px; }
    .blueprint-content .bp-pace h2 { margin-top: 0; }

    /* Footer */
    .blueprint-content .bp-footer { margin-top: 3rem; padding-top: 1.4rem; border-top: 1px solid var(--bp-rule); font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--bp-muted); }
    .blueprint-content .bp-footer a { color: var(--bp-sage); text-decoration: none; }

    /* Animations */
    @keyframes bpFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bpBandReveal { to { width: var(--target, 100%); } }
    @keyframes bpMarkerPop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) {
      .blueprint-content * { animation: none !important; }
      .blueprint-content .bp-band { width: var(--target, auto) !important; }
      .blueprint-content .bp-sev-fill { width: var(--target, 0%) !important; }
    }
    @media print {
      header { display: none !important; }
      .blueprint-content * { animation: none !important; }
      .blueprint-content .bp-band { width: var(--target, auto) !important; }
      .blueprint-content .bp-sev-fill { width: var(--target, 0%) !important; }
    }

    /* Responsive */
    @media (max-width: 720px) {
      .blueprint-content h1 { font-size: 2.2rem; }
      .blueprint-content h2 { font-size: 1.55rem; }
      .blueprint-content .bp-tldr { font-size: 1.1rem; }
      .blueprint-content .bp-map-grid { grid-template-columns: 1fr; }
      .blueprint-content .bp-wins-grid { grid-template-columns: 1fr; }
      .blueprint-content .bp-stacked-bar { flex-direction: column; height: auto; }
      .blueprint-content .bp-band { padding: 0.7rem 1rem; }
      .blueprint-content .bp-fit-name { font-size: 1.7rem; }
      .blueprint-content .bp-pre-list { grid-template-columns: 1fr; }
    }
  `});export{n as B};
