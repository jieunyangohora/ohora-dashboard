import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Bookmark, Share2, UserCheck, Eye, Heart, MessageCircle, UserPlus, Plus, Trash2, Pencil, Check, X, ExternalLink, ChevronDown, ChevronUp, Minus, RefreshCw, Settings, Target, Flame, CheckCircle, AlertCircle } from 'lucide-react';

import {
  C, FONT, SHADOW, COUNTRIES, NAV, ACCOUNT_METRICS, ALL_ACCOUNT_KEYS,
  CONTENT_METRICS, CONTENT_CORE, CONTENT_SUB, FEED_METRICS, FEED_CORE,
  FEED_SUB, FEED_KEYS, PRODUCT_CATS, initialWeekMeta, initialFeedContents,
  initialAllContents, initialAccountMetrics, initialCountryInsights, initialProductSales
} from './data';

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const pct = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
const fmtMetric = (mkey, value) => {
  if (mkey === 'sales') return `₩${fmt(value)}`;
  if (mkey.includes('AchieveRate') || mkey === 'pace' || mkey === 'hitRate') return `${Number(value || 0).toFixed(0)}%`;
  return fmt(value);
};
const isReel = (item) => /\/reel[s]?\//.test(item.link || '');
const fmtMonth = (m) => { if (!m) return ''; const [y, mo] = m.split('-'); return `${y}.${mo}`; };
const metricLabels = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.label]));

const blankItem = (id, title, keys) => {
  const base = { id, title, thumbnail: '', link: '', hypothesis: '', analysis: '', salesImpact: '', productCategory: '', initialScore: 0, w1Score: 0, w2Score: 0, w3Score: 0, w4Score: 0, finalScore: 0 };
  keys.forEach((k) => { base[k] = 0; }); return base;
};

const lastNWeeksKeys = (weekMeta, selectedWeek, n) => {
  const keys = weekMeta.map((w) => w.key);
  const idx = keys.indexOf(selectedWeek);
  if (idx < 0) return keys.slice(-n);
  return keys.slice(Math.max(0, idx - n + 1), idx + 1);
};

const zeroAccount = () => {
  const o = {};
  ALL_ACCOUNT_KEYS.forEach((k) => { o[k] = 0; });
  return o;
};

