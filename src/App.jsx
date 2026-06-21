import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LabelList
} from 'recharts';
import {
  Bookmark, Share2, UserCheck, Eye, Heart, MessageCircle, UserPlus,
  Plus, Trash2, Pencil, Check, X, ExternalLink, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Minus, Loader2, RefreshCw, Settings, Target, 
  Leaf, FileStack, Flame, LayoutDashboard, Globe, Rss, PlayCircle, 
  ArrowDownToLine, MousePointerClick, Activity, NotebookPen, CheckCircle, 
  AlertCircle, Sparkles
} from 'lucide-react';

// ============================================================
// 디자인 토큰 및 메타 설정
// ============================================================
const C = {
  bg: '#F4EEE8',
  card: '#FFFFFF',
  panel: '#FBF7F3',
  ink: '#241F1B',
  sub: '#6B6259',
  subLite: '#9A928A',
  border: '#E7DCD3',
  borderStrong: '#D9CABB',
  accent: '#E8546B',
  accentSoft: '#FCE9EC',
  mint: '#2E9E89',
  mintSoft: '#E4F2EE',
};
const FONT = "'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const SHADOW = '0 1px 3px rgba(40,28,18,0.05), 0 1px 2px rgba(40,28,18,0.03)';

const COUNTRIES = [
  { key: 'KR', label: '한국', flag: '🇰🇷', color: '#E8546B' },
  { key: 'US', label: '미국', flag: '🇺🇸', color: '#3E6FE0' },
];

const NAV = [
  { key: 'summary', label: '통합 요약', icon: LayoutDashboard },
  { key: 'KR', label: '한국 대시보드', icon: Globe },
  { key: 'US', label: '미국 대시보드', icon: Globe },
  { key: 'feed', label: '피드 콘텐츠', icon: Rss },
];

const ACCOUNT_METRICS = {
  reach: { label: '도달수', icon: Eye, color: '#3E8FB0' },
  organicReach: { label: '오가닉 도달', icon: Leaf, color: '#2E9E89' },
  views: { label: '조회수', icon: PlayCircle, color: '#4C6FBF' },
  organicViews: { label: '오가닉 조회수', icon: Leaf, color: '#2E9E89' },
  engagement: { label: '참여수', icon: Activity, color: '#6C5CE7' },
  newFollowers: { label: '신규 팔로우 수', icon: UserPlus, color: '#2E9E89' },
  followers: { label: '팔로워(누적)', icon: UserCheck, color: '#2E9E89' },
  contentsCount: { label: '콘텐츠 수', icon: FileStack, color: '#E08A2B' },
  profileVisits: { label: '프로필 방문', icon: UserCheck, color: '#E8546B' },
  websiteClicks: { label: '웹사이트 클릭', icon: MousePointerClick, color: '#E08A2B' },
  sales: { label: '매출', icon: TrendingUp, color: '#E8546B' },
  inflow: { label: '유입', icon: ArrowDownToLine, color: '#2E9E89' },
  salesAchieveRate: { label: '매출 달성률', icon: Check, color: '#6C5CE7' },
  inflowAchieveRate: { label: '유입 달성률', icon: Check, color: '#6C5CE7' },
  pace: { label: 'Pace', icon: Activity, color: '#E08A2B' },
};
const ALL_ACCOUNT_KEYS = ['sales', 'inflow', 'salesAchieveRate', 'inflowAchieveRate', 'pace', 'reach', 'organicReach', 'views', 'organicViews', 'engagement', 'newFollowers', 'followers', 'contentsCount', 'profileVisits', 'websiteClicks'];

const CONTENT_METRICS = {
  reach: { label: '도달', icon: Eye, color: '#3E8FB0' },
  views: { label: '조회수', icon: PlayCircle, color: '#4C6FBF' },
  engagement: { label: '참여', icon: Activity, color: '#6C5CE7' },
  likes: { label: '좋아요', icon: Heart, color: '#E8546B' },
  comments: { label: '댓글', icon: MessageCircle, color: '#C9A24B' },
  saves: { label: '저장', icon: Bookmark, color: '#E8546B' },
  shares: { label: '공유', icon: Share2, color: '#E08A2B' },
};
const CONTENT_CORE = ['reach', 'views', 'engagement'];
const CONTENT_SUB = ['likes', 'comments', 'saves', 'shares'];

