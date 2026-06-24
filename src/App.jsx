import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Bookmark, Share2, UserCheck, Eye, Heart, MessageCircle, UserPlus, Plus, Trash2, Pencil, Check, X, ExternalLink, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Loader2, ClipboardPaste, ArrowDownToLine, NotebookPen, Activity, PlayCircle, MousePointerClick, LayoutDashboard, Globe, Rss, Lightbulb, Rocket, AlertCircle, RefreshCw, Settings, Target, Leaf, FileText, Filter } from 'lucide-react';

const storage = {
  get: async (key) => { try { const val = localStorage.getItem(key); return val ? { value: val } : null; } catch(e) { return null; } },
  set: async (key, val) => { try { localStorage.setItem(key, val); } catch(e) {} }
};

const C = { bg: '#F4EEE8', card: '#FFFFFF', panel: '#FBF7F3', ink: '#241F1B', sub: '#6B6259', subLite: '#9A928A', border: '#E7DCD3', borderStrong: '#D9CABB', accent: '#E8546B', accentSoft: '#FCE9EC', mint: '#2E9E89', mintSoft: '#E4F2EE' };
const FONT = "'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif";
const SHADOW = '0 1px 3px rgba(40,28,18,0.05)';

const COUNTRIES = [ { key: 'KR', label: '한국', flag: '🇰🇷', color: '#E8546B' }, { key: 'US', label: '미국', flag: '🇺🇸', color: '#3E6FE0' } ];
const NAV = [ { key: 'KR', label: '한국 대시보드', icon: Globe }, { key: 'US', label: '미국 대시보드', icon: Globe }, { key: 'feed', label: '피드 콘텐츠', icon: Rss }, { key: 'archive', label: '전체 콘텐츠 리스트', icon: Filter } ];

const ACCOUNT_METRICS = {
  reach: { label: '도달수', icon: Eye, color: '#3E8FB0' }, organicReach: { label: '오가닉 도달', icon: Leaf, color: '#2E9E89' }, views: { label: '조회수', icon: PlayCircle, color: '#4C6FBF' }, organicViews: { label: '오가닉 조회수', icon: Leaf, color: '#2E9E89' },
  engagement: { label: '참여수', icon: Activity, color: '#6C5CE7' }, newFollowers: { label: '신규 팔로우', icon: UserPlus, color: '#2E9E89' }, followers: { label: '팔로워(누적)', icon: UserCheck, color: '#2E9E89' },
  contentsCount: { label: '콘텐츠 수', icon: FileText, color: '#E08A2B' }, profileVisits: { label: '프로필 방문', icon: UserCheck, color: '#E8546B' }, websiteClicks: { label: '웹사이트 클릭', icon: MousePointerClick, color: '#E08A2B' },
  sales: { label: '매출', icon: TrendingUp, color: '#E8546B' }, inflow: { label: '유입', icon: ArrowDownToLine, color: '#2E9E89' }, salesAchieveRate: { label: '매출 달성률', icon: Check, color: '#6C5CE7' }, inflowAchieveRate: { label: '유입 달성률', icon: Check, color: '#6C5CE7' }
};

const CONTENT_METRICS = { reach: { label: '도달', icon: Eye, color: '#3E8FB0' }, views: { label: '조회수', icon: PlayCircle, color: '#4C6FBF' }, engagement: { label: '참여', icon: Activity, color: '#6C5CE7' }, likes: { label: '좋아요', icon: Heart, color: '#E8546B' }, comments: { label: '댓글', icon: MessageCircle, color: '#4C6FBF' }, saves: { label: '저장', icon: Bookmark, color: '#E8546B' }, shares: { label: '공유', icon: Share2, color: '#E08A2B' } };
const CONTENT_CORE = ['reach', 'views', 'engagement']; const CONTENT_SUB = ['likes', 'comments', 'saves', 'shares'];
const FEED_METRICS = { saves: { label: '저장수', icon: Bookmark, color: '#E8546B' }, shares: { label: '공유수', icon: Share2, color: '#E08A2B' }, profileActivity: { label: '프로필 활동', icon: UserCheck, color: '#6C5CE7' }, reach: { label: '도달', icon: Eye, color: '#3E8FB0' }, likes: { label: '좋아요', icon: Heart, color: '#E8546B' }, comments: { label: '댓글', icon: MessageCircle, color: '#4C6FBF' }, follows: { label: '팔로우', icon: UserPlus, color: '#2E9E89' } };
const FEED_CORE = ['saves', 'shares', 'profileActivity']; const FEED_SUB = ['reach', 'likes', 'comments', 'follows'];

const initialWeekMeta = [{ key: 'W18', month: '2026-05' }, { key: 'W19', month: '2026-05' }, { key: 'W20', month: '2026-05' }, { key: 'W21', month: '2026-05' }, { key: 'W22', month: '2026-05' }, { key: 'W23', month: '2026-06' }, { key: 'W24', month: '2026-06' }];
const fmt = (n) => Number(Math.round(n || 0)).toLocaleString('ko-KR'); 
const pct = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`; 
const fmtMetric = (mkey, value) => { if (mkey === 'sales') return `₩${fmt(value)}`; if (['salesAchieveRate', 'inflowAchieveRate', 'hitRate'].includes(mkey)) return `${Number(value || 0).toFixed(0)}%`; return fmt(value); };
const numFrom = (v) => { const n = Number(String(v ?? '').replace(/[,\s%]/g, '')); return isFinite(n) ? n : 0; };

const isReel = (item) => { if (!item) return false; if (item.isReel !== undefined) return item.isReel; return /\/reel[s]?\//i.test(item.link || ''); };
const contentScore = (item) => item ? (Number(item.reach || 0) + Number(item.engagement || 0)) : 0;
// 판매전환 증감률(Lift): 발행 직전 N일(b) → 발행 후 N일(a)
const liftPct = (wo) => { if (!wo) return null; const b = Number(wo.b || 0), a = Number(wo.a || 0); if (b <= 0) return a > 0 ? Infinity : 0; return Math.round(((a - b) / b) * 100); };
const liftGrade = (p) => {
  if (p === null) return null;
  if (p === Infinity) return { label: '신규', color: '#1D9E75', bg: '#E1F5EE' };
  if (p >= 100) return { label: 'S급', color: '#E8546B', bg: '#FCE9EC' };
  if (p >= 50)  return { label: 'A급', color: '#E08A2B', bg: '#FDF3E7' };
  if (p >= 20)  return { label: 'B급', color: '#6C5CE7', bg: '#F0EEFD' };
  if (p >= 5)   return { label: 'C급', color: '#2E9E89', bg: '#EAF6F3' };
  return { label: 'D급', color: '#9A928A', bg: '#F5F5F5' };
};
// 대표 Lift: 제품 7일이 있으면 제품, 없으면 제품군 7일
const headlineLiftWO = (item) => { if (!item) return null; const pw = item.salesProd && item.salesProd.d7; if (liftPct(pw) !== null) return pw; return (item.salesCat && item.salesCat.d7) || null; };
const salesConvScore = (item) => { const p = liftPct(headlineLiftWO(item)); if (p === null) return -Infinity; return p === Infinity ? 1e9 : p; };
// 역주행: 발행 1주차(d7.a) 대비 2주차(w2a) 판매가 +10%↑ 더 늘어난 콘텐츠
const COMEBACK_MIN_GROWTH = 10;
const snapScore = (b) => b ? (Number(b.reach || 0) + Number(b.engagement || 0)) : 0;
// 역주행: 1주차 성과 대비, 이후 주차(2~4주)에 성과가 +10%↑ 더 늘어난 콘텐츠
const comebackInfo = (item) => {
  if (!item || !item.snap || !item.snap.w1) return null;
  const base = snapScore(item.snap.w1);
  if (base <= 0) return null;
  let later = 0, laterWk = '';
  ['w4', 'w3', 'w2'].forEach((k) => { if (!later && item.snap[k]) { const v = snapScore(item.snap[k]); if (v > 0) { later = v; laterWk = k; } } });
  if (later <= 0) return null;
  const growth = Math.round(((later - base) / base) * 100);
  if (growth < COMEBACK_MIN_GROWTH) return null;
  return { base: base, later: later, laterWk: laterWk, growth: growth };
};
const WK_LABEL = { w2: '2주차', w3: '3주차', w4: '4주차' };
const feedScore = (item) => item ? (Number(item.reach || 0) + Number(item.saves || 0) + Number(item.shares || 0) + Number(item.likes || 0) + Number(item.comments || 0)) : 0;

const fmtMonth = (m) => { if (!m) return ''; const [y, mo] = m.split('-'); return `${y}.${mo}`; };
const metricLabels = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.label]));

const blankItem = (id, title, metricKeys) => { const base = { id, title, thumbnail: '', link: '', hypothesis: '', analysis: '', salesImpact: '', productCategory: '', productNames: [], publishDate: '', initialScore: 0, salesCount: 0, finalScore: 0 }; metricKeys.forEach((k) => { base[k] = 0; }); return base; };
const FEED_KEYS = [...FEED_CORE, ...FEED_SUB]; const CONTENT_KEYS = [...CONTENT_CORE, ...CONTENT_SUB];
const lastNWeeksKeys = (weekMeta, selectedWeek, n) => { const keys = weekMeta.map((w) => w.key); const idx = keys.indexOf(selectedWeek); if (idx < 0) return keys.slice(-n); return keys.slice(Math.max(0, idx - n + 1), idx + 1); };
const currentWeekNumNow = () => { const d = new Date(), j = new Date(d.getFullYear(), 0, 1); const ord = Math.round((d.getTime() - j.getTime()) / 86400000) + 1; return Math.floor((ord - 1 + j.getDay()) / 7) + 1; };
// 기본 선택: 현재 주차의 '이전 주차'(가장 최근 완료 주차)
const defaultWeekKey = (meta) => { if (!meta || !meta.length) return ''; const cur = currentWeekNumNow(); const num = (k) => Number(String(k).replace(/[^0-9]/g, '')) || 0; const prev = meta.filter((m) => num(m.key) < cur); return (prev.length ? prev[prev.length - 1] : meta[meta.length - 1]).key; };

const initialFeedContents = { KR: {}, US: {} }; const initialAllContents = { KR: {}, US: {} }; const initialAccountMetrics = { KR: {}, US: {} };
const zeroAccount = () => { const o = {}; Object.keys(ACCOUNT_METRICS).forEach((k) => { o[k] = 0; }); return o; };

const STORAGE_WEEKS_KEY = 'dash2-weeks-v4'; const STORAGE_FEED_KEY = 'dash2-feed-contents-v4'; const STORAGE_ALL_KEY = 'dash2-all-contents-v4'; const STORAGE_ACCOUNT_KEY = 'dash2-account-metrics-v4'; const STORAGE_GAS_URL_KEY = 'dash2-gas-url-v4';
const PRODUCT_CATS = [ { key: 'gelPressOn', label: '젤프레스온', color: '#E8546B' }, { key: 'hardener', label: '강화제', color: '#6C5CE7' }, { key: 'gelStrip', label: '젤스트립', color: '#2E9E89' }, { key: 'otherCare', label: '기타케어류', color: '#C9A24B' } ];

// GAS의 제품 타입(원문) → 대시보드 제품군 key 매핑
const PTYPE_TO_KEY = { '젤스트립': 'gelStrip', '젤프레스온': 'gelPressOn', '프레스온': 'gelPressOn', '리얼젤팁': 'gelPressOn', '젤프레스온/리얼젤팁': 'gelPressOn', '강화제': 'hardener', '기타 케어류': 'otherCare', '기타케어류': 'otherCare', '기타 케어': 'otherCare' };
const productKeyFromType = (t) => { const s = String(t || '').trim(); if (PTYPE_TO_KEY[s]) return PTYPE_TO_KEY[s]; if (PRODUCT_CATS.some((c) => c.key === s)) return s; return ''; };
// GAS 콘텐츠 아이템(productType/productName/salesConvD*)을 앱 필드(productCategory/productNames/salesCount)로 정규화
const normalizeGasItem = (it) => {
  if (!it || typeof it !== 'object') return it;
  const d1 = Number(it.salesConvD1 || 0), d3 = Number(it.salesConvD3 || 0), d7 = Number(it.salesConvD7 || 0);
  const cat = it.productCategory || productKeyFromType(it.productType);
  let names = it.productNames; if (!Array.isArray(names)) names = it.productName ? [String(it.productName)] : [];
  const prodA7 = (it.salesProd && it.salesProd.d7) ? Number(it.salesProd.d7.a || 0) : 0;
  const catA7 = (it.salesCat && it.salesCat.d7) ? Number(it.salesCat.d7.a || 0) : 0;
  return { ...it, productCategory: cat || '', productNames: names, salesConvD1: d1, salesConvD3: d3, salesConvD7: d7, salesCount: Number(it.salesCount || 0) || prodA7 || catA7 };
};
// 'W25' → 해당 주차의 날짜 범위 (스프레드시트 WEEKNUM 기준: 일요일 시작)
const weekRangeLabel = (wk, weekMeta) => {
  const n = Number(String(wk).replace(/[^0-9]/g, '')) || 0; if (!n) return '';
  const meta = (weekMeta || []).find((m) => m.key === wk);
  const year = meta && meta.month ? Number(String(meta.month).split('-')[0]) : new Date().getFullYear();
  const jan1 = new Date(year, 0, 1);
  const startSun = new Date(jan1.getTime() - jan1.getDay() * 86400000 + (n - 1) * 7 * 86400000);
  const start = new Date(Math.max(startSun.getTime(), jan1.getTime()));
  const end = new Date(startSun.getTime() + 6 * 86400000);
  const f = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
  return `${year}년 · ${f(start)} ~ ${f(end)}`;
};

// 💡 툴팁용 텍스트 및 엄격한 컷오프 스펙 전역 선언
const GRADE_TOOLTIP = "[상대평가 등급 커트라인]\nS급: 상위 3% 이내\nA+급: 상위 7% 이내\nA급: 상위 15% 이내\nB급: 상위 30% 이내\nC급: 상위 55% 이내\nD급: 하위 45% (개선 요망)";

const GRADE_SPECS = [
  { label: 'S급', color: '#E8546B', bg: '#FCE9EC' }, { label: 'A+급', color: '#E08A2B', bg: '#FDF3E7' },
  { label: 'A급', color: '#6C5CE7', bg: '#F0EEFD' }, { label: 'B급', color: '#3E8FB0', bg: '#EBF4F6' },
  { label: 'C급', color: '#2E9E89', bg: '#EAF6F3' }, { label: 'D급', color: '#9A928A', bg: '#F5F5F5' }
];

const ALL_IMPORT_FIELDS = [{ key: 'title', label: '제목 (Caption)' }, { key: 'link', label: '링크 (Link)' }, { key: 'reach', label: '도달 (Reach)' }, { key: 'views', label: '조회수 (Views)' }, { key: 'engagement', label: '참여 (Engagement)' }, { key: 'likes', label: '좋아요 (Likes)' }, { key: 'comments', label: '댓글 (Comments)' }, { key: 'saves', label: '저장 (Saves)' }, { key: 'shares', label: '공유 (Shares)' }, { key: 'productCategory', label: '제품군 (Category)' }, { key: 'productNames', label: '제품명 (Products)' }, { key: 'hypothesis', label: '가설' }, { key: 'analysis', label: '분석 & 추후 방안' }, { key: 'salesImpact', label: '매출전환효과' }];
const ALL_GUESS = { title: ['caption', '캡션', '제목'], link: ['link', 'url', '링크'], reach: ['reach', '도달'], views: ['views', 'view', '조회수'], engagement: ['engagement', 'interactions', '참여'], likes: ['likes', '좋아요'], comments: ['comments', '댓글'], saves: ['saves', '저장'], shares: ['shares', '공유'], productCategory: ['제품군', '제품 타입', '제품타입', 'category'], productNames: ['제품명', '제품', 'product'], hypothesis: ['hypothesis', '가설'], analysis: ['analysis', '분석'], salesImpact: ['salesimpact', '매출전환효과', '매출효과'] };

function Swatch({ color, size = 8 }) { return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '999px', background: color, flexShrink: 0 }} />; }
function SectionLabel({ children, color = C.accent, sub }) { return ( <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 10px' }}> <span style={{ width: 4, height: 15, borderRadius: 2, background: color, flexShrink: 0 }} /> <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{children}</span> {sub && <span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>{sub}</span>} </div> ); }
function MetricPill({ metricsMap, mkey, value, big }) { const m = metricsMap[mkey]; if (!m) return null; const Icon = m.icon; return ( <div className="flex items-center gap-1.5" style={{ color: C.ink }}> <Swatch color={m.color} size={big ? 9 : 7} /> <Icon size={big ? 15 : 13} color={C.sub} strokeWidth={2} /> <span style={{ fontSize: big ? 14 : 12, fontWeight: big ? 700 : 600 }}>{fmt(value)}</span> <span style={{ fontSize: big ? 12 : 11, color: C.sub }}>{m.label}</span> </div> ); }

function DeltaTag({ value }) {
  if (value === null || value === undefined || !isFinite(value)) return <span style={{ fontSize: 12, color: C.sub }}>—</span>;
  const up = value > 0; const flat = value === 0; const color = flat ? C.sub : up ? C.mint : C.accent; const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return ( <span style={{ color, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}><Icon size={13} strokeWidth={2.5} />{pct(value)}</span> );
}

function GenericTooltip({ text, width = 280 }) {
  const [isHover, setIsHover] = useState(false);
  return (
    <span onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', position: 'relative', verticalAlign: 'middle', zIndex: 10 }}>
      <AlertCircle size={13} color={C.subLite} style={{ marginLeft: 4, transform: 'translateY(-0.5px)' }} />
      {isHover && ( <span style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', width: width, background: '#241F1B', color: '#FFF', padding: '10px 12px', borderRadius: 8, fontSize: 11.5, lineHeight: '1.5', zIndex: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'normal', whiteSpace: 'pre-wrap', textAlign: 'left', display: 'block' }}>{text}</span> )}
    </span>
  );
}

function ChartTooltip({ active, payload, label, labels }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: SHADOW }}>
      <div style={{ fontWeight: 800, marginBottom: 6, color: C.ink }}>{label}</div>
      {payload.map((p) => {
        const rawKey = `_raw_${p.dataKey}`;
        const displayValue = p.payload && p.payload[rawKey] !== undefined ? p.payload[rawKey] : p.value;
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-4" style={{ color: C.ink, marginBottom: 4 }}>
            <div className="flex items-center gap-1.5"><Swatch color={p.color || p.fill} size={7} /><span>{labels?.[p.dataKey] || p.name}</span></div>
            <b>{p.dataKey.includes('AchieveRate') ? `${displayValue}%` : p.dataKey === 'sales' ? `₩${fmt(displayValue)}` : fmt(displayValue)}</b>
          </div>
        );
      })}
    </div>
  );
}

// 💡 [TOP 3 툴팁 병합 엔진] 주간 그래프 차트에 마우스를 올렸을 때 클릭 가능한 탑 3 게시물이 스케일 수치와 함께 노출됩니다.
function WeeklyTrendTooltip({ active, payload, label, labels, contentsByWeek, resolvers, countryKey }) {
  if (!active || !payload?.length) return null;
  const week = label; const items = contentsByWeek?.[week] || [];
  const top3 = [...items].sort((a,b) => contentScore(b) - contentScore(a)).slice(0, 3);
  
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, boxShadow: SHADOW, minWidth: 260, pointerEvents: 'auto' }}>
      <div style={{ fontWeight: 800, marginBottom: 8, color: C.ink, borderBottom: `1px solid ${C.border}`, paddingBottom: 6 }}>📅 {week} 성과 지표</div>
      <div className="mb-3">
        {payload.map((p) => {
          const displayValue = p.payload && p.payload[`_raw_${p.dataKey}`] !== undefined ? p.payload[`_raw_${p.dataKey}`] : p.value;
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1.5">
              <div className="flex items-center gap-1.5 text-gray-600"><Swatch color={p.color || p.fill} size={7} /><span>{labels?.[p.dataKey] || p.name}</span></div>
              <b style={{ color: C.ink }}>{p.dataKey.includes('AchieveRate') || p.dataKey === 'rate' ? pct(displayValue) : p.dataKey === 'sales' ? `₩${fmt(displayValue)}` : fmt(displayValue)}</b>
            </div>
          );
        })}
      </div>
      {top3.length > 0 && (
        <div className="border-t border-dashed pt-3 mt-2" style={{ borderColor: C.border }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 6 }}>🏆 해당 주차 TOP 3 (클릭시 이동)</div>
          <div className="flex flex-col gap-2">
            {top3.map((item, idx) => {
              const g = resolvers?.[`${countryKey}_all`]?.(item);
              return (
                <a key={item.id} href={item.link || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-gray-800 hover:text-blue-600 truncate" style={{ textDecoration: 'none' }}>
                  <span className="font-bold text-gray-400">{idx+1}.</span>
                  {g && <span title={GRADE_TOOLTIP} style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px', background: g.bg, color: g.color, flexShrink: 0, cursor: 'help' }}>{g.label} <span style={{opacity: 0.7}}>상위{g.pct}%</span></span>}
                  <span className="truncate hover:underline">{item.title || '(제목 없음)'}</span>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DailyChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const originalPayload = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, boxShadow: SHADOW, minWidth: 220 }}>
      <div style={{ fontWeight: 800, marginBottom: 8, color: C.ink, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>📅 2026-{label} 성과</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4" style={{ marginBottom: 4 }}>
          <div className="flex items-center gap-1.5 text-gray-600"><Swatch color={p.color} size={7} /><span>{p.name}</span></div>
          <b style={{ color: C.ink }}>{p.dataKey === 'sales' ? `₩${fmt(p.value)}` : fmt(p.value)}</b>
        </div>
      ))}
      {originalPayload.contentTitle && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${C.border}`, color: C.accent, fontSize: 11.5, lineHeight: 1.4 }}>
          📣 <b>이날 발행된 콘텐츠:</b><br /><span style={{ fontWeight: 700 }}>{originalPayload.contentTitle}</span>
        </div>
      )}
    </div>
  );
}

