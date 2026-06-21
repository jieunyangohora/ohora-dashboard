import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, AreaChart, Area, LabelList, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import {
  Bookmark, Share2, UserCheck, Eye, Heart, MessageCircle, UserPlus,
  Plus, Trash2, Pencil, Check, X, ExternalLink, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Minus, Loader2, ClipboardPaste, ArrowDownToLine,
  NotebookPen, BookOpen, Activity, PlayCircle, MousePointerClick, LayoutDashboard,
  Globe, Rss, Rocket, Lightbulb, Sparkles, Link, CheckCircle, AlertCircle, RefreshCw,
  Settings, Target, Leaf, FileStack,
} from 'lucide-react';

// ============================================================
// 디자인 토큰 — 대비·위계 강화 버전
//  · 텍스트를 진하게(ink/sub), 보더를 살짝 또렷하게, 카드에 옅은 그림자
//  · 색은 작은 스와치/아이콘에만, 큰 면적은 비워 숫자가 주인공이 되게
// ============================================================
const C = {
  bg: '#F4EEE8',          // 베이지 배경 (살짝 따뜻하게)
  card: '#FFFFFF',
  panel: '#FBF7F3',       // 섹션 묶음용 옅은 패널
  ink: '#241F1B',         // 본문/숫자 — 진하게
  sub: '#6B6259',         // 보조 텍스트 — 기존보다 진하게(가독성↑)
  subLite: '#9A928A',     // 아주 약한 캡션용
  border: '#E7DCD3',
  borderStrong: '#D9CABB',
  accent: '#E8546B',
  accentSoft: '#FCE9EC',
  mint: '#2E9E89',        // 채도 ↑
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

// ============================================================
// 지표 메타
// ============================================================
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
  achieveRate: { label: '달성률', icon: Check, color: '#6C5CE7' },
  salesAchieveRate: { label: '매출 달성률', icon: Check, color: '#6C5CE7' },
  inflowAchieveRate: { label: '유입 달성률', icon: Check, color: '#6C5CE7' },
  pace: { label: 'Pace', icon: Activity, color: '#E08A2B' },
};
// 입력 테이블에 노출되는 계정 지표 키 (조회 가능한 전체 지표)
const ACCOUNT_KEYS = ['reach', 'organicReach', 'views', 'organicViews', 'engagement', 'newFollowers', 'followers', 'contentsCount', 'profileVisits', 'websiteClicks'];
const BIZ_KEYS = ['sales', 'inflow', 'salesAchieveRate', 'inflowAchieveRate', 'pace'];
const COUNTRY_BIZ_KEYS = ['sales', 'inflow'];
const ALL_ACCOUNT_KEYS = [...BIZ_KEYS, ...ACCOUNT_KEYS];

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

// 도달/조회수 ↔ 오가닉 짝
const ORGANIC_PAIR = { reach: 'organicReach', views: 'organicViews' };

// ============================================================
// 주차 메타
// ============================================================
const initialWeekMeta = [
  { key: 'W18', month: '2026-05' },
  { key: 'W19', month: '2026-05' },
  { key: 'W20', month: '2026-05' },
  { key: 'W21', month: '2026-05' },
  { key: 'W22', month: '2026-05' },
  { key: 'W23', month: '2026-06' },
  { key: 'W24', month: '2026-06' },
];

// ============================================================
// 헬퍼
// ============================================================
const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const fmtK = (n) => { const v = Number(n || 0); if (v >= 1000000) return `${(v/1000000).toFixed(1)}M`; if (v >= 10000) return `${(v/1000).toFixed(0)}K`; if (v >= 1000) return `${(v/1000).toFixed(1)}K`; return String(v); };
const pct = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
const fmtMetric = (mkey, value) => {
  if (mkey === 'sales') return `₩${fmt(value)}`;
  if (mkey === 'achieveRate' || mkey === 'salesAchieveRate' || mkey === 'inflowAchieveRate' || mkey === 'pace' || mkey === 'hitRate') return `${Number(value || 0).toFixed(0)}%`;
  return fmt(value);
};
const numFrom = (v) => {
  const n = Number(String(v ?? '').replace(/[,\s%]/g, ''));
  return isFinite(n) ? n : 0;
};
const isReel = (item) => /\/reel[s]?\//.test(item.link || '');
// 도달수 + 참여수 결합 점수 — 상/하위 콘텐츠 분류, 고성과 TOP3 산출 기준
const combinedScore = (item) => Number(item.reach || 0) + Number(item.engagement || 0);
const fmtMonth = (m) => {
  if (!m) return '';
  const [y, mo] = m.split('-');
  return `${y}.${mo}`;
};
const metricLabels = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.label]));

const blankItem = (id, title, metricKeys) => {
  const base = {
    id, title, thumbnail: '', link: '',
    hypothesis: '', analysis: '', salesImpact: '',
    productCategory: '', productNames: [], publishDate: '',
    initialScore: 0, w1Score: 0, w2Score: 0, w3Score: 0, w4Score: 0, finalScore: 0,
  };
  metricKeys.forEach((k) => { base[k] = 0; });
  return base;
};
const FEED_KEYS = [...FEED_CORE, ...FEED_SUB];
const CONTENT_KEYS = [...CONTENT_CORE, ...CONTENT_SUB];

const lastThreeMonthsWeekKeys = (weekMeta, selectedWeek) => {
  const months = [];
  weekMeta.forEach((w) => { if (!months.includes(w.month)) months.push(w.month); });
  const curMonth = weekMeta.find((w) => w.key === selectedWeek)?.month;
  const idx = months.indexOf(curMonth);
  const last3 = idx >= 0 ? months.slice(Math.max(0, idx - 2), idx + 1) : months.slice(-3);
  return weekMeta.filter((w) => last3.includes(w.month)).map((w) => w.key);
};
const lastNWeeksKeys = (weekMeta, selectedWeek, n) => {
  const keys = weekMeta.map((w) => w.key);
  const idx = keys.indexOf(selectedWeek);
  if (idx < 0) return keys.slice(-n);
  return keys.slice(Math.max(0, idx - n + 1), idx + 1);
};

const isRetroGrowth = (item, weekKeys, selectedWeek) => {
  const diff = weekKeys.indexOf(selectedWeek) - weekKeys.indexOf(item.week);
  if (diff < 2) return null;
  const initial = Number(item.initialScore || 0);
  const final = Number(item.finalScore || 0);
  if (initial <= 0) return null;
  const growth = ((final - initial) / initial) * 100;
  if (growth < 100 || final < 5000) return null;
  return growth;
};

// ============================================================
// 초기 데이터
// ============================================================
const initialFeedContents = {
  KR: {
    W20: [
      { ...blankItem(1, 'Whispers of Early Summer 출시 안내', FEED_KEYS), link: 'https://www.instagram.com/p/DYL5WMYgaNM/', saves: 2, shares: 0, profileActivity: 0, reach: 2434, likes: 32, comments: 0, follows: 0 },
      { ...blankItem(2, '올 여름 당도 100, 제철 과일맛 네일 zip', FEED_KEYS), link: 'https://www.instagram.com/p/DYOFuzTmTxF/', saves: 252, shares: 131, profileActivity: 0, reach: 13087, likes: 259, comments: 0, follows: 1 },
      { ...blankItem(3, 'Choose your fresh vibe (과일 컬러)', FEED_KEYS), link: 'https://www.instagram.com/p/DYTnouFGT1J/', saves: 4, shares: 1, profileActivity: 0, reach: 3612, likes: 45, comments: 0, follows: 0 },
      { ...blankItem(4, 'D-2 fresh & glazed (강화제 티저)', FEED_KEYS), link: 'https://www.instagram.com/p/DYYjfyrmauj/', saves: 12, shares: 0, profileActivity: 0, reach: 4025, likes: 91, comments: 2, follows: 1 },
    ],
    W21: [
      { ...blankItem(5, 'Pick your daily fruit', FEED_KEYS), link: 'https://www.instagram.com/p/DYjEZ97GcKb/', saves: 14, shares: 7, profileActivity: 0, reach: 2196, likes: 76, comments: 0, follows: 0 },
      { ...blankItem(6, 'Find Your Summer Pink', FEED_KEYS), link: 'https://www.instagram.com/p/DYoOEZHmS8D/', saves: 78, shares: 16, profileActivity: 0, reach: 5162, likes: 125, comments: 32, follows: 0 },
      { ...blankItem(7, '과즙 가득 머금은 여름 원컬러 네일 모음', FEED_KEYS), link: 'https://www.instagram.com/p/DYqzGZpGTzz/', saves: 3650, shares: 1760, profileActivity: 0, reach: 89203, likes: 2557, comments: 70, follows: 53 },
    ],
    W22: [
      { ...blankItem(8, 'Pick Your Favorite Summer Mood', FEED_KEYS), link: 'https://www.instagram.com/p/DYvutN2E-Y2/', saves: 46, shares: 19, profileActivity: 0, reach: 14527, likes: 97, comments: 1, follows: 0 },
      { ...blankItem(9, "Which one's your vibe?", FEED_KEYS), link: 'https://www.instagram.com/p/DYyhLTKGUWW/', saves: 9, shares: 0, profileActivity: 0, reach: 3720, likes: 55, comments: 0, follows: 0 },
      { ...blankItem(10, '차분한 일상 속, 특별한 기분 전환', FEED_KEYS), link: 'https://www.instagram.com/p/DY6PlUXGYWq/', saves: 9, shares: 6, profileActivity: 0, reach: 1892, likes: 52, comments: 0, follows: 0 },
      { ...blankItem(11, 'BEST 리얼젤팁 모음', FEED_KEYS), link: 'https://www.instagram.com/p/DY8mr7NGdFA/', saves: 13, shares: 15, profileActivity: 0, reach: 3164, likes: 66, comments: 0, follows: 0 },
    ],
    W23: [
      { ...blankItem(12, '글레이즈드 강화제 (허니듀+골드 컨페티)', FEED_KEYS), link: 'https://www.instagram.com/p/DZG50R1GTph/', saves: 10, shares: 1, profileActivity: 0, reach: 2258, likes: 47, comments: 0, follows: 0 },
      { ...blankItem(13, '아이스크림맛 페디 모음 zip', FEED_KEYS), link: 'https://www.instagram.com/p/DZMmPtVGetj/', saves: 311, shares: 82, profileActivity: 0, reach: 18936, likes: 221, comments: 1, follows: 4 },
    ],
    W24: [],
  },
  US: {
    W20: [],
    W21: [
      { ...blankItem(201, 'Sunset cocktails to coastal drives', FEED_KEYS), link: 'https://www.instagram.com/p/DYvaFa-mbZN/', saves: 31, shares: 0, profileActivity: 0, reach: 5843, likes: 96, comments: 3, follows: 0 },
    ],
    W22: [
      { ...blankItem(202, 'Grapefruit, Cherry, Guava, or Honeydew?', FEED_KEYS), link: 'https://www.instagram.com/p/DY2mJzpmSnT/', saves: 43, shares: 0, profileActivity: 0, reach: 5130, likes: 111, comments: 7, follows: 0 },
      { ...blankItem(203, 'Summermaxing, but make it nails ☀️', FEED_KEYS), link: 'https://www.instagram.com/p/DY5K8DoGbKc/', saves: 11, shares: 0, profileActivity: 0, reach: 4913, likes: 61, comments: 4, follows: 0 },
    ],
    W23: [
      { ...blankItem(204, 'Playful or Sleek? 🍋', FEED_KEYS), link: 'https://www.instagram.com/p/DZA5SBWmeRj/', saves: 29, shares: 0, profileActivity: 0, reach: 5493, likes: 120, comments: 5, follows: 0 },
    ],
    W24: [],
  },
};