const FEED_METRICS = {
  saves: { label: '저장수', icon: Bookmark, color: '#E8546B' },
  shares: { label: '공유수', icon: Share2, color: '#E08A2B' },
  profileActivity: { label: '프로필 활동', icon: UserCheck, color: '#6C5CE7' },
  reach: { label: '도달', icon: Eye, color: '#3E8FB0' },
  likes: { label: '좋아요', icon: Heart, color: '#E8546B' },
  comments: { label: '댓글', icon: MessageCircle, color: '#4C6FBF' },
  follows: { label: '팔로우', icon: UserPlus, color: '#2E9E89' },
};
const FEED_CORE = ['saves', 'shares', 'profileActivity'];
const FEED_SUB = ['reach', 'likes', 'comments', 'follows'];
const FEED_KEYS = [...FEED_CORE, ...FEED_SUB];

const PRODUCT_CATS = [
  { key: 'gelPressOn', label: '젤프레스온', color: '#E8546B' },
  { key: 'hardener',   label: '강화제',    color: '#6C5CE7' },
  { key: 'gelStrip',   label: '젤스트립',  color: '#2E9E89' },
  { key: 'otherCare',  label: '기타케어류', color: '#C9A24B' },
];

// ============================================================
// 가데이터 및 헬퍼 함수
// ============================================================
const initialWeekMeta = [
  { key: 'W18', month: '2026-05' }, { key: 'W19', month: '2026-05' }, { key: 'W20', month: '2026-05' },
  { key: 'W21', month: '2026-05' }, { key: 'W22', month: '2026-05' }, { key: 'W23', month: '2026-06' }, { key: 'W24', month: '2026-06' },
];
const initialFeedContents = { KR: {}, US: {} };
const initialAllContents = { KR: {}, US: {} };
const initialAccountMetrics = {
  KR: {
    W22: { sales: 335000000, inflow: 281000, salesAchieveRate: 110, inflowAchieveRate: 105, pace: 102, reach: 4970000, organicReach: 1970000, views: 7210000, organicViews: 3100000, engagement: 167000, newFollowers: 1460, followers: 79800, contentsCount: 7, profileVisits: 24200, websiteClicks: 4200 },
    W23: { sales: 475000000, inflow: 260000, salesAchieveRate: 154, inflowAchieveRate: 130, pace: 140, reach: 5720000, organicReach: 2320000, views: 8650000, organicViews: 3560000, engagement: 243000, newFollowers: 2140, followers: 81900, contentsCount: 7, profileVisits: 29100, websiteClicks: 4700 },
    W24: { sales: 365000000, inflow: 216000, salesAchieveRate: 120, inflowAchieveRate: 111, pace: 115, reach: 4790000, organicReach: 1290000, views: 7800000, organicViews: 2050000, engagement: 125000, newFollowers: 1260, followers: 83200, contentsCount: 7, profileVisits: 17900, websiteClicks: 3900 },
  },
  US: {
    W22: { sales: 430000000, inflow: 277000, salesAchieveRate: 96, inflowAchieveRate: 94, pace: 99, reach: 7810000, organicReach: 7430000, views: 11630000, organicViews: 11110000, engagement: 317000, newFollowers: 2130, followers: 110500, contentsCount: 25, profileVisits: 15300, websiteClicks: 2700 },
    W23: { sales: 442000000, inflow: 291000, salesAchieveRate: 102, inflowAchieveRate: 98, pace: 101, reach: 3210000, organicReach: 2930000, views: 5240000, organicViews: 4760000, engagement: 128000, newFollowers: 960, followers: 111500, contentsCount: 15, profileVisits: 8600, websiteClicks: 1300 },
    W24: { sales: 339000000, inflow: 259000, salesAchieveRate: 92, inflowAchieveRate: 89, pace: 90, reach: 4420000, organicReach: 4140000, views: 7220000, organicViews: 6740000, engagement: 206000, newFollowers: 1341, followers: 112800, contentsCount: 14, profileVisits: 8300, websiteClicks: 900 },
  }
};
const initialCountryInsights = { KR: {}, US: {} };
const initialProductSales = { KR: {}, US: {} };

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
  const keys = weekMeta.map((w) => w.key); const idx = keys.indexOf(selectedWeek);
  if (idx < 0) return keys.slice(-n); return keys.slice(Math.max(0, idx - n + 1), idx + 1);
};
const zeroAccount = () => { const o = {}; ALL_ACCOUNT_KEYS.forEach((k) => { o[k] = 0; }); return o; };