function HeroCard({ metricsMap, mkey, value, delta, sub, accentColor, tooltip }) {
  const m = metricsMap[mkey]; const Icon = m.icon; const [isHover, setIsHover] = useState(false);
  return (
    <div className="flex-1" style={{ position: 'relative', overflow: 'visible', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', minWidth: 150, boxShadow: SHADOW }}>
      {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accentColor, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5" style={{ position: 'relative' }}>
          <Swatch color={m.color} size={10} /> <span style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>{m.label}</span>
          {tooltip && (
            <div onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}>
              <AlertCircle size={13} color={C.subLite} style={{ transform: 'translateY(0.5px)', marginLeft: 3 }} />
              {isHover && ( <div style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, width: 280, background: '#241F1B', color: '#FFF', padding: '12px 14px', borderRadius: 10, fontSize: 11.5, lineHeight: '1.6', zIndex: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'normal', whiteSpace: 'pre-wrap', textAlign: 'left' }}>{tooltip}</div> )}
            </div>
          )}
        </div>
        <Icon size={16} color={m.color} />
      </div>
      <div className="flex items-end justify-between"> <span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{fmtMetric(mkey, value)}</span> <DeltaTag value={delta} /> </div>
      <div className="flex items-center justify-between" style={{ marginTop: 2 }}> <span style={{ fontSize: 11, color: C.subLite }}>전주 대비</span> {sub} </div>
    </div>
  );
}