const ac = (id, title, link, week, reach, likes, comments, saves, shares, initialScore = 0, finalScore = 0) => ({
  ...blankItem(id, title, CONTENT_KEYS), link, week,
  reach, views: 0, engagement: likes + comments + saves + shares, likes, comments, saves, shares,
  initialScore, finalScore,
});
const initialAllContents = {
  KR: {
    W20: [
      ac(1, 'Whispers of Early Summer 출시 안내', 'https://www.instagram.com/p/DYL5WMYgaNM/', 'W20', 2434, 32, 0, 2, 0),
      ac(2, '여름을 담은 싱그러운 과일 네일 디자인', 'https://www.instagram.com/reel/DYMN8uLy0aE/', 'W20', 4924, 65, 6, 17, 4),
      ac(3, '올 여름 당도 100, 제철 과일맛 네일 zip', 'https://www.instagram.com/p/DYOFuzTmTxF/', 'W20', 13087, 259, 0, 252, 131),
      ac(4, '오호라 리얼젤팁 사이즈 차이 비교', 'https://www.instagram.com/reel/DYQqECNuIHG/', 'W20', 25300, 239, 0, 80, 130),
      ac(5, '예뻐서 산 네일팁, 유지력이 가장 중요', 'https://www.instagram.com/reel/DYRUCtBEnty/', 'W20', 26707, 267, 13, 98, 71),
      ac(6, 'Choose your fresh vibe (과일 컬러)', 'https://www.instagram.com/p/DYTnouFGT1J/', 'W20', 3612, 45, 0, 4, 1),
      ac(7, '상큼한 토마토 네일', 'https://www.instagram.com/reel/DYT8VIuymyq/', 'W20', 2696, 44, 4, 5, 8),
      ac(8, '[#EVENT] NEW 강화제 오픈 전 이벤트', 'https://www.instagram.com/reel/DYWX8gPuEUw/', 'W20', 5345, 172, 44, 40, 42),
      ac(9, '딸기맛 도트네일', 'https://www.instagram.com/reel/DYWhBeGyBbL/', 'W20', 14706, 144, 6, 23, 12),
      ac(10, 'D-2 fresh & glazed (강화제 티저)', 'https://www.instagram.com/p/DYYjfyrmauj/', 'W20', 4025, 91, 2, 12, 0),
      ac(11, '[D-2] Hello, My Summer', 'https://www.instagram.com/reel/DYYxTQeyA4J/', 'W20', 2667, 40, 0, 3, 0),
      ac(12, '파데 네일 - 얼그레이 밀크시럽 강화제', 'https://www.instagram.com/reel/DYbIVlHFTR0/', 'W20', 12281, 86, 45, 50, 20),
    ],
    W21: [
      ac(13, 'NEW 탱글광 시럽네일 강화제 런칭', 'https://www.instagram.com/reel/DYd7ZytSPDd/', 'W21', 3090, 51, 0, 6, 7),
      ac(14, '여름 과일 컬러 발색 모음 (글레이즈드 강화제)', 'https://www.instagram.com/reels/DYg0OiayhSE/', 'W21', 206324, 5590, 127, 1625, 1223, 80000, 206324),
      ac(15, 'Pick your daily fruit', 'https://www.instagram.com/p/DYjEZ97GcKb/', 'W21', 2196, 76, 0, 14, 7),
      ac(16, '샴페인 글리터 강화제', 'https://www.instagram.com/reels/DYjZCvpScF8/', 'W21', 13765, 603, 23, 205, 34),
      ac(17, '전설의 신민아네일 따라하기 (포도)', 'https://www.instagram.com/reels/DYlxxLiOk3k/', 'W21', 67249, 172, 29, 292, 109),
      ac(18, '네일팁 유지력 높이는 TIP', 'https://www.instagram.com/reels/DYl906dSRKq/', 'W21', 41892, 224, 109, 167, 98),
      ac(19, 'Find Your Summer Pink', 'https://www.instagram.com/p/DYoOEZHmS8D/', 'W21', 5162, 125, 32, 78, 16),
      ac(20, 'NEW 글레이즈드 강화제 컬러 모음.zip', 'https://www.instagram.com/reel/DYojidUAXcT/', 'W21', 15698, 273, 0, 198, 93),
      ac(21, '올 여름 트렌드, 포도 네일 (글레이즈드)', 'https://www.instagram.com/reel/DYqlFsMBlAH/', 'W21', 378946, 21874, 22, 3827, 1880, 150000, 378946),
      ac(22, '과즙 가득 머금은 여름 원컬러 네일 모음', 'https://www.instagram.com/p/DYqzGZpGTzz/', 'W21', 89203, 2557, 70, 3650, 1760),
    ],
    W22: [
      ac(23, '강화제 올바르게 바르는 튜토리얼', 'https://www.instagram.com/reels/DYtJ82dSqyS/', 'W22', 59738, 462, 5, 284, 170),
      ac(24, 'Pick Your Favorite Summer Mood', 'https://www.instagram.com/p/DYvutN2E-Y2/', 'W22', 14527, 97, 1, 46, 19),
      ac(25, '강화제 콧수별 발색 비교 (자몽)', 'https://www.instagram.com/reel/DYwNunpFs4A/', 'W22', 72531, 332, 24, 155, 103),
      ac(26, "Which one's your vibe?", 'https://www.instagram.com/p/DYyhLTKGUWW/', 'W22', 3720, 55, 0, 9, 0),
      ac(27, '나만 알고 싶었던 네일관리 꿀템 TOP3', 'https://www.instagram.com/reel/DYy9bosQhKx/', 'W22', 19004, 225, 21, 274, 128),
      ac(28, '형광등 네일 (포도 컬러 믹스)', 'https://www.instagram.com/reel/DY1amFGgtHU/', 'W22', 16820, 211, 7, 80, 48),
      ac(29, '강화제 컬러 믹스 (허니듀+샴페인)', 'https://www.instagram.com/reel/DY4JW2nNqhJ/', 'W22', 98453, 3982, 51, 1398, 451),
      ac(30, '차분한 일상 속, 특별한 기분 전환', 'https://www.instagram.com/p/DY6PlUXGYWq/', 'W22', 1892, 52, 0, 9, 6),
      ac(31, '아이돌st 여름 네일 따라하기 (블루베리)', 'https://www.instagram.com/reel/DY6oowRxSsn/', 'W22', 68973, 970, 52, 275, 245),
      ac(32, 'BEST 리얼젤팁 모음', 'https://www.instagram.com/p/DY8mr7NGdFA/', 'W22', 3164, 66, 0, 13, 15),
      ac(33, '골드 컨페티 발색 공개', 'https://www.instagram.com/reel/DY8v2k3BMEs/', 'W22', 179031, 3875, 31, 756, 268, 80000, 179031),
    ],
    W23: [
      ac(34, '오호라 강화제, 몇 번 쓸 수 있을까 (구아바)', 'https://www.instagram.com/reel/DY_LcyuylLT/', 'W23', 37178, 578, 12, 100, 86),
      ac(35, 'POV: 여행 전 페디 (체리 젤리)', 'https://www.instagram.com/reel/DZCSmdvSFYA/', 'W23', 22371, 187, 14, 58, 21),
      ac(36, '강화제 컬러 비교 한눈에 보기', 'https://www.instagram.com/reel/DZE_eV6xjbH/', 'W23', 912054, 55456, 39, 10928, 8531),
      ac(37, '글레이즈드 강화제 (허니듀+골드 컨페티)', 'https://www.instagram.com/p/DZG50R1GTph/', 'W23', 2258, 47, 0, 10, 1),
      ac(38, '자몽주st 네일 강화제 (자몽 글레이즈드)', 'https://www.instagram.com/reel/DZHHl3IykrA/', 'W23', 8954, 381, 19, 57, 29),
      ac(39, '페디의 계절이 돌아왔다 (자몽 젤리)', 'https://www.instagram.com/reel/DZKBAniS-Yy/', 'W23', 7766, 113, 7, 27, 14),
      ac(40, '여름에 찰떡인 구아바 시럽네일', 'https://www.instagram.com/reel/DZMWUoDMkGr/', 'W23', 308777, 9740, 52, 1148, 1421),
      ac(41, '아이스크림맛 페디 모음 zip', 'https://www.instagram.com/p/DZMmPtVGetj/', 'W23', 18936, 221, 1, 311, 82),
      ac(42, '에스파 윈터st 블루 마그넷 네일', 'https://www.instagram.com/reel/DZO17NBy2QP/', 'W23', 180044, 3619, 59, 630, 584),
    ],
    W24: [
      ac(43, 'POV: 네일팁 붙이고 손만 보게 되는 기분', 'https://www.instagram.com/reel/DZRazOxyHTQ/', 'W24', 64662, 1284, 17, 39, 209),
      ac(44, '시럽 강화제로 휴식기 케어 (구아바)', 'https://www.instagram.com/reel/DZUTow-PoKP/', 'W24', 150081, 1328, 72, 263, 387),
      ac(45, '시원한 블루베리맛 페디', 'https://www.instagram.com/reel/DZW3pKys7g1/', 'W24', 9973, 137, 11, 61, 16),
      ac(46, '강화제 인기 컬러 3대장 비교', 'https://www.instagram.com/reel/DZZsGuaB8cB/', 'W24', 27855, 1444, 4, 472, 274),
      ac(47, '수박 네일 여리하고 시원한', 'https://www.instagram.com/reel/DZcDWNABbjx/', 'W24', 44578, 2830, 6, 337, 199),
      ac(48, '쌩얼네일 직장인/학생 추천템', 'https://www.instagram.com/reel/DZenW8oyQd2/', 'W24', 119028, 1848, 324, 1233, 1812),
    ],
  },
  US: {
    W20: [],
    W21: [
      ac(101, 'How to make glazed nails look juicy', 'https://www.instagram.com/reel/DYr1RFtipyM/', 'W21', 25240, 560, 1, 55, 17),
      ac(102, 'NEW glazed shades just dropped', 'https://www.instagram.com/reel/DYqON2ugQM4/', 'W21', 15902, 320, 5, 72, 25),
      ac(103, 'Tropical summer nails N Aloha Dream', 'https://www.instagram.com/reel/DYuZ-lfEqoe/', 'W21', 17240, 421, 0, 18, 9),
      ac(104, 'The color payoff 1 vs 2 coats', 'https://www.instagram.com/reel/DYszAoXDDz_/', 'W21', 8044, 136, 0, 21, 10),
    ],
    W22: [
      ac(105, 'Starfish nails N Tropical Starfish ☀️', 'https://www.instagram.com/reel/DYyC94HJa9h/', 'W22', 1501817, 43163, 16, 1984, 2150, 500000, 1501817),
      ac(106, 'Comment "LINK" — N Y2K Muse', 'https://www.instagram.com/reel/DY5x618p3za/', 'W22', 4077873, 105844, 130, 5981, 6553, 1000000, 4077873),
      ac(107, 'look at these grape shades 🍇', 'https://www.instagram.com/reel/DY1pgDfprDG/', 'W22', 394252, 15073, 9, 2671, 1313, 80000, 394252),
      ac(108, 'pink summer nails at home N Strawberry Milk', 'https://www.instagram.com/reel/DY6ViD2JWG2/', 'W22', 45917, 861, 0, 23, 27),
      ac(109, 'Watch the color payoff build (Cherry)', 'https://www.instagram.com/reel/DYyhLhtJQvs/', 'W22', 32175, 520, 1, 33, 11),
      ac(110, 'ocean nails N Ocean Stars', 'https://www.instagram.com/reel/DY4tS6ojdeu/', 'W22', 44316, 709, 1, 24, 12),
      ac(111, 'stop ripping your press-ons off 😭', 'https://www.instagram.com/reel/DY0hb6uDOKm/', 'W22', 30344, 257, 2, 25, 10),
      ac(112, 'No makeup, make up nails (Honeydew)', 'https://www.instagram.com/reel/DYvX6QgAQpc/', 'W22', 27140, 860, 6, 128, 33),
    ],
    W23: [
      ac(113, 'pink summer nail essential 🌸 Strawberry Milk', 'https://www.instagram.com/reel/DZEFkrOp2Fl/', 'W23', 459651, 6549, 12, 374, 521, 100000, 459651),
      ac(114, 'cool girl nails frrr — N Y2K Muse', 'https://www.instagram.com/reel/DZJNlq9J9mc/', 'W23', 540775, 11491, 10, 328, 328, 100000, 540775),
      ac(115, 'Want a no gap press-on? NP Blush Pink', 'https://www.instagram.com/reel/DZFHv3kJlMq/', 'W23', 152952, 4980, 3, 111, 20),
      ac(116, 'removal competition: glue vs ours', 'https://www.instagram.com/reel/DZLskdJm8zm/', 'W23', 58567, 352, 6, 31, 6),
      ac(117, 'Butter yellow nails 💛 N Butter Veil', 'https://www.instagram.com/reel/DZKuyyfkhdl/', 'W23', 23005, 508, 3, 53, 24),
      ac(118, 'berry jelly vibes 🍒 N Berry Jelly', 'https://www.instagram.com/reel/DZOYCpOpllF/', 'W23', 31968, 347, 1, 6, 17),
      ac(119, 'Jelly nails for summer 🌸 N Berry Jelly', 'https://www.instagram.com/reel/DZP4eAOHJ5p/', 'W23', 19025, 309, 1, 15, 3),
      ac(120, 'Meet the new colors — Glazed Nail Care Polish', 'https://www.instagram.com/reel/DZQ2J8KgLXV/', 'W23', 16767, 394, 6, 179, 62),
      ac(121, 'purple nail inspo 💜 N Plum Veil', 'https://www.instagram.com/reel/DZFlapZgYiz/', 'W23', 34344, 665, 2, 22, 13),
      ac(122, 'One item, two moods 🍊 Grapefruit', 'https://www.instagram.com/reel/DZORaXMAgNV/', 'W23', 12489, 324, 3, 48, 12),
    ],
    W24: [
      ac(123, 'Common nail glue VS primer — gel press-ons', 'https://www.instagram.com/reel/DZXFqAlpufZ/', 'W24', 754185, 21461, 19, 332, 136, 100000, 754185),
      ac(124, 'bow girl nails in 10 mins 🎀 N Sweet Bow', 'https://www.instagram.com/reel/DZTlV5Fp_sM/', 'W24', 334981, 3823, 4, 91, 72, 50000, 334981),
      ac(125, 'cat-eye nails are calling 🐱 N Ocean Stars', 'https://www.instagram.com/reel/DZbRFf5pCtX/', 'W24', 267921, 6340, 2, 93, 84, 30000, 267921),
      ac(126, 'Custard yellow nails 💛 N Butter Veil', 'https://www.instagram.com/reel/DZWFSf1pvFj/', 'W24', 195381, 2205, 2, 69, 71),
      ac(127, '"Primer is bad quality" … still think so? 👀', 'https://www.instagram.com/reel/DZYkkmnjRQU/', 'W24', 42823, 1096, 3, 40, 16),
      ac(128, 'Jelly blush nails in 10 mins 💗 N Berry Jelly', 'https://www.instagram.com/reel/DZXmx0Tihm1/', 'W24', 37550, 683, 2, 33, 25),
      ac(129, '2026 summer nails — Glazed Grapefruit', 'https://www.instagram.com/reel/DZTa8w_F48l/', 'W24', 42438, 578, 4, 125, 47),
      ac(130, '@HaileyBieber coconut nails at home', 'https://www.instagram.com/reel/DZX0cmOgkkO/', 'W24', 14713, 127, 2, 32, 9),
      ac(131, 'SUMMER NAILS INSPO 2026 — Glazed Cherry', 'https://www.instagram.com/reel/DZbJSpBAibB/', 'W24', 6523, 124, 2, 21, 5),
    ],
  },
};

// 계정 지표 시드값 — import KR/US SNS (daily) 탭의 실제 주간 집계(W20~W24) 기준.
const initialAccountMetrics = {
  KR: {
    W18: { sales: 298500000, inflow: 208400, achieveRate: 158, pace: 163, reach: 3778846, organicReach: 1803915, views: 5687723, organicViews: 2647889, engagement: 96829, newFollowers: 1561, followers: 75527, contentsCount: 7, profileVisits: 27600, websiteClicks: 4980 },
    W19: { sales: 309200000, inflow: 213900, achieveRate: 163, pace: 168, reach: 3709820, organicReach: 841396, views: 4507219, organicViews: 1313082, engagement: 61179, newFollowers: 684, followers: 76211, contentsCount: 7, profileVisits: 28200, websiteClicks: 5150 },
    W20: { sales: 321464120, inflow: 222790, achieveRate: 172, pace: 178, reach: 3503148, organicReach: 562020, views: 5256630, organicViews: 924427, engagement: 66023, newFollowers: 856, followers: 77067, contentsCount: 7, profileVisits: 29171, websiteClicks: 5560 },
    W21: { sales: 413334711, inflow: 302255, achieveRate: 221, pace: 229, reach: 3576247, organicReach: 1177458, views: 5721873, organicViews: 1878860, engagement: 92531, newFollowers: 1279, followers: 78346, contentsCount: 7, profileVisits: 30641, websiteClicks: 9454 },
    W22: { sales: 335729387, inflow: 281689, achieveRate: 180, pace: 186, reach: 4974618, organicReach: 1975518, views: 7213421, organicViews: 3100663, engagement: 167156, newFollowers: 1461, followers: 79807, contentsCount: 7, profileVisits: 24271, websiteClicks: 4204 },
    W23: { sales: 475051684, inflow: 260598, achieveRate: 154, pace: 159, reach: 5723719, organicReach: 2327614, views: 8656838, organicViews: 3562506, engagement: 243754, newFollowers: 2145, followers: 81952, contentsCount: 7, profileVisits: 29161, websiteClicks: 4797 },
    W24: { sales: 365145940, inflow: 216092, achieveRate: 111, pace: 115, reach: 4793196, organicReach: 1298924, views: 7802158, organicViews: 2059358, engagement: 125086, newFollowers: 1264, followers: 83216, contentsCount: 7, profileVisits: 17911, websiteClicks: 3922 },
  },
  US: {
    W18: { sales: 398200000, inflow: 278600, achieveRate: 88, pace: 91, reach: 1529869, organicReach: 1165008, views: 3848739, organicViews: 3223718, engagement: 175527, newFollowers: 1253, followers: 104538, contentsCount: 14, profileVisits: 14400, websiteClicks: 1950 },
    W19: { sales: 405700000, inflow: 283100, achieveRate: 91, pace: 94, reach: 1974903, organicReach: 1494051, views: 3726726, organicViews: 2966513, engagement: 104102, newFollowers: 1181, followers: 105719, contentsCount: 11, profileVisits: 14750, websiteClicks: 2020 },
    W20: { sales: 426713061, inflow: 297174, achieveRate: 95, pace: 98, reach: 5129669, organicReach: 4714251, views: 8301810, organicViews: 7625389, engagement: 129711, newFollowers: 1284, followers: 107003, contentsCount: 27, profileVisits: 15807, websiteClicks: 2104 },
    W21: { sales: 452969174, inflow: 292823, achieveRate: 101, pace: 104, reach: 4682212, organicReach: 4233591, views: 7658436, organicViews: 6970475, engagement: 178234, newFollowers: 1439, followers: 108442, contentsCount: 18, profileVisits: 12332, websiteClicks: 1786 },
    W22: { sales: 430853662, inflow: 277885, achieveRate: 96, pace: 99, reach: 7817922, organicReach: 7439998, views: 11637295, organicViews: 11119701, engagement: 317072, newFollowers: 2137, followers: 110579, contentsCount: 25, profileVisits: 15324, websiteClicks: 2799 },
    W23: { sales: 442068143, inflow: 291731, achieveRate: 67, pace: 69, reach: 3210728, organicReach: 2936025, views: 5248923, organicViews: 4762435, engagement: 128900, newFollowers: 968, followers: 111547, contentsCount: 15, profileVisits: 8635, websiteClicks: 1326 },
    W24: { sales: 339149357, inflow: 259075, achieveRate: 49, pace: 50, reach: 4425236, organicReach: 4141903, views: 7220614, organicViews: 6746287, engagement: 206656, newFollowers: 1341, followers: 112888, contentsCount: 14, profileVisits: 8309, websiteClicks: 924 },
  },
};
function zeroAccount() {
  const o = {};
  ALL_ACCOUNT_KEYS.forEach((k) => { o[k] = 0; });
  return o;
}

const initialCountryInsights = {
  KR: { W20: '', W21: '', W22: '', W23: '', W24: '' },
  US: { W20: '', W21: '', W22: '', W23: '', W24: '' },
};

const initialActiveProjects = { KR: '', US: '', feed: '' };

// ============================================================
// 저장소 키
// ============================================================
const STORAGE_WEEKS_KEY = 'dash2-weeks-v2';
const STORAGE_FEED_KEY = 'dash2-feed-contents-v2';
const STORAGE_ALL_KEY = 'dash2-all-contents-v2';
const STORAGE_ACCOUNT_KEY = 'dash2-account-metrics-v3';
const STORAGE_INSIGHTS_KEY = 'dash2-country-insights-v2';
const STORAGE_PROJECTS_KEY = 'dash2-active-projects-v2';
const STORAGE_PRODUCT_KEY = 'dash2-product-sales-v1';
const STORAGE_GAS_URL_KEY = 'dash2-gas-url-v1';

const PRODUCT_CATS = [
  { key: 'gelPressOn', label: '젤프레스온', color: '#E8546B' },
  { key: 'hardener',   label: '강화제',    color: '#6C5CE7' },
  { key: 'gelStrip',   label: '젤스트립',  color: '#2E9E89' },
  { key: 'otherCare',  label: '기타케어류', color: '#C9A24B' },
];
const zeroProduct = () => Object.fromEntries(PRODUCT_CATS.map((p) => [p.key, 0]));
const initialProductSales = {
  KR: { W20: zeroProduct(), W21: zeroProduct(), W22: zeroProduct(), W23: zeroProduct(), W24: zeroProduct() },
  US: { W20: zeroProduct(), W21: zeroProduct(), W22: zeroProduct(), W23: zeroProduct(), W24: zeroProduct() },
};

const FEED_IMPORT_FIELDS = [
  { key: 'title', label: '제목 (Caption)' }, { key: 'link', label: '링크 (Link)' },
  { key: 'reach', label: '도달 (Reach)' }, { key: 'follows', label: '팔로우 (Follows)' }, { key: 'likes', label: '좋아요 (Likes)' },
  { key: 'saves', label: '저장수 (Saves)' }, { key: 'shares', label: '공유수 (Shares)' }, { key: 'comments', label: '댓글 (Comments)' },
];
const FEED_GUESS = {
  title: ['caption'], link: ['link'],
  reach: ['reach'], follows: ['follows'], likes: ['likes'], saves: ['saves'], shares: ['shares'], comments: ['comments'],
};

const ALL_IMPORT_FIELDS = [
  { key: 'title', label: '제목 (Caption)' }, { key: 'link', label: '링크 (Link)' },
  { key: 'reach', label: '도달 (Reach)' }, { key: 'views', label: '조회수 (Views)' }, { key: 'engagement', label: '참여 (Engagement)' },
  { key: 'likes', label: '좋아요 (Likes)' }, { key: 'comments', label: '댓글 (Comments)' }, { key: 'saves', label: '저장 (Saves)' }, { key: 'shares', label: '공유 (Shares)' },
  { key: 'hypothesis', label: '가설' }, { key: 'analysis', label: '분석 & 추후 방안' }, { key: 'salesImpact', label: '매출전환효과' },
  { key: 'initialScore', label: '초기 성과' }, { key: 'w1Score', label: '1주차 성과' }, { key: 'w2Score', label: '2주차 성과' },
  { key: 'w3Score', label: '3주차 성과' }, { key: 'w4Score', label: '4주차 성과' }, { key: 'finalScore', label: '최종 누적 성과' },
];
const ALL_GUESS = {
  title: ['caption'], link: ['link'],
  reach: ['reach'], views: ['views', 'view'], engagement: ['engagement', 'interactions'],
  likes: ['likes'], comments: ['comments'], saves: ['saves'], shares: ['shares'],
  hypothesis: ['hypothesis', '가설'], analysis: ['analysis', '분석'], salesImpact: ['salesimpact', '매출전환효과', '매출효과'],
  initialScore: ['initialscore', '초기'], w1Score: ['w1', '1주차'], w2Score: ['w2', '2주차'],
  w3Score: ['w3', '3주차'], w4Score: ['w4', '4주차'], finalScore: ['finalscore', '최종', '현재'],
};

// ============================================================
// 공용 작은 컴포넌트
// ============================================================
function Swatch({ color, size = 8 }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '999px', background: color, flexShrink: 0 }} />;
}

// 섹션 구획용 라벨 — 컬러 바 + 진한 텍스트로 구획을 명확히
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
      <button onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${C.sub}`, background: 'transparent', color: C.sub, fontSize: 9, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0 }}>
        ?
      </button>
      {open && (
        <div style={{ position: 'absolute', bottom: '140%', left: 0, background: C.ink, color: '#fff', fontSize: 11.5, fontWeight: 500, padding: '9px 11px', borderRadius: 9, width: 230, lineHeight: 1.55, zIndex: 50, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          {text}
          <div style={{ position: 'absolute', top: '100%', left: 8, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${C.ink}` }} />
        </div>
      )}
    </span>
  );
}

function MetricPill({ metricsMap, mkey, value, big }) {
  const m = metricsMap[mkey];
  const Icon = m.icon;
  return (
    <div className="flex items-center gap-1.5" style={{ color: C.ink }}>
      <Swatch color={m.color} size={big ? 9 : 7} />
      <Icon size={big ? 15 : 13} color={C.sub} strokeWidth={2} />
      <span style={{ fontSize: big ? 14 : 12, fontWeight: big ? 700 : 600 }}>{fmt(value)}</span>
      <span style={{ fontSize: big ? 12 : 11, color: C.sub }}>{m.label}</span>
    </div>
  );
}

function DeltaTag({ value }) {
  if (value === null || value === undefined || !isFinite(value)) return <span style={{ fontSize: 12, color: C.sub }}>—</span>;
  const up = value > 0;
  const flat = value === 0;
  const color = flat ? C.sub : up ? C.mint : C.accent;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span className="flex items-center gap-0.5" style={{ color, fontSize: 12, fontWeight: 700 }}>
      <Icon size={13} strokeWidth={2.5} />{pct(value)}
    </span>
  );
}

function HeroCard({ metricsMap, mkey, value, delta, sub, infoText, accentColor }) {
  const m = metricsMap[mkey];
  const Icon = m.icon;
  return (
    <div className="flex-1" style={{ position: 'relative', overflow: 'hidden', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', minWidth: 150, boxShadow: SHADOW }}>
      {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accentColor }} />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Swatch color={m.color} size={10} /><span style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>{m.label}</span>{infoText && <InfoTip text={infoText} />}</div>
        <Icon size={16} color={m.color} />
      </div>
      <div className="flex items-end justify-between">
        <span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{fmtMetric(mkey, value)}</span>
        <DeltaTag value={delta} />
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: 2 }}>
        <span style={{ fontSize: 11, color: C.subLite }}>전주 대비</span>
        {sub}
      </div>
    </div>
  );
}