// ============================================================
// 공용 UI 작은 컴포넌트
// ============================================================
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
function SyncBadge({ status }) {
  if (status === 'idle') return null;
  const map = { syncing: { icon: RefreshCw, text: '동기화 중...', color: C.sub }, ok: { icon: CheckCircle, text: '시트 저장됨', color: C.mint }, error: { icon: AlertCircle, text: '연동 실패', color: C.accent } };
  const m = map[status]; if (!m) return null;
  const Icon = m.icon;
  return <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: m.color, padding: '4px 10px', borderRadius: 999, border: `1px solid ${m.color}22`, background: `${m.color}11` }}><Icon size={12} className={status === 'syncing' ? "animate-spin" : ""} />{m.text}</span>;
}

// 옵션 체이닝으로 페이로드 크래시를 방지하는 차트 툴팁
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

// ============================================================
// 콘텐츠 카드 컴포넌트
// ============================================================
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
          <div style={{ flex: '1 1 240px' }}><TextAreaField label="📝 분석 & 방안" value={draft.analysis} onChange={set('analysis')} placeholder="결과 분석을 입력하세요." /></div>
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
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setInsightOpen((v) => !v)} className="flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 700, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
          {insightOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 인사이트 {insightOpen ? '접기' : '펼치기'}
          {(item.hypothesis || item.analysis) && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'inline-block', flexShrink: 0 }} />}
        </button>
        {insightOpen && (
          <div style={{ marginTop: 6, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <div className="flex items-start gap-1.5" style={{ fontSize: 12, color: C.ink, lineHeight: 1.5, marginBottom: 6 }}>
              <Lightbulb size={13} color={C.accent} style={{ marginTop: 2, flexShrink: 0 }} />
              <span><b style={{ color: C.accent }}>[가설]</b> {item.hypothesis ? <span style={{ whiteSpace: 'pre-wrap' }}>{item.hypothesis}</span> : <span style={{ color: C.sub }}>아직 가설이 없습니다.</span>}</span>
            </div>
            <div className="flex items-start gap-1.5" style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}>
              <Activity size={13} color={C.mint} style={{ marginTop: 2, flexShrink: 0 }} />
              <span><b style={{ color: C.mint }}>[분석 & 방안]</b> {item.analysis ? <span style={{ whiteSpace: 'pre-wrap' }}>{item.analysis}</span> : <span style={{ color: C.sub }}>아직 분석이 없습니다.</span>}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 1. 통합 요약 탭 뷰 (SummaryView)
// ============================================================
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

      {/* ✅ [복구] 통합 요약 내 콘텐츠 수 / 콘텐츠 타율 영역 */}
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

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <SectionLabel color={C.mint} sub="이번 주 발행 리스트 중 도달+참여 기반 최고 성과">🔥 고성과 TOP 3 요약 콘텐츠</SectionLabel>
        <div className="flex flex-col gap-2.5 mt-3">
          {top3Content.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>표시할 콘텐츠가 없습니다.</div>}
          {top3Content.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onSave={()=>{}} onDelete={()=>{}} avgMetrics={avgMetrics} />)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 2. 국가별 대시보드 뷰 (CountryView)
// ============================================================
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
  
  const reelsBaseAvg = avgMetrics.reach || 0;
  const calcHitRate = (w) => { const items = allContents[countryKey]?.[w] || []; const reels = items.filter(isReel); const hits = reels.filter((r) => Number(r.reach || 0) >= reelsBaseAvg).length; return reels.length ? Math.round((hits / reels.length) * 100) : null; };
  const hitRateNow = calcHitRate(selectedWeek); const hitRatePrev = prevWeek ? calcHitRate(prevWeek) : null; const hitRateDelta = hitRateNow != null && hitRatePrev != null ? hitRateNow - hitRatePrev : null;

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
        <ReachOrganicCard mkey="reach" organicKey="organicReach" value={totals(selectedWeek).reach} organicValue={totals(selectedWeek).organicReach} delta={wowDelta('reach')} organicDelta={wowDelta('organicReach')} />
        <ReachOrganicCard mkey="views" organicKey="organicViews" value={totals(selectedWeek).views} organicValue={totals(selectedWeek).organicViews} delta={wowDelta('views')} organicDelta={wowDelta('organicViews')} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="engagement" value={totals(selectedWeek).engagement} delta={wowDelta('engagement')} />
      </div>

      {/* ✅ [복구] 국가 대시보드 내 콘텐츠 수 / 콘텐츠 타율 영역 */}
      <SectionLabel color="#E08A2B">콘텐츠 발행 · 타율</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-6">
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="contentsCount" value={totals(selectedWeek).contentsCount} delta={wowDelta('contentsCount')} />
        <HeroCard metricsMap={{ hitRate: { label: '콘텐츠 타율', icon: Target, color: '#2E9E89' } }} mkey="hitRate" value={hitRateNow ?? 0} delta={hitRateDelta} />
      </div>

      {/* 주차별 성과 추이 차트 */}
      <div className="mb-6" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
          <div><h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>주차별 성과 추이 지수 비교 (최근 7주)</h3></div>
          <button onClick={() => setShowPrimaryTable((v) => !v)} className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showPrimaryTable ? C.ink : '#fff', color: showPrimaryTable ? '#fff' : C.sub, cursor: 'pointer' }}>{showPrimaryTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표</button>
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

      {/* ✅ [신설/복구] 제품군별 성과 현황 그리드 레이아웃 섹션 */}
      <SectionLabel color={C.ink}>📦 제품군별 성과 현황</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {PRODUCT_CATS.map((p) => {
          const catContents = weekItems.filter(item => item.productCategory === p.key);
          const totalReach = catContents.reduce((sum, item) => sum + Number(item.reach || 0), 0);
          const totalEng = catContents.reduce((sum, item) => sum + Number(item.engagement || 0), 0);
          return (
            <div key={p.key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px', boxShadow: SHADOW, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: p.color }} />
              <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 10, paddingLeft: 4 }}>{p.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'between', fontSize: 12 }}>
                  <span style={{ color: C.sub }}>발행 콘텐츠</span>
                  <span style={{ fontWeight: 700, color: C.ink }}>{catContents.length}건</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'between', fontSize: 12, marginTop: 4 }}>
                  <span style={{ color: C.sub }}>총 도달수</span>
                  <span style={{ fontWeight: 700, color: C.ink }}>{fmt(totalReach)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'between', fontSize: 12, marginTop: 4 }}>
                  <span style={{ color: C.sub }}>총 참여수</span>
                  <span style={{ fontWeight: 700, color: C.ink }}>{fmt(totalEng)}</span>
                </div>
              </div>
            </div>
          );
        })}
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

      <div className="mb-4" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}><div><h3 style={{ fontSize: 13, fontWeight: 800, color: C.sub }}>[참고] 월간 누적 추이</h3></div></div>
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <LineChart data={monthlyTrendNorm}>
              <CartesianGrid stroke={C.border} vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip content={<ChartTooltip labels={labelsA} />} />
              <Line type="monotone" dataKey="sales" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="inflow" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="reach" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="engagement" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 3. 피드 콘텐츠 대시보드 뷰 (FeedView)
