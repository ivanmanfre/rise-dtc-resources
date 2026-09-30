import{u as B,j as e,g as V}from"./vendor-motion-C7K4cPGH.js";import{r as j}from"./vendor-react-CBNdsNPG.js";import{o as W,p as J,d as y,f as H,s as X,M as Z,P as ee,D as ne,A as ae,i as O,g as re,F as te,h as se,j as z,q as oe,t as ie,v as le,w as pe,b as K,x as ce,y as de,z as ge,E as he,C as R,R as P}from"./ClientBoardPage-DNi30UyJ.js";import"./index-CKI3gjXU.js";import"./vendor-supabase-yKjPlrCh.js";import"./LinkedInPostPreview-BvZtc5xI.js";import"./useGoogleFonts-CcXDFqkX.js";import"./globe-mr5kWL0j.js";import"./thumbs-up-C7UOvnJa.js";import"./repeat-2-DwXB-Ght.js";import"./send-mxQPMgZV.js";import"./postReach-C0a7loYC.js";import"./assessmentEmbed-D2jgGa9G.js";import"./clientSlot-U_rGH5fy.js";import"./LiveAssessmentEmbed-Cs26SjAw.js";const f=n=>Math.round(n).toLocaleString("en-US"),_=(n,t,a)=>n===1?t:a,C=6,be=`
.pk .pk-mute { color: rgb(var(--nt-fg, 255 255 255) / .64); }
.nf-panel { overflow: hidden; }
.nf-panel .pk-fn { margin-top: 20px; }
.nf-panel .pk-fn-stages { grid-column: 1 / -1; position: relative; z-index: 1; }
.nf-stage { appearance: none; border: 0; background: none; color: inherit; font: inherit; text-align: left; box-sizing: border-box; width: calc(100% + 12px); margin-left: -12px; padding: 0 0 0 12px; height: var(--fn-stage); display: flex; flex-direction: column; justify-content: center; border-radius: 14px 6px 6px 14px; -webkit-tap-highlight-color: transparent; }
button.nf-stage { cursor: pointer; }
button.nf-stage:hover, button.nf-stage:focus-visible { background: linear-gradient(90deg, rgb(var(--nt-fg, 255 255 255) / .07), rgb(var(--nt-fg, 255 255 255) / 0) 58%); }
.nf-stage .nf-go { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; letter-spacing: .1em; }
.nf-stage .nf-go svg { opacity: .5; flex: none; }
button.nf-stage:hover .nf-go svg, button.nf-stage:focus-visible .nf-go svg { opacity: 1; color: var(--cb-accent-fg, var(--cb-accent)); }
@media (prefers-reduced-motion: no-preference) { .nf-stage { transition: background-color 200ms ease; } }

.nw-panel { margin-top: 20px; }
.nw-legend .pk-sw-msg { background: rgb(var(--nt-fg, 255 255 255) / .3); }
.nw .pk-chart { --plot: 150px; --slot: 30px; }
@media (min-width: 768px) { .nw .pk-chart { --plot: 190px; --slot: 34px; } }
.nw .pk-bar { width: clamp(14px, 4.6vw, 40px); }
.nw .pk-col.on .pk-bar-msg .pk-fill { background: rgb(var(--nt-fg, 255 255 255) / .55); }
.nw .pk-col.on .pk-bar-msg .pk-val { color: rgb(var(--nt-fg, 255 255 255)); }
.nw .pk-bar-msg .pk-val { color: rgb(var(--nt-fg, 255 255 255) / .66); font-size: 11px; }
@media (min-width: 768px) { .nw .pk-bar-msg .pk-val { font-size: 13px; } }
.nw .pk-badge { font-size: 11px; }
.nw .pk-wl small { font-size: 11px; letter-spacing: .04em; color: rgb(var(--nt-fg, 255 255 255) / .62); }
.nw .nw-thin { visibility: hidden; }
@media (min-width: 640px) { .nw .nw-thin { visibility: visible; } }
.nw .pk-readout { min-height: 0; margin-top: 10px; padding-bottom: 6px; }
.nw .pk-rd-stats dt { font-size: 12.5px; color: rgb(var(--nt-fg, 255 255 255) / .66); }

/* QUIET (2026-09-29, "private-bank quiet, receipts first"): white panels on the light ground,
   a matte funnel, grey bars with the chosen week in ink, yellow only as the booked-a-call
   marks and the marker under a booked-call number. Night never matches [data-quiet]. */
[data-quiet] .nf-panel, [data-quiet] .nw-panel { background: #FFFFFF; border: 1px solid rgba(17,17,17,.09); }
[data-quiet] .pk-fn-matte { filter: none !important; mask-image: none; -webkit-mask-image: none; }
[data-quiet] .pk-money { display: inline-block; color: #111 !important; padding: 0 .08em; margin: 0 -.08em; background: linear-gradient(transparent 58%, color-mix(in srgb, var(--cb-accent) 80%, transparent) 58%, color-mix(in srgb, var(--cb-accent) 80%, transparent) 92%, transparent 92%); }
[data-quiet] button.nf-stage:hover, [data-quiet] button.nf-stage:focus-visible { background: rgba(17,17,17,.035); }
[data-quiet] button.nf-stage:hover .nf-go svg, [data-quiet] button.nf-stage:focus-visible .nf-go svg { color: #111; }
[data-quiet] .nf-stage .nf-go { color: rgba(17,17,17,.62); }
[data-quiet] .nw .pk-bar-msg .pk-fill { background: rgba(17,17,17,.14); }
[data-quiet] .nw .pk-col.on .pk-bar-msg .pk-fill { background: #111; }
[data-quiet] .nw .pk-col.partial .pk-fill { background-color: rgba(17,17,17,.10); background-image: repeating-linear-gradient(135deg, rgba(17,17,17,.30) 0 1.5px, transparent 1.5px 6px); }
[data-quiet] .nw .pk-col::before { display: none; }
[data-quiet] .nw .pk-col.on .pk-wl-t { background: #111; color: #fff; }
[data-quiet] .nw .pk-bar-msg .pk-val { color: rgba(17,17,17,.62); }
[data-quiet] .nw .pk-col.on .pk-bar-msg .pk-val { color: #111; }
[data-quiet] .nw .pk-badge { box-shadow: none; }
[data-quiet] .nw .pk-sw-msg { background: rgba(17,17,17,.14); }
[data-quiet] .nw .pk-sw-call { box-shadow: none; }
[data-quiet] .nw .pk-gl { border-top-color: rgba(17,17,17,.08); }
[data-quiet] .nw .pk-gl.base { border-top-color: rgba(17,17,17,.22); }
[data-quiet] .nw .pk-rd-stats .hi dd { color: #111; }
[data-quiet] .nw .pk-rd-stats .hi dd .an-root { background: linear-gradient(transparent 58%, color-mix(in srgb, var(--cb-accent) 80%, transparent) 58%, color-mix(in srgb, var(--cb-accent) 80%, transparent) 92%, transparent 92%); padding: 0 .08em; margin: 0 -.08em; }
[data-quiet] .nw .pk-rd-stats > div { border-left-color: rgba(17,17,17,.14); }
[data-quiet] .nw .pk-rd-stats > div.hi { border-left-color: var(--cb-accent); }
[data-quiet] .nw .pk-wl { color: #111; }
`;function S(n){if(n.current)return`${y(n.start)} to today`;const t=pe(n.end,-1);if(t===n.start)return y(n.start);const[a,o]=y(n.start).split(" ");return n.start.slice(5,7)===t.slice(5,7)?`${a} to ${y(t)}`:`${a} ${o} to ${y(t)}`}const F=54,N=28;function xe({stages:n,eyebrow:t,onGo:a}){const[o,c]=re(.35);if(n.length<2)return null;const g=Math.max(1,...n.map(d=>d.v)),b=n.map(d=>d.v>0?Math.max(8,Math.sqrt(d.v/g)*100):1.5),h=n.length*F+(n.length-1)*N,p=n.map((d,s)=>F/2+s*(F+N)),x=n.slice(1).map((d,s)=>F+s*(F+N)+N/2);return e.jsxs("section",{className:"pk-panel pk-fnp nf-panel","aria-label":"The funnel","data-night-funnel":"",children:[t&&e.jsx("div",{className:"pk-cap pk-capline",children:t}),e.jsxs("div",{ref:o,className:"pk-fn",style:{"--fn-stage":`${F}px`,"--fn-gap":`${N}px`,marginTop:t?20:0},children:[e.jsx("div",{className:"pk-fn-col","aria-hidden":"true",children:e.jsx(te,{widths:b,centers:p,slices:x,height:h,shown:c,duration:.35})}),e.jsx("ol",{className:"pk-fn-stages",children:n.map(d=>{const s=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"pk-fn-num",style:d.key==="booked"?{color:"var(--cb-accent-fg, var(--cb-accent))"}:void 0,children:e.jsx("span",{className:d.key==="booked"?"pk-money":void 0,children:f(d.v)})}),e.jsxs("span",{className:"nf-go pk-cap pk-mute",children:[d.label,a&&e.jsx("svg",{"aria-hidden":"true",width:"10",height:"10",viewBox:"0 0 10 10",children:e.jsx("path",{d:"M5 1v7M1.8 5L5 8.2 8.2 5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]})]});return e.jsx("li",{children:a?e.jsx("button",{type:"button",className:"nf-stage",onClick:()=>a(d.key),"aria-label":`${f(d.v)} ${d.label.toLowerCase()}. Show the list.`,children:s}):e.jsx("div",{className:"nf-stage",children:s})},d.key)})})]})]})}function me(n){if(n<=0)return[];const t=n/2.5,a=10**Math.floor(Math.log10(t)),o=[1,2,2.5,5,10].map(g=>g*a).find(g=>g>=t)??t,c=[];for(let g=o;g<n*.97;g+=o)c.push(g);return c}function fe({weeks:n,third:t,children:a}){const o=j.useMemo(()=>{let r=-1;return n.forEach((i,$)=>{i.wrote>0&&(r<0||i.wrote>n[r].wrote)&&(r=$)}),r<0?null:r},[n]),[c,g]=j.useState(o??Math.max(0,n.length-1)),[b,h]=j.useState(null);if(n.length<2)return null;const p=b??c,x=n[p],d=Math.max(1,...n.map(r=>r.wrote)),s=d*1.18,u=me(d),w=r=>i=>{i.pointerType==="mouse"&&h(r)},k=o!==null?`Your best week for replies was ${S(n[o])}: ${f(n[o].wrote)} ${_(n[o].wrote,"person","people")}.`:"Replies and calls, week by week.",m=r=>r===0||n[r].start.slice(5,7)!==n[r-1].start.slice(5,7),l=new Set;return n.forEach((r,i)=>{(m(i)||(n.length-1-i)%2===0&&!(i>0&&m(i-1))&&!(i+1<n.length&&m(i+1)))&&l.add(i)}),l.add(n.length-1),e.jsxs("section",{className:"pk-sec nw","aria-labelledby":"nw-h","data-night-weeks":"",children:[e.jsx("div",{className:"pk-cap pk-capline",children:"Week by week"}),e.jsx("h2",{id:"nw-h",className:"pk-h2",children:k}),e.jsxs("div",{className:"pk-panel pk-wkp nw-panel",children:[e.jsxs("ul",{className:"pk-legend nw-legend","aria-hidden":"true",children:[e.jsxs("li",{children:[e.jsx("span",{className:"pk-sw pk-sw-msg"}),"Replied"]}),e.jsxs("li",{children:[e.jsx("span",{className:"pk-sw pk-sw-call"}),"Booked a call"]})]}),e.jsxs("div",{className:"pk-chart",children:[e.jsxs("div",{className:"pk-grid","aria-hidden":"true",children:[u.map(r=>e.jsx("span",{className:"pk-gl",style:{bottom:`${r/s*100}%`}},r)),e.jsx("span",{className:"pk-gl base"})]}),e.jsx("div",{className:"pk-cols",onPointerLeave:()=>h(null),children:n.map((r,i)=>e.jsxs("button",{type:"button",className:`pk-col${p===i?" on":""}${r.current?" partial":""}`,"aria-pressed":c===i,"aria-label":`${S(r)}: ${f(r.wrote)} replied${r.calls?`, ${r.calls} booked a call`:""}.`,onClick:()=>g(i),onPointerEnter:w(i),children:[e.jsx("span",{className:"pk-slot",children:r.calls>0&&e.jsx("span",{className:"pk-badge",children:r.calls})}),e.jsx("span",{className:"pk-bars","aria-hidden":"true",children:e.jsxs("span",{className:"pk-bar pk-bar-msg",style:{height:`${Math.max(r.wrote/s,0)*100}%`},children:[e.jsx("span",{className:"pk-fill"}),e.jsx("span",{className:"pk-val",children:f(r.wrote)})]})}),e.jsxs("span",{className:"pk-wl","aria-hidden":"true",children:[e.jsx("span",{className:`pk-wl-t${l.has(i)||p===i?"":" nw-thin"}`,children:se(n,i)}),r.current&&e.jsx("small",{children:"to today"})]})]},r.key))})]}),e.jsxs("div",{className:"pk-readout","aria-live":"polite",children:[e.jsx("div",{className:"pk-rd-week",children:e.jsx("span",{className:"pk-cap pk-mute",children:S(x)})}),e.jsxs("dl",{className:"pk-rd-stats",children:[e.jsxs("div",{children:[e.jsx("dt",{children:"Replied"}),e.jsx("dd",{children:e.jsx(z,{value:x.wrote})})]}),e.jsxs("div",{className:x.calls>0?"hi":"none",children:[e.jsx("dt",{children:"Booked a call"}),e.jsx("dd",{children:e.jsx(z,{value:x.calls})})]}),t&&e.jsxs("div",{children:[e.jsx("dt",{children:t.label}),e.jsx("dd",{children:e.jsx(z,{value:t.of(x)})})]})]})]}),a]})]})}const ue=`
.pn-anchor { scroll-margin-top: 88px; }
/* Outreach keeps its proof number, a step below the Home hero */
.pn-hero .pk-hero-n { font-size: clamp(88px, 26vw, 132px); }
.pn-hero .pk-hero-l { font-size: clamp(22px, 5.8vw, 32px); }
.pk-head.pn-head { justify-content: flex-end; border-bottom: 0; }
/* desktop: straight on the board ground, no second rounded frame inside the page */
@media (min-width: 640px) {
  .pk.pk-flat { background: transparent; border-radius: 0; padding: 0 0 36px; overflow: visible; }
  .pk.pk-flat > .pk-glow, .pk.pk-flat > .pk-dots { display: none; }
  .pk-flat .pk-top { padding-top: 8px; }
}
.pn-seg { display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; border: 1px solid rgb(var(--nt-fg, 255 255 255) / .1); background: rgb(var(--nt-fg, 255 255 255) / .03); }
.pn-seg button { appearance: none; border: 0; border-radius: 999px; padding: 7px 12px; background: none; color: rgb(var(--nt-fg, 255 255 255) / .72); font: 700 12.5px/1.2 var(--cb-body, Manrope), sans-serif; cursor: pointer; white-space: nowrap; }
.pn-seg button[aria-pressed="true"] { background: var(--cb-accent); color: var(--cb-accent-ink, #111); box-shadow: 0 4px 16px color-mix(in srgb, var(--pk-acc, #FFC71D) 30%, transparent); }

/* hero: the booked names ride with their avatars, then the interested line */
.pn-herowho { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; margin-top: 24px; }
@media (min-width: 560px) { .pn-herowho { flex-direction: row; align-items: center; gap: 16px; } }
.pn-names { max-width: 44ch; text-wrap: balance; font-size: 15px; font-weight: 700; line-height: 1.35; color: rgb(var(--nt-fg, 255 255 255)); }
.pn-lede { margin: 26px 0 0; max-width: 30ch; font-family: var(--cb-serif, Sora), sans-serif; font-weight: 400; font-size: clamp(20px, 5.2vw, 25px); line-height: 1.28; letter-spacing: -0.02em; color: rgb(var(--nt-fg, 255 255 255) / .9); text-wrap: balance; }
.pn-lede b { font-weight: 400 !important; color: var(--cb-accent-fg, var(--cb-accent)); }
.pn-def { margin-top: 6px; font-size: 14px; line-height: 1.45; color: rgb(var(--nt-fg, 255 255 255) / .64); max-width: 44ch; }

/* section heads with a count */
.pn-count { display: flex; align-items: baseline; gap: 14px; margin: 12px 0 0; font-weight: 400; }
.pn-count .pn-num { flex: none; font-family: var(--cb-serif, Sora), sans-serif; font-weight: 300; font-size: clamp(44px, 12vw, 60px); line-height: .9; letter-spacing: -0.05em; }
.pn-count .pn-note { font-size: 14.5px; line-height: 1.4; color: rgb(var(--nt-fg, 255 255 255) / .66); max-width: 40ch; }

/* who we reach */
.pn-line { margin-top: 18px; padding: 20px 18px 10px; }
@media (min-width: 768px) { .pn-line { padding: 26px 28px 14px; } }
.pn-line h3 { margin: 0; font-family: var(--cb-serif, Sora), sans-serif; font-weight: 400; font-size: 23px; line-height: 1.15; letter-spacing: -0.025em; color: rgb(var(--nt-fg, 255 255 255)); }
.pn-sub { margin-top: 3px; font-size: 14px; color: rgb(var(--nt-fg, 255 255 255) / .64); }
.pn-strip { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 10px; margin: 8px 0 0; }
@media (max-width: 560px) { .pn-strip { grid-template-columns: repeat(3, minmax(0,1fr)); row-gap: 16px; } }
.pn-strip > div { border-left: 2px solid rgb(var(--nt-fg, 255 255 255) / .16); padding-left: 10px; min-width: 0; }
.pn-strip dd { margin: 0; font-family: var(--cb-serif, Sora), sans-serif; font-weight: 300; font-size: 28px; line-height: 1; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }
.pn-strip dt { margin-top: 5px; font-size: 12.5px; font-weight: 700; line-height: 1.25; color: rgb(var(--nt-fg, 255 255 255) / .66); }
.pn-strip .hi { border-left-color: var(--cb-accent); }
.pn-strip .hi dd { color: var(--cb-accent-fg, var(--cb-accent)); }
.pn-strip .zero dd { color: rgb(var(--nt-fg, 255 255 255) / .4); }
.pn-vtbl { margin-top: 18px; }
.pn-vtbl th:first-child { width: 40% !important; }
.pn-vtbl thead th { font-size: 11px !important; color: rgb(var(--nt-fg, 255 255 255) / .62) !important; }
.pn-vtbl tbody th { font-weight: 600 !important; color: rgb(var(--nt-fg, 255 255 255) / .82); }
.pn-vtbl td.txt { font-size: 12.5px; font-weight: 600; color: rgb(var(--nt-fg, 255 255 255) / .62); }
.pn-vtbl tbody tr:last-child th, .pn-vtbl tbody tr:last-child td { border-bottom: 0; }
.pn-vstack { display: none; margin: 16px 0 0; padding: 0; list-style: none; }
.pn-vstack li { padding: 12px 0; border-top: 1px solid rgb(var(--nt-fg, 255 255 255) / .07); }
.pn-vstack .l { font-size: 14px; font-weight: 700; line-height: 1.35; color: rgb(var(--nt-fg, 255 255 255) / .88); }
.pn-vstack .v { margin-top: 5px; display: flex; flex-wrap: wrap; gap: 3px 12px; font-size: 13px; color: rgb(var(--nt-fg, 255 255 255) / .64); }
.pn-vstack .v b { color: rgb(var(--nt-fg, 255 255 255)); font-weight: 800; font-variant-numeric: tabular-nums; }
.pn-vstack .v .z b { color: rgb(var(--nt-fg, 255 255 255) / .45); font-weight: 600; }
.pn-vstack .v .hit b { color: var(--cb-accent-fg, var(--cb-accent)); }
@media (max-width: 700px) { .pn-vtbl { display: none; } .pn-vstack { display: block; } }
.pn-kinds { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.pn-kind { display: inline-flex; align-items: baseline; gap: 5px; padding: 4px 10px; border-radius: 999px; border: 1px solid rgb(var(--nt-fg, 255 255 255) / .12); background: rgb(var(--nt-fg, 255 255 255) / .035); font-size: 13px; font-weight: 600; color: rgb(var(--nt-fg, 255 255 255) / .8); }
.pn-kind b { color: rgb(var(--nt-fg, 255 255 255)); font-weight: 800; font-variant-numeric: tabular-nums; }
.pn-kind i { margin-left: 3px; font-style: normal; font-weight: 800; color: var(--cb-accent-fg, var(--cb-accent)); }
.pn-kind.gold { border-color: color-mix(in srgb, var(--pk-acc, #FFC71D) 30%, transparent); background: color-mix(in srgb, var(--pk-acc, #FFC71D) 6%, transparent); }

/* people */
.pn-cards { list-style: none; margin: 20px 0 0; padding: 0; display: grid; gap: 10px; }
@media (min-width: 900px) { .pn-cards { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; } }
.pn-cards > li { min-width: 0; }
.pn-card { position: relative; height: 100%; box-sizing: border-box; border-radius: 22px 8px 8px 8px; border: 1px solid rgb(var(--nt-fg, 255 255 255) / .08); background: linear-gradient(180deg, rgb(var(--nt-fg, 255 255 255) / .05), rgb(var(--nt-fg, 255 255 255) / .015)); padding: 16px 16px 10px; overflow: hidden; }
.pn-card.gold { border-color: color-mix(in srgb, var(--pk-acc, #FFC71D) 30%, transparent); background: radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--pk-acc, #FFC71D) 14%, transparent), color-mix(in srgb, var(--pk-acc, #FFC71D) 0%, transparent) 62%), linear-gradient(180deg, rgb(var(--nt-fg, 255 255 255) / .04), rgb(var(--nt-fg, 255 255 255) / .012)); box-shadow: 0 18px 44px -24px color-mix(in srgb, var(--pk-acc, #FFC71D) 45%, transparent); }
.pn-top { display: flex; gap: 12px; align-items: center; }
.pn-top .pk-av { margin-left: 0; border-color: rgb(var(--nt-fg, 255 255 255) / .08); }
.pn-av-q { background: #232323 !important; color: rgb(var(--nt-fg, 255 255 255) / .88) !important; box-shadow: inset 0 0 0 1px rgb(var(--nt-fg, 255 255 255) / .12); }
.pn-card.edge { border-color: color-mix(in srgb, var(--pk-acc, #FFC71D) 70%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--pk-acc, #FFC71D) 18%, transparent), 0 18px 44px -22px color-mix(in srgb, var(--pk-acc, #FFC71D) 60%, transparent); }
.pn-card.gold .pk-av { box-shadow: 0 0 0 3px color-mix(in srgb, var(--pk-acc, #FFC71D) 18%, transparent), 0 0 22px color-mix(in srgb, var(--pk-acc, #FFC71D) 35%, transparent); border-color: #111; }
.pn-who { flex: 1 1 auto; min-width: 0; }
.pn-name { font-size: 15.5px; font-weight: 800; line-height: 1.25; letter-spacing: -0.01em; color: rgb(var(--nt-fg, 255 255 255)); overflow-wrap: anywhere; }
.pn-co { margin-top: 1px; font-size: 13.5px; line-height: 1.3; color: rgb(var(--nt-fg, 255 255 255) / .64); overflow-wrap: anywhere; }
.pn-date { flex: none; align-self: flex-start; margin-top: 3px; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: rgb(var(--nt-fg, 255 255 255) / .62); white-space: nowrap; }
.pn-card.gold .pn-date { color: var(--cb-accent-fg, var(--cb-accent)); }
.pn-chips { margin-top: 10px; }
.pn-chips .pk-chip { margin-left: 0; font-size: 12px; }
.pn-quote { margin: 12px 0 0; padding-left: 12px; border-left: 2px solid rgb(var(--nt-fg, 255 255 255) / .14); font-size: 14px; line-height: 1.5; color: rgb(var(--nt-fg, 255 255 255) / .72); overflow-wrap: anywhere; }
.pn-card.gold .pn-quote { border-left-color: color-mix(in srgb, var(--pk-acc, #FFC71D) 45%, transparent); }
.pn-acts { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; }
.pn-lnk { display: inline-flex; align-items: center; font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; text-decoration: none; border-radius: 999px; padding: 6px 12px; color: rgb(var(--nt-fg, 255 255 255)); border: 1px solid rgb(var(--nt-fg, 255 255 255) / .22); }
.pn-lnk.gold { color: var(--cb-accent-ink, #111); background: var(--cb-accent); border-color: var(--cb-accent); }
.pn-msgs { appearance: none; border: 0; background: none; padding: 6px 0; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font: 800 11px/1.2 var(--cb-body, Manrope), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: rgb(var(--nt-fg, 255 255 255) / .66); }
.pn-msgs:hover { color: rgb(var(--nt-fg, 255 255 255)); }
.pn-msgs i { font-style: normal; color: var(--cb-accent-fg, var(--cb-accent)); font-size: 13px; }
.pn-thread { display: flex; flex-direction: column; gap: 8px; padding: 6px 0 8px; }
.pn-msg { align-self: flex-start; max-width: 92%; border-radius: 14px 14px 14px 4px; padding: 9px 12px; background: rgb(var(--nt-fg, 255 255 255) / .05); border: 1px solid rgb(var(--nt-fg, 255 255 255) / .08); }
.pn-msg.mine { align-self: flex-end; border-radius: 14px 14px 4px 14px; background: color-mix(in srgb, var(--pk-acc, #FFC71D) 7%, transparent); border-color: color-mix(in srgb, var(--pk-acc, #FFC71D) 18%, transparent); }
.pn-msg .h { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgb(var(--nt-fg, 255 255 255) / .62); }
.pn-msg .t { margin-top: 4px; font-size: 14px; line-height: 1.5; color: rgb(var(--nt-fg, 255 255 255) / .88); white-space: pre-wrap; overflow-wrap: anywhere; }
.pn-more { appearance: none; margin-top: 14px; display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; border: 1px solid rgb(var(--nt-fg, 255 255 255) / .18); background: rgb(var(--nt-fg, 255 255 255) / .03); color: rgb(var(--nt-fg, 255 255 255)); padding: 10px 18px; font: 800 13.5px/1.2 var(--cb-body, Manrope), sans-serif; cursor: pointer; }
.pn-more:hover { border-color: color-mix(in srgb, var(--pk-acc, #FFC71D) 50%, transparent); }
.pn-more svg { color: var(--cb-accent-fg, var(--cb-accent)); }
.pn-empty { margin-top: 16px; padding: 18px; border-radius: 18px 8px 8px 8px; border: 1px dashed rgb(var(--nt-fg, 255 255 255) / .14); font-size: 14px; color: rgb(var(--nt-fg, 255 255 255) / .64); }
.pn-fold { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; padding: 14px 16px; border-radius: 18px 8px 8px 8px; border: 1px solid rgb(var(--nt-fg, 255 255 255) / .1); background: rgb(var(--nt-fg, 255 255 255) / .03); color: rgb(var(--nt-fg, 255 255 255)); font: 800 14px/1.3 var(--cb-body, Manrope), sans-serif; cursor: pointer; text-align: left; }
.pn-fold:hover { border-color: rgb(var(--nt-fg, 255 255 255) / .22); }
.pk-flat .pk-foot { color: rgb(var(--nt-fg, 255 255 255) / .6); }

/* QUIET: light ground, white panels and cards, ink numbers, no glow. Booked-call cards keep
   their yellow initials disc; the latest one carries a flat 2px ink edge. */
[data-quiet] .pk.pk-flat { border: 0; background: transparent; }
[data-quiet] .pn-seg { background: #FFFFFF; border-color: rgba(17,17,17,.12); }
[data-quiet] .pn-seg button[aria-pressed="true"] { box-shadow: none; }
[data-quiet] .pn-herowho .pk-av { border-color: #F5F5F3; }
[data-quiet] .pn-herowho .pk-av-more { background: #E9E9E6; color: #111; }
[data-quiet] .pn-lede { color: #111; }
[data-quiet] .pn-lede b { color: #111; }
[data-quiet] .pn-line { background: #FFFFFF; border: 1px solid rgba(17,17,17,.09); }
[data-quiet] .pn-strip > div { border-left-color: rgba(17,17,17,.14); }
[data-quiet] .pn-strip .hi { border-left-color: var(--cb-accent); }
[data-quiet] .pn-strip .hi dd { color: #111; }
[data-quiet] .pn-strip .zero dd { color: rgba(17,17,17,.4); }
[data-quiet] .pn-vtbl td.hit, [data-quiet] .pn-vstack .v .hit b { color: #111; font-weight: 800; }
[data-quiet] .pn-kind { background: #F5F5F3; border-color: rgba(17,17,17,.10); color: rgba(17,17,17,.78); }
[data-quiet] .pn-kind.gold { background: #FFFFFF; border-color: rgba(17,17,17,.22); }
[data-quiet] .pn-kind i { color: #111; }
[data-quiet] .pn-kind i::before { content: ''; display: inline-block; width: 6px; height: 6px; margin: 0 5px 1px 1px; border-radius: 999px; background: var(--cb-accent); vertical-align: middle; }
[data-quiet] .pn-card, [data-quiet] .pn-card.gold { background: #FFFFFF; border-color: rgba(17,17,17,.09); box-shadow: none; }
[data-quiet] .pn-card.edge { border-color: #111; box-shadow: inset 0 0 0 1px #111; }
[data-quiet] .pn-top .pk-av { border-color: #FFFFFF; }
[data-quiet] .pn-card.gold .pk-av { box-shadow: none; border-color: #FFFFFF; }
[data-quiet] .pn-av-q { background: #E9E9E6 !important; color: #111 !important; box-shadow: none; }
[data-quiet] .pn-card.gold .pn-date { color: #111; }
[data-quiet] .pn-quote, [data-quiet] .pn-card.gold .pn-quote { border-left-color: rgba(17,17,17,.14); color: rgba(17,17,17,.78); }
[data-quiet] .pn-lnk, [data-quiet] .pn-lnk.gold { background: #FFFFFF; color: #111; border-color: rgba(17,17,17,.22); }
[data-quiet] .pn-lnk:hover { border-color: #111; }
[data-quiet] .pn-msgs { color: rgba(17,17,17,.66); }
[data-quiet] .pn-msgs i { color: #111; }
[data-quiet] .pn-msg { background: #F5F5F3; border-color: rgba(17,17,17,.08); }
[data-quiet] .pn-msg.mine { background: #FFFFFF; border-color: rgba(17,17,17,.14); }
[data-quiet] .pn-more, [data-quiet] .pn-fold { background: #FFFFFF; border-color: rgba(17,17,17,.14); }
[data-quiet] .pn-more:hover, [data-quiet] .pn-fold:hover { border-color: rgba(17,17,17,.4); }
[data-quiet] .pn-more svg { color: #111; }
[data-quiet] .pn-empty { background: #FFFFFF; }
`,U=({open:n=!1})=>e.jsx("svg",{"aria-hidden":"true",width:"12",height:"12",viewBox:"0 0 14 14",style:{transform:n?"rotate(180deg)":void 0},children:e.jsx("path",{d:"M3 5l4 4 4-4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),M=n=>[n.reached,n.connected,n.wrote,n.interested,n.booked];function ke({ctx:n}){var d;const t=W(n),a=j.useMemo(()=>oe(n),[n]),o=((d=n.payload)==null?void 0:d.people)||[];if(!a.length)return null;const c=H(n).map(s=>s.label),g=c.map(s=>s.toLowerCase()),b=t?ie(o):[],h=a.map(s=>s.ln.title.toLowerCase()),p=t?"Grouped by the kind of company, then by how we found each person.":`Everyone we've contacted since ${y(n.cfg.start)}, split into ${h.length>1?`${h.slice(0,-1).join(", ")} and ${h[h.length-1]}`:h[0]}.`,x=s=>s===null?"already connected":f(s);return e.jsxs("section",{id:"pn-reach",className:"pk-sec pn-anchor","aria-labelledby":"pn-reach-h",children:[e.jsx("div",{className:"pk-cap pk-capline",children:"Who we reach"}),e.jsx("h2",{id:"pn-reach-h",className:"pk-h2",children:p}),a.map(({ln:s,inLine:u,all:w,rows:k})=>{const m=!t&&s.key==="owner"?le(u):[];return e.jsxs("div",{className:"pk-panel pn-line",children:[e.jsx("h3",{children:s.title}),e.jsx("div",{className:"pn-sub",children:s.sub.charAt(0).toUpperCase()+s.sub.slice(1)}),e.jsx("div",{className:"pk-cap pk-mute",style:{marginTop:18},children:w.label}),e.jsx("dl",{className:"pn-strip",children:M(w).map((l,r)=>e.jsxs("div",{className:r===4&&l?"hi":l?void 0:"zero",children:[e.jsx("dd",{children:l===null?"":r===4&&l?e.jsx("span",{className:"pk-money",children:f(l)}):f(l)}),e.jsx("dt",{children:g[r]})]},r))}),e.jsxs("table",{className:"pk-nums pn-vtbl",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{scope:"col",children:"How we found them"}),c.map(l=>e.jsx("th",{scope:"col",children:l},l))]})}),e.jsx("tbody",{children:k.map(l=>e.jsxs("tr",{children:[e.jsx("th",{scope:"row",children:l.label}),M(l).map((r,i)=>e.jsx("td",{className:r===null?"txt":i===4&&r?"hit":r?void 0:"zero",children:x(r)},i))]},l.label))})]}),e.jsx("ul",{className:"pn-vstack",children:k.map(l=>e.jsxs("li",{children:[e.jsx("div",{className:"l",children:l.label}),e.jsx("div",{className:"v",children:M(l).map((r,i)=>r===null?e.jsx("span",{children:"already connected"},i):e.jsxs("span",{className:i===4&&r?"hit":r?void 0:"z",children:[e.jsx("b",{children:f(r)})," ",g[i]]},i))})]},l.label))}),m.length>0&&e.jsx(A,{label:"Kinds of stores that wrote back",items:m})]},s.key)}),b.length>0&&e.jsx("div",{style:{marginTop:20},children:e.jsx(A,{label:"Conversations came from",items:b})})]})}function A({label:n,items:t}){return e.jsxs("div",{style:{margin:"18px 0 10px"},children:[e.jsx("div",{className:"pk-cap pk-mute",children:n}),e.jsx("div",{className:"pn-kinds",children:t.map(a=>e.jsxs("span",{className:`pn-kind${a.booked?" gold":""}`,children:[e.jsx("b",{children:a.n}),a.label,a.booked?e.jsxs("i",{children:[a.booked," booked a call"]}):null]},a.key))})]})}function ve({ctx:n,entry:t}){const a=(t.messages||[]).filter(o=>R(o)).slice().sort((o,c)=>(o.sent_at||"")<(c.sent_at||"")?-1:1);return a.length?e.jsx("div",{className:"pn-thread",children:a.map((o,c)=>{const g=o.direction==="outbound",b=/email/i.test(`${o.channel||""} ${o.type||""}`),h=K(o.sent_at,n.cfg.tz),p=R(o);return e.jsxs("div",{className:`pn-msg${g?" mine":""}`,children:[e.jsxs("div",{className:"h",children:[g?"You":(t.name||"Them").split(" ")[0],b?", by email":"",h?`, ${y(h)}`:""]}),e.jsx("div",{className:"t",children:P.test(p)?`Reacted ${p.replace(P,"").trim()}`:p})]},c)})}):e.jsx("div",{className:"pn-def",style:{margin:"4px 0 8px"},children:"No messages to show yet."})}function we({ctx:n,c:t,booked:a,hideYes:o,edge:c}){const g=B(),[b,h]=j.useState(!1),{p,entry:x,last:d,extra:s}=t,u=K(a?p.bk:d,n.cfg.tz),w=ce(x),k=a||o&&["positive","soft_yes"].includes(de(p.li))?null:ge(n,p.li),m=!!x&&(x.messages||[]).length>0;return e.jsxs("div",{className:`pn-card${a?" gold":""}${c?" edge":""}`,children:[e.jsxs("div",{className:"pn-top",children:[e.jsx("span",{className:`pk-av${a?"":" pn-av-q"}`,"aria-hidden":"true",style:{width:40,height:40,fontSize:13},children:p.n?O(p.n):"?"}),e.jsxs("div",{className:"pn-who",children:[e.jsx("div",{className:"pn-name",children:p.n||"Name not shown"}),p.c&&e.jsx("div",{className:"pn-co",children:p.c})]}),u&&e.jsx("span",{className:"pn-date",children:a?`Booked ${y(u)}`:y(u)})]}),k&&e.jsx("div",{className:"pn-chips",children:e.jsx("span",{className:"pk-chip",children:k})}),w&&e.jsxs("p",{className:"pn-quote",children:["“",w,"”"]}),((s==null?void 0:s.scan_url)||(s==null?void 0:s.brief_url)||m)&&e.jsxs("div",{className:"pn-acts",children:[m&&e.jsxs("button",{type:"button",className:"pn-msgs","aria-expanded":b,onClick:()=>h(l=>!l),children:[b?"Hide the thread":"Read the thread"," ",e.jsx("i",{"aria-hidden":"true",children:b?"−":"+"})]}),e.jsxs("span",{style:{marginLeft:"auto",display:"inline-flex",gap:8,flexWrap:"wrap"},children:[(s==null?void 0:s.scan_url)&&e.jsx("a",{className:"pn-lnk",href:s.scan_url,target:"_blank",rel:"noreferrer",children:"Their scan"}),(s==null?void 0:s.brief_url)&&e.jsx("a",{className:"pn-lnk gold",href:s.brief_url,target:"_blank",rel:"noreferrer",children:"Pre-call brief"})]})]}),b&&x&&e.jsx(V.div,{initial:g?!1:{opacity:0},animate:{opacity:1},transition:{duration:.2,ease:he},children:e.jsx(ve,{ctx:n,entry:x})})]})}function E({ctx:n,rows:t,booked:a,hideYes:o}){const[c,g]=j.useState(!1),b=c?t:t.slice(0,C);return e.jsxs(e.Fragment,{children:[e.jsx("ul",{className:"pn-cards",children:b.map((h,p)=>e.jsx("li",{children:e.jsx(we,{ctx:n,c:h,booked:a,hideYes:o,edge:a&&p===0})},`${h.p.n}-${p}`))}),t.length>C&&e.jsxs("button",{type:"button",className:"pn-more","aria-expanded":c,onClick:()=>g(h=>!h),children:[c?"Show fewer":`Show ${t.length-C} more`,e.jsx(U,{open:c})]})]})}function D({id:n,label:t,n:a,note:o,gold:c}){return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"pk-cap pk-capline",children:t}),e.jsxs("h2",{id:n,className:"pn-count","aria-label":`${t}: ${f(a)}`,children:[e.jsx("span",{className:"pn-num",style:c?{color:"var(--cb-accent-fg, var(--cb-accent))",textShadow:"0 0 28px color-mix(in srgb, var(--pk-acc, #FFC71D) 35%, transparent)"}:{color:"rgb(var(--nt-fg, 255 255 255))"},children:e.jsx("span",{className:c?"pk-money":void 0,children:f(a)})}),o&&e.jsx("span",{className:"pn-note",children:o})]})]})}function je(n,t=3){const a=n.filter(Boolean);if(a.length<=1)return a[0]||"";if(a.length<=t)return`${a.slice(0,-1).join(", ")} and ${a[a.length-1]}`;const o=a.length-t;return`${a.slice(0,t).join(", ")} and ${o} ${_(o,"other","others")}`}function Re({ctx:n,log:t,booked:a=[],queue:o,queueCount:c}){const g=B(),[b,h]=j.useState("conv"),[p,x]=j.useState(!1),d=W(n),s=j.useMemo(()=>J(n,t,a),[n,t,a]),{bookedRows:u,interested:w,recent:k,nBooked:m,nInterested:l}=s,r=d?l===1?"person is":"people are":l===1?"founder is":"founders are",i=y(n.cfg.start),$=j.useMemo(()=>H(n),[n]),G=j.useMemo(()=>X(n),[n]),Q=v=>{const L=v==="booked"?"pn-booked":v==="replied"?"pn-wrote":v==="yes"?"cb-pipe-interested":"pn-reach";L==="pn-wrote"&&x(!0),window.setTimeout(()=>{var I;(I=document.getElementById(L))==null||I.scrollIntoView({behavior:g?"auto":"smooth",block:"start"})},40)},q=u.map(v=>v.p.n).filter(Boolean),T=q.slice(0,3),Y=d?"Their latest reply, in the last two weeks, says yes or asks for details.":"Said yes in the last 14 days and hasn't booked yet.";return e.jsxs(Z,{children:[e.jsx("style",{children:ee+be+ue}),e.jsxs("div",{className:"pk pk-flat","data-report":"pipeline","data-pipe-night":"",children:[e.jsx("div",{"aria-hidden":!0,className:"pk-glow"}),e.jsx(ne,{}),o&&e.jsx("header",{className:"pk-head pn-head",children:e.jsxs("div",{className:"pn-seg",role:"tablist",children:[e.jsx("button",{type:"button",role:"tab","aria-pressed":b==="conv","aria-selected":b==="conv",onClick:()=>h("conv"),children:"Conversations"}),e.jsxs("button",{type:"button",role:"tab","aria-pressed":b==="queue","aria-selected":b==="queue",onClick:()=>h("queue"),children:["Queue",c?` ${c}`:""]})]})}),b==="queue"&&o?e.jsx("div",{style:{marginTop:18},children:o}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"pk-top",children:[e.jsxs("section",{className:"pn-hero","aria-labelledby":"pn-hero",children:[e.jsxs("div",{className:"pk-cap pk-capline",children:["Since ",i]}),m>0?e.jsxs("h1",{id:"pn-hero",className:"pk-hero-h",style:{margin:"12px 0 0"},children:[e.jsx("span",{className:"pk-hero-n pk-grad",children:f(m)}),e.jsxs("span",{className:"pk-hero-l pk-disp",children:[_(m,"call","calls")," booked"]})]}):e.jsx("h1",{id:"pn-hero",className:"pk-h2",style:{fontSize:"clamp(34px, 9vw, 52px)"},children:"No calls booked yet."}),q.length>0&&e.jsxs("div",{className:"pn-herowho",children:[e.jsx(ae,{size:44,more:q.length-T.length,avatars:T.map(v=>({initials:O(v),label:v}))}),e.jsx("p",{className:"pn-names",style:{margin:0},children:je(q)})]}),l>0&&e.jsxs(e.Fragment,{children:[e.jsxs("p",{className:"pn-lede",children:[e.jsx("b",{children:f(l)})," more ",r," interested right now."]}),e.jsx("div",{className:"pn-def",children:Y})]})]}),e.jsx(xe,{stages:$,onGo:Q})]}),e.jsx(ke,{ctx:n}),e.jsx(fe,{weeks:G,third:n.payload?{label:"Came to you",of:v=>v.came}:null}),e.jsxs("section",{id:"cb-pipe-interested",className:"pk-sec pn-anchor","aria-labelledby":"pn-int-h",children:[e.jsx(D,{id:"pn-int-h",label:"Interested right now",n:w.length}),w.length?e.jsx(E,{ctx:n,rows:w,hideYes:!0}):e.jsx("div",{className:"pn-empty",children:"Nobody right now."})]}),e.jsxs("section",{id:"pn-booked",className:"pk-sec pn-anchor","aria-labelledby":"pn-bk-h",children:[e.jsx(D,{id:"pn-bk-h",label:"Calls booked",n:u.length,gold:!0}),u.length?e.jsx(E,{ctx:n,rows:u,booked:!0}):e.jsx("div",{className:"pn-empty",children:"No calls booked yet."})]}),e.jsxs("section",{id:"pn-wrote",className:"pk-sec pn-anchor","aria-labelledby":"pn-wr-h",children:[e.jsx(D,{id:"pn-wr-h",label:"Wrote back",n:k.length,note:"Everyone else who wrote back in the last 30 days."}),k.length===0?e.jsx("div",{className:"pn-empty",children:"Nobody else in the last 30 days."}):e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",className:"pn-fold","aria-expanded":p,"aria-controls":"pn-wrote-list",onClick:()=>x(v=>!v),children:[e.jsx("span",{children:p?"Close the list":`Show all ${k.length}`}),e.jsx(U,{open:p})]}),p&&e.jsx("div",{id:"pn-wrote-list",children:e.jsx(E,{ctx:n,rows:k})})]})]}),e.jsx("div",{className:"pk-foot",children:"Each person is counted once."})]})]})]})}export{be as NIGHT_CSS,xe as NightFunnel,fe as NightWeeks,Re as default,S as weekSpan};