// 도달/조회수 전용 카드 — 메인 지표 아래에 오가닉 값을 항상 함께 표시
function ReachOrganicCard({ mkey, organicKey, value, organicValue, delta, organicDelta, accentColor }) {
  const m = ACCOUNT_METRICS[mkey];
  const om = ACCOUNT_METRICS[organicKey];
  const Icon = m.icon;
  const OIcon = om.icon;
  const ratio = value > 0 ? Math.round((organicValue / value) * 100) : 0;
  return (
    <div className="flex-1" style={{ position: 'relative', overflow: 'hidden', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', minWidth: 190, boxShadow: SHADOW }}>
      {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accentColor }} />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Swatch color={m.color} size={10} /><span style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>{m.label}</span></div>
        <Icon size={16} color={m.color} />
      </div>
      <div className="flex items-end justify-between">
        <span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{fmt(value)}</span>
        <DeltaTag value={delta} />
      </div>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <OIcon size={13} color={om.color} strokeWidth={2.2} />
            <span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>{om.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14, fontWeight: 800, color: om.color }}>{fmt(organicValue)}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, background: C.mintSoft, borderRadius: 999, padding: '1px 7px' }}>{ratio}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, width }) {
  return (
    <label className="flex flex-col gap-1" style={{ width: width || 'auto' }}>
      <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', fontSize: 13, width: '100%', background: '#fff', color: C.ink }} />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, width }) {
  return (
    <label className="flex flex-col gap-1" style={{ width: width || 'auto', flex: width ? 'none' : 1 }}>
      <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{label}</span>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', fontSize: 13, width: '100%', background: '#fff', color: C.ink }} />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="flex flex-col gap-1" style={{ width: '100%' }}>
      {label && <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{label}</span>}
      <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={rows}
        style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, width: '100%', background: '#fff', color: C.ink, resize: 'vertical', fontFamily: FONT, boxSizing: 'border-box' }} />
    </label>
  );
}

function ChartTooltip({ active, payload, label, labels }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', fontSize: 12, boxShadow: SHADOW }}>
      <div style={{ fontWeight: 800, marginBottom: 4, color: C.ink }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5" style={{ color: C.ink }}>
          <Swatch color={p.color || p.fill} size={7} />
          {labels?.[p.dataKey] || p.name}: <b>{p.dataKey === 'rate' ? pct(p.value) : fmt(p.value)}</b>
        </div>
      ))}
    </div>
  );
}

function SyncBadge({ status }) {
  if (status === 'idle') return null;
  const map = {
    syncing: { icon: <RefreshCw size={12} className="animate-spin" />, text: '동기화 중...', color: C.sub },
    ok:      { icon: <CheckCircle size={12} />, text: '시트 저장됨', color: C.mint },
    error:   { icon: <AlertCircle size={12} />, text: '연동 실패', color: C.accent },
  };
  const m = map[status];
  if (!m) return null;
  return (
    <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: m.color, padding: '4px 10px', borderRadius: 999, border: `1px solid ${m.color}22`, background: `${m.color}11` }}>
      {m.icon}{m.text}
    </span>
  );
}

// ============================================================
// 콘텐츠 카드 (보기/편집)
// ============================================================
// 콘텐츠 발행 전후 판매 영향 분석 — RAW_제품별판매 시트(날짜/국가/제품군/제품명/판매건수)가 있어야 동작
function SalesImpactResult({ result }) {
  if (!result.sheetExists) {
    return (
      <div style={{ color: C.sub, lineHeight: 1.6 }}>
        원본 판매 데이터 시트(<b>{result.sheetName || 'RAW_제품별판매'}</b>)가 아직 없어요. 스프레드시트에 아래 헤더로 탭을 만들어주시면 자동으로 분석돼요.
        <div style={{ marginTop: 4, padding: '6px 10px', background: C.panel, borderRadius: 8, fontFamily: 'monospace', fontSize: 11 }}>
          날짜 | 국가 | 제품군 | 제품명 | 판매건수
        </div>
      </div>
    );
  }
  if (result.columnsMissing) {
    return <div style={{ color: C.accent }}>{result.sheetName || 'RAW_제품별판매'} 시트는 있는데 "날짜/국가/제품군/제품명/판매건수" 헤더를 찾지 못했어요. 헤더명을 확인해주세요.</div>;
  }
  const Row = ({ label, before, after, growthRate }) => (
    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
      <span style={{ fontWeight: 700, color: C.ink, minWidth: 90 }}>{label}</span>
      <span style={{ color: C.sub }}>발행전 {fmt(before)}건 → 발행후 {fmt(after)}건</span>
      {growthRate == null ? <span style={{ fontWeight: 800, color: C.mint }}>신규 발생</span> : <DeltaTag value={growthRate} />}
    </div>
  );
  const catLabel = PRODUCT_CATS.find((p) => p.key === result.category.name)?.label || result.category.name;
  return (
    <div>
      <Row label={`${catLabel} 전체`} before={result.category.before} after={result.category.after} growthRate={result.category.growthRate} />
      {result.product && (
        result.product.exists
          ? <Row label={result.product.name} before={result.product.before} after={result.product.after} growthRate={result.product.growthRate} />
          : (
            <div style={{ color: C.accent, marginTop: 4 }}>
              "{result.product.name}" 제품명이 raw 데이터에 없어요.{' '}
              <a href="https://docs.google.com/spreadsheets/d/1r1yUxPxvyvZILVhUI0YRamK3Ue0GAHERkerbY5uczLk" target="_blank" rel="noreferrer" style={{ color: C.accent, fontWeight: 700, textDecoration: 'underline' }}>
                raw 시트에서 제품명을 입력해주세요 →
              </a>
            </div>
          )
      )}
      {result.multipleProducts && (
        <div style={{ color: C.subLite, fontSize: 11, marginTop: 2 }}>여러 제품이 등장한 콘텐츠라 제품군 단위로만 비교했어요.</div>
      )}
    </div>
  );
}