function Swatch({ color, size = 8 }) { return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '999px', background: color, flexShrink: 0 }} />; }
function SectionLabel({ children, color = C.accent, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 10px' }}>
      <span style={{ width: 4, height: 15, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{children}</span>
      {sub && <span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>{sub}</span>}
    </div>
  );
}

function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }} style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${C.sub}`, background: 'transparent', color: C.sub, fontSize: 9, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>?</button>
      {open && <div style={{ position: 'absolute', bottom: '140%', left: 0, background: C.ink, color: '#fff', fontSize: 11.5, fontWeight: 500, padding: '9px 11px', borderRadius: 9, width: 230, zIndex: 50, boxShadow: SHADOW }}>{text}</div>}
    </span>
  );
}

function MetricPill({ metricsMap, mkey, value, big }) {
  const m = metricsMap[mkey]; if (!m) return null;
  const Icon = m.icon;
  return (
    <div className="flex items-center gap-1.5" style={{ color: C.ink }}>
      <Swatch color={m.color} size={big ? 9 : 7} /><Icon size={big ? 15 : 13} color={C.sub} strokeWidth={2} />
      <span style={{ fontSize: big ? 14 : 12, fontWeight: big ? 700 : 600 }}>{fmt(value)}</span>
      <span style={{ fontSize: big ? 12 : 11, color: C.sub }}>{m.label}</span>
    </div>
  );
}

function DeltaTag({ value }) {
  if (value === null || value === undefined || !isFinite(value)) return <span style={{ fontSize: 12, color: C.sub }}>—</span>;
  const up = value > 0; const flat = value === 0;
  const color = flat ? C.sub : up ? C.mint : C.accent;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return <span className="flex items-center gap-0.5" style={{ color, fontSize: 12, fontWeight: 700 }}><Icon size={13} strokeWidth={2.5} />{pct(value)}</span>;
}

function HeroCard({ metricsMap, mkey, value, delta, sub, infoText, accentColor }) {
  const m = metricsMap[mkey]; if (!m) return null;
  const Icon = m.icon;
  return (
    <div className="flex-1" style={{ position: 'relative', overflow: 'hidden', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', minWidth: 150, boxShadow: SHADOW }}>
      {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accentColor }} />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Swatch color={m.color} size={10} /><span style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>{m.label}</span>{infoText && <InfoTip text={infoText} />}</div>
        <Icon size={16} color={m.color} />
      </div>
      <div className="flex items-end justify-between"><span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{fmtMetric(mkey, value)}</span><DeltaTag value={delta} /></div>
      <div className="flex items-center justify-between" style={{ marginTop: 2 }}><span style={{ fontSize: 11, color: C.subLite }}>전주 대비</span>{sub}</div>
    </div>
  );
}

function ReachOrganicCard({ mkey, organicKey, value, organicValue, delta, organicDelta, accentColor }) {
  const m = ACCOUNT_METRICS[mkey]; const om = ACCOUNT_METRICS[organicKey];
  if (!m || !om) return null;
  const Icon = m.icon; const OmIcon = om.icon;
  const ratio = value > 0 ? Math.round((organicValue / value) * 100) : 0;
  return (
    <div className="flex-1" style={{ position: 'relative', overflow: 'hidden', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', minWidth: 190, boxShadow: SHADOW }}>
      {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accentColor }} />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Swatch color={m.color} size={10} /><span style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>{m.label}</span></div>
        <Icon size={16} color={m.color} />
      </div>
      <div className="flex items-end justify-between"><span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{fmt(value)}</span><DeltaTag value={delta} /></div>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5"><OmIcon size={13} color={om.color} strokeWidth={2.2} /><span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>{om.label}</span></div>
          <div className="flex items-center gap-2"><span style={{ fontSize: 14, fontWeight: 800, color: om.color }}>{fmt(organicValue)}</span><span style={{ fontSize: 11, fontWeight: 700, color: C.sub, background: C.mintSoft, borderRadius: 999, padding: '1px 7px' }}>{ratio}%</span></div>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, width }) {
  return (
    <label className="flex flex-col gap-1" style={{ width: width || 'auto' }}>
      <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', fontSize: 13, width: '100%', background: '#fff', color: C.ink }} />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, width }) {
  return (
    <label className="flex flex-col gap-1" style={{ width: width || 'auto', flex: width ? 'none' : 1 }}>
      <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{label}</span>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', fontSize: 13, width: '100%', background: '#fff', color: C.ink }} />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="flex flex-col gap-1" style={{ width: '100%' }}>
      {label && <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{label}</span>}
      <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, width: '100%', background: '#fff', color: C.ink, resize: 'vertical', fontFamily: FONT }} />
    </label>
  );
}

function ChartTooltip({ active, payload, label, labels }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: SHADOW }}>
      <div style={{ fontWeight: 800, marginBottom: 6, color: C.ink }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5" style={{ color: C.ink, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill, display: 'inline-block' }} />
          <span style={{ minWidth: 35 }}>{labels?.[p.dataKey] || p.name || p.dataKey}</span>
          <b>{p.dataKey === 'sales' ? fmtMetric('sales', p.payload?.[`_raw_${p.dataKey}`]) : fmt(p.payload?.[`_raw_${p.dataKey}`] || p.value)}</b>
          {p.payload?.[`_raw_${p.dataKey}`] !== undefined && <span style={{ color: C.sub, fontSize: 11, marginLeft: 4 }}>(지수: {p.value})</span>}
        </div>
      ))}
    </div>
  );
}

function ContentCard({ item, coreKeys, subKeys, metricsMap, onSave, onDelete, onSyncInsight, avgMetrics }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);
  const [insightOpen, setInsightOpen] = useState(false);
  useEffect(() => { setDraft(item); }, [item]);
  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));

  const standout = useMemo(() => {
    if (!avgMetrics) return null;
    let best = null; let maxPct = 0;
    ['saves', 'shares', 'comments', 'likes', 'reach', 'engagement'].forEach(k => {
       if (avgMetrics[k] > 50 && item[k] > 0) { 
         const pct = ((item[k] - avgMetrics[k]) / avgMetrics[k]) * 100;
         if (pct > maxPct && pct >= 50) { maxPct = pct; best = { key: k, pct }; }
       }
    });
    if (avgMetrics['reachAndEngagement'] && (Number(item.reach || 0) + Number(item.engagement || 0)) > 0) {
       const combinedVal = Number(item.reach || 0) + Number(item.engagement || 0);
       const pct = ((combinedVal - avgMetrics['reachAndEngagement']) / avgMetrics['reachAndEngagement']) * 100;
       if (pct > maxPct && pct >= 50) { maxPct = pct; best = { key: 'reachAndEngagement', pct, label: '도달+참여수' }; }
    }
    return best;
  }, [item, avgMetrics]);

  const handleSave = () => {
    onSave(draft); setEditing(false);
    if (onSyncInsight && (draft.hypothesis || draft.analysis)) onSyncInsight(draft);
  };

  if (editing) {
    return (
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, boxShadow: SHADOW }}>
        <div className="flex flex-wrap gap-3 mb-3"><TextField label="콘텐츠 제목" value={draft.title} onChange={set('title')} /></div>
        <div className="flex flex-wrap gap-3 mb-3"><TextField label="콘텐츠 링크" value={draft.link} onChange={set('link')} placeholder="https://instagram.com/p/..." /></div>
        <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 6 }}>핵심지표</div>
        <div className="flex flex-wrap gap-3 mb-3">
          {coreKeys.map((k) => <NumberField key={k} label={k === 'profileActivity' ? '프로필 활동 [수동 기입]' : metricsMap[k]?.label} value={draft[k]} onChange={set(k)} width={120} />)}
        </div>
        <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 6 }}>서브지표</div>
        <div className="flex flex-wrap gap-3 mb-4">
          {subKeys.map((k) => <NumberField key={k} label={metricsMap[k]?.label} value={draft[k]} onChange={set(k)} width={100} />)}
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <div style={{ flex: '1 1 240px' }}><TextAreaField label="🤔 가설" value={draft.hypothesis} onChange={set('hypothesis')} placeholder="가설을 입력하세요." /></div>
          <div style={{ flex: '1 1 240px' }}><TextAreaField label="📝 분석 & 추후 방안" value={draft.analysis} onChange={set('analysis')} placeholder="결과 분석을 입력하세요." /></div>
        </div>
        <div className="mb-4">
          <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>제품군</div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATS.map((p) => (
              <button key={p.key} onClick={() => setDraft((d) => ({ ...d, productCategory: p.key }))} style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999, border: `1.5px solid ${draft.productCategory === p.key ? p.color : C.border}`, background: draft.productCategory === p.key ? `${p.color}15` : '#fff', color: draft.productCategory === p.key ? p.color : C.sub, cursor: 'pointer' }}>
                {draft.productCategory === p.key ? '✓ ' : ''}{p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setEditing(false); setDraft(item); }} className="flex items-center gap-1" style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.sub, fontWeight: 600 }}><X size={14} /> 취소</button>
          <button onClick={handleSave} className="flex items-center gap-1" style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: 'none', background: C.accent, color: '#fff', fontWeight: 700 }}><Check size={14} /> 저장</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, boxShadow: SHADOW }}>
      <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
        <a href={item.link || undefined} target="_blank" rel="noreferrer" style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {item.thumbnail ? <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ExternalLink size={14} color={C.sub} />}
        </a>
        <div style={{ minWidth: 180, flex: '1 1 220px' }}>
          <a href={item.link || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ fontSize: 14, fontWeight: 700, color: C.ink, textDecoration: 'none', marginBottom: 6 }}>
            {item.title || '(제목 없음)'}{item.link && <ExternalLink size={12} color={C.sub} />}
          </a>
          {item.productCategory && (() => {
            const p = PRODUCT_CATS.find((c) => c.key === item.productCategory);
            return p ? <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}40`, marginBottom: 6 }}># {p.label}</span> : null;
          })()}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center">
            {coreKeys.map((k) => <MetricPill key={k} metricsMap={metricsMap} mkey={k} value={item[k]} big />)}
            {standout && (
              <span className="flex items-center gap-0.5" style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: '#FFF4E5', color: '#E65100', border: '1px solid #FFE0B2', whiteSpace: 'nowrap' }}>
                <Flame size={12} strokeWidth={2.5} style={{ marginRight: 2 }} /> {standout.label || metricsMap[standout.key]?.label || standout.key} 터짐 (+{standout.pct.toFixed(0)}%)
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5" style={{ flex: '1 1 240px' }}>
          {subKeys.map((k) => <MetricPill key={k} metricsMap={metricsMap} mkey={k} value={item[k]} />)}
        </div>
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          <button onClick={() => setEditing(true)} style={{ padding: 7, borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.sub }}><Pencil size={14} /></button>
          <button onClick={() => onDelete(item.id)} style={{ padding: 7, borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.accent }}><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function SummaryView({ weekMeta, selectedWeek, displayWeeks, accountMetrics, allContents }) {
  const [tab, setTab] = useState('KR'); const accent = tab === 'KR' ? '#E8546B' : '#3E6FE0';
  const weekKeys = weekMeta.map((w) => w.key); const prevIdx = weekKeys.indexOf(selectedWeek) - 1; const prevWeek = prevIdx >= 0 ? weekKeys[prevIdx] : null;
  const val = (country, week, k) => Number(accountMetrics[country]?.[week]?.[k] || 0);
  const wowDelta = (country, k) => { const cur = val(country, selectedWeek, k); if (!prevWeek) return null; const prev = val(country, prevWeek, k); return prev ? ((cur - prev) / prev) * 100 : null; };
  const labelsA = metricLabels(ACCOUNT_METRICS);

  const latestMonthStr = weekMeta[weekMeta.length - 1]?.month || '2026-06';
  const currentYear = latestMonthStr.split('-')[0]; const latestMonthNum = parseInt(latestMonthStr.split('-')[1], 10);
  const monthList = Array.from({length: latestMonthNum}, (_, i) => `${currentYear}-${String(i+1).padStart(2, '0')}`);

  const monthlyData = monthList.map(m => {
      const wks = weekMeta.filter(w => w.month === m).map(w => w.key); const data = { month: m, sales: 0, inflow: 0, reach: 0, engagement: 0 };
      wks.forEach(wk => { data.sales += val(tab, wk, 'sales') || 0; data.inflow += val(tab, wk, 'inflow') || 0; data.reach += val(tab, wk, 'reach') || 0; data.engagement += val(tab, wk, 'engagement') || 0; }); return data;
  });
  const mBase = { sales: monthlyData.find(d => d.sales > 0)?.sales || 1, inflow: monthlyData.find(d => d.inflow > 0)?.inflow || 1, reach: monthlyData.find(d => d.reach > 0)?.reach || 1, engagement: monthlyData.find(d => d.engagement > 0)?.engagement || 1 };
  const monthlyTrendNorm = monthlyData.map(d => ({ month: fmtMonth(d.month), sales: Math.round((d.sales / mBase.sales) * 100), inflow: Math.round((d.inflow / mBase.inflow) * 100), reach: Math.round((d.reach / mBase.reach) * 100), engagement: Math.round((d.engagement / mBase.engagement) * 100), _raw_sales: d.sales, _raw_inflow: d.inflow, _raw_reach: d.reach, _raw_engagement: d.engagement }));

  const BASELINE_WEEKS = 8; const baselineWeeksList = lastNWeeksKeys(weekMeta, selectedWeek, BASELINE_WEEKS); const rangeItems = baselineWeeksList.flatMap((w) => allContents[tab]?.[w] || []);
  const avgMetrics = {};
  ['reach', 'views', 'engagement', 'likes', 'comments', 'saves', 'shares'].forEach(k => {
     const vals = rangeItems.map(i => Number(i[k] || 0)).sort((a,b)=>b-a); const cutoff = Math.ceil(vals.length * 0.05); const valid = vals.slice(cutoff); avgMetrics[k] = valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : 0;
  });
  const combinedScore = (i) => Number(i.reach || 0) + Number(i.engagement || 0);
  const combinedVals = rangeItems.map(i => combinedScore(i)).sort((a,b)=>b-a);
  const combinedCutoff = Math.ceil(combinedVals.length * 0.05); const combinedValid = combinedVals.slice(combinedCutoff); avgMetrics['reachAndEngagement'] = combinedValid.length ? combinedValid.reduce((a,b)=>a+b,0)/combinedValid.length : 0;

  const weekItems = allContents[tab]?.[selectedWeek] || []; const top3Content = [...weekItems].sort((a, b) => combinedScore(b) - combinedScore(a)).slice(0, 3);
  const reelsBaseAvg = avgMetrics.reach || 0; const calcHitRate = (w) => { const items = allContents[tab]?.[w] || []; const reels = items.filter(isReel); const hits = reels.filter((r) => Number(r.reach || 0) >= reelsBaseAvg).length; return reels.length ? Math.round((hits / reels.length) * 100) : null; };
  const hitRateNow = calcHitRate(selectedWeek); const hitRatePrev = prevWeek ? calcHitRate(prevWeek) : null; const hitRateDelta = hitRateNow != null && hitRatePrev != null ? hitRateNow - hitRatePrev : null;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 4 }}>
        <div><h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>통합 요약 · {selectedWeek}</h2></div>
        <div className="flex gap-1.5">
          {COUNTRIES.map((c) => {
            const cAccent = c.key === 'KR' ? '#E8546B' : '#3E6FE0';
            return <button key={c.key} onClick={() => setTab(c.key)} className="flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 800, padding: '8px 20px', borderRadius: 999, border: `2px solid ${c.key === tab ? cAccent : C.border}`, background: c.key === tab ? cAccent : '#fff', color: c.key === tab ? '#fff' : C.sub }}><span>{c.flag}</span>{c.label}</button>;
          })}
        </div>
      </div>
      <div style={{ marginTop: 14 }} />

      <SectionLabel color={ACCOUNT_METRICS.sales.color}>매출 · 유입</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-1">
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="sales" value={val(tab, selectedWeek, 'sales')} delta={wowDelta(tab, 'sales')} accentColor={accent} sub={<span style={{ fontSize: 11, fontWeight: 700 }}>달성률 {fmtMetric('salesAchieveRate', val(tab, selectedWeek, 'salesAchieveRate'))}</span>} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="inflow" value={val(tab, selectedWeek, 'inflow')} delta={wowDelta(tab, 'inflow')} accentColor={accent} sub={<span style={{ fontSize: 11, fontWeight: 700 }}>달성률 {fmtMetric('inflowAchieveRate', val(tab, selectedWeek, 'inflowAchieveRate'))}</span>} />
      </div>

      <SectionLabel color={ACCOUNT_METRICS.reach.color}>SNS 채널 · 도달 · 조회수 · 참여</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-3">
        <ReachOrganicCard mkey="reach" organicKey="organicReach" value={val(tab, selectedWeek, 'reach')} organicValue={val(tab, selectedWeek, 'organicReach')} delta={wowDelta(tab, 'reach')} organicDelta={wowDelta(tab, 'organicReach')} accentColor={accent} />
        <ReachOrganicCard mkey="views" organicKey="organicViews" value={val(tab, selectedWeek, 'views')} organicValue={val(tab, selectedWeek, 'organicViews')} delta={wowDelta(tab, 'views')} organicDelta={wowDelta(tab, 'organicViews')} accentColor={accent} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="engagement" value={val(tab, selectedWeek, 'engagement')} delta={wowDelta(tab, 'engagement')} accentColor={accent} />
      </div>

      <SectionLabel color="#E08A2B">콘텐츠 발행 · 타율</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-3">
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="contentsCount" value={val(tab, selectedWeek, 'contentsCount')} delta={wowDelta(tab, 'contentsCount')} accentColor={accent} />
        <HeroCard metricsMap={{ hitRate: { label: '콘텐츠 타율', icon: Target, color: '#2E9E89' } }} mkey="hitRate" value={hitRateNow ?? 0} delta={hitRateDelta} accentColor={accent} />
      </div>

      <div className="mb-8 mt-6" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
          <div><h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px' }}>[참고] 월간 매출 · 유입 · 도달 · 참여 추이</h3></div>
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={monthlyTrendNorm} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip labels={labelsA} />} />
              <Line type="monotone" dataKey="sales" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="inflow" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="reach" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="engagement" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ✅ [완벽 복구] 태그 문법 오류를 도끼로 찍듯 완벽히 소거하여 리팩토링한 CountryView 컴포넌트