function ReachOrganicCard({ mkey, organicKey, value, organicValue, delta, organicDelta, accentColor }) { const m = ACCOUNT_METRICS[mkey]; const om = ACCOUNT_METRICS[organicKey]; const Icon = m.icon; const OIcon = om.icon; const ratio = value > 0 ? Math.round((organicValue / value) * 100) : 0; return ( <div className="flex-1" style={{ position: 'relative', overflow: 'hidden', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', minWidth: 190, boxShadow: SHADOW }}> {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accentColor }} />} <div className="flex items-center justify-between mb-2"> <div className="flex items-center gap-2"><Swatch color={m.color} size={10} /><span style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>{m.label}</span></div> <Icon size={16} color={m.color} /> </div> <div className="flex items-end justify-between"> <span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{fmt(value)}</span> <DeltaTag value={delta} /> </div> <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}> <div className="flex items-center justify-between"> <div className="flex items-center gap-1.5"> <OIcon size={13} color={om.color} strokeWidth={2.2} /> <span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>{om.label}</span> </div> <div className="flex items-center gap-2"> <span style={{ fontSize: 14, fontWeight: 800, color: om.color }}>{fmt(organicValue)}</span> <DeltaTag value={organicDelta} /> <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, background: C.mintSoft, borderRadius: 999, padding: '1px 7px' }}>{ratio}%</span> </div> </div> </div> </div> ); }

function ContentThumbnail({ item }) {
  const catGradients = { gelPressOn: 'linear-gradient(135deg, #FF758C 0%, #FF7EB3 100%)', hardener: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)', gelStrip: 'linear-gradient(135deg, #2E9E89 0%, #68D391 100%)', otherCare: 'linear-gradient(135deg, #C9A24B 0%, #F6E05E 100%)' };
  const bg = catGradients[item.productCategory] || 'linear-gradient(135deg, #9A928A 0%, #CBD5E0 100%)';
  const Icon = isReel(item) ? PlayCircle : FileText;
  return ( <div style={{ width: 50, height: 50, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)' }}> <Icon size={18} color="#FFFFFF" opacity={0.9} /> </div> );
}

const REVIEW_FIELDS = [['hypothesis', '💡 가설'], ['analysis', '📝 분석 & 추후 방안'], ['salesReview', '💰 판매전환 리뷰']];
function ContentCard({ item, coreKeys, subKeys, metricsMap, grade, salesGrade, onEditAnalysis }) {
  const [open, setOpen] = useState(false);
  const [salesWin, setSalesWin] = useState('d7');
  const [draft, setDraft] = useState({ hypothesis: '', analysis: '', salesReview: '' });
  useEffect(() => { if (open) setDraft({ hypothesis: item.hypothesis || '', analysis: item.analysis || '', salesReview: item.salesReview || '' }); }, [open]);
  const saveField = (f) => { const v = draft[f]; if (onEditAnalysis && item.link && v !== (item[f] || '')) onEditAnalysis(item.link, f, v); };
  const hasReview = item.hypothesis || item.analysis || item.salesReview;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, boxShadow: SHADOW }}>
      <div className="flex gap-4 items-center">
        {item.link ? ( <a href={item.link} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity flex-shrink-0" style={{ display: 'block' }}> <ContentThumbnail item={item} /> </a> ) : ( <ContentThumbnail item={item} /> )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <a href={item.link || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ fontSize: 14, fontWeight: 700, color: C.ink, textDecoration: 'none', marginBottom: 6, display: 'inline-flex', width: '100%' }}>
            {grade && ( <span title={GRADE_TOOLTIP} style={{ fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', background: grade.bg, color: grade.color, marginRight: '6px', flexShrink: 0, cursor: 'help' }}>{grade.label} <span style={{ opacity: 0.75, fontWeight: 700 }}>상위{grade.pct}%</span></span> )}
            {Number(item.views || 0) >= 1000000 && ( <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', background: '#FFF0F2', color: '#FF003C', border: '1px solid #FFCCD5', marginRight: '6px', flexShrink: 0 }}>🔥 100만뷰</span> )}
            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: 4, marginRight: 6, flexShrink: 0, background: isReel(item) ? '#EDE9FE' : '#E0F2FE', color: isReel(item) ? '#6C5CE7' : '#0369A1' }}>{isReel(item) ? '🎬 릴스' : '🖼️ 피드'}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || '(제목 없음)'}</span> {item.link && <ExternalLink size={12} color={C.sub} />}
          </a>
          {item.productCategory && (() => {
            const p = PRODUCT_CATS.find((c) => c.key === item.productCategory); const names = item.productNames || [];
            return p ? (
              <span className="flex items-center gap-1.5 flex-wrap" style={{ marginBottom: 4 }}>
                <span style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, padding: '1px 8px', borderRadius: 999, background: `${p.color}15`, color: p.color }}># {p.label}</span>
                {names.length > 0 && <span style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 700, padding: '1px 8px', borderRadius: 999, background: C.panel, color: C.ink }}>{names.join(', ')}</span>}
                {item.publishDate && <span style={{ fontSize: 10.5, color: C.sub }}>📅 {item.publishDate}</span>}
              </span>
            ) : null;
          })()}
          {(item.salesProd || item.salesCat) ? (() => {
            const cat = PRODUCT_CATS.find((c) => c.key === item.productCategory);
            const rows = [];
            if (item.salesProd) rows.push(['제품', (item.productNames && item.productNames[0]) || item.productName || item.productCode || '노출 제품', item.salesProd[salesWin]]);
            if (item.salesCat) rows.push(['제품군', cat ? cat.label : (item.productCategory || '제품군'), item.salesCat[salesWin]]);
            return (
              <div style={{ marginBottom: 6, maxWidth: 460 }}>
                <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                  <span title={"발행 직전 N일 대비 발행 후 N일 판매 증감률"} style={{ fontSize: 10, fontWeight: 800, color: '#C2185B', cursor: 'help' }}>💰 판매전환</span>
                  <span style={{ display: 'inline-flex', border: `1px solid ${C.border}`, borderRadius: 999, overflow: 'hidden' }}>
                    {[['d1', '1일'], ['d3', '3일'], ['d7', '7일']].map(([k, lab]) => (
                      <button key={k} onClick={() => setSalesWin(k)} style={{ border: 'none', padding: '1px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: salesWin === k ? '#C2185B' : '#fff', color: salesWin === k ? '#fff' : C.sub }}>{lab}</button>
                    ))}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {rows.map(([kind, name, wo]) => {
                    const p = liftPct(wo); const g = liftGrade(p);
                    const isNew = p === Infinity;
                    const col = p === null ? C.subLite : (isNew || p >= 0 ? '#1D9E75' : '#E24B4A');
                    const txt = p === null ? '데이터 없음' : (isNew ? '신규 발생' : `${p > 0 ? '+' : ''}${p}%`);
                    return (
                      <div key={kind} className="flex items-center justify-between gap-2" style={{ fontSize: 11, background: C.panel, borderRadius: 6, padding: '3px 8px' }}>
                        <span style={{ color: C.sub, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><b style={{ color: C.ink }}>{kind}</b> {name}</span>
                        <span className="flex items-center gap-2 flex-shrink-0">
                          {wo && <span style={{ color: C.subLite, fontSize: 10 }}>{wo.b}→{wo.a}건</span>}
                          <span style={{ color: col, fontWeight: 800 }}>{txt}</span>
                          {g && <span style={{ fontWeight: 900, fontSize: 10, padding: '0 6px', borderRadius: 4, background: g.bg, color: g.color }}>{g.label}</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })() : (item.productCategory && Number(item.salesConvD7 || 0) > 0 ? (
            <div style={{ fontSize: 10.5, color: '#C2185B', marginBottom: 6 }}>💰 판매전환(±7일) {fmt(item.salesConvD7)}건 · GAS 업데이트 후 증감률 표시</div>
          ) : null)}
          <div className="flex flex-wrap gap-x-4 gap-y-1 items-center"> {coreKeys.map((k) => <MetricPill key={k} metricsMap={metricsMap} mkey={k} value={item[k]} big />)} </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 max-w-[200px] justify-end"> {subKeys.map((k) => <MetricPill key={k} metricsMap={metricsMap} mkey={k} value={item[k]} />) } </div>
      </div>
      {(onEditAnalysis || hasReview) && (
        <div style={{ marginTop: 10, borderTop: `1px dashed ${C.border}`, paddingTop: 10 }}>
          {!open ? (
            <div className="flex items-start gap-2 flex-wrap" style={{ fontSize: 11.5, color: C.sub }}>
              {item.hypothesis && <span style={{ flex: '1 1 200px' }}>💡 <b style={{ color: C.ink }}>가설</b> {item.hypothesis}</span>}
              {item.analysis && <span style={{ flex: '1 1 200px' }}>📝 <b style={{ color: C.ink }}>분석</b> {item.analysis}</span>}
              {item.salesReview && <span style={{ flex: '1 1 200px' }}>💰 <b style={{ color: C.ink }}>전환리뷰</b> {item.salesReview}</span>}
              {onEditAnalysis && item.link && <button onClick={() => setOpen(true)} style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, border: `1px solid ${C.border}`, background: '#fff', color: C.accent, cursor: 'pointer', flexShrink: 0 }}>✏️ 리뷰 {hasReview ? '수정' : '작성'}</button>}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {REVIEW_FIELDS.map(([f, label]) => (
                <label key={f} className="flex flex-col gap-1">
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>{label}</span>
                  <textarea value={draft[f]} onChange={(e) => setDraft((d) => ({ ...d, [f]: e.target.value }))} onBlur={() => saveField(f)} rows={2} placeholder="입력 시 자동 저장 · 모든 접속자에게 공유됩니다" style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 9px', fontSize: 12.5, fontFamily: FONT, resize: 'vertical', width: '100%' }} />
                </label>
              ))}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { REVIEW_FIELDS.forEach(([f]) => saveField(f)); setOpen(false); }} style={{ fontSize: 12, fontWeight: 800, padding: '6px 16px', borderRadius: 8, border: 'none', background: C.mint, color: '#fff', cursor: 'pointer' }}>저장</button>
                <button onClick={() => setOpen(false)} style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.sub, cursor: 'pointer' }}>닫기</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImportSection({ week, fields, guess, mappingStorageKey, buildItem, onImport }) {
  const [open, setOpen] = useState(false); const [pasteText, setPasteText] = useState(''); const [headers, setHeaders] = useState([]); const [parsedRows, setParsedRows] = useState([]); const [mapping, setMapping] = useState({});
  useEffect(() => { (async () => { try { const r = await storage.get(mappingStorageKey); if (r?.value) setMapping(JSON.parse(r.value)); } catch (e) {} })(); }, [mappingStorageKey]);
  const persistMapping = async (next) => { setMapping(next); try { await storage.set(mappingStorageKey, JSON.stringify(next)); } catch (e) {} };
  const handleParse = () => { const lines = pasteText.split(/\r?\n/).filter((l) => l.trim().length > 0); if (lines.length < 2) return; const hdrs = lines[0].split('\t').map((h) => h.trim()); const rows = lines.slice(1).map((line) => { const cells = line.split('\t'); const obj = {}; hdrs.forEach((h, i) => { obj[h] = (cells[i] ?? '').trim(); }); return obj; }); setHeaders(hdrs); setParsedRows(rows); const needsGuess = fields.some((f) => !mapping[f.key] || !hdrs.includes(mapping[f.key])); if (needsGuess) { const guessed = { ...mapping }; fields.forEach((f) => { if (guessed[f.key] && hdrs.includes(guessed[f.key])) return; const candidates = guess[f.key] || []; let found = hdrs.find((h) => candidates.includes(h.toLowerCase())) || hdrs.find((h) => candidates.some((c) => h.toLowerCase().includes(c))); guessed[f.key] = found || ''; }); persistMapping(guessed); } };
  const handleImport = () => { onImport(parsedRows.map((row) => buildItem(row, mapping))); setOpen(false); setPasteText(''); setHeaders([]); setParsedRows([]); };
  return (
    <div className="mb-3">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.ink }}> <ClipboardPaste size={14} /> 시트에서 가져오기 {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} </button>
      {open && (
        <div style={{ marginTop: 10, padding: 14, background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 12 }}>
          <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="여기에 구글시트에서 복사한 내용을 붙여넣으세요 (헤더 행 포함)" rows={4} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, fontSize: 12, background: '#fff', color: C.ink, boxSizing: 'border-box' }} />
          <div className="flex flex-wrap gap-2 mt-2">
            <button onClick={handleParse} disabled={!pasteText.trim()} className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', border: `1px solid ${C.border}`, background: '#fff' }}> 컬럼 인식 </button>
            {headers.length > 0 && <button onClick={handleImport} className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 700, padding: '7px 14px', borderRadius: 8, border: 'none', background: C.mint, color: '#fff' }}> {week}에 가져오기 ({parsedRows.length}건) </button>}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryView({ weekMeta, selectedWeek, accountMetrics, allContents, resolvers }) {
  const [tab, setTab] = useState('KR'); const accent = tab === 'KR' ? '#E8546B' : '#3E6FE0'; const weekKeys = weekMeta.map((w) => w.key); const val = (country, week, k) => Number(accountMetrics[country]?.[week]?.[k] || 0);
  const BASELINE_WEEKS = 8; const baselineWeeksList = lastNWeeksKeys(weekMeta, selectedWeek, BASELINE_WEEKS);
  
  const weeklyBaseAvg = useMemo(() => {
    const res = {};
    weekKeys.forEach((wk) => {
      const rangeWeeks = lastNWeeksKeys(weekMeta, wk, 8); const rangeItems = rangeWeeks.flatMap((w) => allContents[tab]?.[w] || []); const reaches = rangeItems.map(i => Number(i.reach || 0)).sort((a, b) => b - a);
      const reachCutoff = Math.ceil(reaches.length * 0.05); const reachAvg = reaches.slice(reachCutoff).length ? reaches.slice(reachCutoff).reduce((s, v) => s + v, 0) / reaches.slice(reachCutoff).length : 0;
      res[wk] = { reachAvg };
    });
    return res;
  }, [weekMeta, allContents, tab, weekKeys]);

  const getHitRate = useCallback((wk) => {
    const items = allContents[tab]?.[wk] || []; const reels = items.filter(isReel); const rAvg = weeklyBaseAvg[wk]?.reachAvg || 0;
    if (!reels.length || !rAvg) return null; const hits = reels.filter(r => Number(r.reach||0) >= rAvg).length; return Math.round((hits / reels.length) * 100);
  }, [allContents, tab, weeklyBaseAvg]);

  const prevIdx = weekKeys.indexOf(selectedWeek) - 1; const prevWeek = prevIdx >= 0 ? weekKeys[prevIdx] : null;
  const wowDelta = (country, k) => { const cur = val(country, selectedWeek, k); if (!prevWeek) return null; const prev = val(country, prevWeek, k); return prev ? ((cur - prev) / prev) * 100 : null; };
  
  const curHitRate = getHitRate(selectedWeek); const prevHitRate = prevWeek ? getHitRate(prevWeek) : null;
  const hitRateDelta = (curHitRate !== null && prevHitRate !== null) ? curHitRate - prevHitRate : null;

  const top3 = useMemo(() => {
    const items = allContents[tab]?.[selectedWeek] || [];
    return [...items].filter((i) => {
      const g = resolvers[tab + '_all']?.(i);
      return g && ['S급', 'A+급', 'A급'].includes(g.label);
    }).sort((a, b) => contentScore(b) - contentScore(a)).slice(0, 3);
  }, [allContents, tab, selectedWeek, resolvers]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4"> <div> <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>통합 요약 · {selectedWeek}</h2> </div> <div className="flex gap-1.5"> {COUNTRIES.map((c) => <button key={c.key} onClick={() => setTab(c.key)} className="flex items-center gap-1.5" style={{ padding: '6px 16px', borderRadius: 999, border: `2px solid ${c.key === tab ? accent : C.border}`, background: c.key === tab ? accent : '#fff', color: c.key === tab ? '#fff' : C.sub }}><span>{c.flag}</span>{c.label}</button>)} </div> </div>
      <SectionLabel color={C.accent}>매출 · 유입</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-1"> <HeroCard metricsMap={ACCOUNT_METRICS} mkey="sales" value={val(tab, selectedWeek, 'sales')} delta={wowDelta(tab, 'sales')} accentColor={accent} sub={<span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>달성률 {fmtMetric('salesAchieveRate', val(tab, selectedWeek, 'salesAchieveRate'))}</span>} /> <HeroCard metricsMap={ACCOUNT_METRICS} mkey="inflow" value={val(tab, selectedWeek, 'inflow')} delta={wowDelta(tab, 'inflow')} accentColor={accent} sub={<span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>달성률 {fmtMetric('inflowAchieveRate', val(tab, selectedWeek, 'inflowAchieveRate'))}</span>} /> </div>
      <SectionLabel color="#3E8FB0" sub="도달·조회수는 오가닉 값을 함께 표시">채널 핵심지표</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-3"> <ReachOrganicCard mkey="reach" organicKey="organicReach" value={val(tab, selectedWeek, 'reach')} organicValue={val(tab, selectedWeek, 'organicReach')} delta={wowDelta(tab, 'reach')} organicDelta={wowDelta(tab, 'organicReach')} accentColor={accent} /> <ReachOrganicCard mkey="views" organicKey="organicViews" value={val(tab, selectedWeek, 'views')} organicValue={val(tab, selectedWeek, 'organicViews')} delta={wowDelta(tab, 'views')} organicDelta={wowDelta(tab, 'organicViews')} accentColor={accent} /> <HeroCard metricsMap={ACCOUNT_METRICS} mkey="engagement" value={val(tab, selectedWeek, 'engagement')} delta={wowDelta(tab, 'engagement')} accentColor={accent} /> </div>
      <SectionLabel color="#E08A2B">콘텐츠 발행 · 타율</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-1"> <HeroCard metricsMap={ACCOUNT_METRICS} mkey="contentsCount" value={val(tab, selectedWeek, 'contentsCount')} delta={wowDelta(tab, 'contentsCount')} accentColor={accent} /> <HeroCard metricsMap={{ hitRate: { label: '콘텐츠 타율', icon: Target, color: '#2E9E89' } }} mkey="hitRate" value={curHitRate ?? 0} delta={hitRateDelta} accentColor={accent} tooltip="⚾ 콘텐츠 타율(Hit Rate)이란?\n\n이번 주 발행된 콘텐츠 중, 채널의 평균 체급(최근 8주 기준) 이상의 도달을 달성한 성공작의 비율입니다." /> </div>
      <div className="mb-4 mt-6">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SectionLabel color="#E8546B">🏆 이번 주 고성과 TOP 3 콘텐츠</SectionLabel>
          <GenericTooltip text="💡 상/하위 콘텐츠 노출 기준:\n\n이번 주 발행된 콘텐츠들의 성과 점수(도달+참여)를 '최근 30일' 기준의 절대 등급과 매칭합니다.\n\n• 상위 콘텐츠: S급 / A+급 / A급(상위 15% 이내) 달성 📈" width={300} />
        </div>
        {top3.length === 0 ? <div style={{ textAlign: 'center', color: C.sub, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12, background: '#fff', fontSize: 13, fontWeight: 600 }}>이번 주 채널 엘리트 체급(A급 이상)을 넘긴 상위 고성과 콘텐츠가 없습니다.</div> : (
          <div className="flex flex-col gap-2.5">
            {top3.map((item, i) => {
              const g = resolvers[tab + '_all'] ? resolvers[tab + '_all'](item) : null;
              return (
                <div key={item.id} className="flex items-center gap-3" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', boxShadow: SHADOW }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? '#E8546B' : C.subLite, width: 22, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a href={item.link || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-bold text-gray-900 truncate text-[13px]">
                      {g && <span title={GRADE_TOOLTIP} style={{ fontSize: '9px', fontWeight: '900', padding: '1px 5px', borderRadius: '4px', background: g.bg, color: g.color, marginRight: '6px', display: 'inline-block', cursor: 'help' }}>{g.label} <span style={{ opacity: 0.75 }}>상위{g.pct}%</span></span>}
                      {Number(item.views || 0) >= 1000000 && <span style={{ fontSize: '9px', fontWeight: '900', padding: '1px 5px', borderRadius: '4px', background: '#FFF0F2', color: '#FF003C', border: '1px solid #FFCCD5', marginRight: '6px', display: 'inline-block' }}>🔥 100만뷰</span>}
                      {item.title || '(제목 없음)'} {item.link && <ExternalLink size={11} />}
                    </a>
                  </div>
                  <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>도달 {fmt(item.reach)}</span><span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>참여 {fmt(item.engagement)}</span><span style={{ fontSize: 12, fontWeight: 800, color: '#E8546B' }}>점수 {fmt(contentScore(item))}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CountryView({ countryKey, weekMeta, selectedWeek, displayWeeks, accountMetrics, allContents, dailyMetrics, resolvers, onEditAnalysis }) {
  const labelsA = useMemo(() => metricLabels(ACCOUNT_METRICS), []);
  const weekKeys = weekMeta.map((w) => w.key); const metrics = accountMetrics[countryKey] || {}; const totals = (week) => metrics[week] || zeroAccount();
  const prevIdx = weekKeys.indexOf(selectedWeek) - 1; const prevWeek = prevIdx >= 0 ? weekKeys[prevIdx] : null; const wowDelta = (k) => { const cur = totals(selectedWeek)[k]; if (!prevWeek) return null; const prev = totals(prevWeek)[k]; return prev ? ((cur - prev) / prev) * 100 : null; };
  const trendData = displayWeeks.map((w) => ({ week: w, ...totals(w) })); const [subView, setSubView] = useState('overview'); const [trendMode, setTrendMode] = useState('weekly');
  const [selectedMonthNode, setSelectedMonthNode] = useState(null);
  const monthlyData = useMemo(() => {
    const year = new Date().getFullYear(); const curMonth = new Date().getMonth() + 1;
    const byMonth = {};
    weekMeta.forEach((wm) => { const t = metrics[wm.key]; if (!t || !wm.month) return; if (!byMonth[wm.month]) byMonth[wm.month] = { reach: 0, engagement: 0, sales: 0, inflow: 0 }; ['reach', 'engagement', 'sales', 'inflow'].forEach((k) => { byMonth[wm.month][k] += Number(t[k] || 0); }); });
    const out = [];
    for (let mo = 1; mo <= curMonth; mo++) { const key = year + '-' + String(mo).padStart(2, '0'); const v = byMonth[key] || { reach: 0, engagement: 0, sales: 0, inflow: 0 }; out.push({ month: key, ...v }); }
    return out;
  }, [weekMeta, metrics]);
  const selectedMonthTopContents = useMemo(() => {
    if (!selectedMonthNode) return [];
    const monthWeeks = weekMeta.filter((w) => w.month === selectedMonthNode).map((w) => w.key);
    const items = [];
    monthWeeks.forEach((wk) => (allContents[countryKey]?.[wk] || []).forEach((it) => items.push(it)));
    return items.sort((a, b) => contentScore(b) - contentScore(a)).slice(0, 3);
  }, [selectedMonthNode, weekMeta, allContents, countryKey]);
  const [selectedDayNode, setSelectedDailyNode] = useState(null);
  const [selectedWeekNode, setSelectedWeekNode] = useState(null);
  const [showAllList, setShowAllList] = useState(false);
  const [showWeeklyTable, setShowWeeklyTable] = useState(false);

  const weeklyBaseAvg = useMemo(() => {
    const res = {};
    weekKeys.forEach((wk) => {
      const rangeWeeks = lastNWeeksKeys(weekMeta, wk, 8); const rangeItems = rangeWeeks.flatMap((w) => allContents[countryKey]?.[w] || []); const reaches = rangeItems.map(i => Number(i.reach || 0)).sort((a,b)=>b-a);
      const reachCutoff = Math.ceil(reaches.length * 0.05); const reachAvg = reaches.slice(reachCutoff).length ? reaches.slice(reachCutoff).reduce((s,v)=>s+v,0) / reaches.slice(reachCutoff).length : 0;
      res[wk] = { reachAvg };
    });
    return res;
  }, [weekMeta, allContents, countryKey, weekKeys]);

  const getHitRate = useCallback((wk) => {
    const items = allContents[countryKey]?.[wk] || []; const reels = items.filter(isReel); const rAvg = weeklyBaseAvg[wk]?.reachAvg || 0;
    if (!reels.length || !rAvg) return null; const hits = reels.filter(r => Number(r.reach||0) >= rAvg).length; return Math.round((hits / reels.length) * 100);
  }, [allContents, countryKey, weeklyBaseAvg]);

  const curHitRate = getHitRate(selectedWeek); const prevHitRate = prevWeek ? getHitRate(prevWeek) : null;
  const hitRateDelta = (curHitRate !== null && prevHitRate !== null) ? curHitRate - prevHitRate : null;

  const weekItems = allContents[countryKey]?.[selectedWeek] || [];
  const weekReelCount = weekItems.filter(isReel).length; const weekFeedCount = weekItems.length - weekReelCount;
  const [gradeFilter, setGradeFilter] = useState(null);
  const gradeFilteredItems = useMemo(() => gradeFilter ? weekItems.filter((item) => resolvers[countryKey + '_all']?.(item)?.label === gradeFilter).sort((a, b) => contentScore(b) - contentScore(a)) : [], [gradeFilter, weekItems, resolvers, countryKey]);
  
  const topContent = useMemo(() => weekItems.filter(item => { const g = resolvers[countryKey + '_all']?.(item); return g && ['S급', 'A+급', 'A급'].includes(g.label); }).sort((a, b) => contentScore(b) - contentScore(a)).slice(0, 5), [weekItems, resolvers, countryKey]);
  const bottomContent = useMemo(() => weekItems.filter(item => { const g = resolvers[countryKey + '_all']?.(item); return g && ['B급', 'C급', 'D급'].includes(g.label); }).sort((a, b) => contentScore(b) - contentScore(a)).slice(0, 5), [weekItems, resolvers, countryKey]);
  const comebackItems = useMemo(() => {
    const out = [];
    weekKeys.forEach((wk) => { if (wk === selectedWeek) return; (allContents[countryKey]?.[wk] || []).forEach((it) => { const cb = comebackInfo(it); if (cb) out.push({ item: it, cb: cb }); }); });
    return out.sort((a, b) => b.cb.growth - a.cb.growth).slice(0, 8);
  }, [allContents, countryKey, weekKeys, selectedWeek]);
  const localTop3 = useMemo(() => [...weekItems].filter(item => { const g = resolvers[countryKey + '_all']?.(item); return g && ['S급', 'A+급', 'A급'].includes(g.label); }).sort((a, b) => contentScore(b) - contentScore(a)).slice(0, 3), [weekItems, resolvers, countryKey]);

  const productCatDataNow = useMemo(() => {
    return PRODUCT_CATS.map(cat => {
      const catItems = weekItems.filter(i => i.productCategory === cat.key); const reels = catItems.filter(isReel); const rAvg = weeklyBaseAvg[selectedWeek]?.reachAvg || 0; const hits = reels.filter(r => Number(r.reach || 0) >= rAvg).length; const totalReach = catItems.reduce((s, i) => s + Number(i.reach || 0), 0);
      return { ...cat, salesCount: catItems.reduce((s, i) => s + Number(i.salesCount || 0), 0), contentCount: catItems.length, reach: totalReach, avgReach: catItems.length ? Math.round(totalReach / catItems.length) : 0, views: catItems.reduce((s, i) => s + Number(i.views || 0), 0), hitRate: reels.length ? Math.round((hits / reels.length) * 100) : 0 };
    });
  }, [weekItems, weeklyBaseAvg, selectedWeek]);

  const productTrendData = useMemo(() => {
    return displayWeeks.map(wk => {
      const itemsWeek = allContents[countryKey]?.[wk] || []; const rAvg = weeklyBaseAvg[wk]?.reachAvg || 0; const entry = { week: wk };
      PRODUCT_CATS.forEach(cat => {
        const catItems = itemsWeek.filter(i => i.productCategory === cat.key); const reels = catItems.filter(isReel); const hits = reels.filter(r => Number(r.reach || 0) >= rAvg).length;
        entry[`${cat.key}_count`] = catItems.length; entry[`${cat.key}_reach`] = catItems.reduce((s, i) => s + Number(i.reach || 0), 0); entry[`${cat.key}_sales`] = catItems.reduce((s, i) => s + Number(i.salesCount || 0), 0); entry[`${cat.key}_hitRate`] = reels.length ? Math.round((hits / reels.length) * 100) : 0;
      });
      return entry;
    });
  }, [displayWeeks, allContents, countryKey, weeklyBaseAvg]);

  const localDailyArray = useMemo(() => dailyMetrics[countryKey] || [], [dailyMetrics, countryKey]);
  const selectedDayTopContents = useMemo(() => { if (!selectedDayNode) return []; let dayContents = []; weekKeys.forEach(wk => { (allContents[countryKey]?.[wk] || []).forEach(item => { if (item.publishDate === selectedDayNode._raw_date) dayContents.push(item); }); }); return dayContents.sort((a,b) => contentScore(b) - contentScore(a)).slice(0, 3); }, [selectedDayNode, allContents, countryKey, weekKeys]);
  const selectedWeekTopContents = useMemo(() => { if (!selectedWeekNode) return []; return [...(allContents[countryKey]?.[selectedWeekNode] || [])].sort((a, b) => contentScore(b) - contentScore(a)).slice(0, 3); }, [selectedWeekNode, allContents, countryKey]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{countryKey === 'KR' ? '한국' : '미국'} 대시보드 · {selectedWeek}</h2>
        <div style={{ display: 'inline-flex', background: '#F4EEE8', padding: '4px', borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: SHADOW }}>
          {[{ key: 'overview', label: '📊 전체 현황' }, { key: 'content', label: '📝 주간 콘텐츠 분석' }, { key: 'product', label: '🛍️ 제품군별 성과' }].map((t) => {
            const active = subView === t.key;
            return ( <button key={t.key} onClick={() => setSubView(t.key)} style={{ padding: '6px 16px', borderRadius: '8px', fontSize: 13, fontWeight: active ? 800 : 600, background: active ? '#fff' : 'transparent', color: active ? C.ink : C.sub, border: 'none', cursor: 'pointer' }}>{t.label}</button> );
          })}
        </div>
      </div>

      {subView === 'overview' && (
        <div>
          <SectionLabel color={C.accent}>매출 · 유입</SectionLabel>
          <div className="flex flex-wrap gap-3 mb-4">
            {[{ k: 'sales', s: 'salesAchieveRate' }, { k: 'inflow', s: 'inflowAchieveRate' }].map(({ k, s }) => ( <HeroCard key={k} metricsMap={ACCOUNT_METRICS} mkey={k} value={totals(selectedWeek)[k]} delta={wowDelta(k)} sub={<span style={{ fontSize:11, fontWeight:700 }}>달성률 {fmtMetric(s, totals(selectedWeek)[s])}</span>} /> ))}
          </div>
          <SectionLabel color="#3E8FB0">채널 지표</SectionLabel>
          <div className="flex flex-wrap gap-3 mb-4">
            <ReachOrganicCard mkey="reach" organicKey="organicReach" value={totals(selectedWeek).reach} organicValue={totals(selectedWeek).organicReach} delta={wowDelta('reach')} organicDelta={wowDelta('organicReach')} />
            <ReachOrganicCard mkey="views" organicKey="organicViews" value={totals(selectedWeek).views} organicValue={totals(selectedWeek).organicViews} delta={wowDelta('views')} organicDelta={wowDelta('organicViews')} />
            <HeroCard metricsMap={ACCOUNT_METRICS} mkey="engagement" value={totals(selectedWeek).engagement} delta={wowDelta('engagement')} />
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            <HeroCard metricsMap={ACCOUNT_METRICS} mkey="contentsCount" value={weekItems.length} delta={prevWeek ? (() => { const prev = (allContents[countryKey]?.[prevWeek] || []).length; return prev ? ((weekItems.length - prev) / prev) * 100 : null; })() : null} sub={<span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>🎬 릴스 {weekReelCount} · 🖼️ 피드 {weekFeedCount}</span>} />
            <HeroCard metricsMap={{ hitRate: { label: '콘텐츠 타율', icon: Target, color: '#2E9E89' } }} mkey="hitRate" value={curHitRate ?? 0} delta={hitRateDelta} tooltip="⚾ 콘텐츠 타율(Hit Rate)이란?\n\n이번 주 발행된 콘텐츠 중, 채널의 평균 체급(최근 8주 기준) 이상의 도달을 달성한 성공작의 비율입니다." />
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 20, boxShadow: SHADOW }}>
            <div className="flex justify-between items-center mb-3">
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: C.ink }}>🏅 주간 기획 성적 분포 리포트 ({selectedWeek})</h3>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.sub }}>총 {weekItems.length}개 콘텐츠 발행 기준</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {GRADE_SPECS.map(spec => {
                const count = weekItems.filter(item => resolvers[countryKey + '_all']?.(item)?.label === spec.label).length;
                const pctValue = weekItems.length ? (count / weekItems.length) * 100 : 0;
                const active = gradeFilter === spec.label;
                return (
                  <button key={spec.label} onClick={() => setGradeFilter(active ? null : spec.label)} title="클릭하면 해당 등급 콘텐츠 보기" style={{ background: active ? spec.bg : C.panel, border: `1.5px solid ${active ? spec.color : C.border}`, borderRadius: 12, padding: '10px 12px', textAlign: 'center', cursor: 'pointer' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', background: spec.bg, color: spec.color, display: 'inline-block', marginBottom: '4px' }}>{spec.label}</span>
                    <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>{count}<span style={{ fontSize: 11, fontWeight: 500, color: C.subLite, marginLeft: 2 }}>개</span></div>
                    <div style={{ width: '100%', height: 3.5, background: '#E7DCD3', borderRadius: 99, marginTop: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${pctValue}%`, height: '100%', background: spec.color, borderRadius: 99 }} />
                    </div>
                  </button>
                );
              })}
            </div>
            {gradeFilter && (
              <div className="mt-4 pt-3" style={{ borderTop: `1px dashed ${C.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{gradeFilter} 콘텐츠 · {gradeFilteredItems.length}건 <span style={{ fontWeight: 600, color: C.sub }}>(🎬 {gradeFilteredItems.filter(isReel).length} · 🖼️ {gradeFilteredItems.length - gradeFilteredItems.filter(isReel).length})</span></span>
                  <button onClick={() => setGradeFilter(null)} style={{ fontSize: 11, fontWeight: 700, color: C.sub, background: 'none', border: 'none', cursor: 'pointer' }}>✕ 닫기</button>
                </div>
                <div className="flex flex-col gap-2.5">
                  {gradeFilteredItems.length === 0 && <div style={{ textAlign: 'center', color: C.sub, padding: '16px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>해당 등급 콘텐츠가 없습니다.</div>}
                  {gradeFilteredItems.map((item) => <ContentCard key={'gf-' + (item.id || item.link)} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} grade={resolvers[countryKey + '_all'] ? resolvers[countryKey + '_all'](item) : null} salesGrade={resolvers[countryKey + '_sales'] ? resolvers[countryKey + '_sales'](item) : null} onEditAnalysis={onEditAnalysis} />)}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div><h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{trendMode === 'weekly' ? '📈 주간 대시보드 트렌드 (그래프 클릭 시 해당 주 TOP3)' : trendMode === 'monthly' ? '📅 월간 트렌드 (올해 1월~최근월, 클릭 시 해당 월 TOP3)' : '🔥 최근 30일 일별 실시간 센서 (날짜를 클릭하세요)'}</h3></div>
              <div style={{ display: 'inline-flex', background: '#F4EEE8', padding: '3px', borderRadius: '8px', border: `1px solid ${C.border}` }}>
                <button onClick={() => setTrendMode('weekly')} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: 12, fontWeight: trendMode === 'weekly' ? 800 : 500, background: trendMode === 'weekly' ? '#fff' : 'transparent', color: trendMode === 'weekly' ? C.ink : C.sub, border: 'none', cursor: 'pointer' }}>📊 7주 주간 추이</button>
                <button onClick={() => setTrendMode('monthly')} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: 12, fontWeight: trendMode === 'monthly' ? 800 : 500, background: trendMode === 'monthly' ? '#fff' : 'transparent', color: trendMode === 'monthly' ? C.ink : C.sub, border: 'none', cursor: 'pointer' }}>📅 월간 추이</button>
                <button onClick={() => setTrendMode('daily')} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: 12, fontWeight: trendMode === 'daily' ? 800 : 500, background: trendMode === 'daily' ? '#fff' : 'transparent', color: trendMode === 'daily' ? C.ink : C.sub, border: 'none', cursor: 'pointer' }}>🔥 최근 30일 일별 화력</button>
              </div>
            </div>
            
            {trendMode === 'weekly' ? (
              <div>
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} onClick={(state) => { if (state && state.activeLabel) setSelectedWeekNode(state.activeLabel); }} style={{ cursor: 'pointer' }}>
                      <CartesianGrid stroke={C.border} vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={false} tickLine={false} /> 
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 10000 ? `${(v/10000).toFixed(0)}만` : v} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 100000000 ? `${(v/100000000).toFixed(0)}억` : v >= 10000 ? `${(v/10000).toFixed(0)}만` : v} />
                      <YAxis yAxisId="inflow" hide={true} domain={['auto', 'auto']} />
                      <YAxis yAxisId="eng" hide={true} domain={['auto', 'auto']} />
                      <Tooltip content={<ChartTooltip labels={labelsA} />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line yAxisId="eng" type="monotone" dataKey="engagement" name="참여수" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={1.5} strokeDasharray="5 4" dot={false} opacity={0.65} />
                      <Line yAxisId="left" type="monotone" dataKey="reach" name="도달수" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="inflow" type="monotone" dataKey="inflow" name="유입" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="sales" name="매출" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {selectedWeekNode && (
                  <div className="mt-4 p-4 border rounded-xl bg-gray-50 animate-fadeIn" style={{ borderColor: C.border }}>
                    <div className="flex justify-between items-center mb-3">
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>🔍 {selectedWeekNode} ({weekRangeLabel(selectedWeekNode, weekMeta)}) 발행 TOP 3</span>
                      <button onClick={() => setSelectedWeekNode(null)} style={{ background: 'none', border: 'none', color: C.subLite, cursor: 'pointer' }}><X size={15} /></button>
                    </div>
                    {selectedWeekTopContents.length === 0 ? (
                      <div style={{ fontSize: 12, color: C.subLite, textAlign: 'center', padding: '10px 0' }}>이 주차에 발행된 콘텐츠가 없습니다.</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selectedWeekTopContents.map((item, idx) => {
                          const g = resolvers[countryKey + '_all'] ? resolvers[countryKey + '_all'](item) : null;
                          return (
                            <div key={item.id || idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border" style={{ borderColor: C.border }}>
                              <div className="flex items-center gap-2 min-w-0">
                                <span style={{ fontSize: 12, fontWeight: 800, color: C.accent }}>TOP {idx + 1}</span>
                                <a href={item.link || undefined} target="_blank" rel="noreferrer" className="text-[12.5px] font-bold text-gray-800 hover:text-blue-600 truncate underline flex items-center gap-1">
                                  {g && <span title={GRADE_TOOLTIP} style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '4px', background: g.bg, color: g.color, marginRight: '4px', display: 'inline-block', cursor: 'help' }}>{g.label} 상위{g.pct}%</span>}
                                  {Number(item.views || 0) >= 1000000 && <span style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '4px', background: '#FFF0F2', color: '#FF003C', border: '1px solid #FFCCD5', marginRight: '4px', display: 'inline-block' }}>🔥 100만뷰</span>}
                                  {item.title ? (item.title.substring(0, 18) + (item.title.length > 18 ? '…' : '')) : '(제목 없음)'}
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                              <div className="flex gap-3 text-xs text-gray-500 font-semibold flex-shrink-0"> <span>도달: {fmt(item.reach)}</span> <span>참여: {fmt(item.engagement)}</span> </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-2 border-t border-dashed border-gray-200">
                  <button onClick={() => setShowWeeklyTable(!showWeeklyTable)} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg border" style={{ cursor: 'pointer' }}>
                    {showWeeklyTable ? '🔼 주간 데이터표 접기' : '📋 주간 데이터표 확인하기'}
                  </button>
                  {showWeeklyTable && (
                    <div className="mt-2 overflow-x-auto rounded-xl border border-gray-200 animate-fadeIn bg-white">
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 550 }}>
                        <thead>
                          <tr style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, fontWeight: 700, color: C.sub }}>
                            <th className="p-2.5 text-left">주차</th> <th className="p-2.5 text-right" style={{ color: C.accent }}>주간 매출액</th> <th className="p-2.5 text-right">달성 유입수</th> <th className="p-2.5 text-right" style={{ color: '#3E8FB0' }}>총 도달수</th> <th className="p-2.5 text-right" style={{ color: '#6C5CE7' }}>총 참여수</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trendData.map(row => (
                            <tr key={row.week} style={{ borderBottom: `1px solid ${C.border}` }} className="hover:bg-gray-50/80">
                              <td className="p-2.5 font-bold text-gray-800">{row.week}</td> <td className="p-2.5 text-right font-bold text-gray-900">₩{fmt(row.sales)}</td> <td className="p-2.5 text-right font-medium">{fmt(row.inflow)} 명</td> <td className="p-2.5 text-right font-semibold text-gray-700">{fmt(row.reach)}</td> <td className="p-2.5 text-right font-semibold text-gray-700">{fmt(row.engagement)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : trendMode === 'monthly' ? (
              <div>
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} onClick={(state) => { if (state && state.activeLabel) setSelectedMonthNode(state.activeLabel); }} style={{ cursor: 'pointer' }}>
                      <CartesianGrid stroke={C.border} vertical={false} />
                      <XAxis dataKey="month" tickFormatter={(m) => Number(String(m).split('-')[1]) + '월'} tick={{ fontSize: 12, fill: C.sub }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 10000 ? `${(v/10000).toFixed(0)}만` : v} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 100000000 ? `${(v/100000000).toFixed(0)}억` : v >= 10000 ? `${(v/10000).toFixed(0)}만` : v} />
                      <YAxis yAxisId="inflow" hide={true} domain={['auto', 'auto']} />
                      <YAxis yAxisId="eng" hide={true} domain={['auto', 'auto']} />
                      <Tooltip content={<ChartTooltip labels={labelsA} />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line yAxisId="eng" type="monotone" dataKey="engagement" name="참여수" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={1.5} strokeDasharray="5 4" dot={false} opacity={0.65} />
                      <Line yAxisId="left" type="monotone" dataKey="reach" name="도달수" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="inflow" type="monotone" dataKey="inflow" name="유입" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="sales" name="매출" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                {selectedMonthNode && (
                  <div className="mt-4 p-4 border rounded-xl bg-gray-50 animate-fadeIn" style={{ borderColor: C.border }}>
                    <div className="flex justify-between items-center mb-3">
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>🔍 {Number(String(selectedMonthNode).split('-')[1])}월 발행 TOP 3</span>
                      <button onClick={() => setSelectedMonthNode(null)} style={{ background: 'none', border: 'none', color: C.subLite, cursor: 'pointer' }}><X size={15} /></button>
                    </div>
                    {selectedMonthTopContents.length === 0 ? (
                      <div style={{ fontSize: 12, color: C.subLite, textAlign: 'center', padding: '10px 0' }}>이 달에 발행된 콘텐츠가 없습니다.</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selectedMonthTopContents.map((item, idx) => {
                          const g = resolvers[countryKey + '_all'] ? resolvers[countryKey + '_all'](item) : null;
                          return (
                            <div key={item.id || idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border" style={{ borderColor: C.border }}>
                              <div className="flex items-center gap-2 min-w-0">
                                <span style={{ fontSize: 12, fontWeight: 800, color: C.accent }}>TOP {idx + 1}</span>
                                <a href={item.link || undefined} target="_blank" rel="noreferrer" className="text-[12.5px] font-bold text-gray-800 hover:text-blue-600 truncate underline flex items-center gap-1">
                                  {g && <span title={GRADE_TOOLTIP} style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '4px', background: g.bg, color: g.color, marginRight: '4px', display: 'inline-block', cursor: 'help' }}>{g.label} 상위{g.pct}%</span>}
                                  {item.title ? (item.title.substring(0, 18) + (item.title.length > 18 ? '…' : '')) : '(제목 없음)'}
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                              <div className="flex gap-3 text-xs text-gray-500 font-semibold flex-shrink-0"> <span>도달: {fmt(item.reach)}</span> <span>참여: {fmt(item.engagement)}</span> </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <ComposedChart data={localDailyArray} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} onClick={(state) => { if(state && state.activePayload) setSelectedDailyNode(state.activePayload[0].payload); }} style={{ cursor: 'pointer' }}>
                    <CartesianGrid stroke={C.border} vertical={false} /> <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="traffic" tick={{ fontSize: 10 }} axisLine={false} tickFormatter={(v) => v >= 10000 ? `${(v/10000).toFixed(0)}만` : v} />
                    <YAxis yAxisId="business" orientation="right" tick={{ fontSize: 10 }} axisLine={false} />
                    <YAxis yAxisId="eng" hide={true} domain={['auto', 'auto']} />
                    <Tooltip content={<DailyChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="traffic" dataKey="reach" name="도달" fill="#3E8FB0" opacity={0.15} barSize={25} />
                    <Line yAxisId="traffic" type="monotone" dataKey="views" name="조회수" stroke="#4C6FBF" strokeWidth={2} dot={false} />
                    <Line yAxisId="eng" type="monotone" dataKey="engagement" name="참여" stroke="#6C5CE7" strokeWidth={2} dot={false} />
                    <Line yAxisId="business" type="monotone" dataKey="sales" name="매출액" stroke="#E8546B" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line yAxisId="business" type="monotone" dataKey="inflow" name="유입수" stroke="#2E9E89" strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {trendMode === 'daily' && selectedDayNode && (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50 animate-fadeIn" style={{ borderColor: C.border }}>
                <div className="flex justify-between items-center mb-3">
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>🔍 {selectedDayNode._raw_date} 발행물 성과 돋보기</span>
                  <button onClick={() => setSelectedDailyNode(null)} style={{ background: 'none', border: 'none', color: C.subLite }}><X size={15} /></button>
                </div>
                {selectedDayTopContents.length === 0 ? (
                  <div style={{ fontSize: 12, color: C.subLite, textAlign: 'center', padding: '10px 0' }}>이날은 피드에 새로 발행된 오리지널 콘텐츠가 없습니다.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedDayTopContents.map((item, idx) => {
                      const g = resolvers[countryKey + '_all'] ? resolvers[countryKey + '_all'](item) : null;
                      return (
                        <div key={item.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border" style={{ borderColor: C.border }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span style={{ fontSize: 12, fontWeight: 800, color: C.accent }}>TOP {idx+1}</span>
                            <a href={item.link || undefined} target="_blank" rel="noreferrer" className="text-[12.5px] font-bold text-gray-800 hover:text-blue-600 truncate underline flex items-center gap-1">
                              {g && <span title={GRADE_TOOLTIP} style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '4px', background: g.bg, color: g.color, marginRight: '4px', textDecoration: 'none', display: 'inline-block', cursor: 'help' }}>{g.label} 상위{g.pct}%</span>}
                              {Number(item.views || 0) >= 1000000 && <span style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '4px', background: '#FFF0F2', color: '#FF003C', border: '1px solid #FFCCD5', marginRight: '4px', textDecoration: 'none', display: 'inline-block' }}>🔥 100만뷰</span>}
                              {item.title ? (item.title.substring(0, 14) + (item.title.length > 14 ? '...' : '')) : '(제목 없음)'}
                              <ExternalLink size={11} />
                            </a>
                          </div>
                          <div className="flex gap-3 text-xs text-gray-500 font-semibold flex-shrink-0"> <span>도달: {fmt(item.reach)}</span> <span>참여: {fmt(item.engagement)}</span> </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SectionLabel color={C.accent}>🏆 이번 주 고성과 TOP 3 콘텐츠</SectionLabel>
              <GenericTooltip text="💡 상/하위 콘텐츠 분류 기준:\n\n이번 주 발행된 콘텐츠들의 결합 점수(도달+참여)를 '최근 30일' 기준의 절대 등급과 매칭합니다.\n\n• 상위 콘텐츠: S급 / A+급 / A급(상위 15% 이내) 달성 📈" width={300} />
            </div>
            {localTop3.length === 0 ? <div style={{ textAlign: 'center', color: C.sub, padding: '24px 0', border: `1px dashed ${C.border}`, borderRadius: 12, background: '#fff', fontSize: 13, fontWeight: 600 }}>이번 주 채널 엘리트 체급(A급 이상)을 넘긴 상위 고성과 콘텐츠가 없습니다.</div> : (
              <div className="flex flex-col gap-2.5">
                {localTop3.map((item, i) => {
                  const g = resolvers[countryKey + '_all'] ? resolvers[countryKey + '_all'](item) : null;
                  return (
                    <div key={item.id} className="flex items-center gap-3" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', boxShadow: SHADOW }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: i === 0 ? C.accent : C.subLite, width: 20, flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a href={item.link || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-bold text-gray-900 truncate text-[13px]">
                          {g && <span title={GRADE_TOOLTIP} style={{ fontSize: '9px', fontWeight: '900', padding: '1px 5px', borderRadius: '4px', background: g.bg, color: g.color, marginRight: '6px', display: 'inline-block', cursor: 'help' }}>{g.label} <span style={{ opacity: 0.75 }}>상위{g.pct}%</span></span>}
                          {Number(item.views || 0) >= 1000000 && <span style={{ fontSize: '9px', fontWeight: '900', padding: '1px 5px', borderRadius: '4px', background: '#FFF0F2', color: '#FF003C', border: '1px solid #FFCCD5', marginRight: '6px', display: 'inline-block' }}>🔥 100만뷰</span>}
                          {item.title || '(제목 없음)'} {item.link && <ExternalLink size={11} />}
                        </a>
                      </div>
                      <span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>도달 {fmt(item.reach)}</span><span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>참여 {fmt(item.engagement)}</span><span style={{ fontSize: 11.5, fontWeight: 800, color: countryKey === 'KR' ? '#E8546B' : '#3E6FE0' }}>점수 {fmt(contentScore(item))}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {subView === 'content' && (
        <div>
          <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>🏆 상위 성공 콘텐츠 (최대 5개)</h3>
              <GenericTooltip text="💡 상/하위 콘텐츠 분류 기준:\n\n최근 30일 전체 데이터 기준 상대평가 컷오프를 통과한 에이스 기획입니다.\n\n• 노출 조건: S급 / A+급 / A급 기획물 📈" width={290} />
            </div>
            <div className="flex flex-col gap-2.5 mt-3">
              {topContent.length === 0 && <div style={{ textAlign: 'center', color: C.sub, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>조건을 만족하는 콘텐츠가 없습니다.</div>}
              {topContent.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} grade={resolvers[countryKey + '_all'] ? resolvers[countryKey + '_all'](item) : null} salesGrade={resolvers[countryKey + '_sales'] ? resolvers[countryKey + '_sales'](item) : null} onEditAnalysis={onEditAnalysis} />)}
            </div>
          </div>
          <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>📉 하위 보완 콘텐츠 (최대 5개)</h3>
              <GenericTooltip text="💡 하위 보완 분류 기준:\n\n성과 화력이 최근 30일 누적 표준선(상위 15% 컷오프) 미만인 B급~D급 판정을 받아 모니터링 및 기획 튜닝이 권장되는 리스트입니다." width={300} />
            </div>
            <div className="flex flex-col gap-2.5 mt-3">
              {bottomContent.length === 0 && <div style={{ textAlign: 'center', color: C.sub, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>조건을 만족하는 콘텐츠가 없습니다.</div>}
              {bottomContent.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} grade={resolvers[countryKey + '_all'] ? resolvers[countryKey + '_all'](item) : null} salesGrade={resolvers[countryKey + '_sales'] ? resolvers[countryKey + '_sales'](item) : null} onEditAnalysis={onEditAnalysis} />)}
            </div>
          </div>
          <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>🔁 역주행 콘텐츠 (최대 8개)</h3>
              <GenericTooltip text={"💡 역주행 기준:\n\n지난 발행 콘텐츠 중, 발행 1주차 성과(도달+참여)보다 이후 주차(2~4주)에 +10% 이상 더 늘어난 콘텐츠입니다. (이번 주 발행 제외)"} width={300} />
            </div>
            <div className="flex flex-col gap-2.5 mt-3">
              {comebackItems.length === 0 && <div style={{ textAlign: 'center', color: C.sub, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>역주행(1주차 이후 성과 재상승) 콘텐츠가 아직 없습니다.</div>}
              {comebackItems.map(({ item, cb }) => (
                <div key={'cb-' + (item.id || item.link)} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 1, fontSize: 11, fontWeight: 800, color: '#1D9E75', background: '#E1F5EE', borderRadius: 999, padding: '2px 9px' }}>🔁 {WK_LABEL[cb.laterWk]} +{cb.growth}%</div>
                  <ContentCard item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} grade={resolvers[countryKey + '_all'] ? resolvers[countryKey + '_all'](item) : null} salesGrade={resolvers[countryKey + '_sales'] ? resolvers[countryKey + '_sales'](item) : null} onEditAnalysis={onEditAnalysis} />
                </div>
              ))}
            </div>
          </div>
          <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
            <button onClick={() => setShowAllList(!showAllList)} className="flex items-center justify-between w-full" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>이번 주 전체 콘텐츠 리스트 · {selectedWeek} ({weekItems.length}건)</h3>
              {showAllList ? <ChevronUp size={18} color={C.sub} /> : <ChevronDown size={18} color={C.sub} />}
            </button>
            {showAllList && (
              <div style={{ marginTop: 12 }}>
                <div className="flex flex-wrap gap-2 mb-3">
                  <ImportSection week={selectedWeek} fields={ALL_IMPORT_FIELDS} guess={ALL_GUESS} mappingStorageKey={`dash2-all-mapping-${countryKey}`} buildItem={buildAllItem} onImport={importAllItems} />
                  <button onClick={addAllItem} className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: 'none', background: C.ink, color: '#fff', height: 36 }}><Plus size={14} /> 콘텐츠 추가</button>
                </div>
                <div className="flex flex-col gap-2.5">
                  {weekItems.length === 0 && <div style={{ textAlign: 'center', color: C.sub, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>등록된 콘텐츠가 없습니다.</div>}
                  {weekItems.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} grade={resolvers[countryKey + '_all'] ? resolvers[countryKey + '_all'](item) : null} salesGrade={resolvers[countryKey + '_sales'] ? resolvers[countryKey + '_sales'](item) : null} onEditAnalysis={onEditAnalysis} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subView === 'product' && (
        <div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 20, boxShadow: SHADOW }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 14px', color: C.ink }}>📊 이번 주 제품군별 종합 그래프 ({selectedWeek})</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <ComposedChart data={productCatDataNow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={C.border} vertical={false} /> <XAxis dataKey="label" tick={{ fontSize: 12, fill: C.sub }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 10000 ? `${(v/10000).toFixed(0)}만` : v} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<ChartTooltip labels={{ reach: '총 도달수', hitRate: '기획 타율', contentCount: '발행 수', salesCount: '판매건수' }} />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="reach" name="총 도달수" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {productCatDataNow.map((entry, idx) => ( <Cell key={`cell-${idx}`} fill={entry.color} /> ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="hitRate" name="기획 타율(%)" stroke={C.ink} strokeWidth={3} dot={{ r: 4, fill: C.ink }} />
                  <Line yAxisId="right" type="monotone" dataKey="salesCount" name="판매건수" stroke="#7F8C8D" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 20, boxShadow: SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>📋 제품군별 성과 지표 매트릭스</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}`, background: C.panel }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: C.sub }}>제품군</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: C.sub }}>판매건수</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: C.sub }}>콘텐츠 수</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: '#3E8FB0' }}>총 도달수</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: C.accent }}>평균 도달수</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: C.sub }}>기획 타율 <GenericTooltip text="⚾ 기획 타율(Hit Rate)이란?\n\n해당 제품군 테마로 발행된 전체 릴스 중, 최근 8주 누적 평균 체급 이상의 트래픽을 돌파한 하이 타격 성공 비율입니다." width={260} /></th>
                  </tr>
                </thead>
                <tbody>
                  {productCatDataNow.map((row) => (
                    <tr key={row.key} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 8 }}><Swatch color={row.color} size={8} /> {row.label}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: C.ink, fontWeight: 'bold' }}>{fmt(row.salesCount)} 건</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{fmt(row.contentCount)} 개</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#3E8FB0', fontWeight: 600 }}>{fmt(row.reach)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: C.accent, fontWeight: 800 }}>{fmt(row.avgReach)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: row.hitRate >= 30 ? C.mint : C.ink }}>{row.hitRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 💡 [복구 완료] 제품군 7주 추이 개별 패널 격자망 전면 복구 장착 */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 14px', color: C.ink }}>📈 제품군별 최근 7주 성과 트렌드 추이</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
              {PRODUCT_CATS.filter(c => c.key !== 'otherCare').map(cat => (
                <div key={cat.key} style={{ background: C.panel, padding: 16, borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Swatch color={cat.color} size={9} /><span>{cat.label} 7주 종단 분석</span></div>
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={productTrendData} margin={{ top: 5, right: -5, left: -25, bottom: 0 }}>
                        <CartesianGrid stroke={C.border} vertical={false} /> <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 9 }} tickFormatter={(v) => v >= 10000 ? `${(v/10000).toFixed(0)}만` : v} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={v=>`${v}%`} />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey={`${cat.key}_reach`} name="총 도달수" fill={`${cat.color}25`} stroke={cat.color} strokeWidth={1} barSize={25} />
                        <Line yAxisId="right" type="monotone" dataKey={`${cat.key}_hitRate`} name="기획 타율(%)" stroke={C.ink} strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line yAxisId="left" type="monotone" dataKey={`${cat.key}_sales`} name="판매건수" stroke={cat.color} strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedView({ weekMeta, selectedWeek, feedContents, resolvers, onEditAnalysis }) {
  const [selectedCountry, setSelectedCountry] = useState('KR'); const weekContents = feedContents[selectedCountry]?.[selectedWeek] || [];
  const weeklyTotals = (country, week) => { const list = feedContents[country]?.[week] || []; const saves = list.reduce((s, c) => s + Number(c.saves || 0), 0); const shares = list.reduce((s, c) => s + Number(c.shares || 0), 0); const likes = list.reduce((s, c) => s + Number(c.likes || 0), 0); const comments = list.reduce((s, c) => s + Number(c.comments || 0), 0); const reach = list.reduce((s, c) => s + Number(c.reach || 0), 0); return { saves, shares, likes, comments, reach, contentsCount: list.length, engagement: likes + comments + saves + shares }; };
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4"> <h2>피드 콘텐츠 성과 리포트</h2>
        <div className="flex gap-1.5">
          {COUNTRIES.map((c) => <button key={c.key} onClick={() => setSelectedCountry(c.key)} className="flex items-center gap-1.5" style={{ padding: '6px 16px', borderRadius: 999, border: `2px solid ${c.key === selectedCountry ? c.color : C.border}`, background: c.key === selectedCountry ? c.color : '#fff', color: c.key === selectedCountry ? '#fff' : C.sub }}><span>{c.flag}</span>{c.label}</button>)}
        </div>
      </div>
      <SectionLabel color={FEED_METRICS.saves.color}>피드 핵심 지표</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-4">
        <HeroCard metricsMap={{ reach: { label: '도달', icon: Eye, color: '#3E8FB0' } }} mkey="reach" value={weeklyTotals(selectedCountry, selectedWeek).reach} delta={null} />
        <HeroCard metricsMap={{ engagement: { label: '참여', icon: Activity, color: '#6C5CE7' } }} mkey="engagement" value={weeklyTotals(selectedCountry, selectedWeek).engagement} delta={null} />
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <HeroCard metricsMap={{ likes: { label: '좋아요', icon: Heart, color: '#E8546B' } }} mkey="likes" value={weeklyTotals(selectedCountry, selectedWeek).likes} delta={null} />
        <HeroCard metricsMap={{ comments: { label: '댓글', icon: MessageCircle, color: '#4C6FBF' } }} mkey="comments" value={weeklyTotals(selectedCountry, selectedWeek).comments} delta={null} />
        <HeroCard metricsMap={FEED_METRICS} mkey="saves" value={weeklyTotals(selectedCountry, selectedWeek).saves} delta={null} />
        <HeroCard metricsMap={FEED_METRICS} mkey="shares" value={weeklyTotals(selectedCountry, selectedWeek).shares} delta={null} />
      </div>
      <div className="flex flex-col gap-2.5">
        {weekContents.length === 0 ? <div style={{ textAlign: 'center', color: C.sub, padding: '20px 0' }}>데이터가 없습니다.</div> : weekContents.map((item) => <ContentCard key={item.id} item={item} coreKeys={FEED_CORE} subKeys={FEED_SUB} metricsMap={FEED_METRICS} grade={resolvers[selectedCountry + '_feed'] ? resolvers[selectedCountry + '_feed'](item) : null} salesGrade={resolvers[selectedCountry + '_sales'] ? resolvers[selectedCountry + '_sales'](item) : null} onEditAnalysis={onEditAnalysis} />)}
      </div>
    </div>
  );
}

function HofReview({ item, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 2 }}>
      <button onClick={() => setOpen((o) => !o)} style={{ fontSize: 10.5, fontWeight: 700, color: accent, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>{open ? '▲ 가설·분석 접기' : '💡 가설·분석 보기'}</button>
      {open && (
        <div className="text-[11px] p-2 rounded-lg border flex flex-col gap-1 text-gray-700" style={{ background: '#FFFDF5', borderColor: '#EFE2C8' }}>
          <div>💡 <b>가설:</b> {item.hypothesis || '미입력'}</div>
          <div>📝 <b>분석:</b> {item.analysis || '미입력'}</div>
        </div>
      )}
    </div>
  );
}

function CombinedArchiveView({ allContents, weekMeta, resolvers }) {
  const [archiveCountry, setArchiveCountry] = useState('all'); const [filterMode, setFilterMode] = useState('all'); const [archType, setArchType] = useState('all'); const [archProd, setArchProd] = useState('all'); const [archSort, setArchSort] = useState('score');
  const [archFrom, setArchFrom] = useState(''); const [archTo, setArchTo] = useState('');
  const [archGrades, setArchGrades] = useState([]);
  const toggleGrade = (label) => setArchGrades((prev) => prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]);
  const weekKeys = weekMeta.map((w) => w.key);
  const [archiveSubTab, setArchiveSubTab] = useState('list'); 

  const hofAllTimeItems = useMemo(() => {
    let items = []; const scanCountries = archiveCountry === 'all' ? ['KR', 'US'] : [archiveCountry];
    scanCountries.forEach(cKey => { weekKeys.forEach(w => { (allContents[cKey]?.[w] || []).forEach(item => { if(item) items.push({...item, _week: w, _country: cKey}); }); }); });
    return [...items].sort((a, b) => contentScore(b) - contentScore(a)).slice(0, 8);
  }, [allContents, archiveCountry, weekKeys]);

  const hofMonthlyItems = useMemo(() => {
    let items = []; const scanCountries = archiveCountry === 'all' ? ['KR', 'US'] : [archiveCountry];
    scanCountries.forEach(cKey => { weekKeys.forEach(w => { (allContents[cKey]?.[w] || []).forEach(item => { if(item) items.push({...item, _week: w, _country: cKey}); }); }); });
    const now = new Date();
    return items.filter(item => {
      if(!item || !item.publishDate) return false;
      return (now - new Date(item.publishDate)) <= 30 * 86400000;
    }).sort((a, b) => contentScore(b) - contentScore(a)).slice(0, 4);
  }, [allContents, archiveCountry, weekKeys]);

  const archiveItems = useMemo(() => {
    let items = []; const scanCountries = archiveCountry === 'all' ? ['KR', 'US'] : [archiveCountry];
    scanCountries.forEach(cKey => { weekKeys.forEach(w => { (allContents[cKey]?.[w] || []).forEach(item => { if(item) items.push({...item, _week: w, _country: cKey}); }); }); });
    const now = new Date();
    
    return items.filter(item => {
      if (!item || !item.publishDate) return false;
      if (filterMode !== 'all') {
        const pDate = new Date(item.publishDate); if (isNaN(pDate.getTime())) return false;
        if (filterMode === '30' && (now - pDate) > 30 * 86400000) return false;
        if (filterMode === '90' && (now - pDate) > 90 * 86400000) return false;
        if (filterMode === 'year' && pDate.getFullYear() !== now.getFullYear()) return false;
        if (filterMode === 'custom') {
          var ds = String(item.publishDate).slice(0, 10);
          if (archFrom && ds < archFrom) return false;
          if (archTo && ds > archTo) return false;
        }
      }
      if (archType !== 'all') {
        const itemIsReel = isReel(item);
        if (archType === 'reel' && !itemIsReel) return false;
        if (archType === 'feed' && itemIsReel) return false;
      }
      if (archProd !== 'all') {
        const catToken = String(item.productCategory || '').trim();
        if (archProd === 'unclassified') { if (catToken !== '') return false; }
        else { if (catToken !== archProd) return false; }
      }
      if (archGrades.length) {
        const g = resolvers[item._country + '_all'] ? resolvers[item._country + '_all'](item) : null;
        if (!g || !archGrades.includes(g.label)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (archSort === 'reach') return Number(b.reach || 0) - Number(a.reach || 0);
      if (archSort === 'views') return Number(b.views || 0) - Number(a.views || 0);
      if (archSort === 'engagement') return Number(b.engagement || 0) - Number(a.engagement || 0);
      if (archSort === 'shares') return Number(b.shares || 0) - Number(a.shares || 0);
      if (archSort === 'comments') return Number(b.comments || 0) - Number(a.comments || 0);
      if (archSort === 'saves') return Number(b.saves || 0) - Number(a.saves || 0);
      if (archSort === 'likes') return Number(b.likes || 0) - Number(a.likes || 0);
      if (archSort === 'sales') return salesConvScore(b) - salesConvScore(a);
      return contentScore(b) - contentScore(a);
    });
  }, [allContents, archiveCountry, filterMode, archFrom, archTo, archType, archProd, archSort, archGrades, weekKeys, resolvers]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[{ key: 'list', label: '📋 아카이브 리스트 검색', on: C.accent, soft: C.accentSoft }, { key: 'hof', label: '🏆 역대 명예의 전당 (All-Time)', on: '#C9A24B', soft: '#FBF4E2' }].map((t) => {
          const active = archiveSubTab === t.key;
          return (
            <button key={t.key} onClick={() => setArchiveSubTab(t.key)} style={{ fontSize: 13.5, fontWeight: active ? 800 : 600, color: active ? '#fff' : C.sub, background: active ? t.on : '#fff', border: `1.5px solid ${active ? t.on : C.border}`, borderRadius: 10, cursor: 'pointer', padding: '9px 16px', boxShadow: active ? '0 2px 6px rgba(40,28,18,0.12)' : 'none', transition: 'all 0.15s' }}>{t.label}</button>
          );
        })}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 items-center"><span style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginRight: 8 }}>국가 필터</span>
            {[{ key: 'all', label: '🌐 전체보기' }, { key: 'KR', label: '🇰🇷 한국' }, { key: 'US', label: '🇺🇸 미국' }].map((c) => <button key={c.key} onClick={() => setArchiveCountry(c.key)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800, border: `1.5px solid ${archiveCountry === c.key ? C.ink : C.border}`, background: archiveCountry === c.key ? C.ink : '#fff', color: archiveCountry === c.key ? '#fff' : C.sub }}>{c.label}</button>)}
          </div>
          {archiveSubTab === 'list' && (
            <>
              <div className="flex flex-wrap gap-2 items-center"><span style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginRight: 8 }}>조회 기간</span>
                {[{ key: 'all', label: '전체' }, { key: '30', label: '최근 30일' }, { key: '90', label: '최근 90일' }, { key: 'year', label: '올해' }, { key: 'custom', label: '📅 직접 지정' }].map((btn) => <button key={btn.key} onClick={() => setFilterMode(btn.key)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: `1px solid ${filterMode === btn.key ? C.ink : C.border}`, background: filterMode === btn.key ? C.ink : '#fff', color: filterMode === btn.key ? '#fff' : C.sub }}>{btn.label}</button>)}
                {filterMode === 'custom' && (
                  <span className="flex items-center gap-1.5" style={{ marginLeft: 4 }}>
                    <input type="date" value={archFrom} onChange={(e) => setArchFrom(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 8px', fontSize: 12, background: '#fff', color: C.ink }} />
                    <span style={{ fontSize: 12, color: C.sub }}>~</span>
                    <input type="date" value={archTo} onChange={(e) => setArchTo(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 8px', fontSize: 12, background: '#fff', color: C.ink }} />
                    {(archFrom || archTo) && <button onClick={() => { setArchFrom(''); setArchTo(''); }} style={{ fontSize: 11, fontWeight: 700, padding: '5px 9px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.sub, cursor: 'pointer' }}>✕</button>}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 items-end pt-2 border-t border-dashed" style={{ borderColor: C.border }}>
                <label className="flex flex-col gap-1.5"><span style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>타입 필터</span>
                  <select value={archType} onChange={(e) => setArchType(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', width: 130 }}><option value="all">전체보기</option><option value="reel">릴스</option><option value="feed">피드</option></select>
                </label>
                <label className="flex flex-col gap-1.5"><span style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>제품군 필터</span>
                  <select value={archProd} onChange={(e) => setArchProd(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#fff', width: 140 }}><option value="all">전체보기</option><option value="unclassified">미분류</option>{PRODUCT_CATS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}</select>
                </label>
                <div className="flex flex-col gap-1.5 ml-auto"><span style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>정렬 순서</span>
                  <select value={archSort} onChange={(e) => setArchSort(e.target.value)} style={{ border: `1px solid ${C.ink}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, fontWeight: 700, background: '#fff' }}><option value="score">결합점수 (도달+참여)</option><option value="reach">도달순</option><option value="views">조회순</option><option value="engagement">참여순</option><option value="shares">공유순</option><option value="comments">댓글순</option><option value="saves">저장순</option><option value="likes">좋아요순</option><option value="sales">판매전환순</option></select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-dashed" style={{ borderColor: C.border }}>
                <span style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginRight: 4 }}>등급 필터 <span style={{ fontWeight: 500 }}>(복수선택)</span></span>
                {GRADE_SPECS.map((spec) => {
                  const on = archGrades.includes(spec.label);
                  return <button key={spec.label} onClick={() => toggleGrade(spec.label)} style={{ padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 800, cursor: 'pointer', border: `1.5px solid ${on ? spec.color : C.border}`, background: on ? spec.bg : '#fff', color: on ? spec.color : C.sub }}>{spec.label}</button>;
                })}
                {archGrades.length > 0 && <button onClick={() => setArchGrades([])} style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1px solid ${C.border}`, background: '#fff', color: C.sub }}>✕ 초기화</button>}
              </div>
            </>
          )}
        </div>
      </div>

      {archiveSubTab === 'hof' ? (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div style={{ background: '#FFFDF2', border: '2px solid #C9A24B', borderRadius: 16, padding: 18, boxShadow: '0 4px 10px rgba(201,162,75,0.06)' }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#9E782F', display: 'block', marginBottom: 12 }}>👑 All-Time 역대 최고 성과 레전드 기획 (TOP 8)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hofAllTimeItems.map((item, idx) => {
                const g = resolvers[item._country + '_all'] ? resolvers[item._country + '_all'](item) : null;
                return (
                  <div key={`hof-all-${item.id || idx}`} className="bg-white border rounded-xl p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: '#EBDCB9' }}>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold text-white" style={{ background: item._country === 'KR' ? '#E8546B' : '#3E6FE0' }}>{item._country === 'KR' ? 'KR' : 'US'} · {item._week}</span>
                        <div className="flex gap-1">{g && <span title={GRADE_TOOLTIP} style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px', background: g.bg, color: g.color, cursor: 'help' }}>{g.label} <span style={{opacity: 0.75}}>상위{g.pct}%</span></span>}{(() => { const sg = liftGrade(liftPct(headlineLiftWO(item))); return sg ? <span title="판매전환 등급 (발행후 7일 증감률)" style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px', background: sg.bg, color: sg.color }}>전환 {sg.label}</span> : null; })()}{Number(item.views || 0) >= 1000000 && <span style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px', background: '#FFF0F2', color: '#FF003C', border: '1px solid #FFCCD5' }}>🔥 1M</span>}</div>
                      </div>
                      <div className="flex gap-2 items-center mb-2">
                        {item.link ? ( <a href={item.link} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity flex-shrink-0"><ContentThumbnail item={item} /></a> ) : ( <ContentThumbnail item={item} /> )}
                        <a href={item.link || undefined} target="_blank" rel="noreferrer" className="text-[12.5px] font-bold text-gray-900 hover:text-blue-600 underline line-clamp-2 leading-snug">{item.title || '(제목 없음)'}</a>
                      </div>
                      <HofReview item={item} accent="#9E782F" />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 pt-2 border-t mt-2" style={{ borderColor: '#F4EEE8' }}>
                      <span>👁️ 도달 {fmt(item.reach)}</span><span style={{ color: '#C9A24B' }}>🔥 {fmt(contentScore(item))}점</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: '#FFF7F2', border: '2px solid #E08A2B', borderRadius: 16, padding: 18, boxShadow: '0 4px 10px rgba(224,138,43,0.06)' }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#C46D14', display: 'block', marginBottom: 12 }}>🔥 최근 30일 트렌드 대박 기획 (TOP 4)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hofMonthlyItems.length === 0 ? <div className="col-span-full text-center text-xs font-semibold text-gray-400 py-6">최근 30일 이내에 배포된 데이터 리포트가 아직 누적되지 않았습니다.</div> : hofMonthlyItems.map((item, idx) => {
                const g = resolvers[item._country + '_all'] ? resolvers[item._country + '_all'](item) : null;
                return (
                  <div key={`hof-mo-${item.id || idx}`} className="bg-white border rounded-xl p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: '#F5E1D3' }}>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold text-white" style={{ background: item._country === 'KR' ? '#E8546B' : '#3E6FE0' }}>{item._country === 'KR' ? 'KR' : 'US'} · {item._week}</span>
                        <div className="flex gap-1">{g && <span title={GRADE_TOOLTIP} style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px', background: g.bg, color: g.color, cursor: 'help' }}>{g.label} <span style={{opacity: 0.75}}>상위{g.pct}%</span></span>}{(() => { const sg = liftGrade(liftPct(headlineLiftWO(item))); return sg ? <span title="판매전환 등급 (발행후 7일 증감률)" style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px', background: sg.bg, color: sg.color }}>전환 {sg.label}</span> : null; })()}{Number(item.views || 0) >= 1000000 && <span style={{ fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px', background: '#FFF0F2', color: '#FF003C', border: '1px solid #FFCCD5' }}>🔥 1M</span>}</div>
                      </div>
                      <div className="flex gap-2 items-center mb-2">
                        {item.link ? ( <a href={item.link} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity flex-shrink-0"><ContentThumbnail item={item} /></a> ) : ( <ContentThumbnail item={item} /> )}
                        <a href={item.link || undefined} target="_blank" rel="noreferrer" className="text-[12.5px] font-bold text-gray-900 hover:text-blue-600 underline line-clamp-2 leading-snug">{item.title || '(제목 없음)'}</a>
                      </div>
                      <HofReview item={item} accent="#C46D14" />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 pt-2 border-t mt-2" style={{ borderColor: '#F4EEE8' }}>
                      <span>👁️ 도달 {fmt(item.reach)}</span><span style={{ color: '#E08A2B' }}>🔥 {fmt(contentScore(item))}점</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>아카이브 검색 결과: <span style={{ color: C.accent }}>{archiveItems.length}</span>건</div>
          <div className="flex flex-col gap-3">
            {archiveItems.map((item, index) => (
              <div key={`arc-${item._country}-${item._week}-${item.id || 0}-${index}`}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: item._country === 'KR' ? '#E8546B' : '#3E6FE0', display: 'inline-block', padding: '3px 10px', borderRadius: '8px 8px 0 0' }}>{item._country === 'KR' ? '🇰🇷 한국' : '🇺🇸 미국'} · {item._week}</div>
                <div style={{ marginTop: -1 }}><ContentCard item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} grade={resolvers[item._country + '_all'] ? resolvers[item._country + '_all'](item) : null} salesGrade={resolvers[item._country + '_sales'] ? resolvers[item._country + '_sales'](item) : null} /></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [view, setView] = useState('KR'); const [weekMeta, setWeekMeta] = useState(initialWeekMeta); const [selectedWeek, setSelectedWeek] = useState('W24');
  const [feedContents, setFeedContents] = useState(initialFeedContents); const [allContents, setAllContents] = useState(initialAllContents); const [accountMetrics, setAccountMetrics] = useState(initialAccountMetrics);
  const [dailyMetrics, setDailyMetrics] = useState({ KR: [], US: [] });
  const [loading, setLoading] = useState(true); const [showGasPanel, setShowGasPanel] = useState(false); const [pullStatus, setPullStatus] = useState('idle'); const [gasUrl, setGasUrl] = useState(''); const [gasInput, setGasInput] = useState(''); const [gasErr, setGasErr] = useState('');

  const syncToGAS = useCallback(async (payload) => { if (!gasUrl) return; try { await fetch(gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) }); } catch (e) {} }, [gasUrl]);
  const persist = useCallback(async (key, value, setter) => { setter(value); try { await storage.set(key, JSON.stringify(value)); } catch (e) {} }, []);

  const pools = useMemo(() => {
    const extract = (obj, cKey) => {
      const arr = []; if (!obj[cKey]) return [];
      Object.values(obj[cKey]).forEach(list => { if (Array.isArray(list)) list.forEach(item => { if(item && item.publishDate) arr.push(item); }); });
      if (!arr.length) return []; const times = arr.map(i => new Date(i.publishDate).getTime()).filter(t => !isNaN(t));
      if (!times.length) return arr; const maxTime = Math.max(...times);
      return arr.filter(i => (maxTime - new Date(i.publishDate).getTime()) <= 30 * 24 * 60 * 60 * 1000);
    };
    const krAll = extract(allContents, 'KR'), usAll = extract(allContents, 'US');
    return { KR_all: krAll, US_all: usAll, KR_feed: extract(feedContents, 'KR'), US_feed: extract(feedContents, 'US'), KR_sales: krAll.filter(i => salesConvScore(i) > 0), US_sales: usAll.filter(i => salesConvScore(i) > 0) };
  }, [allContents, feedContents]);

  // 💡 [엘리트 등급제] S급:3%, A+급:7%, A급:15%, B급:30%, C급:55% 적용 및 정확한 퍼센트(%) 라벨 계산
  const resolvers = useMemo(() => {
    const getGradeResolver = (itemsPool, scoreFn) => {
      const scores = itemsPool.map(i => scoreFn(i)).sort((a, b) => b - a);
      return (item) => {
        const score = scoreFn(item); if (!scores.length) return { label: 'C급', pct: 50, color: '#2E9E89', bg: '#EAF6F3' };
        const higher = scores.filter(s => s > score).length; const p = Math.max(1, Math.ceil(((higher + 1) / scores.length) * 100));
        if (p <= 3) return { label: 'S급', pct: p, color: '#E8546B', bg: '#FCE9EC' };
        if (p <= 7) return { label: 'A+급', pct: p, color: '#E08A2B', bg: '#FDF3E7' };
        if (p <= 15) return { label: 'A급', pct: p, color: '#6C5CE7', bg: '#F0EEFD' };
        if (p <= 30) return { label: 'B급', pct: p, color: '#3E8FB0', bg: '#EBF4F6' };
        if (p <= 55) return { label: 'C급', pct: p, color: '#2E9E89', bg: '#EAF6F3' };
        return { label: 'D급', pct: p, color: '#9A928A', bg: '#F5F5F5' };
      };
    };
    return { 
      KR_all: getGradeResolver(pools.KR_all, contentScore), 
      US_all: getGradeResolver(pools.US_all, contentScore), 
      KR_feed: getGradeResolver(pools.KR_feed, feedScore),
      US_feed: getGradeResolver(pools.US_feed, feedScore),
      KR_sales: getGradeResolver(pools.KR_sales, salesConvScore),
      US_sales: getGradeResolver(pools.US_sales, salesConvScore)
    };
  }, [pools]);

  useEffect(() => {
    (async () => {
      try {
        const [w, f, a, am, gasR, dm] = await Promise.all([ storage.get(STORAGE_WEEKS_KEY), storage.get(STORAGE_FEED_KEY), storage.get(STORAGE_ALL_KEY), storage.get(STORAGE_ACCOUNT_KEY), storage.get(STORAGE_GAS_URL_KEY), storage.get('dash2-daily-metrics-v4') ]);
        let meta = initialWeekMeta; if (w?.value) { meta = JSON.parse(w.value); setWeekMeta(meta); }
        const currentYearStr = "2026";
        if (a?.value) {
          const parsedAll = JSON.parse(a.value); const cleanAll = {};
          Object.keys(parsedAll).forEach(c => { cleanAll[c] = {}; Object.keys(parsedAll[c]).forEach(wk => { cleanAll[c][wk] = (parsedAll[c][wk] || []).filter(item => item && item.publishDate && String(item.publishDate).startsWith(currentYearStr)); }); });
          setAllContents(cleanAll);
        }
        if (f?.value) {
          const parsedFeed = JSON.parse(f.value); const cleanFeed = {};
          Object.keys(parsedFeed).forEach(c => { cleanFeed[c] = {}; Object.keys(parsedFeed[c]).forEach(wk => { cleanFeed[c][wk] = (parsedFeed[c][wk] || []).filter(item => item && item.publishDate && String(item.publishDate).startsWith(currentYearStr)); }); });
          setFeedContents(cleanFeed);
        }
        if (am?.value) setAccountMetrics(JSON.parse(am.value));
        if (dm?.value) setDailyMetrics(JSON.parse(dm.value));
        if (gasR?.value) { setGasUrl(gasR.value); setGasInput(gasR.value); }
        if (meta.length) setSelectedWeek(defaultWeekKey(meta));
      } catch (e) { console.error('load error', e); } finally { setLoading(false); }
    })();
  }, []);

  const pullFromGAS = useCallback(async () => {
    if (!gasUrl) return; setPullStatus('loading');
    try {
      const res = await fetch(`${gasUrl}?type=all&weeks=52`); const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'GAS 응답 오류');
      const gasWeeks = data.weekMeta || []; const weekNum = (k) => Number(String(k).replace(/[^0-9]/g, '')) || 0;
      const nextWeekMeta = [...gasWeeks.map((g) => ({ key: g.key, month: g.month }))].sort((a, b) => weekNum(a.key) - weekNum(b.key));
      const nextWeekKeys = nextWeekMeta.map((w) => w.key);
      setSelectedWeek((prev) => nextWeekKeys.includes(prev) ? prev : defaultWeekKey(nextWeekMeta));
      const nextAccount = { ...accountMetrics };
      COUNTRIES.forEach((c) => { const country = c.key; const gasByWeek = data.accountMetrics?.[country] || {}; nextAccount[country] = { ...(nextAccount[country] || {}) }; Object.keys(gasByWeek).forEach((wk) => { nextAccount[country][wk] = { ...(nextAccount[country][wk] || zeroAccount()), ...gasByWeek[wk] }; }); });
      
      const PRESERVE_FIELDS = ['hypothesis', 'analysis', 'salesImpact', 'salesReview']; const currentYearStr = "2026";
      const mergeList = (localList, freshList) => {
        if (!Array.isArray(freshList)) return []; const byLink = {}; (localList || []).forEach((it) => { if (it && it.link) byLink[it.link] = it; });
        return freshList.filter(fresh => fresh && fresh.publishDate && String(fresh.publishDate).startsWith(currentYearStr)).map((raw) => {
          const fresh = normalizeGasItem(raw);
          const existing = fresh.link ? byLink[fresh.link] : null; if (!existing) return fresh;
          const out = { ...fresh, id: existing.id };
          PRESERVE_FIELDS.forEach((f) => { out[f] = fresh[f] || existing[f] || ''; }); return out;
        });
      };

      const nextAll = {}; const nextFeed = {};
      COUNTRIES.forEach((c) => {
        const country = c.key; const freshAll = data.allContents?.[country] || {}; const freshFeed = data.feedContents?.[country] || {};
        nextAll[country] = {}; nextFeed[country] = {};
        nextWeekMeta.forEach((w) => {
          const wk = w.key;
          nextAll[country][wk] = mergeList(allContents[country]?.[wk] || [], freshAll[wk] || []);
          nextFeed[country][wk] = mergeList(feedContents[country]?.[wk] || [], freshFeed[wk] || []);
        });
      });

      const nextDaily = data.dailyMetrics || { KR: [], US: [] };

      await persist(STORAGE_WEEKS_KEY, nextWeekMeta, setWeekMeta); await persist(STORAGE_ACCOUNT_KEY, nextAccount, setAccountMetrics); await persist(STORAGE_ALL_KEY, nextAll, setAllContents); await persist(STORAGE_FEED_KEY, nextFeed, setFeedContents);
      await persist('dash2-daily-metrics-v4', nextDaily, setDailyMetrics);
      setPullStatus('done'); setTimeout(() => setPullStatus('idle'), 4000);
    } catch (e) { setPullStatus('error'); setGasErr(e.message); }
  }, [gasUrl, accountMetrics, allContents, feedContents, persist]);

  const saveGasUrl = async () => { const url = gasInput.trim(); setGasUrl(url); try { await storage.set(STORAGE_GAS_URL_KEY, url); } catch (e) {} setShowGasPanel(false); };

  // #6 리뷰(가설/분석/판매전환) 양방향 키인: 즉시 로컬 반영(낙관적) + GAS 저장(link 기준 누적)
  const handleEditAnalysis = useCallback((link, field, value) => {
    if (!link) return;
    const applyByLink = (prev) => {
      const next = { ...prev };
      COUNTRIES.forEach((c) => {
        const country = c.key; if (!next[country]) return;
        next[country] = { ...next[country] };
        Object.keys(next[country]).forEach((wk) => {
          next[country][wk] = (next[country][wk] || []).map((it) => (it && it.link === link ? { ...it, [field]: value } : it));
        });
      });
      return next;
    };
    setAllContents((prev) => { const next = applyByLink(prev); try { storage.set(STORAGE_ALL_KEY, JSON.stringify(next)); } catch (e) {} return next; });
    setFeedContents((prev) => { const next = applyByLink(prev); try { storage.set(STORAGE_FEED_KEY, JSON.stringify(next)); } catch (e) {} return next; });
    syncToGAS({ type: 'analysis', field, ref: link, value });
  }, [syncToGAS]);

  // 저장 즉시 + 자동 새로고침: 다른 접속자 입력이 45초마다 반영 (탭이 보일 때만)
  useEffect(() => {
    if (!gasUrl) return;
    const id = setInterval(() => { if (typeof document === 'undefined' || document.visibilityState === 'visible') pullFromGAS(); }, 45000);
    return () => clearInterval(id);
  }, [gasUrl, pullFromGAS]);
  if (loading) return <div className="flex items-center justify-center h-48 font-bold text-gray-500">대시보드 로딩 중...</div>;
  const weekKeys = weekMeta.map(w => w.key); const endIdx = weekKeys.indexOf(selectedWeek); const recentWeekKeys = weekKeys.slice(-7);

  return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: '100vh', padding: '24px 20px', color: C.ink }}>
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1"><Swatch color={C.accent} size={10} /><span style={{ fontSize: 12, color: C.sub, fontWeight: 700 }}>오호라 · 성과 대시보드</span></div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>한/미 SNS 성과 대시보드</h1>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {recentWeekKeys.map((w) => <button key={w} title={weekRangeLabel(w, weekMeta)} onClick={() => setSelectedWeek(w)} style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: `1px solid ${w === selectedWeek ? C.accent : C.border}`, background: w === selectedWeek ? C.accent : '#fff', color: w === selectedWeek ? '#fff' : C.sub, cursor: 'pointer' }}>{w}</button>)}
          </div>
        </div>
        <div className="flex gap-1.5 mb-6">
          {NAV.map((n) => { const Icon = n.icon; const active = view === n.key; return ( <button key={n.key} onClick={() => setView(n.key)} className="flex items-center gap-1.5" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1px solid ${active ? C.ink : C.border}`, background: active ? C.ink : '#fff', color: active ? '#fff' : C.ink }}><Icon size={14} /> {n.label}</button> ); })}
        </div>

        {showGasPanel && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: SHADOW }}>
            <div className="flex gap-2 items-end">
              <label className="flex flex-col gap-1 flex-1"><span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>Apps Script 웹 앱 URL</span><input type="text" value={gasInput} onChange={(e) => setGasInput(e.target.value)} placeholder="https://script.google.com/macros/s/..." style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, width: '100%' }} /></label>
              <button onClick={saveGasUrl} style={{ padding: '8px 16px', borderRadius: 8, background: C.mint, color: '#fff', fontSize: 13, fontWeight: 700, height: 38 }}>저장</button>
            </div>
            {gasUrl && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                <button onClick={pullFromGAS} disabled={pullStatus === 'loading'} className="flex items-center gap-1.5" style={{ padding: '8px 18px', borderRadius: 8, background: C.ink, color: '#fff', fontSize: 13, fontWeight: 700 }}>{pullStatus === 'loading' ? '🔄 데이터 불러오는 중...' : '구글시트에서 불러오기'}</button>
                {pullStatus === 'done' && <span className="text-xs text-green-600 font-bold">✓ 동기화 완료</span>}
                {pullStatus === 'error' && <span className="text-xs text-red-500 font-bold">⚠️ 실패: {gasErr}</span>}
              </div>
            )}
          </div>
        )}

        {(view === 'KR' || view === 'US') && <CountryView countryKey={view} weekMeta={weekMeta} selectedWeek={selectedWeek} displayWeeks={weekKeys.slice(Math.max(0, endIdx - 6), endIdx + 1)} accountMetrics={accountMetrics} allContents={allContents} dailyMetrics={dailyMetrics} onAllContentsChange={(next) => persist(STORAGE_ALL_KEY, next, setAllContents)} gasUrl={gasUrl} resolvers={resolvers} onEditAnalysis={handleEditAnalysis} />}
        {view === 'feed' && <FeedView weekMeta={weekMeta} selectedWeek={selectedWeek} feedContents={feedContents} resolvers={resolvers} onEditAnalysis={handleEditAnalysis} />}
        {view === 'archive' && <CombinedArchiveView allContents={allContents} weekMeta={weekMeta} resolvers={resolvers} />}

        <div style={{ fontSize: 12, color: C.subLite, textAlign: 'center', marginTop: 40, padding: '24px 0', borderTop: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-center gap-1.5 mb-2"><AlertCircle size={14} color={C.accent} /><span style={{ fontWeight: 800, color: C.ink }}>데이터 오류나 누락이 있으면 양지은에게 문의하세요.</span></div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <button onClick={() => setShowGasPanel(!showGasPanel)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.sub, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}><Settings size={14} /> 연동 설정</button>
            <a href="https://docs.google.com/spreadsheets/d/1r1yUxPxvyvZILVhUI0YRamK3Ue0GAHERkerbY5uczLk" target="_blank" rel="noreferrer" className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">🔗 원본 스프레드시트 바로가기 ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}