function SalesImpactPanel({ item, gasUrl, country }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const loggedRef = useRef(false);
  const WINDOW_DAYS = 3;

  const fetchImpact = async () => {
    setStatus('loading');
    try {
      const params = new URLSearchParams({
        type: 'productImpact', country, category: item.productCategory,
        productNames: (item.productNames || []).join(','), publishDate: item.publishDate,
        windowDays: String(WINDOW_DAYS),
      });
      const res = await fetch(`${gasUrl}?${params.toString()}`);
      const data = await res.json();
      setResult(data);
      setStatus('done');
      if (data.ok && data.sheetExists && !data.columnsMissing && !loggedRef.current) {
        loggedRef.current = true;
        const logs = [];
        if (data.category && data.category.growthRate > 0) {
          logs.push({ scope: '제품군', productName: '', before: data.category.before, after: data.category.after, growthRate: data.category.growthRate });
        }
        if (data.product && data.product.exists && data.product.growthRate > 0) {
          logs.push({ scope: '제품명', productName: data.product.name, before: data.product.before, after: data.product.after, growthRate: data.product.growthRate });
        }
        logs.forEach((log) => {
          fetch(gasUrl, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ type: 'salesImpactLog', country, week: item.week || '', title: item.title, url: item.link, category: item.productCategory, ...log }),
          }).catch(() => {});
        });
      }
    } catch (e) {
      setStatus('error');
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && item.publishDate && status === 'idle') fetchImpact();
  };

  return (
    <div style={{ marginTop: 4 }}>
      <button onClick={handleToggle} className="flex items-center gap-1.5"
        style={{ fontSize: 11, fontWeight: 700, color: C.mint, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        판매 영향 분석 {open ? '접기' : '보기'} (발행 전후 {WINDOW_DAYS}일)
      </button>
      {open && (
        <div style={{ marginTop: 4, paddingTop: 8, borderTop: `1px solid ${C.border}`, fontSize: 12 }}>
          {!item.publishDate && <div style={{ color: C.sub }}>발행일을 입력하면 발행 전후 {WINDOW_DAYS}일 판매 변화를 자동으로 분석해드려요. 카드 수정 모드에서 발행일을 입력해주세요.</div>}
          {item.publishDate && status === 'loading' && <div className="flex items-center gap-1.5" style={{ color: C.sub }}><Loader2 size={13} className="animate-spin" /> 판매 데이터 분석 중...</div>}
          {item.publishDate && status === 'error' && <div style={{ color: C.accent }}>분석에 실패했어요. 구글시트 연동 URL을 확인해주세요.</div>}
          {item.publishDate && status === 'done' && result && (result.ok ? <SalesImpactResult result={result} /> : <div style={{ color: C.accent }}>{result.error || '분석에 실패했어요.'}</div>)}
        </div>
      )}
    </div>
  );
}

function ContentCard({ item, coreKeys, subKeys, metricsMap, onSave, onDelete, showSalesImpact, showScoreTracking, retroBadge, onSyncInsight, avgScore, showThumbnailUpload, gasUrl, country }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);
  const [insightOpen, setInsightOpen] = useState(false);
  useEffect(() => { setDraft(item); }, [item]);
  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 300;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        set('thumbnail')(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
    if (onSyncInsight && (draft.hypothesis || draft.analysis || draft.salesImpact)) onSyncInsight(draft);
  };

  if (editing) {
    return (
      <div style={{ background: C.card, border: `1px solid ${C.accent}`, borderRadius: 14, padding: 16, boxShadow: SHADOW }}>
        <div className="flex flex-wrap gap-3 mb-3"><TextField label="콘텐츠 제목" value={draft.title} onChange={set('title')} /></div>
        <div className="flex flex-wrap gap-3 mb-3">
          <TextField label="콘텐츠 링크" value={draft.link} onChange={set('link')} placeholder="https://instagram.com/p/..." />
        </div>
        {showThumbnailUpload && (
          <div className="mb-3">
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, marginBottom: 6 }}>썸네일 이미지</div>
            <div className="flex items-center gap-3">
              {draft.thumbnail && (
                <img src={draft.thumbnail} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }} />
              )}
              <label style={{ cursor: 'pointer' }}>
                <div className="flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: `1px dashed ${C.border}`, color: C.sub, background: C.bg }}>
                  <Plus size={13} /> {draft.thumbnail ? '이미지 변경' : '이미지 업로드'}
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
              {draft.thumbnail && (
                <button onClick={() => set('thumbnail')('')} style={{ fontSize: 12, color: C.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>삭제</button>
              )}
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 6 }}>핵심지표</div>
        <div className="flex flex-wrap gap-3 mb-3">
          {coreKeys.map((k) => <NumberField key={k} label={metricsMap[k].label} value={draft[k]} onChange={set(k)} width={110} />)}
        </div>
        <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginBottom: 6 }}>서브지표</div>
        <div className="flex flex-wrap gap-3 mb-4">
          {subKeys.map((k) => <NumberField key={k} label={k === 'profileActivity' ? `[수동 기입] ${metricsMap[k].label}` : metricsMap[k].label} value={draft[k]} onChange={set(k)} width={100} />)}
        </div>
        {showScoreTracking && (
          <div className="mb-4">
            <div style={{ fontSize: 11, color: C.mint, fontWeight: 700, marginBottom: 6 }} className="flex items-center gap-1">
              <Rocket size={13} /> 성과 추적 (역주행/성장 분석용 · 도달수 기준)
            </div>
            <div className="flex flex-wrap gap-3">
              <NumberField label="초기 성과" value={draft.initialScore} onChange={set('initialScore')} width={100} />
              <NumberField label="1주차" value={draft.w1Score} onChange={set('w1Score')} width={90} />
              <NumberField label="2주차" value={draft.w2Score} onChange={set('w2Score')} width={90} />
              <NumberField label="3주차" value={draft.w3Score} onChange={set('w3Score')} width={90} />
              <NumberField label="4주차" value={draft.w4Score} onChange={set('w4Score')} width={90} />
              <NumberField label="최종 누적" value={draft.finalScore} onChange={set('finalScore')} width={100} />
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3 mb-4">
          <div style={{ flex: '1 1 240px' }}>
            <TextAreaField label="🤔 가설" value={draft.hypothesis} onChange={set('hypothesis')} placeholder="발행 전 타겟팅 및 실험 가설을 적어주세요." />
          </div>
          <div style={{ flex: '1 1 240px' }}>
            <TextAreaField label="📝 분석 & 추후 방안" value={draft.analysis} onChange={set('analysis')} placeholder="결과 데이터 분석 및 다음 액션 플랜을 적어주세요." />
          </div>
        </div>
        <div className="mb-4">
          <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>제품군</div>
          <div className="flex flex-wrap gap-2">
            {[{ key: '', label: '미분류' }, ...PRODUCT_CATS].map((p) => (
              <button key={p.key} onClick={() => setDraft((d) => ({ ...d, productCategory: p.key }))}
                style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999, border: `1.5px solid ${draft.productCategory === p.key ? (p.color || C.ink) : C.border}`, background: draft.productCategory === p.key ? `${p.color || C.ink}15` : '#fff', color: draft.productCategory === p.key ? (p.color || C.ink) : C.sub, cursor: 'pointer' }}>
                {draft.productCategory === p.key ? '✓ ' : ''}{p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <TextField label="제품명 (여러 개면 쉼표로 구분, 예: n 블루베리 베일, n 자몽 글레이즈드)" value={(draft.productNames || []).join(', ')}
            onChange={(v) => setDraft((d) => ({ ...d, productNames: v.split(',').map((s) => s.trim()).filter(Boolean) }))} />
          <label className="flex flex-col gap-1" style={{ width: 160 }}>
            <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>발행일 (판매 영향 분석용)</span>
            <input type="date" value={draft.publishDate || ''} onChange={(e) => set('publishDate')(e.target.value)}
              style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', fontSize: 13, width: '100%', background: '#fff', color: C.ink }} />
          </label>
        </div>
        {showSalesImpact && (
          <div className="mb-4">
            <TextAreaField label="매출전환효과" value={draft.salesImpact || ''} onChange={set('salesImpact')}
              placeholder="예: 판매건수 150% 상승 (30 → 45) / 전환율 2.1% → 3.4%" rows={2} />
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button onClick={() => { setEditing(false); setDraft(item); }} className="flex items-center gap-1"
            style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.sub, fontWeight: 600 }}>
            <X size={14} /> 취소
          </button>
          <button onClick={handleSave} className="flex items-center gap-1"
            style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: 'none', background: C.accent, color: '#fff', fontWeight: 700 }}>
            <Check size={14} /> 저장
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, boxShadow: SHADOW }}>
      <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
        <a href={item.link || undefined} target="_blank" rel="noreferrer"
          style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {item.thumbnail
            ? <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <ExternalLink size={14} color={C.sub} />}
        </a>
        <div style={{ minWidth: 180, flex: '1 1 220px' }}>
          <a href={item.link || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-1"
            style={{ fontSize: 14, fontWeight: 700, color: C.ink, textDecoration: 'none', marginBottom: 6 }}>
            {item.title || '(제목 없음)'}{item.link && <ExternalLink size={12} color={C.sub} />}
          </a>
          {item.productCategory && (() => {
            const p = PRODUCT_CATS.find((c) => c.key === item.productCategory);
            const names = item.productNames || [];
            return p ? (
              <span className="flex items-center gap-1.5 flex-wrap" style={{ marginBottom: 6 }}>
                <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}40` }}>
                  # {p.label}
                </span>
                {names.length === 1 && (
                  <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: C.panel, color: C.ink, border: `1px solid ${C.border}` }}>
                    {names[0]}
                  </span>
                )}
                {names.length > 1 && (
                  <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: C.panel, color: C.sub, border: `1px solid ${C.border}` }}>
                    여러 제품
                  </span>
                )}
              </span>
            ) : null;
          })()}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center">
            {coreKeys.map((k) => <MetricPill key={k} metricsMap={metricsMap} mkey={k} value={item[k]} big />)}
            {avgScore > 0 && (() => {
              const score = combinedScore(item);
              const diff = ((score - avgScore) / avgScore) * 100;
              const isAbove = diff >= 0;
              return (
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
                  background: isAbove ? 'rgba(46,158,137,0.14)' : 'rgba(232,84,107,0.12)',
                  color: isAbove ? C.mint : C.accent, whiteSpace: 'nowrap',
                }}>
                  {isAbove ? '▲' : '▼'} 평균 대비 {isAbove ? '+' : ''}{diff.toFixed(0)}%
                </span>
              );
            })()}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5" style={{ flex: '1 1 240px' }}>
          {subKeys.map((k) => <MetricPill key={k} metricsMap={metricsMap} mkey={k} value={item[k]} />)}
        </div>
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          {retroBadge != null && (
            <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 999, background: 'rgba(46,158,137,0.16)', color: C.mint, whiteSpace: 'nowrap', marginRight: 4 }}>
              {`+${retroBadge.toFixed(0)}% 역주행`}
            </span>
          )}
          <button onClick={() => setEditing(true)} style={{ padding: 7, borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.sub }}><Pencil size={14} /></button>
          <button onClick={() => onDelete(item.id)} style={{ padding: 7, borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.accent }}><Trash2 size={14} /></button>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setInsightOpen((v) => !v)} className="flex items-center gap-1.5"
          style={{ fontSize: 11, fontWeight: 700, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
          {insightOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          인사이트 {insightOpen ? '접기' : '펼치기'}
          {(item.hypothesis || item.analysis || (showSalesImpact && item.salesImpact)) && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'inline-block', flexShrink: 0 }} />
          )}
        </button>
        {insightOpen && (
          <div style={{ marginTop: 6, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <div className="flex items-start gap-1.5" style={{ fontSize: 12, color: C.ink, lineHeight: 1.5, marginBottom: 6 }}>
              <Lightbulb size={13} color={C.accent} style={{ marginTop: 2, flexShrink: 0 }} />
              <span><b style={{ color: C.accent }}>[가설]</b> {item.hypothesis
                ? <span style={{ whiteSpace: 'pre-wrap' }}>{item.hypothesis}</span>
                : <span style={{ color: C.sub }}>아직 작성된 가설이 없습니다.</span>}</span>
            </div>
            <div className="flex items-start gap-1.5" style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}>
              <NotebookPen size={13} color={C.mint} style={{ marginTop: 2, flexShrink: 0 }} />
              <span><b style={{ color: C.mint }}>[분석 & 추후 방안]</b> {item.analysis
                ? <span style={{ whiteSpace: 'pre-wrap' }}>{item.analysis}</span>
                : <span style={{ color: C.sub }}>아직 작성된 분석이 없습니다.</span>}</span>
            </div>
            {showSalesImpact && item.salesImpact && (
              <div className="flex items-start gap-1.5" style={{ marginTop: 6, fontSize: 12, color: C.mint, fontWeight: 700, lineHeight: 1.5 }}>
                <Sparkles size={13} color={C.mint} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'pre-wrap' }}>매출전환효과: {item.salesImpact}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {item.productCategory && gasUrl && country && <SalesImpactPanel item={item} gasUrl={gasUrl} country={country} />}
    </div>
  );
}

// ============================================================
// 시트 가져오기 패널
// ============================================================
function ImportSection({ week, fields, guess, mappingStorageKey, buildItem, onImport, label }) {
  const [open, setOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [headers, setHeaders] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [mapping, setMapping] = useState({});

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(mappingStorageKey, true); if (r?.value) setMapping(JSON.parse(r.value)); } catch (e) {}
    })();
  }, [mappingStorageKey]);

  const persistMapping = async (next) => {
    setMapping(next);
    try { await window.storage.set(mappingStorageKey, JSON.stringify(next), true); } catch (e) {}
  };

  const handleParse = () => {
    const lines = pasteText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) { setHeaders([]); setParsedRows([]); return; }
    const hdrs = lines[0].split('\t').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => { const cells = line.split('\t'); const obj = {}; hdrs.forEach((h, i) => { obj[h] = (cells[i] ?? '').trim(); }); return obj; });
    setHeaders(hdrs); setParsedRows(rows);
    const needsGuess = fields.some((f) => !mapping[f.key] || !hdrs.includes(mapping[f.key]));
    if (needsGuess) {
      const guessed = { ...mapping };
      fields.forEach((f) => {
        if (guessed[f.key] && hdrs.includes(guessed[f.key])) return;
        const candidates = guess[f.key] || [];
        let found = hdrs.find((h) => candidates.includes(h.toLowerCase()));
        if (!found) found = hdrs.find((h) => candidates.some((c) => h.toLowerCase().includes(c)));
        guessed[f.key] = found || '';
      });
      persistMapping(guessed);
    }
  };

  const handleImport = () => {
    onImport(parsedRows.map((row) => buildItem(row, mapping)));
    setOpen(false); setPasteText(''); setHeaders([]); setParsedRows([]);
  };

  return (
    <div className="mb-3">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1"
        style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.ink }}>
        <ClipboardPaste size={14} /> {label || '시트에서 가져오기'} {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div style={{ marginTop: 10, padding: 14, background: C.bg, border: `1px dashed ${C.border}`, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 8, lineHeight: 1.6 }}>
            구글시트에서 <b>헤더 행을 포함</b>해 {week} 데이터 범위를 선택 → 복사(Ctrl+C) → 아래에 붙여넣기(Ctrl+V) 하세요.
          </div>
          <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="여기에 구글시트에서 복사한 내용을 붙여넣으세요 (헤더 행 포함)" rows={4}
            style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, fontSize: 12, fontFamily: 'monospace', resize: 'vertical', background: '#fff', color: C.ink, boxSizing: 'border-box' }} />
          <div className="flex flex-wrap gap-2 mt-2">
            <button onClick={handleParse} disabled={!pasteText.trim()} className="flex items-center gap-1"
              style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.ink, opacity: pasteText.trim() ? 1 : 0.4 }}>
              <ClipboardPaste size={14} /> 컬럼 인식
            </button>
            {headers.length > 0 && <span style={{ fontSize: 12, color: C.sub, alignSelf: 'center' }}>{headers.length}개 컬럼 · {parsedRows.length}개 행 인식됨</span>}
          </div>
          {headers.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, margin: '12px 0 8px' }}>컬럼 매핑</div>
              <div className="flex flex-wrap gap-3 mb-3">
                {fields.map((f) => (
                  <label key={f.key} className="flex flex-col gap-1" style={{ width: 150 }}>
                    <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{f.label}</span>
                    <select value={mapping[f.key] || ''} onChange={(e) => persistMapping({ ...mapping, [f.key]: e.target.value })}
                      style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', fontSize: 12, background: '#fff', color: C.ink }}>
                      <option value="">선택 안 함</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              <button onClick={handleImport} className="flex items-center gap-1"
                style={{ fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 8, border: 'none', background: C.mint, color: '#fff' }}>
                <ArrowDownToLine size={14} /> {week}에 가져오기 ({parsedRows.length}건, 기존 목록 대체)
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 계정 지표 입력 테이블
// ============================================================
function AccountMetricsTable({ weekKeys, metrics, onChange }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1100 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 12, color: C.sub }}>주차</th>
            {ALL_ACCOUNT_KEYS.map((k) => <th key={k} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 12, color: C.sub, whiteSpace: 'nowrap' }}>{ACCOUNT_METRICS[k].label}</th>)}
          </tr>
        </thead>
        <tbody>
          {weekKeys.map((w) => (
            <tr key={w}>
              <td style={{ padding: '6px 8px', fontSize: 13, fontWeight: 700 }}>{w}</td>
              {ALL_ACCOUNT_KEYS.map((k) => (
                <td key={k} style={{ padding: '4px 8px' }}>
                  <input type="number" value={metrics[w]?.[k] ?? 0}
                    onChange={(e) => onChange(w, k, e.target.value === '' ? 0 : Number(e.target.value))}
                    style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 8px', fontSize: 13, width: 100 }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// 릴스 타율 커스텀 툴팁 (상위 3개 콘텐츠 표시)
// ============================================================
function ReelsTooltip({ active, payload, label, allContents, countryKey }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload || {};
  const top3 = ((allContents[countryKey]?.[label]) || [])
    .filter(isReel)
    .sort((a, b) => Number(b.reach || 0) - Number(a.reach || 0))
    .slice(0, 3);
  const hitColor = d.hitRate >= 70 ? '#2E9E89' : d.hitRate >= 50 ? '#E08A2B' : '#E8546B';
  const hitEmoji = d.hitRate >= 70 ? '🔥' : d.hitRate >= 50 ? '✓' : '△';
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, maxWidth: 300, boxShadow: '0 2px 10px rgba(0,0,0,0.09)' }}>
      <div style={{ fontWeight: 800, marginBottom: 8, color: C.ink }}>{label}</div>
      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
        <span style={{ color: C.sub }}>발행 수</span>
        <b style={{ color: C.ink }}>{d.reelCount}개</b>
      </div>
      {d.hitRate != null && (
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <span style={{ color: C.sub }}>타율</span>
          <b style={{ color: hitColor, fontSize: 14 }}>{d.hitRate}%</b>
          <span style={{ fontSize: 13 }}>{hitEmoji}</span>
          <span style={{ color: C.sub, fontSize: 11 }}>({d.reelCount > 0 ? `${Math.round(d.hitRate * d.reelCount / 100)}/${d.reelCount}개 기준 초과` : '-'})</span>
        </div>
      )}
      <div className="flex items-center gap-2" style={{ marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ color: C.sub }}>평균 도달</span>
        <b style={{ color: C.ink }}>{fmt(d.avgReach)}</b>
      </div>
      {top3.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 5 }}>📌 도달 상위 릴스</div>
          {top3.map((item, i) => (
            <div key={i} style={{ marginBottom: i < top3.length - 1 ? 6 : 0 }}>
              <a href={item.link || undefined} target="_blank" rel="noreferrer"
                style={{ fontWeight: 700, color: C.ink, lineHeight: 1.4, fontSize: 11, textDecoration: 'none', display: 'block', cursor: item.link ? 'pointer' : 'default' }}
                onMouseEnter={(e) => { if (item.link) e.currentTarget.style.color = C.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.ink; }}>
                {i + 1}. {(item.title || '').length > 32 ? (item.title || '').slice(0, 32) + '…' : (item.title || '')}{item.link ? ' ↗' : ''}
              </a>
              <div style={{ color: C.sub, fontSize: 11 }}>도달 {fmt(item.reach)}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================
// 통합 요약 뷰 — 국가 탭으로 전환, 핵심 카드만 간단히
// 추이 차트·릴스 타율 분석·콘텐츠 리스트·인사이트 등 상세는 국가별 대시보드에서 확인
// ============================================================
function SummaryView({ weekMeta, selectedWeek, displayWeeks, accountMetrics, allContents, productSales, onProductSalesChange }) {
  const [tab, setTab] = useState('KR');
  const accent = tab === 'KR' ? '#E8546B' : '#3E6FE0';
  const weekKeys = weekMeta.map((w) => w.key);
  const prevIdx = weekKeys.indexOf(selectedWeek) - 1;
  const prevWeek = prevIdx >= 0 ? weekKeys[prevIdx] : null;
  const val = (country, week, k) => Number(accountMetrics[country]?.[week]?.[k] || 0);
  const wowDelta = (country, k) => {
    const cur = val(country, selectedWeek, k);
    if (!prevWeek) return null;
    const prev = val(country, prevWeek, k);
    return prev ? ((cur - prev) / prev) * 100 : null;
  };

  // 콘텐츠 타율 (직전 8주 평균 도달, 상위 5% 메가바이럴 제외)
  const BASELINE_WEEKS = 8;
  const baselineWeeksList = lastNWeeksKeys(weekMeta, selectedWeek, BASELINE_WEEKS);
  const reelsBaseAvg = (() => {
    const items = baselineWeeksList.flatMap((w) => allContents[tab]?.[w] || []).filter(isReel);
    const reaches = items.map((i) => Number(i.reach || 0)).sort((a, b) => b - a);
    const cutoff = Math.ceil(reaches.length * 0.05);
    const filtered = reaches.slice(cutoff);
    return filtered.length ? filtered.reduce((s, v) => s + v, 0) / filtered.length : 0;
  })();
  const baselineInfoText = `직전 ${BASELINE_WEEKS}주(${baselineWeeksList[0] || '-'}~${selectedWeek}) 릴스 도달 중 상위 5% 메가바이럴을 제외한 평균입니다. 이 평균 이상 도달한 릴스 비율이 타율이에요.`;
  const calcHitRate = (w) => {
    const items = allContents[tab]?.[w] || [];
    const reels = items.filter(isReel);
    const hits = reels.filter((r) => Number(r.reach || 0) >= reelsBaseAvg).length;
    return reels.length ? Math.round((hits / reels.length) * 100) : null;
  };
  const hitRateNow = calcHitRate(selectedWeek);
  const hitRatePrev = prevWeek ? calcHitRate(prevWeek) : null;
  const hitRateDelta = hitRateNow != null && hitRatePrev != null ? hitRateNow - hitRatePrev : null;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 4 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>통합 요약 · {selectedWeek}</h2>
          <div style={{ fontSize: 12, color: C.sub }}>핵심 지표만 간단히 확인 · 콘텐츠 리스트·인사이트·릴스 타율 분석 등 상세는 국가별 대시보드에서</div>
        </div>
        <div className="flex gap-1.5">
          {COUNTRIES.map((c) => {
            const cAccent = c.key === 'KR' ? '#E8546B' : '#3E6FE0';
            const cFlag = c.key === 'KR' ? '🇰🇷' : '🇺🇸';
            return (
              <button key={c.key} onClick={() => setTab(c.key)} className="flex items-center gap-1.5"
                style={{ fontSize: 13, fontWeight: 800, padding: '8px 20px', borderRadius: 999, border: `2px solid ${c.key === tab ? cAccent : C.border}`, background: c.key === tab ? cAccent : '#fff', color: c.key === tab ? '#fff' : C.sub }}>
                <span>{cFlag}</span>{c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 14 }} />

      <SectionLabel color={ACCOUNT_METRICS.sales.color}>매출 · 유입</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-1">
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="sales" value={val(tab, selectedWeek, 'sales')} delta={wowDelta(tab, 'sales')} accentColor={accent}
          sub={<span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>달성률 {fmtMetric('salesAchieveRate', val(tab, selectedWeek, 'salesAchieveRate'))}</span>} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="inflow" value={val(tab, selectedWeek, 'inflow')} delta={wowDelta(tab, 'inflow')} accentColor={accent}
          sub={<span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>달성률 {fmtMetric('inflowAchieveRate', val(tab, selectedWeek, 'inflowAchieveRate'))}</span>} />
      </div>

      <SectionLabel color={ACCOUNT_METRICS.reach.color} sub="도달·조회수는 오가닉 값을 함께 표시">채널 핵심지표</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-3">
        <ReachOrganicCard mkey="reach" organicKey="organicReach" value={val(tab, selectedWeek, 'reach')} organicValue={val(tab, selectedWeek, 'organicReach')} delta={wowDelta(tab, 'reach')} organicDelta={wowDelta(tab, 'organicReach')} accentColor={accent} />
        <ReachOrganicCard mkey="views" organicKey="organicViews" value={val(tab, selectedWeek, 'views')} organicValue={val(tab, selectedWeek, 'organicViews')} delta={wowDelta(tab, 'views')} organicDelta={wowDelta(tab, 'organicViews')} accentColor={accent} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="engagement" value={val(tab, selectedWeek, 'engagement')} delta={wowDelta(tab, 'engagement')} accentColor={accent} />
      </div>

      <SectionLabel color="#E08A2B">콘텐츠 발행 · 타율</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-1">
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="contentsCount" value={val(tab, selectedWeek, 'contentsCount')} delta={wowDelta(tab, 'contentsCount')} accentColor={accent} />
        <HeroCard metricsMap={{ hitRate: { label: '콘텐츠 타율', icon: Target, color: '#2E9E89' } }} mkey="hitRate" value={hitRateNow ?? 0} delta={hitRateDelta} infoText={baselineInfoText} accentColor={accent} />
      </div>

      <SectionLabel color={ACCOUNT_METRICS.newFollowers.color}>계정 성장 / 구매유도</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-2">
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="newFollowers" value={val(tab, selectedWeek, 'newFollowers')} delta={wowDelta(tab, 'newFollowers')} accentColor={accent} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="followers" value={val(tab, selectedWeek, 'followers')} delta={wowDelta(tab, 'followers')} accentColor={accent} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="profileVisits" value={val(tab, selectedWeek, 'profileVisits')} delta={wowDelta(tab, 'profileVisits')} accentColor={accent} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="websiteClicks" value={val(tab, selectedWeek, 'websiteClicks')} delta={wowDelta(tab, 'websiteClicks')} accentColor={accent} />
      </div>

      {(() => {
        const weekItems = allContents[tab]?.[selectedWeek] || [];
        const top3 = [...weekItems].sort((a, b) => combinedScore(b) - combinedScore(a)).slice(0, 3);
        return (
          <div className="mb-8">
            <SectionLabel color="#E8546B">고성과 TOP 3 콘텐츠</SectionLabel>
            <div style={{ fontSize: 12, color: C.subLite, margin: '-6px 0 12px' }}>도달수 + 참여수 결합 점수 기준 · {selectedWeek}</div>
            {top3.length === 0
              ? <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>{selectedWeek}에 등록된 콘텐츠가 없습니다.</div>
              : <div className="flex flex-col gap-2.5">
                  {top3.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-3" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', boxShadow: SHADOW }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? '#E8546B' : C.subLite, width: 22, flexShrink: 0, textAlign: 'center' }}>{i + 1}</span>
                      <a href={item.link || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 700, color: C.ink, textDecoration: 'none', flex: 1, minWidth: 0 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || '(제목 없음)'}</span>
                        {item.link && <ExternalLink size={11} color={C.sub} style={{ flexShrink: 0 }} />}
                      </a>
                      <span style={{ fontSize: 12, color: C.sub, fontWeight: 600, flexShrink: 0 }}>도달 {fmt(item.reach)}</span>
                      <span style={{ fontSize: 12, color: C.sub, fontWeight: 600, flexShrink: 0 }}>참여 {fmt(item.engagement)}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#E8546B', flexShrink: 0 }}>점수 {fmt(combinedScore(item))}</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        );
      })()}

      {(() => {
        const monthOrder = []; const monthGroups = {};
        weekMeta.forEach((w) => {
          const m = w.month || '기타';
          if (!monthGroups[m]) { monthGroups[m] = { sales: 0, inflow: 0, reach: 0, engagement: 0 }; monthOrder.push(m); }
          monthGroups[m].sales += val(tab, w.key, 'sales');
          monthGroups[m].inflow += val(tab, w.key, 'inflow');
          monthGroups[m].reach += val(tab, w.key, 'reach');
          monthGroups[m].engagement += val(tab, w.key, 'engagement');
        });
        const NORM_KEYS = ['sales', 'inflow', 'reach', 'engagement'];
        const monthlyRaw = monthOrder.map((m) => ({ month: fmtMonth(m), ...monthGroups[m] }));
        const firstNonZero = (key) => monthlyRaw.find((d) => d[key] > 0)?.[key] || 0;
        const base = { sales: firstNonZero('sales'), inflow: firstNonZero('inflow'), reach: firstNonZero('reach'), engagement: firstNonZero('engagement') };
        const monthlyData = monthlyRaw.map((d) => {
          const entry = { month: d.month };
          NORM_KEYS.forEach((k) => { entry[k] = base[k] > 0 ? Math.round((d[k] / base[k]) * 100) : 0; entry[`_raw_${k}`] = d[k]; });
          return entry;
        });
        const labelsA = metricLabels(ACCOUNT_METRICS);
        const renderMonthlyTooltip = ({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          return (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: SHADOW }}>
              <div style={{ fontWeight: 800, marginBottom: 6, color: C.ink }}>{label}</div>
              {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-1.5" style={{ color: C.ink, marginBottom: 3 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ minWidth: 50 }}>{labelsA[p.dataKey] || p.dataKey}</span>
                  <b>{fmtMetric(p.dataKey, p.payload[`_raw_${p.dataKey}`])}</b>
                  <span style={{ color: C.sub, fontSize: 11 }}>({p.value})</span>
                </div>
              ))}
            </div>
          );
        };
        return (
          <div className="mb-2" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
            <div style={{ marginBottom: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 2px', color: C.sub }}>월간 매출 · 유입 · 도달 · 참여 추이 (참고용)</h3>
              <div style={{ fontSize: 12, color: C.subLite }}>월별 합계 · 첫 데이터 보유월 대비 지수(=100) · {COUNTRIES.find((c) => c.key === tab)?.label}</div>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                  <Tooltip content={renderMonthlyTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => labelsA[v] || v} />
                  <Line type="monotone" dataKey="sales" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="inflow" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="reach" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="engagement" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={2} dot={{ r: 2.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
// ============================================================
// 국가별 대시보드 뷰
// ============================================================
function CountryView({
  countryKey, weekMeta, selectedWeek, displayWeeks,
  accountMetrics, onAccountChange,
  countryInsights, onInsightChange,
  allContents, onAllContentsChange,
  productSales, onProductSalesChange,
  activeProjects, onProjectsChange,
  onSyncContent, gasUrl,
}) {
  const country = COUNTRIES.find((c) => c.key === countryKey);
  const weekKeys = weekMeta.map((w) => w.key);
  const metrics = accountMetrics[countryKey] || {};
  const totals = (week) => metrics[week] || zeroAccount();
  const prevIdx = weekKeys.indexOf(selectedWeek) - 1;
  const prevWeek = prevIdx >= 0 ? weekKeys[prevIdx] : null;
  const wowDelta = (k) => {
    const cur = totals(selectedWeek)[k];
    if (!prevWeek) return null;
    const prev = totals(prevWeek)[k];
    return prev ? ((cur - prev) / prev) * 100 : null;
  };
  const trendData = displayWeeks.map((w) => ({ week: w, ...totals(w) }));
  const labelsA = metricLabels(ACCOUNT_METRICS);

  const SECONDARY_KEYS = ['newFollowers', 'profileVisits', 'websiteClicks'];
  const secondaryBase = Object.fromEntries(SECONDARY_KEYS.map((k) => [k, trendData.find((d) => d[k] > 0)?.[k] || 0]));
  const secondaryTrendNorm = trendData.map((d) => {
    const entry = { week: d.week };
    SECONDARY_KEYS.forEach((k) => {
      entry[k] = secondaryBase[k] > 0 ? Math.round((d[k] / secondaryBase[k]) * 100) : 0;
      entry[`_raw_${k}`] = d[k];
    });
    return entry;
  });
  const renderSecondaryTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: SHADOW }}>
        <div style={{ fontWeight: 800, marginBottom: 6, color: C.ink }}>{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-1.5" style={{ color: C.ink, marginBottom: 3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ minWidth: 76 }}>{labelsA[p.dataKey] || p.dataKey}</span>
            <b>{fmt(p.payload[`_raw_${p.dataKey}`])}</b>
            <span style={{ color: C.sub, fontSize: 11 }}>({p.value})</span>
          </div>
        ))}
      </div>
    );
  };
  const [showInputTable, setShowInputTable] = useState(false);
  const [showAllList, setShowAllList] = useState(false);
  const [showMetricsTable, setShowMetricsTable] = useState(false);
  const [showReachEngTable, setShowReachEngTable] = useState(false);
  const [showReelsTable, setShowReelsTable] = useState(false);
  const [showProdWeeklyTable, setShowProdWeeklyTable] = useState(false);
  const [showProdMonthlyTable, setShowProdMonthlyTable] = useState(false);
  const [subView, setSubView] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState('gelPressOn');

  const BASELINE_WEEKS = 8;
  const rangeWeeks = lastNWeeksKeys(weekMeta, selectedWeek, BASELINE_WEEKS);
  const rangeItems = rangeWeeks.flatMap((w) => allContents[countryKey]?.[w] || []);
  const scores = rangeItems.map((i) => combinedScore(i)).sort((a, b) => b - a);
  const top5cutoff = Math.ceil(scores.length * 0.05);
  const filteredScores = scores.slice(top5cutoff);
  const avgScore = filteredScores.length ? filteredScores.reduce((s, v) => s + v, 0) / filteredScores.length : 0;
  const baselineInfoText = `직전 ${BASELINE_WEEKS}주(${rangeWeeks[0] || '-'}~${selectedWeek}) 콘텐츠의 도달수+참여수 결합 점수 중 상위 5% 메가바이럴을 제외한 평균입니다. 이 평균 이상이면 "타율 적중", "평균 이상"으로 표시돼요.`;
  const weekItems = allContents[countryKey]?.[selectedWeek] || [];
  const topContent = weekItems.filter((i) => combinedScore(i) >= avgScore).sort((a, b) => combinedScore(b) - combinedScore(a)).slice(0, 5);
  const bottomContent = weekItems.filter((i) => combinedScore(i) < avgScore).sort((a, b) => combinedScore(a) - combinedScore(b)).slice(0, 5);
  const reaches = rangeItems.map((i) => Number(i.reach || 0)).sort((a, b) => b - a);
  const reachBaseAvg = reaches.length ? reaches.slice(top5cutoff).reduce((s, v) => s + v, 0) / Math.max(1, reaches.length - top5cutoff) : 0;
  const countryReelsWeekData = displayWeeks.map((w) => {
    const items = allContents[countryKey]?.[w] || [];
    const reels = items.filter(isReel);
    const avgR = reels.length ? Math.round(reels.reduce((s, i) => s + Number(i.reach || 0), 0) / reels.length) : 0;
    const hits = reels.filter((r) => Number(r.reach || 0) >= reachBaseAvg).length;
    const hitRate = reels.length ? Math.round((hits / reels.length) * 100) : null;
    return { week: w, reelCount: reels.length, avgReach: avgR, hitRate };
  });
  const calcCountryHitRate = (w) => {
    const items = allContents[countryKey]?.[w] || [];
    const reels = items.filter(isReel);
    const hits = reels.filter((r) => Number(r.reach || 0) >= reachBaseAvg).length;
    return reels.length ? Math.round((hits / reels.length) * 100) : null;
  };
  const weekHitRate = calcCountryHitRate(selectedWeek);
  const prevHitRate = prevWeek ? calcCountryHitRate(prevWeek) : null;
  const hitRateDelta = weekHitRate != null && prevHitRate != null ? weekHitRate - prevHitRate : null;

  const updateAllItem = (item) => {
    const list = weekItems.map((c) => (c.id === item.id ? item : c));
    onAllContentsChange({ ...allContents, [countryKey]: { ...allContents[countryKey], [selectedWeek]: list } });
  };
  const deleteAllItem = (id) => {
    const list = weekItems.filter((c) => c.id !== id);
    onAllContentsChange({ ...allContents, [countryKey]: { ...allContents[countryKey], [selectedWeek]: list } });
  };
  const addAllItem = () => {
    const allIds = Object.values(allContents).flatMap((byWeek) => Object.values(byWeek).flat()).map((c) => c.id);
    const newId = (allIds.length ? Math.max(...allIds) : 0) + 1;
    const list = [...weekItems, blankItem(newId, '새 콘텐츠', CONTENT_KEYS)];
    onAllContentsChange({ ...allContents, [countryKey]: { ...allContents[countryKey], [selectedWeek]: list } });
  };
  const importAllItems = (newList) => {
    const existingByLink = {};
    weekItems.forEach((c) => { if (c.link) existingByLink[c.link] = c; });
    const allIds = Object.values(allContents).flatMap((byWeek) => Object.values(byWeek).flat()).map((c) => c.id);
    let nextId = (allIds.length ? Math.max(...allIds) : 0) + 1;
    const built = newList.map((item) => {
      const existing = item.link ? existingByLink[item.link] : null;
      return { ...item, id: existing?.id ?? nextId++, hypothesis: item.hypothesis || existing?.hypothesis || '', analysis: item.analysis || existing?.analysis || '', salesImpact: item.salesImpact || existing?.salesImpact || '' };
    });
    onAllContentsChange({ ...allContents, [countryKey]: { ...allContents[countryKey], [selectedWeek]: built } });
  };
  const buildAllItem = (row, mapping) => {
    const link = mapping.link ? row[mapping.link] : '';
    const item = { id: 0, title: mapping.title ? row[mapping.title] : '', link, hypothesis: mapping.hypothesis ? row[mapping.hypothesis] : '', analysis: mapping.analysis ? row[mapping.analysis] : '', salesImpact: mapping.salesImpact ? row[mapping.salesImpact] : '' };
    CONTENT_KEYS.forEach((k) => { item[k] = mapping[k] ? numFrom(row[mapping[k]]) : 0; });
    ['initialScore', 'w1Score', 'w2Score', 'w3Score', 'w4Score', 'finalScore'].forEach((k) => { item[k] = mapping[k] ? numFrom(row[mapping[k]]) : 0; });
    return item;
  };

  const handleSyncContent = (item, category = '') => {
    if (onSyncContent) {
      onSyncContent({ type: 'content', country: countryKey, week: selectedWeek, category, url: item.link, title: item.title, hypothesis: item.hypothesis, analysis: item.analysis, salesImpact: item.salesImpact });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{country.label} 대시보드 · {selectedWeek}</h2>
        <div className="flex gap-1.5">
          {[{ key: 'overview', label: '전체 현황' }, { key: 'content', label: '콘텐츠별 성과 및 분석' }, { key: 'product', label: '제품군별 성과' }].map((t) => (
            <button key={t.key} onClick={() => setSubView(t.key)}
              style={{ padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: `1.5px solid ${subView === t.key ? C.ink : C.border}`, background: subView === t.key ? C.ink : '#fff', color: subView === t.key ? '#fff' : C.sub, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: subView === 'overview' ? 'block' : 'none' }}>
      <SectionLabel color={ACCOUNT_METRICS.sales.color}>매출 · 유입</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-1">
        {[
          { k: 'sales', subs: [{ key: 'salesAchieveRate', icon: Check }] },
          { k: 'inflow', subs: [{ key: 'inflowAchieveRate', icon: Check }] },
        ].map(({ k, subs }) => (
          <HeroCard key={k} metricsMap={ACCOUNT_METRICS} mkey={k} value={totals(selectedWeek)[k]} delta={wowDelta(k)}
            sub={
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}`, width: '100%' }}>
                {subs.map(({ key: subKey, icon: SubIcon }) => (
                  <div key={subKey} className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <SubIcon size={12} color={ACCOUNT_METRICS[subKey].color} />
                      <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{ACCOUNT_METRICS[subKey].label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{fmtMetric(subKey, totals(selectedWeek)[subKey])}</span>
                      <DeltaTag value={wowDelta(subKey)} />
                    </div>
                  </div>
                ))}
              </div>
            }
          />
        ))}
      </div>

      <SectionLabel color={ACCOUNT_METRICS.reach.color} sub="도달·조회수는 오가닉 값을 함께 표시">채널 핵심지표</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-3">
        <ReachOrganicCard mkey="reach" organicKey="organicReach" value={totals(selectedWeek).reach} organicValue={totals(selectedWeek).organicReach} delta={wowDelta('reach')} organicDelta={wowDelta('organicReach')} />
        <ReachOrganicCard mkey="views" organicKey="organicViews" value={totals(selectedWeek).views} organicValue={totals(selectedWeek).organicViews} delta={wowDelta('views')} organicDelta={wowDelta('organicViews')} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="engagement" value={totals(selectedWeek).engagement} delta={wowDelta('engagement')} />
      </div>
      <div className="flex flex-wrap gap-3 mb-1">
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="contentsCount" value={totals(selectedWeek).contentsCount} delta={wowDelta('contentsCount')} />
        <HeroCard metricsMap={{ hitRate: { label: '콘텐츠 타율', icon: Target, color: '#2E9E89' } }} mkey="hitRate" value={weekHitRate ?? 0} delta={hitRateDelta} infoText={baselineInfoText} />
      </div>

      <SectionLabel color={ACCOUNT_METRICS.newFollowers.color}>계정 성장 / 구매유도</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-7">
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="newFollowers" value={totals(selectedWeek).newFollowers} delta={wowDelta('newFollowers')} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="profileVisits" value={totals(selectedWeek).profileVisits} delta={wowDelta('profileVisits')} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="websiteClicks" value={totals(selectedWeek).websiteClicks} delta={wowDelta('websiteClicks')} />
      </div>

      {(() => {
        const NORM_KEYS = ['sales', 'inflow', 'reach', 'engagement'];
        const normData = trendData.map((d) => {
          const entry = { week: d.week };
          NORM_KEYS.forEach((k) => {
            const base = trendData[0][k];
            entry[k] = base > 0 ? Math.round((d[k] / base) * 100) : 0;
            entry[`_raw_${k}`] = d[k];
          });
          return entry;
        });
        const renderNormTooltip = ({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          return (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: SHADOW }}>
              <div style={{ fontWeight: 800, marginBottom: 6, color: C.ink }}>{label}</div>
              {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-1.5" style={{ color: C.ink, marginBottom: 3 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ minWidth: 50 }}>{labelsA[p.dataKey] || p.dataKey}</span>
                  <b>{fmtMetric(p.dataKey, p.payload[`_raw_${p.dataKey}`])}</b>
                  <span style={{ color: C.sub, fontSize: 11 }}>({p.value})</span>
                </div>
              ))}
            </div>
          );
        };
        return (
          <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
            <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px' }}>주간 성과 추이 (매출 · 유입 · 도달수 · 참여수)</h3>
                <div style={{ fontSize: 12, color: C.sub }}>{selectedWeek} 기준 최근 {displayWeeks.length}주 · 첫 주 대비 지수(=100) · 스케일이 다른 지표를 한 그래프에서 비교</div>
              </div>
              <button onClick={() => setShowReachEngTable((v) => !v)} className="flex items-center gap-1.5"
                style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showReachEngTable ? C.ink : '#fff', color: showReachEngTable ? '#fff' : C.sub, cursor: 'pointer' }}>
                {showReachEngTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
              </button>
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={normData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={renderNormTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => labelsA[v] || v} />
                  <Line type="monotone" dataKey="sales" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="inflow" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="reach" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="engagement" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {showReachEngTable && (
              <div style={{ marginTop: 14, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 480 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      {['주차', '매출', '유입', '도달수', '참여수'].map((h) => (
                        <th key={h} style={{ textAlign: h === '주차' ? 'left' : 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {normData.map((d, i) => (
                      <tr key={d.week} style={{ borderBottom: `1px solid ${C.border}`, background: d.week === selectedWeek ? `${C.accent}08` : i % 2 === 0 ? C.bg : '#fff' }}>
                        <td style={{ padding: '7px 10px', fontWeight: d.week === selectedWeek ? 800 : 600, color: d.week === selectedWeek ? C.accent : C.ink }}>{d.week}{d.week === selectedWeek ? ' ★' : ''}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmtMetric('sales', d._raw_sales)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d._raw_inflow)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d._raw_reach)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d._raw_engagement)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px' }}>신규 팔로우 · 프로필 방문 · 웹사이트 클릭 추이</h3>
            <div style={{ fontSize: 12, color: C.sub }}>{selectedWeek} 기준 최근 {displayWeeks.length}주 · 첫 주 대비 지수(=100) · 툴팁에 실제값 표시</div>
          </div>
          <button onClick={() => setShowMetricsTable((v) => !v)} className="flex items-center gap-1.5"
            style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showMetricsTable ? C.ink : '#fff', color: showMetricsTable ? '#fff' : C.sub, cursor: 'pointer' }}>
            {showMetricsTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
          </button>
        </div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={secondaryTrendNorm} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
              <Tooltip content={renderSecondaryTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => labelsA[v] || v} />
              <Line type="monotone" dataKey="newFollowers" stroke={ACCOUNT_METRICS.newFollowers.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="profileVisits" stroke={ACCOUNT_METRICS.profileVisits.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="websiteClicks" stroke={ACCOUNT_METRICS.websiteClicks.color} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {showMetricsTable && (
          <div style={{ marginTop: 14, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['주차','도달','참여','신규 팔로우','프로필 방문','웹사이트 클릭'].map((h) => (
                    <th key={h} style={{ textAlign: h==='주차'?'left':'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayWeeks.map((w, i) => (
                  <tr key={w} style={{ borderBottom: `1px solid ${C.border}`, background: w===selectedWeek ? `${C.accent}08` : i%2===0 ? C.bg : '#fff' }}>
                    <td style={{ padding:'7px 10px', fontWeight: w===selectedWeek?800:600, color: w===selectedWeek?C.accent:C.ink }}>{w}{w===selectedWeek?' ★':''}</td>
                    <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(totals(w).reach)}</td>
                    <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(totals(w).engagement)}</td>
                    <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(totals(w).newFollowers)}</td>
                    <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(totals(w).profileVisits)}</td>
                    <td style={{ padding:'7px 10px', textAlign:'right' }}>{fmt(totals(w).websiteClicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button onClick={() => setShowInputTable((v) => !v)} className="flex items-center gap-1" style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {showInputTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 주간 데이터 입력 · 수정
        </button>
        {showInputTable && <div style={{ marginTop: 10 }}><AccountMetricsTable weekKeys={weekKeys} metrics={metrics} onChange={(w, k, v) => onAccountChange(countryKey, w, k, v)} /></div>}
      </div>

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 2 }}>
          <div className="flex items-center gap-1.5">
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>주차별 릴스 발행 수 · 타율</h3>
            <InfoTip text={baselineInfoText} />
          </div>
          <button onClick={() => setShowReelsTable((v) => !v)} className="flex items-center gap-1.5"
            style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showReelsTable ? C.ink : '#fff', color: showReelsTable ? '#fff' : C.sub, cursor: 'pointer' }}>
            {showReelsTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
          </button>
        </div>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>그래프는 최근 {displayWeeks.length}주 표시 (타율 기준선은 직전 {BASELINE_WEEKS}주 별도 산출) · 툴팁에 평균 도달 표시</div>
        <div style={{ width: '100%', height: 210 }}>
          <ResponsiveContainer>
            <ComposedChart data={countryReelsWeekData} margin={{ top: 20, right: 40, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip content={(props) => <ReelsTooltip {...props} allContents={allContents} countryKey={countryKey} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => ({ reelCount: '릴스 발행 수', hitRate: '타율 (%)' }[v] || v)} />
              <Bar yAxisId="left" dataKey="reelCount" fill={ACCOUNT_METRICS.views.color} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="reelCount" position="top" style={{ fontSize: 11, fontWeight: 700, fill: C.ink }} />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="hitRate" stroke="#2E9E89" strokeWidth={2.5} dot={{ r: 4 }} label={{ position: 'top', fontSize: 10, fontWeight: 700, fill: '#2E9E89', formatter: (v) => v != null ? `${v}%` : '' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {showReelsTable && (
          <div style={{ marginTop: 14, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 380 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['주차', '발행 수', '타율', '평균 도달'].map((h) => (
                    <th key={h} style={{ textAlign: h === '주차' ? 'left' : 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countryReelsWeekData.map((d, i) => (
                  <tr key={d.week} style={{ borderBottom: `1px solid ${C.border}`, background: d.week === selectedWeek ? `${C.accent}08` : i % 2 === 0 ? C.bg : '#fff' }}>
                    <td style={{ padding: '7px 10px', fontWeight: d.week === selectedWeek ? 800 : 600, color: d.week === selectedWeek ? C.accent : C.ink }}>{d.week}{d.week === selectedWeek ? ' ★' : ''}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{d.reelCount}개</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{d.hitRate != null ? `${d.hitRate}%` : '-'}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.avgReach)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(() => {
        const [showProductTable, setShowProductTable] = useState(false);
        const productChartData = displayWeeks.map((w) => {
          const d = productSales[countryKey]?.[w] || {};
          return { week: w, ...Object.fromEntries(PRODUCT_CATS.map((p) => [p.key, Number(d[p.key] || 0)])) };
        });
        return (
          <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
            <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px' }}>제품군별 판매건수 추이</h3>
                <div style={{ fontSize: 12, color: C.sub }}>최근 {displayWeeks.length}주 · 주차별 판매건수</div>
              </div>
              <button onClick={() => setShowProductTable((v) => !v)} className="flex items-center gap-1.5"
                style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showProductTable ? C.ink : '#fff', color: showProductTable ? '#fff' : C.sub, cursor: 'pointer' }}>
                {showProductTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
              </button>
            </div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={productChartData} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip labels={Object.fromEntries(PRODUCT_CATS.map((p) => [p.key, p.label]))} />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => PRODUCT_CATS.find((p) => p.key === v)?.label || v} />
                  {PRODUCT_CATS.map((p) => (
                    <Line key={p.key} type="monotone" dataKey={p.key} stroke={p.color} strokeWidth={2.5} dot={{ r: 3 }}
                      label={{ position: 'top', fontSize: 10, fontWeight: 700, fill: p.color, formatter: (v) => v > 0 ? fmtK(v) : '' }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {showProductTable && (
              <div style={{ marginTop: 14, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 360 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>주차</th>
                      {PRODUCT_CATS.map((p) => <th key={p.key} style={{ textAlign: 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: p.color }}>{p.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {displayWeeks.map((w, i) => {
                      const d = productSales[countryKey]?.[w] || {};
                      return (
                        <tr key={w} style={{ borderBottom: `1px solid ${C.border}`, background: w === selectedWeek ? `${C.accent}08` : i % 2 === 0 ? C.bg : '#fff' }}>
                          <td style={{ padding: '7px 10px', fontWeight: w === selectedWeek ? 800 : 600, color: w === selectedWeek ? C.accent : C.ink }}>{w}{w === selectedWeek ? ' ★' : ''}</td>
                          {PRODUCT_CATS.map((p) => <td key={p.key} style={{ padding: '7px 10px', textAlign: 'right', color: C.ink }}>{fmt(d[p.key] || 0)}</td>)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      <div className="mb-8" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
        <div className="flex items-center gap-2 mb-2">
          <NotebookPen size={16} color={C.accent} />
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>인사이트 · {selectedWeek}</h3>
          <span style={{ fontSize: 11, color: C.sub, marginLeft: 'auto' }}>내용 입력 후 1초 뒤 자동 저장</span>
        </div>
        <TextAreaField
          value={countryInsights[countryKey]?.[selectedWeek] || ''}
          onChange={(v) => onInsightChange(countryKey, selectedWeek, v)}
          placeholder="이번 주 전체적인 분석/인사이트를 자유롭게 기록하세요." rows={4}
        />
      </div>

      </div>

      {subView === 'content' && (
        <div>
      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>🏆 상위 콘텐츠 (최대 5개)</h3>
          <InfoTip text={baselineInfoText} />
        </div>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>직전 {BASELINE_WEEKS}주 평균 결합점수(도달+참여, {fmt(Math.round(avgScore))}) 이상인 콘텐츠 중 점수 상위 5개</div>
        <div className="flex flex-col gap-2.5">
          {topContent.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>조건을 만족하는 콘텐츠가 없습니다.</div>}
          {topContent.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onSave={updateAllItem} onDelete={deleteAllItem} showSalesImpact showScoreTracking onSyncInsight={(i) => handleSyncContent(i, '상위')} avgScore={avgScore} gasUrl={gasUrl} country={countryKey} />)}
        </div>
      </div>

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>📉 하위 콘텐츠 (최대 5개)</h3>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>직전 {BASELINE_WEEKS}주 평균 결합점수(도달+참여, {fmt(Math.round(avgScore))}) 미만인 콘텐츠 중 점수 하위 5개</div>
        <div className="flex flex-col gap-2.5">
          {bottomContent.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>조건을 만족하는 콘텐츠가 없습니다.</div>}
          {bottomContent.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onSave={updateAllItem} onDelete={deleteAllItem} showSalesImpact showScoreTracking onSyncInsight={(i) => handleSyncContent(i, '하위')} avgScore={avgScore} gasUrl={gasUrl} country={countryKey} />)}
        </div>
      </div>

      {(() => {
        const retroList = weekKeys.flatMap((w) => (allContents[countryKey]?.[w] || []).map((item) => { const growth = isRetroGrowth(item, weekKeys, selectedWeek); return growth !== null ? { item, week: w, growth } : null; }).filter(Boolean)).sort((a, b) => b.growth - a.growth);
        return (
          <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
              <Rocket size={15} color={C.mint} />
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>역주행 / 성장 콘텐츠</h3>
              <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>({retroList.length}건)</span>
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>{selectedWeek} 기준 2주↑ 전 발행 · 초기 대비 성장률 +100%↑ · 최종 누적 도달 5,000↑</div>
            {retroList.length === 0 ? <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>조건을 만족하는 역주행/성장 콘텐츠가 없습니다.</div>
              : <div className="flex flex-col gap-2.5">{retroList.map(({ item, week: w, growth }) => <div key={`retro-${item.id}`}><div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 4 }}>{w} 발행 · 초기 {fmt(item.initialScore)} → 최종 {fmt(item.finalScore)}</div><ContentCard item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onSave={updateAllItem} onDelete={deleteAllItem} showSalesImpact showScoreTracking retroBadge={growth} onSyncInsight={(i) => handleSyncContent(i, '역주행')} avgScore={avgScore} gasUrl={gasUrl} country={countryKey} /></div>)}</div>}
          </div>
        );
      })()}

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <button onClick={() => setShowAllList((v) => !v)} className="flex items-center justify-between w-full" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>게시 전체 콘텐츠 리스트 · {selectedWeek} ({weekItems.length}건)</h3>
          {showAllList ? <ChevronUp size={18} color={C.sub} /> : <ChevronDown size={18} color={C.sub} />}
        </button>
        {showAllList && (
          <div style={{ marginTop: 12 }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <ImportSection week={selectedWeek} fields={ALL_IMPORT_FIELDS} guess={ALL_GUESS} mappingStorageKey={`dash2-all-mapping-${countryKey}`} buildItem={buildAllItem} onImport={importAllItems} />
              <button onClick={addAllItem} className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: 'none', background: C.ink, color: '#fff', height: 36 }}><Plus size={14} /> 콘텐츠 추가</button>
            </div>
            <div className="flex flex-col gap-2.5">
              {weekItems.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>{selectedWeek}에 등록된 콘텐츠가 없습니다.</div>}
              {weekItems.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onSave={updateAllItem} onDelete={deleteAllItem} showSalesImpact showScoreTracking onSyncInsight={(i) => handleSyncContent(i, '전체')} avgScore={avgScore} gasUrl={gasUrl} country={countryKey} />)}
            </div>
          </div>
        )}
      </div>
        </div>
      )}

      {subView === 'product' && (() => {
        const prod = PRODUCT_CATS.find((p) => p.key === selectedProduct) || PRODUCT_CATS[0];
        const prodSalesNow = Number(productSales[countryKey]?.[selectedWeek]?.[selectedProduct] || 0);
        const prodSalesPrev = prevWeek ? Number(productSales[countryKey]?.[prevWeek]?.[selectedProduct] || 0) : null;
        const prodSalesDelta = prodSalesPrev != null && prodSalesPrev > 0 ? ((prodSalesNow - prodSalesPrev) / prodSalesPrev) * 100 : null;
        const allWeekItems = Object.entries(allContents[countryKey] || {}).flatMap(([w, items]) => items.map((i) => ({ ...i, _week: w })));
        const prodContentsNow = (allContents[countryKey]?.[selectedWeek] || []).filter((i) => i.productCategory === selectedProduct);
        const prodContentsPrev = prevWeek ? (allContents[countryKey]?.[prevWeek] || []).filter((i) => i.productCategory === selectedProduct) : [];
        const sumReach = (items) => items.reduce((s, i) => s + Number(i.reach || 0), 0);
        const sumEng = (items) => items.reduce((s, i) => s + Number(i.likes || 0) + Number(i.comments || 0) + Number(i.saves || 0) + Number(i.shares || 0), 0);
        const reachNow = sumReach(prodContentsNow); const reachPrev = sumReach(prodContentsPrev);
        const reachDelta = reachPrev > 0 ? ((reachNow - reachPrev) / reachPrev) * 100 : null;
        const engNow = sumEng(prodContentsNow); const engPrev = sumEng(prodContentsPrev);
        const engDelta = engPrev > 0 ? ((engNow - engPrev) / engPrev) * 100 : null;
        const weeklyData = displayWeeks.map((w) => ({ week: w, 구매건수: Number(productSales[countryKey]?.[w]?.[selectedProduct] || 0) }));
        const monthGroupsProd = {};
        weekMeta.forEach((w) => { const m = w.month || '기타'; if (!monthGroupsProd[m]) monthGroupsProd[m] = 0; monthGroupsProd[m] += Number(productSales[countryKey]?.[w.key]?.[selectedProduct] || 0); });
        const dataYear = weekMeta.length ? (weekMeta[0].month || '2026-01').split('-')[0] : '2026';
        const latestM = weekMeta.reduce((max, w) => (w.month && w.month > max ? w.month : max), '');
        const monthlyDataProd = Array.from({ length: 12 }, (_, i) => `${dataYear}-${String(i + 1).padStart(2, '0')}`).filter((m) => m <= latestM).map((m) => ({ month: fmtMonth(m), 구매건수: monthGroupsProd[m] || 0 }));
        const allProdContents = allWeekItems.filter((i) => i.productCategory === selectedProduct).sort((a, b) => combinedScore(b) - combinedScore(a));
        return (
          <div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {PRODUCT_CATS.map((p) => (
                <button key={p.key} onClick={() => setSelectedProduct(p.key)}
                  style={{ padding: '7px 20px', borderRadius: 999, fontSize: 13, fontWeight: 800, border: `2px solid ${selectedProduct === p.key ? p.color : C.border}`, background: selectedProduct === p.key ? `${p.color}18` : '#fff', color: selectedProduct === p.key ? p.color : C.sub, cursor: 'pointer' }}>
                  {p.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 12, fontWeight: 700 }}>전주 대비 · {selectedWeek}</div>
            <div className="flex flex-wrap gap-3 mb-7">
              <HeroCard metricsMap={{ purchases: { label: `${prod.label} 구매건수`, icon: Target, color: prod.color } }} mkey="purchases" value={prodSalesNow} delta={prodSalesDelta} />
              <HeroCard metricsMap={{ reach: { label: `${prod.label} 콘텐츠 도달`, icon: Eye, color: ACCOUNT_METRICS.reach.color } }} mkey="reach" value={reachNow} delta={reachDelta} />
              <HeroCard metricsMap={{ engagement: { label: `${prod.label} 콘텐츠 참여`, icon: Activity, color: ACCOUNT_METRICS.engagement.color } }} mkey="engagement" value={engNow} delta={engDelta} />
            </div>
            <div className="mb-7" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
              <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 2 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{prod.label} 구매건수 주간 추이</h3>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>최근 {displayWeeks.length}주</div>
                </div>
                <button onClick={() => setShowProdWeeklyTable((v) => !v)} className="flex items-center gap-1.5"
                  style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showProdWeeklyTable ? C.ink : '#fff', color: showProdWeeklyTable ? '#fff' : C.sub, cursor: 'pointer' }}>
                  {showProdWeeklyTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
                </button>
              </div>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={weeklyData} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke={C.border} vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip labels={{ 구매건수: `${prod.label} 구매건수` }} />} />
                    <Bar dataKey="구매건수" fill={prod.color} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="구매건수" position="top" style={{ fontSize: 11, fontWeight: 700, fill: prod.color }} formatter={(v) => v > 0 ? fmt(v) : ''} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {showProdWeeklyTable && (
                <div style={{ marginTop: 14, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 240 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                        <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>주차</th>
                        <th style={{ textAlign: 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: prod.color }}>구매건수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyData.map((d, i) => (
                        <tr key={d.week} style={{ borderBottom: `1px solid ${C.border}`, background: d.week === selectedWeek ? `${C.accent}08` : i % 2 === 0 ? C.bg : '#fff' }}>
                          <td style={{ padding: '7px 10px', fontWeight: d.week === selectedWeek ? 800 : 600, color: d.week === selectedWeek ? C.accent : C.ink }}>{d.week}{d.week === selectedWeek ? ' ★' : ''}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.구매건수)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="mb-7" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
              <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 2 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{prod.label} 구매건수 월간 추이</h3>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>월별 누계</div>
                </div>
                <button onClick={() => setShowProdMonthlyTable((v) => !v)} className="flex items-center gap-1.5"
                  style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showProdMonthlyTable ? C.ink : '#fff', color: showProdMonthlyTable ? '#fff' : C.sub, cursor: 'pointer' }}>
                  {showProdMonthlyTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
                </button>
              </div>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={monthlyDataProd} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke={C.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip labels={{ 구매건수: `${prod.label} 구매건수` }} />} />
                    <Bar dataKey="구매건수" fill={prod.color} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="구매건수" position="top" style={{ fontSize: 11, fontWeight: 700, fill: prod.color }} formatter={(v) => v > 0 ? fmtK(v) : ''} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {showProdMonthlyTable && (
                <div style={{ marginTop: 14, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 240 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                        <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>월</th>
                        <th style={{ textAlign: 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: prod.color }}>구매건수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyDataProd.map((d, i) => (
                        <tr key={d.month} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.bg : '#fff' }}>
                          <td style={{ padding: '7px 10px', fontWeight: 700, color: C.ink }}>{d.month}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.구매건수)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="mb-7">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{prod.label} 콘텐츠 성과</h3>
                <span style={{ fontSize: 12, color: C.sub }}>총 {allProdContents.length}건 · 결합점수(도달+참여)순</span>
              </div>
              {allProdContents.length === 0
                ? <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '32px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>"{prod.label}"로 태그된 콘텐츠가 없습니다.<br />콘텐츠 카드 수정 모드에서 제품군을 지정해주세요.</div>
                : <div className="flex flex-col gap-2.5">
                    {allProdContents.map((item) => (
                      <div key={`${item.id}-${item._week}`}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 4 }}>{item._week} 발행</div>
                        <ContentCard item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onSave={updateAllItem} onDelete={deleteAllItem} showSalesImpact showScoreTracking onSyncInsight={(i) => handleSyncContent(i, prod.label)} avgScore={avgScore} gasUrl={gasUrl} country={countryKey} />
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        );
      })()}

      {subView === 'overview' && (() => {
        const monthOrder = []; const monthGroups = {};
        weekMeta.forEach((w) => {
          const m = w.month || '기타';
          if (!monthGroups[m]) { monthGroups[m] = { sales: 0, inflow: 0, reach: 0, engagement: 0 }; monthOrder.push(m); }
          const d = totals(w.key);
          monthGroups[m].sales += Number(d.sales || 0);
          monthGroups[m].inflow += Number(d.inflow || 0);
          monthGroups[m].reach += Number(d.reach || 0);
          monthGroups[m].engagement += Number(d.engagement || 0);
        });
        const NORM_KEYS = ['sales', 'inflow', 'reach', 'engagement'];
        const monthlyRaw = monthOrder.map((m) => ({ month: fmtMonth(m), ...monthGroups[m] }));
        const firstNonZero = (key) => monthlyRaw.find((d) => d[key] > 0)?.[key] || 0;
        const base = { sales: firstNonZero('sales'), inflow: firstNonZero('inflow'), reach: firstNonZero('reach'), engagement: firstNonZero('engagement') };
        const monthlyData = monthlyRaw.map((d) => {
          const entry = { month: d.month };
          NORM_KEYS.forEach((k) => { entry[k] = base[k] > 0 ? Math.round((d[k] / base[k]) * 100) : 0; entry[`_raw_${k}`] = d[k]; });
          return entry;
        });
        const renderMonthlyTooltip = ({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          return (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: SHADOW }}>
              <div style={{ fontWeight: 800, marginBottom: 6, color: C.ink }}>{label}</div>
              {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-1.5" style={{ color: C.ink, marginBottom: 3 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ minWidth: 50 }}>{labelsA[p.dataKey] || p.dataKey}</span>
                  <b>{fmtMetric(p.dataKey, p.payload[`_raw_${p.dataKey}`])}</b>
                  <span style={{ color: C.sub, fontSize: 11 }}>({p.value})</span>
                </div>
              ))}
            </div>
          );
        };
        return (
          <div className="mb-2" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
            <div style={{ marginBottom: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 2px', color: C.sub }}>월간 추이 (참고용)</h3>
              <div style={{ fontSize: 12, color: C.subLite }}>매출 · 유입 · 도달수 · 참여수 · 월별 합계 · 첫 데이터 보유월 대비 지수(=100)</div>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                  <Tooltip content={renderMonthlyTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => labelsA[v] || v} />
                  <Line type="monotone" dataKey="sales" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="inflow" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="reach" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="engagement" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={2} dot={{ r: 2.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// 피드 콘텐츠 뷰
// ============================================================
function FeedView({ weekMeta, selectedWeek, displayWeeks, feedContents, onFeedContentsChange, accountMetrics, allContents, activeProjects, onProjectsChange, onSyncContent }) {
  const [selectedCountry, setSelectedCountry] = useState('KR');
  const [showArchive, setShowArchive] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showFeedTable, setShowFeedTable] = useState(false);
  const [showFollowerCompareTable, setShowFollowerCompareTable] = useState(false);
  const [showMonthlyMetricsTable, setShowMonthlyMetricsTable] = useState(false);
  const [showMonthlyGrowthTable, setShowMonthlyGrowthTable] = useState(false);
  const weekKeys = weekMeta.map((w) => w.key);
  const countryContents = feedContents[selectedCountry] || {};
  const weekContents = countryContents[selectedWeek] || [];
  const weeklyTotals = (country, week) => {
    const list = feedContents[country]?.[week] || [];
    const saves = list.reduce((s, c) => s + Number(c.saves || 0), 0);
    const shares = list.reduce((s, c) => s + Number(c.shares || 0), 0);
    const likes = list.reduce((s, c) => s + Number(c.likes || 0), 0);
    const comments = list.reduce((s, c) => s + Number(c.comments || 0), 0);
    const reach = list.reduce((s, c) => s + Number(c.reach || 0), 0);
    const profileActivity = list.reduce((s, c) => s + Number(c.profileActivity || 0), 0);
    const newFollowers = list.reduce((s, c) => s + Number(c.follows || 0), 0);
    return { saves, shares, likes, comments, reach, profileActivity, newFollowers, contentsCount: list.length, engagement: likes + comments + saves + shares };
  };
  const prevIdx = weekKeys.indexOf(selectedWeek) - 1;
  const prevWeek = prevIdx >= 0 ? weekKeys[prevIdx] : null;
  const heroDelta = (k) => { const cur = weeklyTotals(selectedCountry, selectedWeek)[k]; if (!prevWeek) return null; const prev = weeklyTotals(selectedCountry, prevWeek)[k]; return prev ? ((cur - prev) / prev) * 100 : null; };

  // 피드 발생 신규 팔로우 vs 계정 전체 신규 팔로우(주간) 비교
  const accountNewFollowersAt = (w) => Number(accountMetrics?.[selectedCountry]?.[w]?.newFollowers || 0);
  const accountFollowerCompare = displayWeeks.map((w) => {
    const idx = weekKeys.indexOf(w);
    const prevKey = idx > 0 ? weekKeys[idx - 1] : null;
    const accountNow = accountNewFollowersAt(w);
    const accountPrev = prevKey ? accountNewFollowersAt(prevKey) : null;
    const accountGrowthRate = accountPrev ? Number((((accountNow - accountPrev) / accountPrev) * 100).toFixed(1)) : (accountPrev === 0 ? 0 : null);
    const feedNow = weeklyTotals(selectedCountry, w).newFollowers;
    const feedPrev = prevKey ? weeklyTotals(selectedCountry, prevKey).newFollowers : null;
    const feedGrowthRate = feedPrev ? Number((((feedNow - feedPrev) / feedPrev) * 100).toFixed(1)) : (feedPrev === 0 ? 0 : null);
    return { week: w, feedFollows: feedNow, accountNewFollowers: accountNow, accountGrowthRate, feedGrowthRate, hasPrevAccount: accountPrev != null, hasPrevFeed: feedPrev != null };
  });
  const feedFollowsNow = weeklyTotals(selectedCountry, selectedWeek).newFollowers;
  const feedFollowsPrev = prevWeek ? weeklyTotals(selectedCountry, prevWeek).newFollowers : null;
  const feedFollowsDelta = feedFollowsPrev ? ((feedFollowsNow - feedFollowsPrev) / feedFollowsPrev) * 100 : null;
  const accountNewFollowersNow = accountNewFollowersAt(selectedWeek);
  const accountNewFollowersPrev = prevWeek ? accountNewFollowersAt(prevWeek) : null;
  const accountNewFollowersDelta = accountNewFollowersPrev ? ((accountNewFollowersNow - accountNewFollowersPrev) / accountNewFollowersPrev) * 100 : null;
  const feedShareOfAccount = accountNewFollowersNow > 0 ? Math.round((feedFollowsNow / accountNewFollowersNow) * 100) : null;
  const monthOrder = []; const monthGroups = {};
  weekMeta.forEach((w) => { const m = w.month || '기타'; if (!monthGroups[m]) { monthGroups[m] = { saves: 0, shares: 0, profileActivity: 0, newFollowers: 0 }; monthOrder.push(m); } const t = weeklyTotals(selectedCountry, w.key); monthGroups[m].saves += t.saves; monthGroups[m].shares += t.shares; monthGroups[m].profileActivity += t.profileActivity; monthGroups[m].newFollowers += t.newFollowers; });
  const monthlyChartData = monthOrder.map((m) => ({ month: fmtMonth(m), ...monthGroups[m] }));
  const monthlyGrowthData = monthOrder.map((m, i) => { const cur = monthGroups[m].newFollowers; const prev = i > 0 ? monthGroups[monthOrder[i - 1]].newFollowers : null; const rate = prev ? ((cur - prev) / prev) * 100 : 0; return { month: fmtMonth(m), rate, hasPrev: !!prev }; });
  const insightArchive = [];
  COUNTRIES.forEach((c) => { weekKeys.forEach((w) => { (feedContents[c.key]?.[w] || []).forEach((item) => { if (item.analysis && item.analysis.trim()) insightArchive.push({ country: c.label, week: w, title: item.title, link: item.link, insight: item.analysis }); }); }); });
  insightArchive.reverse();
  const updateContent = (item) => {
    const list = weekContents.map((c) => (c.id === item.id ? item : c));
    onFeedContentsChange({ ...feedContents, [selectedCountry]: { ...countryContents, [selectedWeek]: list } });
  };
  const handleSyncFeedContent = (item) => {
    if (onSyncContent && (item.hypothesis || item.analysis || item.salesImpact)) {
      onSyncContent({ type: 'content', country: selectedCountry, week: selectedWeek, category: '피드', url: item.link, title: item.title, hypothesis: item.hypothesis, analysis: item.analysis, salesImpact: item.salesImpact });
    }
  };
  const deleteContent = (id) => { const list = weekContents.filter((c) => c.id !== id); onFeedContentsChange({ ...feedContents, [selectedCountry]: { ...countryContents, [selectedWeek]: list } }); };
  const addContent = () => { const allIds = Object.values(feedContents).flatMap((byWeek) => Object.values(byWeek).flat()).map((c) => c.id); const newId = (allIds.length ? Math.max(...allIds) : 0) + 1; const list = [...weekContents, blankItem(newId, '새 콘텐츠', FEED_KEYS)]; onFeedContentsChange({ ...feedContents, [selectedCountry]: { ...countryContents, [selectedWeek]: list } }); };
  const importItems = (newList) => { const existingByLink = {}; weekContents.forEach((c) => { if (c.link) existingByLink[c.link] = c; }); const allIds = Object.values(feedContents).flatMap((byWeek) => Object.values(byWeek).flat()).map((c) => c.id); let nextId = (allIds.length ? Math.max(...allIds) : 0) + 1; const built = newList.map((item) => { const existing = item.link ? existingByLink[item.link] : null; return { ...item, id: existing?.id ?? nextId++, hypothesis: existing?.hypothesis || '', analysis: existing?.analysis || '', salesImpact: existing?.salesImpact || '', profileActivity: existing?.profileActivity || 0 }; }); onFeedContentsChange({ ...feedContents, [selectedCountry]: { ...countryContents, [selectedWeek]: built } }); };
  const buildFeedItem = (row, mapping) => { const link = mapping.link ? row[mapping.link] : ''; const item = { id: 0, title: mapping.title ? row[mapping.title] : '', link, hypothesis: '', analysis: '', salesImpact: '', profileActivity: 0 }; ['reach', 'follows', 'likes', 'saves', 'shares', 'comments'].forEach((k) => { item[k] = mapping[k] ? numFrom(row[mapping[k]]) : 0; }); return item; };
  const labelsF = metricLabels(FEED_METRICS);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>피드 콘텐츠 주간 성과 리포트</h2>
        <div className="flex gap-1.5">
          {COUNTRIES.map((c) => <button key={c.key} onClick={() => setSelectedCountry(c.key)} style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, border: `1px solid ${c.key === selectedCountry ? C.ink : C.border}`, background: c.key === selectedCountry ? C.ink : '#fff', color: c.key === selectedCountry ? '#fff' : C.sub }}>{c.label}</button>)}
        </div>
      </div>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>{selectedWeek} · {COUNTRIES.find((c) => c.key === selectedCountry)?.label} · 피드(캐러셀/포토)만 집계</div>

      <SectionLabel color={FEED_METRICS.profileActivity.color}>피드 핵심 지표 · {selectedWeek}</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-3">
        <HeroCard metricsMap={{ reach: { label: '도달', icon: Eye, color: '#3E8FB0' } }} mkey="reach" value={weeklyTotals(selectedCountry, selectedWeek).reach} delta={heroDelta('reach')} />
        <HeroCard metricsMap={{ engagement: { label: '참여', icon: Activity, color: '#6C5CE7' } }} mkey="engagement" value={weeklyTotals(selectedCountry, selectedWeek).engagement} delta={heroDelta('engagement')} />
      </div>
      <div className="flex flex-wrap gap-3 mb-7">
        <HeroCard metricsMap={{ likes: { label: '좋아요', icon: Heart, color: '#E8546B' } }} mkey="likes" value={weeklyTotals(selectedCountry, selectedWeek).likes} delta={heroDelta('likes')} />
        <HeroCard metricsMap={{ comments: { label: '댓글', icon: MessageCircle, color: '#4C6FBF' } }} mkey="comments" value={weeklyTotals(selectedCountry, selectedWeek).comments} delta={heroDelta('comments')} />
        <HeroCard metricsMap={FEED_METRICS} mkey="saves" value={weeklyTotals(selectedCountry, selectedWeek).saves} delta={heroDelta('saves')} />
        <HeroCard metricsMap={FEED_METRICS} mkey="shares" value={weeklyTotals(selectedCountry, selectedWeek).shares} delta={heroDelta('shares')} />
      </div>
      <div className="flex flex-wrap gap-3 mb-7">
        <HeroCard metricsMap={{ contentsCount: { label: '콘텐츠 수', icon: FileStack, color: '#E08A2B' } }} mkey="contentsCount" value={weeklyTotals(selectedCountry, selectedWeek).contentsCount} delta={heroDelta('contentsCount')} />
        <HeroCard metricsMap={{ profileActivity: { label: '[수동 기입] 프로필 활동', icon: UserCheck, color: '#6C5CE7' } }} mkey="profileActivity" value={weeklyTotals(selectedCountry, selectedWeek).profileActivity} delta={heroDelta('profileActivity')} />
      </div>

      {(() => {
        const FEED_TREND_LABELS = { reach: '도달', engagement: '참여', saves: '저장수', shares: '공유수', profileActivity: '프로필 활동' };
        const FEED_TREND_COLORS = { reach: '#3E8FB0', engagement: '#6C5CE7', saves: '#E8546B', shares: '#E08A2B', profileActivity: '#2E9E89' };
        const rawTrend = displayWeeks.map((w) => ({ week: w, ...weeklyTotals(selectedCountry, w) }));
        const renderFeedTrendTooltip = ({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          return (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: SHADOW }}>
              <div style={{ fontWeight: 800, marginBottom: 6, color: C.ink }}>{label}</div>
              {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-1.5" style={{ color: C.ink, marginBottom: 3 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ minWidth: 60 }}>{FEED_TREND_LABELS[p.dataKey] || p.dataKey}</span>
                  <b>{fmt(p.value)}</b>
                </div>
              ))}
            </div>
          );
        };
        return (
          <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
            <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px' }}>피드 핵심 지표 추이</h3>
                <div style={{ fontSize: 12, color: C.sub }}>{selectedWeek} 기준 최근 {displayWeeks.length}주 · 도달은 좌측 축, 나머지 지표는 우측 축(스케일 차이로 인해 안 보이는 현상 방지)</div>
              </div>
              <button onClick={() => setShowFeedTable((v) => !v)} className="flex items-center gap-1.5"
                style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showFeedTable ? C.ink : '#fff', color: showFeedTable ? '#fff' : C.sub, cursor: 'pointer' }}>
                {showFeedTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
              </button>
            </div>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <ComposedChart data={rawTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                  <Tooltip content={renderFeedTrendTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => FEED_TREND_LABELS[v] || v} />
                  <Line yAxisId="left" type="monotone" dataKey="reach" stroke={FEED_TREND_COLORS.reach} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="engagement" stroke={FEED_TREND_COLORS.engagement} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="saves" stroke={FEED_TREND_COLORS.saves} strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="shares" stroke={FEED_TREND_COLORS.shares} strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="profileActivity" stroke={FEED_TREND_COLORS.profileActivity} strokeWidth={2} dot={{ r: 2.5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {showFeedTable && (
              <div style={{ marginTop: 14, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 520 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      {['주차', '도달', '참여', '저장', '공유', '프로필 활동'].map((h) => (
                        <th key={h} style={{ textAlign: h === '주차' ? 'left' : 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawTrend.map((d, i) => (
                      <tr key={d.week} style={{ borderBottom: `1px solid ${C.border}`, background: d.week === selectedWeek ? `${C.accent}08` : i % 2 === 0 ? C.bg : '#fff' }}>
                        <td style={{ padding: '7px 10px', fontWeight: d.week === selectedWeek ? 800 : 600, color: d.week === selectedWeek ? C.accent : C.ink }}>{d.week}{d.week === selectedWeek ? ' ★' : ''}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.reach)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.engagement)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.saves)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.shares)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.profileActivity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>콘텐츠별 성과 · {selectedWeek}</h3>
          <div className="flex gap-2">
            <ImportSection week={selectedWeek} fields={FEED_IMPORT_FIELDS} guess={FEED_GUESS} mappingStorageKey={`dash2-feed-mapping-${selectedCountry}`} buildItem={buildFeedItem} onImport={importItems} />
            <button onClick={addContent} className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: 'none', background: C.ink, color: '#fff', height: 36 }}><Plus size={14} /> 콘텐츠 추가</button>
          </div>
        </div>
        <div className="flex items-start gap-1.5" style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 10, background: '#FFF4E0', border: '1px solid #F2D9A8' }}>
          <AlertCircle size={14} color="#B8762E" style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#8A5A1E', lineHeight: 1.5 }}><b>프로필 활동 수는 자동 수집되지 않아요.</b> 콘텐츠 카드를 수정 모드로 열어 직접 입력해주셔야 위 핵심 지표·추이 그래프에 반영돼요.</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {weekContents.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '24px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>{COUNTRIES.find((c) => c.key === selectedCountry)?.label} {selectedWeek}에 등록된 피드 콘텐츠가 없습니다.</div>}
          {weekContents.map((item) => <ContentCard key={item.id} item={item} coreKeys={FEED_CORE} subKeys={FEED_SUB} metricsMap={FEED_METRICS} onSave={updateContent} onDelete={deleteContent} onSyncInsight={handleSyncFeedContent} showThumbnailUpload />)}
        </div>
      </div>
      <div className="mb-8">
        <SectionLabel color={ACCOUNT_METRICS.newFollowers.color}>팔로워 현황 비교</SectionLabel>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 12, marginTop: -6 }}>피드 콘텐츠로 발생한 신규 팔로우와 계정 전체 주간 신규 팔로우를 함께 비교합니다.</div>
        <div className="flex flex-wrap gap-3 mb-4">
          <HeroCard metricsMap={{ feedFollows: { label: '피드 발생 신규 팔로우', icon: UserPlus, color: FEED_METRICS.profileActivity.color } }} mkey="feedFollows" value={feedFollowsNow} delta={feedFollowsDelta} />
          <HeroCard metricsMap={{ accountNewFollowers: { label: '계정 전체 신규 팔로우', icon: UserCheck, color: ACCOUNT_METRICS.newFollowers.color } }} mkey="accountNewFollowers" value={accountNewFollowersNow} delta={accountNewFollowersDelta}
            sub={feedShareOfAccount != null && (
              <span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>피드 비중 {feedShareOfAccount}%</span>
            )} />
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
          <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>주차별 피드 발생 팔로우 · 계정 전체 신규 팔로우 증감률</span>
              <InfoTip text="피드 콘텐츠만의 합계가 아닌 계정 전체 신규 팔로워 증감률 현황입니다." />
            </div>
            <button onClick={() => setShowFollowerCompareTable((v) => !v)} className="flex items-center gap-1.5"
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showFollowerCompareTable ? C.ink : '#fff', color: showFollowerCompareTable ? '#fff' : C.sub, cursor: 'pointer' }}>
              {showFollowerCompareTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
            </button>
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>막대: 피드 발생 신규 팔로우 수(좌축) · 선: 계정 전체 신규 팔로우 전주 대비 증감률(우축, %)</div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <ComposedChart data={accountFollowerCompare} margin={{ top: 18, right: 30, left: -10, bottom: 0 }}>
                <CartesianGrid stroke={C.border} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<ChartTooltip labels={{ feedFollows: '피드 발생 팔로우', accountGrowthRate: '계정 신규 팔로우 증감률' }} />} />
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => ({ feedFollows: '피드 발생 팔로우', accountGrowthRate: '계정 신규 팔로우 증감률(%)' }[v] || v)} />
                <Bar yAxisId="left" dataKey="feedFollows" fill={FEED_METRICS.profileActivity.color} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="feedFollows" position="top" style={{ fontSize: 10, fontWeight: 700, fill: FEED_METRICS.profileActivity.color }} />
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="accountGrowthRate" stroke={ACCOUNT_METRICS.newFollowers.color} strokeWidth={2.5} dot={{ r: 4 }} connectNulls
                  label={{ position: 'top', fontSize: 10, fontWeight: 700, fill: ACCOUNT_METRICS.newFollowers.color, formatter: (v) => v != null ? `${v}%` : '' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {showFollowerCompareTable && (
            <div style={{ marginTop: 14, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 520 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {['주차', '피드 발생 팔로우', '피드 증감률', '계정 신규 팔로우', '계정 증감률'].map((h) => (
                      <th key={h} style={{ textAlign: h === '주차' ? 'left' : 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accountFollowerCompare.map((d, i) => (
                    <tr key={d.week} style={{ borderBottom: `1px solid ${C.border}`, background: d.week === selectedWeek ? `${C.accent}08` : i % 2 === 0 ? C.bg : '#fff' }}>
                      <td style={{ padding: '7px 10px', fontWeight: d.week === selectedWeek ? 800 : 600, color: d.week === selectedWeek ? C.accent : C.ink }}>{d.week}{d.week === selectedWeek ? ' ★' : ''}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.feedFollows)}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right' }}>{d.hasPrevFeed ? `${d.feedGrowthRate}%` : '-'}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.accountNewFollowers)}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right' }}>{d.hasPrevAccount ? `${d.accountGrowthRate}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 8 }}>피드 증감률은 발행 수가 적은 주에 변동폭이 크게 보일 수 있어요.</div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <button onClick={() => setShowMonthly((v) => !v)} className="flex items-center justify-between w-full" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>월간 현황 · {COUNTRIES.find((c) => c.key === selectedCountry)?.label}</h3>
          {showMonthly ? <ChevronUp size={18} color={C.sub} /> : <ChevronDown size={18} color={C.sub} />}
        </button>
        {showMonthly && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-2" style={{ margin: '16px 0 8px' }}>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 700 }}>월별 핵심지표 합계</div>
              <button onClick={() => setShowMonthlyMetricsTable((v) => !v)} className="flex items-center gap-1.5"
                style={{ fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: showMonthlyMetricsTable ? C.ink : '#fff', color: showMonthlyMetricsTable ? '#fff' : C.sub, cursor: 'pointer' }}>
                {showMonthlyMetricsTable ? <ChevronUp size={12} /> : <ChevronDown size={12} />} 데이터표
              </button>
            </div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip labels={labelsF} />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => labelsF[v] || v} />
                  <Line type="monotone" dataKey="saves" stroke={FEED_METRICS.saves.color} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="shares" stroke={FEED_METRICS.shares.color} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="profileActivity" stroke={FEED_METRICS.profileActivity.color} strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {showMonthlyMetricsTable && (
              <div style={{ marginTop: 12, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 380 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      {['월', '저장', '공유', '프로필 활동'].map((h) => (
                        <th key={h} style={{ textAlign: h === '월' ? 'left' : 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyChartData.map((d, i) => (
                      <tr key={d.month} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.bg : '#fff' }}>
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: C.ink }}>{d.month}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.saves)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.shares)}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d.profileActivity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-between flex-wrap gap-2" style={{ margin: '20px 0 8px' }}>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 700 }}>월별 신규 팔로우 증감률 (%)</div>
              <button onClick={() => setShowMonthlyGrowthTable((v) => !v)} className="flex items-center gap-1.5"
                style={{ fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: showMonthlyGrowthTable ? C.ink : '#fff', color: showMonthlyGrowthTable ? '#fff' : C.sub, cursor: 'pointer' }}>
                {showMonthlyGrowthTable ? <ChevronUp size={12} /> : <ChevronDown size={12} />} 데이터표
              </button>
            </div>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyGrowthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>{monthlyGrowthData.map((d, i) => <Cell key={i} fill={!d.hasPrev ? C.border : d.rate >= 0 ? C.mint : C.accent} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {showMonthlyGrowthTable && (
              <div style={{ marginTop: 12, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 240 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>월</th>
                      <th style={{ textAlign: 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>전월 대비</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyGrowthData.map((d, i) => (
                      <tr key={d.month} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.bg : '#fff' }}>
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: C.ink }}>{d.month}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right' }}>{d.hasPrev ? `${d.rate.toFixed(1)}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mb-8" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
        <button onClick={() => setShowArchive((v) => !v)} className="flex items-center justify-between w-full" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span className="flex items-center gap-2"><BookOpen size={16} color={C.accent} /><h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.ink }}>분석 아카이브</h3><span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>({insightArchive.length}건)</span></span>
          {showArchive ? <ChevronUp size={18} color={C.sub} /> : <ChevronDown size={18} color={C.sub} />}
        </button>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>콘텐츠 카드에서 작성한 [분석 & 추후 방안] 내용이 국가·주차와 함께 모두 누적됩니다.</div>
        {showArchive && (
          <div className="flex flex-col gap-2" style={{ marginTop: 12 }}>
            {insightArchive.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>아직 기록된 인사이트가 없습니다.</div>}
            {insightArchive.map((entry, i) => (
              <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', background: '#fff' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 999, padding: '1px 8px' }}>{entry.country} · {entry.week}</span>
                  <a href={entry.link || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 700, color: C.ink, textDecoration: 'none' }}>{entry.title || '(제목 없음)'}{entry.link && <ExternalLink size={11} color={C.sub} />}</a>
                </div>
                <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{entry.insight}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 메인 앱
// ============================================================
export default function Dashboard() {
  const [view, setView] = useState('summary');
  const [weekMeta, setWeekMeta] = useState(initialWeekMeta);
  const [selectedWeek, setSelectedWeek] = useState('W24');
  const [feedContents, setFeedContents] = useState(initialFeedContents);
  const [allContents, setAllContents] = useState(initialAllContents);
  const [accountMetrics, setAccountMetrics] = useState(initialAccountMetrics);
  const [countryInsights, setCountryInsights] = useState(initialCountryInsights);
  const [activeProjects, setActiveProjects] = useState(initialActiveProjects);
  const [productSales, setProductSales] = useState(initialProductSales);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [showAddWeek, setShowAddWeek] = useState(false);
  const [newWeekKey, setNewWeekKey] = useState('');
  const [newWeekMonth, setNewWeekMonth] = useState('');

  // ── GAS 연동 상태 ─────────────────────────────────────────
  const [gasUrl, setGasUrl] = useState('');
  const [gasInput, setGasInput] = useState('');
  const [showGasPanel, setShowGasPanel] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const insightSyncTimer = useRef(null);

  const syncToGAS = useCallback(async (payload) => {
    if (!gasUrl) return;
    setSyncStatus('syncing');
    try {
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
      setSyncStatus('ok');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }, [gasUrl]);

  useEffect(() => {
    (async () => {
      try {
        const [w, f, a, am, ci, ap, ps, gasR] = await Promise.all([
          window.storage.get(STORAGE_WEEKS_KEY, true).catch(() => null),
          window.storage.get(STORAGE_FEED_KEY, true).catch(() => null),
          window.storage.get(STORAGE_ALL_KEY, true).catch(() => null),
          window.storage.get(STORAGE_ACCOUNT_KEY, true).catch(() => null),
          window.storage.get(STORAGE_INSIGHTS_KEY, true).catch(() => null),
          window.storage.get(STORAGE_PROJECTS_KEY, true).catch(() => null),
          window.storage.get(STORAGE_PRODUCT_KEY, true).catch(() => null),
          window.storage.get(STORAGE_GAS_URL_KEY, true).catch(() => null),
        ]);
        let meta = initialWeekMeta;
        if (w?.value) { meta = JSON.parse(w.value); setWeekMeta(meta); } else await window.storage.set(STORAGE_WEEKS_KEY, JSON.stringify(initialWeekMeta), true);
        if (f?.value) setFeedContents(JSON.parse(f.value)); else await window.storage.set(STORAGE_FEED_KEY, JSON.stringify(initialFeedContents), true);
        if (a?.value) setAllContents(JSON.parse(a.value)); else await window.storage.set(STORAGE_ALL_KEY, JSON.stringify(initialAllContents), true);
        if (am?.value) setAccountMetrics(JSON.parse(am.value)); else await window.storage.set(STORAGE_ACCOUNT_KEY, JSON.stringify(initialAccountMetrics), true);
        if (ci?.value) setCountryInsights(JSON.parse(ci.value)); else await window.storage.set(STORAGE_INSIGHTS_KEY, JSON.stringify(initialCountryInsights), true);
        if (ap?.value) setActiveProjects(JSON.parse(ap.value)); else await window.storage.set(STORAGE_PROJECTS_KEY, JSON.stringify(initialActiveProjects), true);
        if (ps?.value) setProductSales(JSON.parse(ps.value)); else await window.storage.set(STORAGE_PRODUCT_KEY, JSON.stringify(initialProductSales), true);
        if (gasR?.value) { setGasUrl(gasR.value); setGasInput(gasR.value); }
        if (meta.length) setSelectedWeek(meta[meta.length - 1].key);
      } catch (e) { console.error('load error', e); } finally { setLoading(false); }
    })();
  }, []);

  const persist = useCallback(async (key, value, setter) => {
    setter(value);
    try { await window.storage.set(key, JSON.stringify(value), true); setSaveError(false); } catch (e) { setSaveError(true); }
  }, []);

  // ── 구글시트 → 대시보드 자동 불러오기 (GAS doGet 호출) ──────
  // 수치형 성과 지표는 시트 최신값으로 갱신하고, 가설/분석/제품명/발행일/썸네일/프로필 활동 등
  // 사람이 직접 입력한 값은 보존합니다(콘텐츠는 link 기준으로 매칭).
  const [pullStatus, setPullStatus] = useState('idle'); // idle | loading | done | error
  const pullFromGAS = useCallback(async () => {
    if (!gasUrl) return;
    setPullStatus('loading');
    try {
      const weeksToRequest = Math.max(weekMeta.length, 12);
      const res = await fetch(`${gasUrl}?type=all&weeks=${weeksToRequest}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'GAS 응답 오류');

      // 1) 주차 메타: GAS 제공 주차 + 로컬에만 있는 주차(수동 추가분) 합치기
      const gasWeeks = data.weekMeta || [];
      const weekNum = (k) => Number(String(k).replace(/[^0-9]/g, '')) || 0;
      const localOnlyWeeks = weekMeta.filter((w) => !gasWeeks.some((g) => g.key === w.key));
      const nextWeekMeta = [...gasWeeks.map((g) => ({ key: g.key, month: g.month })), ...localOnlyWeeks].sort((a, b) => weekNum(a.key) - weekNum(b.key));

      // 2) 계정 지표: GAS가 보내는 필드만 갱신 (pace처럼 GAS가 안 보내는 필드는 자동 보존됨)
      const nextAccount = { ...accountMetrics };
      COUNTRIES.forEach((c) => {
        const country = c.key;
        const gasByWeek = data.accountMetrics?.[country] || {};
        nextAccount[country] = { ...(nextAccount[country] || {}) };
        Object.keys(gasByWeek).forEach((wk) => {
          const existing = nextAccount[country][wk] || zeroAccount();
          nextAccount[country][wk] = { ...existing, ...gasByWeek[wk] };
        });
      });

      // 3) 콘텐츠(릴스/전체) + 피드: link 기준 매칭, 수동 입력 필드 보존
      const PRESERVE_CONTENT_FIELDS = ['hypothesis', 'analysis', 'salesImpact', 'thumbnail'];
      const mergeReelList = (localList, freshList) => {
        const byLink = {};
        localList.forEach((it) => { if (it.link) byLink[it.link] = it; });
        const merged = freshList.map((fresh) => {
          const existing = fresh.link ? byLink[fresh.link] : null;
          if (!existing) return fresh;
          const out = { ...fresh, id: existing.id };
          PRESERVE_CONTENT_FIELDS.forEach((f) => { out[f] = existing[f]; });
          out.productCategory = existing.productCategory || fresh.productCategory;
          out.productNames = (existing.productNames && existing.productNames.length) ? existing.productNames : fresh.productNames;
          out.publishDate = existing.publishDate || fresh.publishDate;
          return out;
        });
        const freshLinks = new Set(freshList.filter((f) => f.link).map((f) => f.link));
        const localOnly = localList.filter((it) => !it.link || !freshLinks.has(it.link));
        return [...merged, ...localOnly];
      };
      const mergeFeedList = (localList, freshList) => {
        const byLink = {};
        localList.forEach((it) => { if (it.link) byLink[it.link] = it; });
        const merged = freshList.map((fresh) => {
          const existing = fresh.link ? byLink[fresh.link] : null;
          if (!existing) return fresh;
          const out = { ...fresh, id: existing.id };
          PRESERVE_CONTENT_FIELDS.forEach((f) => { out[f] = existing[f]; });
          out.profileActivity = existing.profileActivity; // GAS는 항상 0을 보내므로 무조건 보존(수동 기입 전용 필드)
          return out;
        });
        const freshLinks = new Set(freshList.filter((f) => f.link).map((f) => f.link));
        const localOnly = localList.filter((it) => !it.link || !freshLinks.has(it.link));
        return [...merged, ...localOnly];
      };

      const nextAll = { ...allContents };
      const nextFeed = { ...feedContents };
      COUNTRIES.forEach((c) => {
        const country = c.key;
        const freshAllByWeek = data.allContents?.[country] || {};
        const freshFeedByWeek = data.feedContents?.[country] || {};
        nextAll[country] = { ...(nextAll[country] || {}) };
        nextFeed[country] = { ...(nextFeed[country] || {}) };
        Object.keys(freshAllByWeek).forEach((wk) => {
          nextAll[country][wk] = mergeReelList(nextAll[country][wk] || [], freshAllByWeek[wk] || []);
        });
        Object.keys(freshFeedByWeek).forEach((wk) => {
          nextFeed[country][wk] = mergeFeedList(nextFeed[country][wk] || [], freshFeedByWeek[wk] || []);
        });
      });

      // 4) 제품군별 판매건수(APEX): 수동 입력 UI가 없는 순수 집계값이라 그대로 덮어씀
      const nextProductSales = { ...productSales };
      COUNTRIES.forEach((c) => {
        const country = c.key;
        if (data.productSales?.[country]) {
          nextProductSales[country] = { ...(nextProductSales[country] || {}), ...data.productSales[country] };
        }
      });

      await persist(STORAGE_WEEKS_KEY, nextWeekMeta, setWeekMeta);
      await persist(STORAGE_ACCOUNT_KEY, nextAccount, setAccountMetrics);
      await persist(STORAGE_ALL_KEY, nextAll, setAllContents);
      await persist(STORAGE_FEED_KEY, nextFeed, setFeedContents);
      await persist(STORAGE_PRODUCT_KEY, nextProductSales, setProductSales);

      setPullStatus('done');
      setTimeout(() => setPullStatus('idle'), 4000);
    } catch (e) {
      setPullStatus('error');
      setTimeout(() => setPullStatus('idle'), 6000);
    }
  }, [gasUrl, weekMeta, accountMetrics, allContents, feedContents, productSales, persist]);

  const saveGasUrl = async () => {
    const url = gasInput.trim();
    setGasUrl(url);
    try { await window.storage.set(STORAGE_GAS_URL_KEY, url, true); } catch (e) {}
    setShowGasPanel(false);
  };

  const onInsightChange = useCallback((country, week, value) => {
    const next = { ...countryInsights, [country]: { ...countryInsights[country], [week]: value } };
    persist(STORAGE_INSIGHTS_KEY, next, setCountryInsights);
    clearTimeout(insightSyncTimer.current);
    insightSyncTimer.current = setTimeout(() => {
      syncToGAS({ type: 'weekly', country, week, insight: value });
    }, 1000);
  }, [countryInsights, persist, syncToGAS]);

  if (loading) {
    return <div className="flex items-center justify-center" style={{ height: 300, fontFamily: FONT, color: C.sub }}><Loader2 className="animate-spin" size={20} style={{ marginRight: 8 }} /> 데이터 불러오는 중...</div>;
  }

  const weekKeys = weekMeta.map((w) => w.key);
  const endIdx = weekKeys.indexOf(selectedWeek);
  // 주간 그래프는 항상 최근 7주(선택 주차 포함)를 보여줌
  const DISPLAY_WEEKS_COUNT = 7;
  const displayWeeks = weekKeys.slice(Math.max(0, endIdx - (DISPLAY_WEEKS_COUNT - 1)), endIdx + 1);

  const addWeek = () => {
    const key = newWeekKey.trim();
    if (!key || !newWeekMonth) return;
    if (weekKeys.includes(key)) { setSelectedWeek(key); setShowAddWeek(false); return; }
    const nextMeta = [...weekMeta, { key, month: newWeekMonth }];
    const nextFeed = { ...feedContents }; const nextAll = { ...allContents }; const nextAccount = { ...accountMetrics }; const nextInsights = { ...countryInsights };
    COUNTRIES.forEach((c) => { nextFeed[c.key] = { ...(nextFeed[c.key] || {}), [key]: nextFeed[c.key]?.[key] || [] }; nextAll[c.key] = { ...(nextAll[c.key] || {}), [key]: nextAll[c.key]?.[key] || [] }; nextAccount[c.key] = { ...(nextAccount[c.key] || {}), [key]: nextAccount[c.key]?.[key] || zeroAccount() }; nextInsights[c.key] = { ...(nextInsights[c.key] || {}), [key]: nextInsights[c.key]?.[key] || '' }; });
    persist(STORAGE_WEEKS_KEY, nextMeta, setWeekMeta); persist(STORAGE_FEED_KEY, nextFeed, setFeedContents); persist(STORAGE_ALL_KEY, nextAll, setAllContents); persist(STORAGE_ACCOUNT_KEY, nextAccount, setAccountMetrics); persist(STORAGE_INSIGHTS_KEY, nextInsights, setCountryInsights);
    setSelectedWeek(key); setShowAddWeek(false); setNewWeekKey(''); setNewWeekMonth('');
  };

  const onAccountChange = (country, week, key, value) => {
    const next = { ...accountMetrics, [country]: { ...accountMetrics[country], [week]: { ...(accountMetrics[country]?.[week] || zeroAccount()), [key]: value } } };
    persist(STORAGE_ACCOUNT_KEY, next, setAccountMetrics);
  };

  return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: '100%', padding: '24px 20px', color: C.ink }}>
      <div className="max-w-[1400px] mx-auto w-full">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Swatch color={C.accent} size={10} /><Swatch color="#E08A2B" size={10} /><Swatch color="#6C5CE7" size={10} />
            <span style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginLeft: 4 }}>오호라 · 통합 대시보드</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>한/미 SNS 성과 대시보드</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1.5 flex-wrap justify-end" style={{ maxWidth: 520 }}>
            {weekKeys.map((w, i) => (
              <button key={w} onClick={() => setSelectedWeek(w)}
                style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: `1px solid ${w === selectedWeek ? C.accent : C.border}`, background: w === selectedWeek ? C.accent : '#fff', color: w === selectedWeek ? '#fff' : C.sub }}>
                {i === weekKeys.length - 1 ? `${w} (최신)` : w}
              </button>
            ))}
            <button onClick={() => setShowAddWeek((v) => !v)} className="flex items-center gap-1"
              style={{ padding: '7px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: `1px dashed ${C.border}`, background: '#fff', color: C.sub }}>
              <Plus size={13} /> 주차
            </button>
          </div>
          {showAddWeek && (
            <div className="flex items-end gap-2" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 10 }}>
              <label className="flex flex-col gap-1"><span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>주차 이름</span><input type="text" value={newWeekKey} onChange={(e) => setNewWeekKey(e.target.value)} placeholder="예: W25" style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', fontSize: 13, width: 90 }} /></label>
              <label className="flex flex-col gap-1"><span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>월 (월간 현황용)</span><input type="month" value={newWeekMonth} onChange={(e) => setNewWeekMonth(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', fontSize: 13 }} /></label>
              <button onClick={addWeek} style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: C.ink, color: '#fff', fontSize: 13, fontWeight: 700 }}>추가</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = view === n.key;
            return (
              <button key={n.key} onClick={() => setView(n.key)} className="flex items-center gap-1.5"
                style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: `1px solid ${active ? C.ink : C.border}`, background: active ? C.ink : '#fff', color: active ? '#fff' : C.ink }}>
                <Icon size={14} /> {n.label}
              </button>
            );
          })}
        </div>
      </div>

      {showGasPanel && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: SHADOW }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 4 }}>구글시트 자동 연동 설정</div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12, lineHeight: 1.6 }}>
            Apps Script를 배포하고 받은 <b>웹 앱 URL</b>을 붙여넣으세요.<br />
            설정 후 인사이트/분석을 저장하면 시트의 <b>분석아카이브</b>, <b>주간인사이트</b> 탭에 자동 기록됩니다.<br />
            아래 <b>구글시트에서 불러오기</b>를 누르면 도달·참여 등 수치 지표는 최신화되고, 가설·분석·제품명 같은 직접 입력값은 그대로 보존돼요.
          </div>
          <div className="flex gap-2 items-end">
            <label className="flex flex-col gap-1" style={{ flex: 1 }}>
              <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>Apps Script 웹 앱 URL</span>
              <input type="text" value={gasInput} onChange={(e) => setGasInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, width: '100%', background: '#fff', color: C.ink }} />
            </label>
            <button onClick={saveGasUrl} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.mint, color: '#fff', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', height: 38 }}>
              저장
            </button>
            {gasUrl && (
              <button onClick={() => { setGasInput(''); setGasUrl(''); window.storage.set(STORAGE_GAS_URL_KEY, '', true).catch(() => {}); setShowGasPanel(false); }}
                style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.sub, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', height: 38 }}>
                연동 해제
              </button>
            )}
          </div>
          {gasUrl && (
            <div className="flex items-center gap-2" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <button onClick={pullFromGAS} disabled={pullStatus === 'loading'} className="flex items-center gap-1.5"
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.ink, color: '#fff', fontSize: 13, fontWeight: 700, cursor: pullStatus === 'loading' ? 'default' : 'pointer', opacity: pullStatus === 'loading' ? 0.7 : 1 }}>
                {pullStatus === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                구글시트에서 불러오기
              </button>
              {pullStatus === 'done' && <span style={{ fontSize: 12, color: C.mint, fontWeight: 700 }}>✓ 불러오기 완료</span>}
              {pullStatus === 'error' && <span style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>불러오기 실패 — URL/배포 상태를 확인해주세요</span>}
            </div>
          )}
        </div>
      )}

      {view === 'summary' && <SummaryView weekMeta={weekMeta} selectedWeek={selectedWeek} displayWeeks={displayWeeks} accountMetrics={accountMetrics} allContents={allContents} productSales={productSales} onProductSalesChange={(next) => persist(STORAGE_PRODUCT_KEY, next, setProductSales)} />}
      {(view === 'KR' || view === 'US') && (
        <CountryView
          countryKey={view} weekMeta={weekMeta} selectedWeek={selectedWeek} displayWeeks={displayWeeks}
          accountMetrics={accountMetrics} onAccountChange={onAccountChange}
          countryInsights={countryInsights} onInsightChange={onInsightChange}
          allContents={allContents} onAllContentsChange={(next) => persist(STORAGE_ALL_KEY, next, setAllContents)}
          productSales={productSales} onProductSalesChange={(next) => persist(STORAGE_PRODUCT_KEY, next, setProductSales)}
          activeProjects={activeProjects[view]}
          onProjectsChange={(v) => persist(STORAGE_PROJECTS_KEY, { ...activeProjects, [view]: v }, setActiveProjects)}
          onSyncContent={syncToGAS}
          gasUrl={gasUrl}
        />
      )}
      {view === 'feed' && (
        <FeedView weekMeta={weekMeta} selectedWeek={selectedWeek} displayWeeks={displayWeeks}
          feedContents={feedContents} onFeedContentsChange={(next) => persist(STORAGE_FEED_KEY, next, setFeedContents)}
          accountMetrics={accountMetrics} allContents={allContents}
          activeProjects={activeProjects.feed}
          onProjectsChange={(v) => persist(STORAGE_PROJECTS_KEY, { ...activeProjects, feed: v }, setActiveProjects)}
          onSyncContent={syncToGAS}
        />
      )}

      <div style={{ fontSize: 11, color: C.subLite, textAlign: 'center', marginTop: 24 }}>
        모든 데이터는 팀 전체에 공유되며 누구나 입력·수정할 수 있습니다.
        {saveError && <span style={{ color: C.accent, marginLeft: 8 }}>저장 중 오류가 발생했습니다.</span>}
        <div className="flex items-center justify-center gap-3" style={{ marginTop: 10 }}>
          <a
            href="https://docs.google.com/spreadsheets/d/1r1yUxPxvyvZILVhUI0YRamK3Ue0GAHERkerbY5uczLk"
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5"
            style={{ color: C.sub, fontSize: 11, fontWeight: 700, textDecoration: 'none', opacity: 0.7 }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
          >
            <ExternalLink size={11} />
            인사이트 아카이브 시트에서 보기 →
          </a>
          <SyncBadge status={syncStatus} />
          <button onClick={() => setShowGasPanel((v) => !v)} title="구글시트 연동 설정"
            style={{ padding: 5, borderRadius: 6, border: `1px solid ${gasUrl ? C.mint : C.border}`, background: 'transparent', color: gasUrl ? C.mint : C.border, cursor: 'pointer' }}>
            <Settings size={12} />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}