// ============================================================
function FeedView({ weekMeta, selectedWeek, displayWeeks, feedContents, accountMetrics, onFeedContentsChange, onSyncContent }) {
  const [selectedCountry, setSelectedCountry] = useState('KR'); const countryContents = feedContents[selectedCountry] || {}; const weekContents = countryContents[selectedWeek] || [];
  const [showWeeklyChartTable, setShowWeeklyChartTable] = useState(false);

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

      {/* 피드 주간 핵심지표 추이 비교 */}
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

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW, marginBottom: 24 }}>
        <div className="flex items-center gap-2 mb-4"><h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>주차별 피드 발생 팔로우 · 계정 전체 신규 팔로우 증감률</h3><InfoTip text="피드 콘텐츠만의 합계가 아닌 계정 전체 신규 팔로워 증감률 현황입니다." /></div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <ComposedChart data={accountFollowerCompare} margin={{ top: 15, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} /><XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} /><YAxis yAxisId="left" tick={{ fontSize: 11, fill: C.sub }} /><YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: C.sub }} unit="%" /><Tooltip content={<ChartTooltip labels={{ feedFollows: '피드 발생 팔로우', accountGrowthRate: '계정 신규 팔로우 증감률' }} />} />
              <Bar yAxisId="left" dataKey="feedFollows" fill={FEED_METRICS.profileActivity.color} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="accountGrowthRate" stroke={ACCOUNT_METRICS.newFollowers.color} strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
            </ComposedChart>
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

// ============================================================
// 메인 마스터 App
// ============================================================
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

  if (loading) return <div className="flex items-center justify-center" style={{ height: '100vh', fontFamily: FONT, color: C.sub }}><RefreshCw className="animate-spin" size={18} style={{ marginRight: 6 }} /> 구글 시트 데이터 연동 중...</div>;

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
            const MyIcon = n.icon; const active = view === n.key;
            return <button key={n.key} onClick={() => setView(n.key)} className="flex items-center gap-1.5" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1px solid ${active ? C.ink : C.border}`, background: active ? C.ink : '#fff', color: active ? '#fff' : C.ink }}><MyIcon size={14} /> {n.label}</button>
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