function CountryView({ countryKey, weekMeta, selectedWeek, displayWeeks, accountMetrics, countryInsights, onInsightChange, allContents, onAllContentsChange, onSyncContent }) {
  const country = COUNTRIES.find((c) => c.key === countryKey); const weekKeys = weekMeta.map((w) => w.key); const metrics = accountMetrics[countryKey] || {}; const totals = (week) => metrics[week] || zeroAccount();
  const prevIdx = weekKeys.indexOf(selectedWeek) - 1; const prevWeek = prevIdx >= 0 ? weekKeys[prevIdx] : null; const labelsA = metricLabels(ACCOUNT_METRICS);
  const [showPrimaryTable, setShowPrimaryTable] = useState(false); const [showAllList, setShowAllList] = useState(false);
  const wowDelta = (k) => { const cur = totals(selectedWeek)[k]; if (!prevWeek) return null; const prev = totals(prevWeek)[k]; return prev ? ((cur - prev) / prev) * 100 : null; };

  const trendData = displayWeeks.map((w) => ({ week: w, ...totals(w) }));
  const PRIMARY_KEYS = ['sales', 'inflow', 'reach', 'engagement']; const primaryBase = Object.fromEntries(PRIMARY_KEYS.map((k) => [k, trendData.find((d) => d[k] > 0)?.[k] || 1]));
  const primaryTrendNorm = trendData.map((d) => { const entry = { week: d.week }; PRIMARY_KEYS.forEach((k) => { entry[k] = Math.round((d[k] / primaryBase[k]) * 100); entry[`_raw_${k}`] = d[k]; }); return entry; });

  const BASELINE_WEEKS = 8; const rangeWeeks = lastNWeeksKeys(weekMeta, selectedWeek, BASELINE_WEEKS); const rangeItems = rangeWeeks.flatMap((w) => allContents[countryKey]?.[w] || []);
  const avgMetrics = {};
  ['reach', 'views', 'engagement', 'likes', 'comments', 'saves', 'shares'].forEach(k => {
     const vals = rangeItems.map(i => Number(i[k] || 0)).sort((a,b)=>b-a); const cutoff = Math.ceil(vals.length * 0.05); const valid = vals.slice(cutoff); avgMetrics[k] = valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : 0;
  });
  const combinedScore = (i) => Number(i.reach || 0) + Number(i.engagement || 0);
  const combinedVals = rangeItems.map(i => combinedScore(i)).sort((a,b)=>b-a);
  const combinedCutoff = Math.ceil(combinedVals.length * 0.05); const combinedValid = combinedVals.slice(combinedCutoff); avgMetrics['reachAndEngagement'] = combinedValid.length ? combinedValid.reduce((a,b)=>a+b,0)/combinedValid.length : 0;
  
  const weekItems = allContents[countryKey]?.[selectedWeek] || [];
  const topContent = weekItems.filter((i) => combinedScore(i) >= avgMetrics.reachAndEngagement).sort((a, b) => combinedScore(b) - combinedScore(a)).slice(0, 5);
  const bottomContent = weekItems.filter((i) => combinedScore(i) < avgMetrics.reachAndEngagement).sort((a, b) => combinedScore(a) - combinedScore(b)).slice(0, 5);
  
  const updateAllItem = (item) => { const list = weekItems.map((c) => (c.id === item.id ? item : c)); onAllContentsChange(countryKey, selectedWeek, list); };
  const deleteAllItem = (id) => { const list = weekItems.filter((c) => c.id !== id); onAllContentsChange(countryKey, selectedWeek, list); };
  const handleSyncContent = (item, category = '') => { if (onSyncContent) onSyncContent({ type: 'content', country: countryKey, week: selectedWeek, category, url: item.link, title: item.title, hypothesis: item.hypothesis, analysis: item.analysis }); };

  return (
    <div>
      <SectionLabel color={ACCOUNT_METRICS.sales.color}>매출 · 유입</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-1">
        {[{ k: 'sales', ar: 'salesAchieveRate' }, { k: 'inflow', ar: 'inflowAchieveRate' }].map(({ k, ar }) => (
          <HeroCard key={k} metricsMap={ACCOUNT_METRICS} mkey={k} value={totals(selectedWeek)[k]} delta={wowDelta(k)} sub={<span style={{ fontSize: 11, fontWeight: 700 }}>달성률 {fmtMetric(ar, totals(selectedWeek)[ar])}</span>} />
        ))}
      </div>

      <SectionLabel color={ACCOUNT_METRICS.reach.color}>채널 핵심지표</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-6">
        <ReachOrganicCard delta={wowDelta('reach')} mkey="reach" organicDelta={wowDelta('organicReach')} organicKey="organicReach" organicValue={totals(selectedWeek).organicReach} value={totals(selectedWeek).reach} />
        <ReachOrganicCard delta={wowDelta('views')} mkey="views" organicDelta={wowDelta('organicViews')} organicKey="organicViews" organicValue={totals(selectedWeek).organicViews} value={totals(selectedWeek).views} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="engagement" value={totals(selectedWeek).engagement} delta={wowDelta('engagement')} />
      </div>

      <div className="mb-6" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
          <div><h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>주차별 성과 추이 지수 비교 (최근 7주)</h3></div>
        </div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={primaryTrendNorm} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
              <Tooltip content={({active, payload, label}) => {
                if(!active || !payload?.length) return null;
                return (
                  <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: SHADOW }}>
                    <div style={{ fontWeight: 800, marginBottom: 6, color: C.ink }}>{label}</div>
                    {payload.map((p) => (
                      <div key={p.dataKey} className="flex items-center gap-1.5" style={{ color: C.ink, marginBottom: 3 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} /><span style={{ minWidth: 35 }}>{labelsA[p.dataKey]}</span>
                        <b>{p.dataKey === 'sales' ? fmtMetric('sales', p.payload?.[`_raw_${p.dataKey}`]) : fmt(p.payload?.[`_raw_${p.dataKey}`])}</b>
                      </div>
                    ))}
                  </div>
                );
              }} />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => labelsA[v] || v} />
              <Line type="monotone" dataKey="sales" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="inflow" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="reach" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="engagement" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
        <div className="flex items-center gap-2 mb-2"><Pencil color={C.accent} size={16} /><h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>주간 전체 인사이트 · {selectedWeek}</h3><span style={{ fontSize: 11, color: C.sub, marginLeft: 'auto' }}>시트 실시간 자동 저장</span></div>
        <TextAreaField value={countryInsights[countryKey]?.[selectedWeek] || ''} onChange={(v) => onInsightChange(countryKey, selectedWeek, v)} placeholder="이번 주 분석 인사이트를 입력하세요." rows={4} />
      </div>

      <div className="mb-6" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>🏆 상위 콘텐츠 (도달+참여수 기준)</h3>
        <div className="flex flex-col gap-2.5 mt-2">
          {topContent.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>콘텐츠가 없습니다.</div>}
          {topContent.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onDelete={deleteAllItem} onSave={updateAllItem} avgMetrics={avgMetrics} onSyncInsight={(i) => handleSyncContent(i, '상위')} />)}
        </div>
      </div>

      <div className="mb-6" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>📉 하위 콘텐츠 (도달+참여수 기준)</h3>
        <div className="flex flex-col gap-2.5 mt-2">
          {bottomContent.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>콘텐츠가 없습니다.</div>}
          {bottomContent.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onDelete={deleteAllItem} onSave={updateAllItem} avgMetrics={avgMetrics} onSyncInsight={(i) => handleSyncContent(i, '하위')} />)}
        </div>
      </div>

      <div className="mb-6" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <button onClick={() => setShowAllList(!showAllList)} className="flex items-center justify-between w-full" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>📦 게시 전체 콘텐츠 목록 ({weekItems.length}건)</h3>
          {showAllList ? <ChevronUp color={C.sub} size={18} /> : <ChevronDown color={C.sub} size={18} />}
        </button>
        {showAllList && (
          <div className="flex flex-col gap-2.5 mt-4">
            {weekItems.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onDelete={deleteAllItem} onSave={updateAllItem} avgMetrics={avgMetrics} onSyncInsight={(i) => handleSyncContent(i, '전체')} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedView({ weekMeta, selectedWeek, displayWeeks, feedContents, accountMetrics, onFeedContentsChange, onSyncContent }) {
  const [selectedCountry, setSelectedCountry] = useState('KR'); const countryContents = feedContents[selectedCountry] || {}; const weekContents = countryContents[selectedWeek] || [];

  const getFeedTotals = useCallback((weekKey) => {
    const list = feedContents[selectedCountry]?.[weekKey] || [];
    return {
      reach: list.reduce((s, c) => s + Number(c.reach || 0), 0),
      engagement: list.reduce((s, c) => s + (Number(c.likes || 0) + Number(c.comments || 0) + Number(c.saves || 0) + Number(c.shares || 0)), 0),
      likes: list.reduce((s, c) => s + Number(c.likes || 0), 0), comments: list.reduce((s, c) => s + Number(c.comments || 0), 0),
      saves: list.reduce((s, c) => s + Number(c.saves || 0), 0), shares: list.reduce((s, c) => s + Number(c.shares || 0), 0),
      profileActivity: list.reduce((s, c) => s + Number(c.profileActivity || 0), 0), follows: list.reduce((s, c) => s + Number(c.follows || 0), 0)
    };
  }, [feedContents, selectedCountry]);

  const weekKeys = weekMeta.map((w) => w.key); const prevIdx = weekKeys.indexOf(selectedWeek) - 1; const prevWeekKey = prevIdx >= 0 ? weekKeys[prevIdx] : null;
  const currentTotals = useMemo(() => getFeedTotals(selectedWeek), [selectedWeek, getFeedTotals]);
  const prevTotals = useMemo(() => prevWeekKey ? getFeedTotals(prevWeekKey) : null, [prevWeekKey, getFeedTotals]);
  const calcFeedDelta = (key) => { if (!prevTotals || prevTotals[key] === 0) return null; return ((currentTotals[key] - prevTotals[key]) / prevTotals[key]) * 100; };

  const weeklyTrendData = displayWeeks.map(wk => ({ week: wk, ...getFeedTotals(wk) }));
  const wBase = { reach: weeklyTrendData.find(d => d.reach > 0)?.reach || 1, engagement: weeklyTrendData.find(d => d.engagement > 0)?.engagement || 1, saves: weeklyTrendData.find(d => d.saves > 0)?.saves || 1, shares: weeklyTrendData.find(d => d.shares > 0)?.shares || 1, profileActivity: weeklyTrendData.find(d => d.profileActivity > 0)?.profileActivity || 1 };
  const weeklyTrendNorm = weeklyTrendData.map(d => ({
    week: d.week, reach: Math.round((d.reach / wBase.reach) * 100), engagement: Math.round((d.engagement / wBase.engagement) * 100), saves: Math.round((d.saves / wBase.saves) * 100), shares: Math.round((d.shares / wBase.shares) * 100), profileActivity: Math.round((d.profileActivity / wBase.profileActivity) * 100),
    _raw_reach: d.reach, _raw_engagement: d.engagement, _raw_saves: d.saves, _raw_shares: d.shares, _raw_profileActivity: d.profileActivity,
  }));

  const latestMonthStr = weekMeta[weekMeta.length - 1]?.month || '2026-06'; const currentYear = latestMonthStr.split('-')[0]; const latestMonthNum = parseInt(latestMonthStr.split('-')[1], 10); const monthList = Array.from({length: latestMonthNum}, (_, i) => `${currentYear}-${String(i+1).padStart(2, '0')}`);
  const monthlyData = monthList.map(m => {
      const wks = weekMeta.filter(w => w.month === m).map(w => w.key); const data = { month: m, saves: 0, shares: 0, profileActivity: 0 };
      wks.forEach(wk => { const t = getFeedTotals(wk); data.saves += t.saves; data.shares += t.shares; data.profileActivity += t.profileActivity; }); return data;
  });
  const mBase = { saves: monthlyData.find(d => d.saves > 0)?.saves || 1, shares: monthlyData.find(d => d.shares > 0)?.shares || 1, profileActivity: monthlyData.find(d => d.profileActivity > 0)?.profileActivity || 1 };
  const monthlyTrendNorm = monthlyData.map(d => ({ month: fmtMonth(d.month), saves: Math.round((d.saves / mBase.saves) * 100), shares: Math.round((d.shares / mBase.shares) * 100), profileActivity: Math.round((d.profileActivity / mBase.profileActivity) * 100), _raw_saves: d.saves, _raw_shares: d.shares, _raw_profileActivity: d.profileActivity }));
  const feedLabels = { reach: '피드 도달수', engagement: '피드 참여수', saves: '피드 저장수', shares: '피드 공유수', profileActivity: '피드 프로필 활동' };

  const accountNewFollowersAt = (w) => Number(accountMetrics?.[selectedCountry]?.[w]?.newFollowers || 0);
  const accountFollowerCompare = displayWeeks.map((w) => {
    const idx = weekMeta.map(wm => wm.key).indexOf(w); const prevKey = idx > 0 ? weekMeta[idx - 1].key : null;
    const accountNow = accountNewFollowersAt(w); const accountPrev = prevKey ? accountNewFollowersAt(prevKey) : null;
    const accountGrowthRate = accountPrev ? Number((((accountNow - accountPrev) / accountPrev) * 100).toFixed(1)) : (accountPrev === 0 ? 0 : null);
    return { week: w, feedFollows: getFeedTotals(w).follows, accountNewFollowers: accountNow, accountGrowthRate };
  });

  const updateContent = (item) => { const list = weekContents.map((c) => (c.id === item.id ? item : c)); onFeedContentsChange(selectedCountry, selectedWeek, list); };
  const deleteContent = (id) => { const list = weekContents.filter((c) => c.id !== id); onFeedContentsChange(selectedCountry, selectedWeek, list); };
  const addContent = () => {
    const allIds = Object.values(feedContents).flatMap((byWeek) => Object.values(byWeek).flat()).map((c) => c.id);
    const newId = (allIds.length ? Math.max(...allIds) : 0) + 1;
    const list = [...weekContents, blankItem(newId, '새 피드 콘텐츠', FEED_KEYS)]; onFeedContentsChange(selectedCountry, selectedWeek, list);
  };
  const handleSyncFeedContent = (item) => { if (onSyncContent && (item.hypothesis || item.analysis)) { onSyncContent({ type: 'content', country: selectedCountry, week: selectedWeek, category: '피드', url: item.link, title: item.title, hypothesis: item.hypothesis, analysis: item.analysis }); } };

  return (
    <div>
      <SectionLabel color={C.ink}>피드 성과 요약 카드</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-1">
        <HeroCard delta={calcFeedDelta('reach')} metricsMap={CONTENT_METRICS} mkey="reach" value={currentTotals.reach} />
        <HeroCard delta={calcFeedDelta('engagement')} metricsMap={CONTENT_METRICS} mkey="engagement" value={currentTotals.engagement} />
      </div>
      <div className="flex flex-wrap gap-3 mb-6" style={{ marginTop: 10 }}>
        {['likes', 'comments', 'saves', 'shares'].map(k => <HeroCard delta={calcFeedDelta(k)} key={k} metricsMap={CONTENT_METRICS} mkey={k} value={currentTotals[k]} />)}
      </div>

      <div className="mb-6" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
          <div><h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px' }}>피드 주간 핵심지표 추이 비교 (최근 7주)</h3></div>
          <button onClick={() => setShowWeeklyChartTable(!showWeeklyChartTable)} className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showWeeklyChartTable ? C.ink : '#fff', color: showWeeklyChartTable ? '#fff' : C.sub, cursor: 'pointer' }}>{showWeeklyChartTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표</button>
        </div>
        <div style={{ width: '100%', height: 230 }}>
          <ResponsiveContainer>
            <LineChart data={weeklyTrendNorm} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip labels={feedLabels} />} /><Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => feedLabels[v] || v} />
              <Line type="monotone" dataKey="reach" stroke={CONTENT_METRICS.reach.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="engagement" stroke={CONTENT_METRICS.engagement.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="saves" stroke={FEED_METRICS.saves.color} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="shares" stroke={FEED_METRICS.shares.color} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="profileActivity" stroke={FEED_METRICS.profileActivity.color} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button onClick={addContent} className="flex items-center gap-1 mb-4" style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: 'none', background: C.ink, color: '#fff' }}><Plus size={14} /> 피드 콘텐츠 추가</button>
      <div className="flex flex-col gap-2.5 mb-8">
        {weekContents.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '24px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>등록된 피드 콘텐츠가 없습니다.</div>}
        {weekContents.map((item) => <ContentCard key={item.id} item={item} coreKeys={FEED_CORE} subKeys={FEED_SUB} metricsMap={FEED_METRICS} onDelete={deleteContent} onSave={updateContent} avgMetrics={null} onSyncInsight={handleSyncFeedContent} />)}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('summary'); const [weekMeta, setWeekMeta] = useState(initialWeekMeta); const [selectedWeek, setSelectedWeek] = useState('W24');
  const [feedContents, setFeedContents] = useState(initialFeedContents); const [allContents, setAllContents] = useState(initialAllContents);
  const [accountMetrics, setAccountMetrics] = useState(initialAccountMetrics); const [countryInsights, setCountryInsights] = useState(initialCountryInsights); const [productSales, setProductSales] = useState(initialProductSales);
  const [loading, setLoading] = useState(true); const [gasUrl, setGasUrl] = useState(''); const [gasInput, setGasInput] = useState(''); const [showGasPanel, setShowGasPanel] = useState(false); const [syncStatus, setSyncStatus] = useState('idle'); const insightSyncTimer = useRef(null);

  const syncToGAS = useCallback(async (payload) => {
    if (!gasUrl || !gasUrl.startsWith('http')) return; setSyncStatus('syncing');
    try {
      await fetch(gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
      setSyncStatus('ok'); setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e) { setSyncStatus('error'); setTimeout(() => setSyncStatus('idle'), 5000); }
  }, [gasUrl]);

  const handleAllContentsChange = useCallback((country, week, newList) => { setAllContents(prev => ({ ...prev, [country]: { ...prev[country], [week]: newList } })); }, []);
  const handleFeedContentsChange = useCallback((country, week, newList) => { setFeedContents(prev => ({ ...prev, [country]: { ...prev[country], [week]: newList } })); }, []);

  useEffect(() => {
    (async () => {
      try {
        const gasR = await window.storage?.get(STORAGE_GAS_URL_KEY, true).catch(() => null); const currentGasUrl = gasR?.value || ''; setGasUrl(currentGasUrl); setGasInput(currentGasUrl);
        if (currentGasUrl && currentGasUrl.startsWith('http')) {
          const res = await fetch(currentGasUrl + '?type=all'); const data = await res.json();
          if (data.ok) {
            if (data.weekMeta && data.weekMeta.length > 0) { setWeekMeta(data.weekMeta); setSelectedWeek(data.weekMeta[data.weekMeta.length - 1].key); }
            if (data.accountMetrics) setAccountMetrics(data.accountMetrics); if (data.allContents) setAllContents(data.allContents); if (data.feedContents) setFeedContents(data.feedContents); if (data.productSales) setProductSales(data.productSales); if (data.countryInsights) setCountryInsights(data.countryInsights); 
          }
        }
      } catch (e) { console.error('load error', e); } finally { setLoading(false); }
    })();
  }, []);

  const saveGasUrl = async () => {
    const url = gasInput.trim(); setGasUrl(url);
    try { await window.storage?.set(STORAGE_GAS_URL_KEY, url, true); } catch (e) {}
    setShowGasPanel(false); window.location.reload(); 
  };

  const mtKeys = useMemo(() => weekMeta.map((w) => w.key), [weekMeta]);
  const endIdx = useMemo(() => mtKeys.indexOf(selectedWeek), [mtKeys, selectedWeek]);
  const displayWeeks = useMemo(() => mtKeys.slice(Math.max(0, endIdx - 6), endIdx + 1), [mtKeys, endIdx]);

  const onInsightChange = useCallback((country, week, value) => {
    const next = { ...countryInsights, [country]: { ...countryInsights[country], [week]: value } }; setCountryInsights(next);
    clearTimeout(insightSyncTimer.current); insightSyncTimer.current = setTimeout(() => { syncToGAS({ type: 'weekly', country, week, insight: value }); }, 1000);
  }, [countryInsights, syncToGAS]);

  if (loading) return <div className="flex items-center justify-center" style={{ height: '100vh', fontFamily: FONT, color: C.sub }}><RefreshCw className="animate-spin" size={18} style={{ marginRight: 6 }} /> 구글 시트 연동 중...</div>;

  return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: '100vh', color: C.ink }}>
      <div className="max-w-[1400px] mx-auto w-full" style={{ padding: '24px 20px' }}>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div><h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>한/미 SNS 성과 대시보드</h1></div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {mtKeys.map((w) => <button key={w} onClick={() => setSelectedWeek(w)} style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: `1px solid ${w === selectedWeek ? C.accent : C.border}`, background: w === selectedWeek ? C.accent : '#fff', color: w === selectedWeek ? '#fff' : C.sub }}>{w}</button>)}
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-6">
          {NAV.map((n) => {
            const Icon = n.icon; const active = view === n.key;
            return <button key={n.key} onClick={() => setView(n.key)} className="flex items-center gap-1.5" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1px solid ${active ? C.ink : C.border}`, background: active ? C.ink : '#fff', color: active ? '#fff' : C.ink }}><Icon size={14} /> {n.label}</button>
          })}
        </div>

        {showGasPanel && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 12 }}>구글 시트 웹앱 URL 설정</div>
            <div className="flex gap-2">
              <input type="text" value={gasInput} onChange={(e) => setGasInput(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, width: '100%' }} />
              <button onClick={saveGasUrl} style={{ padding: '8px 16px', borderRadius: 8, background: C.mint, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>저장</button>
            </div>
          </div>
        )}

        {view === 'summary' && <SummaryView accountMetrics={accountMetrics} allContents={allContents} displayWeeks={displayWeeks} selectedWeek={selectedWeek} weekMeta={weekMeta} />}
        {(view === 'KR' || view === 'US') && <CountryView accountMetrics={accountMetrics} allContents={allContents} countryInsights={countryInsights} countryKey={view} displayWeeks={displayWeeks} onAllContentsChange={handleAllContentsChange} onInsightChange={onInsightChange} onSyncContent={syncToGAS} selectedWeek={selectedWeek} weekMeta={weekMeta} />}
        {view === 'feed' && <FeedView accountMetrics={accountMetrics} displayWeeks={displayWeeks} feedContents={feedContents} onFeedContentsChange={handleFeedContentsChange} onSyncContent={syncToGAS} selectedWeek={selectedWeek} weekMeta={weekMeta} />}

        <div style={{ fontSize: 11, color: C.subLite, textAlign: 'center', marginTop: 30 }}>
          모든 데이터는 시트 원본을 바라보고 있으며, 인사이트 수정시 시트에 자동 기록됩니다.
          <div className="flex items-center justify-center gap-3" style={{ marginTop: 10 }}>
            <SyncBadge status={syncStatus} />
            <button onClick={() => setShowGasPanel((v) => !v)} title="구글시트 연동 설정" style={{ padding: 5, borderRadius: 6, border: `1px solid ${gasUrl ? C.mint : C.border}`, background: 'transparent', color: gasUrl ? C.mint : C.border, cursor: 'pointer' }}><Settings size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}