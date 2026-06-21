import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, AreaChart, Area, LabelList, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import {
  Bookmark, Share2, UserCheck, Eye, Heart, MessageCircle, Repeat2, UserPlus,
  Plus, Trash2, Pencil, Check, X, ExternalLink, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Minus, Loader2, ClipboardPaste, ArrowDownToLine,
  NotebookPen, BookOpen, Activity, PlayCircle, MousePointerClick, LayoutDashboard,
  Globe, Rss, Rocket, Lightbulb, Sparkles, Link, CheckCircle, AlertCircle, RefreshCw,
  Settings, Target, Leaf, FileStack, Flame
} from 'lucide-react';

// ============================================================
// 디자인 토큰
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
  salesAchieveRate: { label: '매출 달성률', icon: Check, color: '#6C5CE7' },
  inflowAchieveRate: { label: '유입 달성률', icon: Check, color: '#6C5CE7' },
  pace: { label: 'Pace', icon: Activity, color: '#E08A2B' },
};
const ACCOUNT_KEYS = ['reach', 'organicReach', 'views', 'organicViews', 'engagement', 'newFollowers', 'followers', 'contentsCount', 'profileVisits', 'websiteClicks'];
const BIZ_KEYS = ['sales', 'inflow', 'salesAchieveRate', 'inflowAchieveRate', 'pace'];
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
  regrams: { label: '리그램', icon: Repeat2, color: '#C9A24B' },
  follows: { label: '팔로우', icon: UserPlus, color: '#2E9E89' },
};
const FEED_CORE = ['saves', 'shares', 'profileActivity'];
const FEED_SUB = ['reach', 'likes', 'comments', 'regrams', 'follows'];

// ============================================================
// 헬퍼 함수
// ============================================================
const fmt = (n) => Number(n || 0).toLocaleString('ko-KR');
const fmtK = (n) => { const v = Number(n || 0); if (v >= 1000000) return `${(v/1000000).toFixed(1)}M`; if (v >= 10000) return `${(v/1000).toFixed(0)}K`; if (v >= 1000) return `${(v/1000).toFixed(1)}K`; return String(v); };
const pct = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
const fmtMetric = (mkey, value) => {
  if (mkey === 'sales') return `₩${fmt(value)}`;
  if (mkey.includes('AchieveRate') || mkey === 'pace' || mkey === 'hitRate') return `${Number(value || 0).toFixed(0)}%`;
  return fmt(value);
};
const numFrom = (v) => {
  const n = Number(String(v ?? '').replace(/[,\s%]/g, ''));
  return isFinite(n) ? n : 0;
};
const isReel = (item) => /\/reel[s]?\//.test(item.link || '');
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
    productCategory: '',
    initialScore: 0, w1Score: 0, w2Score: 0, w3Score: 0, w4Score: 0, finalScore: 0,
  };
  metricKeys.forEach((k) => { base[k] = 0; });
  return base;
};
const FEED_KEYS = [...FEED_CORE, ...FEED_SUB];
const CONTENT_KEYS = [...CONTENT_CORE, ...CONTENT_SUB];

const lastNWeeksKeys = (weekMeta, selectedWeek, n) => {
  const keys = weekMeta.map((w) => w.key);
  const idx = keys.indexOf(selectedWeek);
  if (idx < 0) return keys.slice(-n);
  return keys.slice(Math.max(0, idx - n + 1), idx + 1);
};

// ============================================================
// 더미 초기 데이터 (원본 데이터 복구!)
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

const initialFeedContents = {
  KR: {
    W20: [
      { ...blankItem(1, 'Whispers of Early Summer 출시 안내', FEED_KEYS), link: 'https://www.instagram.com/p/DYL5WMYgaNM/', saves: 2, shares: 0, profileActivity: 0, reach: 2434, likes: 32, comments: 0, regrams: 0, follows: 0 },
      { ...blankItem(2, '올 여름 당도 100, 제철 과일맛 네일 zip', FEED_KEYS), link: 'https://www.instagram.com/p/DYOFuzTmTxF/', saves: 252, shares: 131, profileActivity: 0, reach: 13087, likes: 259, comments: 0, regrams: 0, follows: 1 },
      { ...blankItem(3, 'Choose your fresh vibe (과일 컬러)', FEED_KEYS), link: 'https://www.instagram.com/p/DYTnouFGT1J/', saves: 4, shares: 1, profileActivity: 0, reach: 3612, likes: 45, comments: 0, regrams: 0, follows: 0 },
      { ...blankItem(4, 'D-2 fresh & glazed (강화제 티저)', FEED_KEYS), link: 'https://www.instagram.com/p/DYYjfyrmauj/', saves: 12, shares: 0, profileActivity: 0, reach: 4025, likes: 91, comments: 2, regrams: 0, follows: 1 },
    ],
    W21: [
      { ...blankItem(5, 'Pick your daily fruit', FEED_KEYS), link: 'https://www.instagram.com/p/DYjEZ97GcKb/', saves: 14, shares: 7, profileActivity: 0, reach: 2196, likes: 76, comments: 0, regrams: 0, follows: 0 },
      { ...blankItem(6, 'Find Your Summer Pink', FEED_KEYS), link: 'https://www.instagram.com/p/DYoOEZHmS8D/', saves: 78, shares: 16, profileActivity: 0, reach: 5162, likes: 125, comments: 32, regrams: 0, follows: 0 },
      { ...blankItem(7, '과즙 가득 머금은 여름 원컬러 네일 모음', FEED_KEYS), link: 'https://www.instagram.com/p/DYqzGZpGTzz/', saves: 3650, shares: 1760, profileActivity: 0, reach: 89203, likes: 2557, comments: 70, regrams: 0, follows: 53 },
    ],
    W22: [
      { ...blankItem(8, 'Pick Your Favorite Summer Mood', FEED_KEYS), link: 'https://www.instagram.com/p/DYvutN2E-Y2/', saves: 46, shares: 19, profileActivity: 0, reach: 14527, likes: 97, comments: 1, regrams: 0, follows: 0 },
      { ...blankItem(9, "Which one's your vibe?", FEED_KEYS), link: 'https://www.instagram.com/p/DYyhLTKGUWW/', saves: 9, shares: 0, profileActivity: 0, reach: 3720, likes: 55, comments: 0, regrams: 0, follows: 0 },
      { ...blankItem(10, '차분한 일상 속, 특별한 기분 전환', FEED_KEYS), link: 'https://www.instagram.com/p/DY6PlUXGYWq/', saves: 9, shares: 6, profileActivity: 0, reach: 1892, likes: 52, comments: 0, regrams: 0, follows: 0 },
      { ...blankItem(11, 'BEST 리얼젤팁 모음', FEED_KEYS), link: 'https://www.instagram.com/p/DY8mr7NGdFA/', saves: 13, shares: 15, profileActivity: 0, reach: 3164, likes: 66, comments: 0, regrams: 0, follows: 0 },
    ],
    W23: [
      { ...blankItem(12, '글레이즈드 강화제 (허니듀+골드 컨페티)', FEED_KEYS), link: 'https://www.instagram.com/p/DZG50R1GTph/', saves: 10, shares: 1, profileActivity: 0, reach: 2258, likes: 47, comments: 0, regrams: 0, follows: 0 },
      { ...blankItem(13, '아이스크림맛 페디 모음 zip', FEED_KEYS), link: 'https://www.instagram.com/p/DZMmPtVGetj/', saves: 311, shares: 82, profileActivity: 0, reach: 18936, likes: 221, comments: 1, regrams: 0, follows: 4 },
    ],
    W24: [],
  },
  US: {
    W20: [],
    W21: [
      { ...blankItem(201, 'Sunset cocktails to coastal drives', FEED_KEYS), link: 'https://www.instagram.com/p/DYvaFa-mbZN/', saves: 31, shares: 0, profileActivity: 0, reach: 5843, likes: 96, comments: 3, regrams: 0, follows: 0 },
    ],
    W22: [
      { ...blankItem(202, 'Grapefruit, Cherry, Guava, or Honeydew?', FEED_KEYS), link: 'https://www.instagram.com/p/DY2mJzpmSnT/', saves: 43, shares: 0, profileActivity: 0, reach: 5130, likes: 111, comments: 7, regrams: 0, follows: 0 },
      { ...blankItem(203, 'Summermaxing, but make it nails ☀️', FEED_KEYS), link: 'https://www.instagram.com/p/DY5K8DoGbKc/', saves: 11, shares: 0, profileActivity: 0, reach: 4913, likes: 61, comments: 4, regrams: 0, follows: 0 },
    ],
    W23: [
      { ...blankItem(204, 'Playful or Sleek? 🍋', FEED_KEYS), link: 'https://www.instagram.com/p/DZA5SBWmeRj/', saves: 29, shares: 0, profileActivity: 0, reach: 5493, likes: 120, comments: 5, regrams: 0, follows: 0 },
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
      ac(30, '차분 일상 속, 특별한 기분 전환', 'https://www.instagram.com/p/DY6PlUXGYWq/', 'W22', 1892, 52, 0, 9, 6),
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

const initialAccountMetrics = {
  KR: {
    W18: { sales: 298500000, inflow: 208400, salesAchieveRate: 158, inflowAchieveRate: 158, pace: 163, reach: 3778846, organicReach: 1803915, views: 5687723, organicViews: 2647889, engagement: 96829, newFollowers: 1561, followers: 75527, contentsCount: 7, profileVisits: 27600, websiteClicks: 4980 },
    W19: { sales: 309200000, inflow: 213900, salesAchieveRate: 163, inflowAchieveRate: 163, pace: 168, reach: 3709820, organicReach: 841396, views: 4507219, organicViews: 1313082, engagement: 61179, newFollowers: 684, followers: 76211, contentsCount: 7, profileVisits: 28200, websiteClicks: 5150 },
    W20: { sales: 321464120, inflow: 222790, salesAchieveRate: 172, inflowAchieveRate: 172, pace: 178, reach: 3503148, organicReach: 562020, views: 5256630, organicViews: 924427, engagement: 66023, newFollowers: 856, followers: 77067, contentsCount: 7, profileVisits: 29171, websiteClicks: 5560 },
    W21: { sales: 413334711, inflow: 302255, salesAchieveRate: 221, inflowAchieveRate: 221, pace: 229, reach: 3576247, organicReach: 1177458, views: 5721873, organicViews: 1878860, engagement: 92531, newFollowers: 1279, followers: 78346, contentsCount: 7, profileVisits: 30641, websiteClicks: 9454 },
    W22: { sales: 335729387, inflow: 281689, salesAchieveRate: 180, inflowAchieveRate: 180, pace: 186, reach: 4974618, organicReach: 1975518, views: 7213421, organicViews: 3100663, engagement: 167156, newFollowers: 1461, followers: 79807, contentsCount: 7, profileVisits: 24271, websiteClicks: 4204 },
    W23: { sales: 475051684, inflow: 260598, salesAchieveRate: 154, inflowAchieveRate: 154, pace: 159, reach: 5723719, organicReach: 2327614, views: 8656838, organicViews: 3562506, engagement: 243754, newFollowers: 2145, followers: 81952, contentsCount: 7, profileVisits: 29161, websiteClicks: 4797 },
    W24: { sales: 365145940, inflow: 216092, salesAchieveRate: 111, inflowAchieveRate: 111, pace: 115, reach: 4793196, organicReach: 1298924, views: 7802158, organicViews: 2059358, engagement: 125086, newFollowers: 1264, followers: 83216, contentsCount: 7, profileVisits: 17911, websiteClicks: 3922 },
  },
  US: {
    W18: { sales: 398200000, inflow: 278600, salesAchieveRate: 88, inflowAchieveRate: 88, pace: 91, reach: 1529869, organicReach: 1165008, views: 3848739, organicViews: 3223718, engagement: 175527, newFollowers: 1253, followers: 104538, contentsCount: 14, profileVisits: 14400, websiteClicks: 1950 },
    W19: { sales: 405700000, inflow: 283100, salesAchieveRate: 91, inflowAchieveRate: 91, pace: 94, reach: 1974903, organicReach: 1494051, views: 3726726, organicViews: 2966513, engagement: 104102, newFollowers: 1181, followers: 105719, contentsCount: 11, profileVisits: 14750, websiteClicks: 2020 },
    W20: { sales: 426713061, inflow: 297174, salesAchieveRate: 95, inflowAchieveRate: 95, pace: 98, reach: 5129669, organicReach: 4714251, views: 8301810, organicViews: 7625389, engagement: 129711, newFollowers: 1284, followers: 107003, contentsCount: 27, profileVisits: 15807, websiteClicks: 2104 },
    W21: { sales: 452969174, inflow: 292823, salesAchieveRate: 101, inflowAchieveRate: 101, pace: 104, reach: 4682212, organicReach: 4233591, views: 7658436, organicViews: 6970475, engagement: 178234, newFollowers: 1439, followers: 108442, contentsCount: 18, profileVisits: 12332, websiteClicks: 1786 },
    W22: { sales: 430853662, inflow: 277885, salesAchieveRate: 96, inflowAchieveRate: 96, pace: 99, reach: 7817922, organicReach: 7439998, views: 11637295, organicViews: 11119701, engagement: 317072, newFollowers: 2137, followers: 110579, contentsCount: 25, profileVisits: 15324, websiteClicks: 2799 },
    W23: { sales: 442068143, inflow: 291731, salesAchieveRate: 67, inflowAchieveRate: 67, pace: 69, reach: 3210728, organicReach: 2936025, views: 5248923, organicViews: 4762435, engagement: 128900, newFollowers: 968, followers: 111547, contentsCount: 15, profileVisits: 8635, websiteClicks: 1326 },
    W24: { sales: 339149357, inflow: 259075, salesAchieveRate: 49, inflowAchieveRate: 49, pace: 50, reach: 4425236, organicReach: 4141903, views: 7220614, organicViews: 6746287, engagement: 206656, newFollowers: 1341, followers: 112888, contentsCount: 14, profileVisits: 8309, websiteClicks: 924 },
  },
};
function zeroAccount() {
  const o = {};
  ALL_ACCOUNT_KEYS.forEach((k) => { o[k] = 0; });
  return o;
}
const initialCountryInsights = { KR: {}, US: {} };

const STORAGE_GAS_URL_KEY = 'dash2-gas-url-v1';
const STORAGE_INSIGHTS_KEY = 'dash2-country-insights-v2';

const PRODUCT_CATS = [
  { key: 'gelPressOn', label: '젤프레스온', color: '#E8546B' },
  { key: 'hardener',   label: '강화제',    color: '#6C5CE7' },
  { key: 'gelStrip',   label: '젤스트립',  color: '#2E9E89' },
  { key: 'otherCare',  label: '기타케어류', color: '#C9A24B' },
];
const initialProductSales = {
  KR: { 
    W20: { gelPressOn: 2400, hardener: 800, gelStrip: 1200, otherCare: 300 }, 
    W21: { gelPressOn: 3100, hardener: 1500, gelStrip: 1450, otherCare: 450 }, 
    W22: { gelPressOn: 2800, hardener: 1200, gelStrip: 1300, otherCare: 400 }, 
    W23: { gelPressOn: 4500, hardener: 2100, gelStrip: 1800, otherCare: 600 }, 
    W24: { gelPressOn: 3900, hardener: 1800, gelStrip: 1600, otherCare: 500 } 
  },
  US: { 
    W20: { gelPressOn: 800, hardener: 100, gelStrip: 200, otherCare: 50 }, 
    W21: { gelPressOn: 1100, hardener: 200, gelStrip: 250, otherCare: 80 }, 
    W22: { gelPressOn: 2500, hardener: 400, gelStrip: 300, otherCare: 100 }, 
    W23: { gelPressOn: 1800, hardener: 300, gelStrip: 200, otherCare: 90 }, 
    W24: { gelPressOn: 2100, hardener: 350, gelStrip: 150, otherCare: 120 } 
  },
};

// ============================================================
// 공용 작은 컴포넌트
// ============================================================
function Swatch({ color, size = 8 }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '999px', background: color, flexShrink: 0 }} />;
}

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
// 콘텐츠 카드
// ============================================================
function ContentCard({ item, coreKeys, subKeys, metricsMap, onSave, onDelete, showSalesImpact, showScoreTracking, retroBadge, onSyncInsight, avgMetrics, metricKey = 'reach', showThumbnailUpload }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);
  const [insightOpen, setInsightOpen] = useState(false);
  useEffect(() => { setDraft(item); }, [item]);
  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));

  const standout = useMemo(() => {
    if (!avgMetrics) return null;
    let best = null;
    let maxPct = 0;
    ['saves', 'shares', 'comments', 'likes', 'reach', 'engagement'].forEach(k => {
       if (avgMetrics[k] > 50 && item[k] > 0) { 
         const pct = ((item[k] - avgMetrics[k]) / avgMetrics[k]) * 100;
         if (pct > maxPct && pct >= 50) { 
           maxPct = pct;
           best = { key: k, pct };
         }
       }
    });
    // 도달+참여 복합 지표용 평균 체크
    if (avgMetrics['reachAndEngagement'] && (Number(item.reach || 0) + Number(item.engagement || 0)) > 0) {
       const combinedVal = Number(item.reach || 0) + Number(item.engagement || 0);
       const pct = ((combinedVal - avgMetrics['reachAndEngagement']) / avgMetrics['reachAndEngagement']) * 100;
       if (pct > maxPct && pct >= 50) {
         maxPct = pct;
         best = { key: 'reachAndEngagement', pct, label: '도달+참여수' };
       }
    }
    return best;
  }, [item, avgMetrics]);

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
          {subKeys.map((k) => <NumberField key={k} label={metricsMap[k].label} value={draft[k]} onChange={set(k)} width={100} />)}
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <div style={{ flex: '1 1 240px' }}>
            <TextAreaField label="🤔 가설" value={draft.hypothesis} onChange={set('hypothesis')} placeholder="발행 전 타겟팅 및 실험 가설을 적어주세요." />
          </div>
          <div style={{ flex: '1 1 240px' }}>
            <TextAreaField label="📝 분석 & 추후 방안" value={draft.analysis} onChange={set('analysis')} placeholder="결과 데이터 분석 및 다음 액션 플랜을 적어주세요." />
          </div>
        </div>
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
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center">
            {coreKeys.map((k) => <MetricPill key={k} metricsMap={metricsMap} mkey={k} value={item[k]} big />)}
            
            {standout && (
              <span className="flex items-center gap-0.5" style={{
                fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
                background: '#FFF4E5', color: '#E65100', border: '1px solid #FFE0B2', whiteSpace: 'nowrap'
              }}>
                <Flame size={12} strokeWidth={2.5} style={{ marginRight: 2 }} /> 
                {standout.label || metricsMap[standout.key]?.label || standout.key} 터짐 (+{standout.pct.toFixed(0)}%)
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
    </div>
  );
}

// ============================================================
// 차트 툴팁 컴포넌트
// ============================================================
function ChartTooltip({ active, payload, label, labels }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: SHADOW }}>
      <div style={{ fontWeight: 800, marginBottom: 6, color: C.ink }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5" style={{ color: C.ink, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ minWidth: 35 }}>{labels?.[p.dataKey] || p.name || p.dataKey}</span>
          <b>
            {p.dataKey === 'sales' ? fmtMetric('sales', p.payload[`_raw_${p.dataKey}`]) : fmt(p.payload[`_raw_${p.dataKey}`] || p.value)}
          </b>
          {p.payload[`_raw_${p.dataKey}`] !== undefined && (
            <span style={{ color: C.sub, fontSize: 11, marginLeft: 4 }}>(지수: {p.value})</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 뷰 컴포넌트 
// ============================================================
function SummaryView({ weekMeta, selectedWeek, displayWeeks, accountMetrics, allContents, productSales }) {
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
  const labelsA = metricLabels(ACCOUNT_METRICS);
  const [showMonthlyTable, setShowMonthlyTable] = useState(false);

  // 통합요약 연간 누적 월별 차트 (매출, 유입, 도달, 참여)
  const latestMonthStr = weekMeta[weekMeta.length - 1]?.month || '2026-06';
  const currentYear = latestMonthStr.split('-')[0];
  const latestMonthNum = parseInt(latestMonthStr.split('-')[1], 10);
  const monthList = Array.from({length: latestMonthNum}, (_, i) => `${currentYear}-${String(i+1).padStart(2, '0')}`);

  const monthlyData = monthList.map(m => {
      const wks = weekMeta.filter(w => w.month === m).map(w => w.key);
      const data = { month: m, sales: 0, inflow: 0, reach: 0, engagement: 0 };
      wks.forEach(wk => {
          data.sales += val(tab, wk, 'sales') || 0;
          data.inflow += val(tab, wk, 'inflow') || 0;
          data.reach += val(tab, wk, 'reach') || 0;
          data.engagement += val(tab, wk, 'engagement') || 0;
      });
      return data;
  });

  const mBase = {
      sales: monthlyData.find(d => d.sales > 0)?.sales || 1,
      inflow: monthlyData.find(d => d.inflow > 0)?.inflow || 1,
      reach: monthlyData.find(d => d.reach > 0)?.reach || 1,
      engagement: monthlyData.find(d => d.engagement > 0)?.engagement || 1,
  };

  const monthlyTrendNorm = monthlyData.map(d => ({
      month: fmtMonth(d.month),
      sales: Math.round((d.sales / mBase.sales) * 100),
      inflow: Math.round((d.inflow / mBase.inflow) * 100),
      reach: Math.round((d.reach / mBase.reach) * 100),
      engagement: Math.round((d.engagement / mBase.engagement) * 100),
      _raw_sales: d.sales,
      _raw_inflow: d.inflow,
      _raw_reach: d.reach,
      _raw_engagement: d.engagement,
  }));

  // 통합요약 Top 3 콘텐츠 로직: '도달수 + 참여수' 기준 합산
  const BASELINE_WEEKS = 8;
  const baselineWeeksList = lastNWeeksKeys(weekMeta, selectedWeek, BASELINE_WEEKS);
  const rangeItems = baselineWeeksList.flatMap((w) => allContents[tab]?.[w] || []);
  
  const avgMetrics = {};
  ['reach', 'views', 'engagement', 'likes', 'comments', 'saves', 'shares'].forEach(k => {
     const vals = rangeItems.map(i => Number(i[k] || 0)).sort((a,b)=>b-a);
     const cutoff = Math.ceil(vals.length * 0.05);
     const valid = vals.slice(cutoff);
     avgMetrics[k] = valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : 0;
  });
  
  // 합산 지표 평균 계산
  const combinedVals = rangeItems.map(i => Number(i.reach || 0) + Number(i.engagement || 0)).sort((a,b)=>b-a);
  const combinedCutoff = Math.ceil(combinedVals.length * 0.05);
  const combinedValid = combinedVals.slice(combinedCutoff);
  avgMetrics['reachAndEngagement'] = combinedValid.length ? combinedValid.reduce((a,b)=>a+b,0)/combinedValid.length : 0;

  const weekItems = allContents[tab]?.[selectedWeek] || [];
  const topContent = [...weekItems]
    .sort((a, b) => {
        const scoreA = Number(a.reach || 0) + Number(a.engagement || 0);
        const scoreB = Number(b.reach || 0) + Number(b.engagement || 0);
        return scoreB - scoreA;
    })
    .slice(0, 3);

  const reelsBaseAvg = avgMetrics.reach || 0;
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

      <SectionLabel color={ACCOUNT_METRICS.reach.color}>SNS 채널 · 도달 · 조회수 · 참여</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-3">
        <ReachOrganicCard mkey="reach" organicKey="organicReach" value={val(tab, selectedWeek, 'reach')} organicValue={val(tab, selectedWeek, 'organicReach')} delta={wowDelta(tab, 'reach')} organicDelta={wowDelta(tab, 'organicReach')} accentColor={accent} />
        <ReachOrganicCard mkey="views" organicKey="organicViews" value={val(tab, selectedWeek, 'views')} organicValue={val(tab, selectedWeek, 'organicViews')} delta={wowDelta(tab, 'views')} organicDelta={wowDelta(tab, 'organicViews')} accentColor={accent} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="engagement" value={val(tab, selectedWeek, 'engagement')} delta={wowDelta(tab, 'engagement')} accentColor={accent} />
      </div>

      <SectionLabel color="#E08A2B">콘텐츠 발행 · 타율</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-1">
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="contentsCount" value={val(tab, selectedWeek, 'contentsCount')} delta={wowDelta(tab, 'contentsCount')} accentColor={accent} />
        <HeroCard metricsMap={{ hitRate: { label: '콘텐츠 타율', icon: Target, color: '#2E9E89' } }} mkey="hitRate" value={hitRateNow ?? 0} delta={hitRateDelta} accentColor={accent} />
      </div>

      <div className="mb-8 mt-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px' }}>월간 매출 · 유입 · 도달 · 참여 추이 비교</h3>
            <div style={{ fontSize: 12, color: C.sub }}>
              {currentYear}년 전체 월별 누적 데이터 · 첫 달 대비 지수(=100)로 정규화하여 스케일이 다른 지표를 비교합니다.
            </div>
          </div>
          <button onClick={() => setShowMonthlyTable((v) => !v)} className="flex items-center gap-1.5"
            style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showMonthlyTable ? C.ink : '#fff', color: showMonthlyTable ? '#fff' : C.sub, cursor: 'pointer' }}>
            {showMonthlyTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
          </button>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={monthlyTrendNorm} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip labels={labelsA} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => labelsA[v] || v} />
              <Line type="monotone" dataKey="sales" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="inflow" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="reach" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="engagement" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {showMonthlyTable && (
          <div style={{ marginTop: 14, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['월', '매출', '유입', '도달수', '참여수'].map((h) => (
                    <th key={h} style={{ textAlign: h === '월' ? 'left' : 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyTrendNorm.map((d, i) => (
                  <tr key={d.month} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.bg : '#fff' }}>
                    <td style={{ padding: '7px 10px', fontWeight: 700, color: C.ink }}>{d.month}</td>
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

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>🏆 상위 콘텐츠 (도달+참여 기준 Top 3)</h3>
        </div>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>{selectedWeek} 발행 콘텐츠 중 도달수와 참여수를 합산하여 가장 성과가 높은 3개입니다.</div>
        <div className="flex flex-col gap-2.5 mt-4">
          {topContent.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>표시할 콘텐츠가 없습니다.</div>}
          {topContent.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onSave={()=>{}} onDelete={()=>{}} avgMetrics={avgMetrics} />)}
        </div>
      </div>
    </div>
  );
}

function CountryView({
  countryKey, weekMeta, selectedWeek, displayWeeks,
  accountMetrics, countryInsights, onInsightChange,
  allContents, onAllContentsChange, onSyncContent,
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
  const labelsA = metricLabels(ACCOUNT_METRICS);

  const [showMonthlyTable, setShowMonthlyTable] = useState(false);

  // 1. 해당 연도 전체 월 리스트 생성 
  const latestMonthStr = weekMeta[weekMeta.length - 1]?.month || '2026-06';
  const currentYear = latestMonthStr.split('-')[0];
  const latestMonthNum = parseInt(latestMonthStr.split('-')[1], 10);
  const monthList = Array.from({length: latestMonthNum}, (_, i) => `${currentYear}-${String(i+1).padStart(2, '0')}`);

  // 2. 월별 데이터 집계 
  const monthlyData = monthList.map(m => {
      const wks = weekMeta.filter(w => w.month === m).map(w => w.key);
      const data = { month: m, sales: 0, inflow: 0, reach: 0, engagement: 0 };
      wks.forEach(wk => {
          data.sales += totals(wk).sales || 0;
          data.inflow += totals(wk).inflow || 0;
          data.reach += totals(wk).reach || 0;
          data.engagement += totals(wk).engagement || 0;
      });
      return data;
  });

  const mBase = {
      sales: monthlyData.find(d => d.sales > 0)?.sales || 1,
      inflow: monthlyData.find(d => d.inflow > 0)?.inflow || 1,
      reach: monthlyData.find(d => d.reach > 0)?.reach || 1,
      engagement: monthlyData.find(d => d.engagement > 0)?.engagement || 1,
  };

  const monthlyTrendNorm = monthlyData.map(d => ({
      month: fmtMonth(d.month),
      sales: Math.round((d.sales / mBase.sales) * 100),
      inflow: Math.round((d.inflow / mBase.inflow) * 100),
      reach: Math.round((d.reach / mBase.reach) * 100),
      engagement: Math.round((d.engagement / mBase.engagement) * 100),
      _raw_sales: d.sales,
      _raw_inflow: d.inflow,
      _raw_reach: d.reach,
      _raw_engagement: d.engagement,
  }));

  const BASELINE_WEEKS = 8;
  const rangeWeeks = lastNWeeksKeys(weekMeta, selectedWeek, BASELINE_WEEKS);
  const rangeItems = rangeWeeks.flatMap((w) => allContents[countryKey]?.[w] || []);
  
  const avgMetrics = {};
  ['reach', 'views', 'engagement', 'likes', 'comments', 'saves', 'shares'].forEach(k => {
     const vals = rangeItems.map(i => Number(i[k] || 0)).sort((a,b)=>b-a);
     const cutoff = Math.ceil(vals.length * 0.05); 
     const valid = vals.slice(cutoff);
     avgMetrics[k] = valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : 0;
  });
  
  const combinedVals = rangeItems.map(i => Number(i.reach || 0) + Number(i.engagement || 0)).sort((a,b)=>b-a);
  const combinedCutoff = Math.ceil(combinedVals.length * 0.05);
  const combinedValid = combinedVals.slice(combinedCutoff);
  avgMetrics['reachAndEngagement'] = combinedValid.length ? combinedValid.reduce((a,b)=>a+b,0)/combinedValid.length : 0;
  
  const weekItems = allContents[countryKey]?.[selectedWeek] || [];
  const topContent = weekItems.filter((i) => Number(i.engagement || 0) >= avgMetrics.engagement).sort((a, b) => Number(b.engagement || 0) - Number(a.engagement || 0)).slice(0, 5);
  const bottomContent = weekItems.filter((i) => Number(i.engagement || 0) < avgMetrics.engagement).sort((a, b) => Number(a.engagement || 0) - Number(b.engagement || 0)).slice(0, 5);
  
  const updateAllItem = (item) => {
    const list = weekItems.map((c) => (c.id === item.id ? item : c));
    onAllContentsChange({ ...allContents, [countryKey]: { ...allContents[countryKey], [selectedWeek]: list } });
  };
  const deleteAllItem = (id) => {
    const list = weekItems.filter((c) => c.id !== id);
    onAllContentsChange({ ...allContents, [countryKey]: { ...allContents[countryKey], [selectedWeek]: list } });
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
      </div>

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
                    </div>
                  </div>
                ))}
              </div>
            }
          />
        ))}
      </div>

      <SectionLabel color={ACCOUNT_METRICS.reach.color}>채널 핵심지표</SectionLabel>
      <div className="flex flex-wrap gap-3 mb-8">
        <ReachOrganicCard mkey="reach" organicKey="organicReach" value={totals(selectedWeek).reach} organicValue={totals(selectedWeek).organicReach} delta={wowDelta('reach')} organicDelta={wowDelta('organicReach')} />
        <ReachOrganicCard mkey="views" organicKey="organicViews" value={totals(selectedWeek).views} organicValue={totals(selectedWeek).organicViews} delta={wowDelta('views')} organicDelta={wowDelta('organicViews')} />
        <HeroCard metricsMap={ACCOUNT_METRICS} mkey="engagement" value={totals(selectedWeek).engagement} delta={wowDelta('engagement')} />
      </div>

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px' }}>월간 매출 · 유입 · 도달 · 참여 추이 비교</h3>
            <div style={{ fontSize: 12, color: C.sub }}>
              {currentYear}년 전체 월별 데이터 · 첫 달 대비 지수(=100)로 정규화하여 스케일이 다른 지표를 한눈에 비교합니다. (툴팁에 실제 값 표시)
            </div>
          </div>
          <button onClick={() => setShowMonthlyTable((v) => !v)} className="flex items-center gap-1.5"
            style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showMonthlyTable ? C.ink : '#fff', color: showMonthlyTable ? '#fff' : C.sub, cursor: 'pointer' }}>
            {showMonthlyTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
          </button>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={monthlyTrendNorm} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip labels={labelsA} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => labelsA[v] || v} />
              <Line type="monotone" dataKey="sales" stroke={ACCOUNT_METRICS.sales.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="inflow" stroke={ACCOUNT_METRICS.inflow.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="reach" stroke={ACCOUNT_METRICS.reach.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="engagement" stroke={ACCOUNT_METRICS.engagement.color} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {showMonthlyTable && (
          <div style={{ marginTop: 14, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['월', '매출', '유입', '도달수', '참여수'].map((h) => (
                    <th key={h} style={{ textAlign: h === '월' ? 'left' : 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyTrendNorm.map((d, i) => (
                  <tr key={d.month} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.bg : '#fff' }}>
                    <td style={{ padding: '7px 10px', fontWeight: 700, color: C.ink }}>{d.month}</td>
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

      <div className="mb-8" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginTop: 24 }}>
        <div className="flex items-center gap-2 mb-2">
          <NotebookPen size={16} color={C.accent} />
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>주간 전체 인사이트 · {selectedWeek}</h3>
          <span style={{ fontSize: 11, color: C.sub, marginLeft: 'auto' }}>입력 후 1초 뒤 시트 자동 저장</span>
        </div>
        <TextAreaField
          value={countryInsights[countryKey]?.[selectedWeek] || ''}
          onChange={(v) => onInsightChange(countryKey, selectedWeek, v)}
          placeholder="이번 주 전체적인 분석/인사이트를 자유롭게 기록하세요." rows={4}
        />
      </div>

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>🏆 상위 콘텐츠 (참여수 기준)</h3>
        </div>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>직전 {BASELINE_WEEKS}주 평균 참여({fmt(Math.round(avgMetrics.engagement))}) 이상인 콘텐츠 중 상위 5개</div>
        <div className="flex flex-col gap-2.5 mt-4">
          {topContent.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>표시할 콘텐츠가 없습니다.</div>}
          {topContent.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onSave={updateAllItem} onDelete={deleteAllItem} showSalesImpact showScoreTracking onSyncInsight={(i) => handleSyncContent(i, '상위')} avgMetrics={avgMetrics} metricKey="engagement" />)}
        </div>
      </div>

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>📉 하위 콘텐츠 (참여수 기준)</h3>
        </div>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>직전 {BASELINE_WEEKS}주 평균 참여({fmt(Math.round(avgMetrics.engagement))}) 미만인 콘텐츠 중 하위 5개</div>
        <div className="flex flex-col gap-2.5 mt-4">
          {bottomContent.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '20px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>표시할 콘텐츠가 없습니다.</div>}
          {bottomContent.map((item) => <ContentCard key={item.id} item={item} coreKeys={CONTENT_CORE} subKeys={CONTENT_SUB} metricsMap={CONTENT_METRICS} onSave={updateAllItem} onDelete={deleteAllItem} showSalesImpact showScoreTracking onSyncInsight={(i) => handleSyncContent(i, '하위')} avgMetrics={avgMetrics} metricKey="engagement" />)}
        </div>
      </div>
    </div>
  );
}

function FeedView({ weekMeta, selectedWeek, displayWeeks, feedContents, accountMetrics, onFeedContentsChange, onSyncContent }) {
  const [selectedCountry, setSelectedCountry] = useState('KR');
  const countryContents = feedContents[selectedCountry] || {};
  const weekContents = countryContents[selectedWeek] || [];
  const [showFeedMonthlyTable, setShowFeedMonthlyTable] = useState(false);
  const [showFollowerCompareTable, setShowFollowerCompareTable] = useState(false);

  const weeklyTotals = (country, week) => {
    const list = feedContents[country]?.[week] || [];
    return { saves: list.reduce((s, c) => s + Number(c.saves || 0), 0), shares: list.reduce((s, c) => s + Number(c.shares || 0), 0), profileActivity: list.reduce((s, c) => s + Number(c.profileActivity || 0), 0), newFollowers: list.reduce((s, c) => s + Number(c.follows || 0), 0) };
  };

  // 피드 월간 추이 차트 (저장수, 공유수, 프로필 활동)
  const latestMonthStr = weekMeta[weekMeta.length - 1]?.month || '2026-06';
  const currentYear = latestMonthStr.split('-')[0];
  const latestMonthNum = parseInt(latestMonthStr.split('-')[1], 10);
  const monthList = Array.from({length: latestMonthNum}, (_, i) => `${currentYear}-${String(i+1).padStart(2, '0')}`);

  const monthlyData = monthList.map(m => {
      const wks = weekMeta.filter(w => w.month === m).map(w => w.key);
      const data = { month: m, saves: 0, shares: 0, profileActivity: 0 };
      wks.forEach(wk => {
          const t = weeklyTotals(selectedCountry, wk);
          data.saves += t.saves;
          data.shares += t.shares;
          data.profileActivity += t.profileActivity;
      });
      return data;
  });

  const mBase = {
      saves: monthlyData.find(d => d.saves > 0)?.saves || 1,
      shares: monthlyData.find(d => d.shares > 0)?.shares || 1,
      profileActivity: monthlyData.find(d => d.profileActivity > 0)?.profileActivity || 1,
  };

  const monthlyTrendNorm = monthlyData.map(d => ({
      month: fmtMonth(d.month),
      saves: Math.round((d.saves / mBase.saves) * 100),
      shares: Math.round((d.shares / mBase.shares) * 100),
      profileActivity: Math.round((d.profileActivity / mBase.profileActivity) * 100),
      _raw_saves: d.saves,
      _raw_shares: d.shares,
      _raw_profileActivity: d.profileActivity,
  }));
  const feedLabels = { saves: '피드 저장수', shares: '피드 공유수', profileActivity: '피드 프로필 활동' };

  // 신규 팔로워 증감률 차트 데이터
  const accountNewFollowersAt = (w) => Number(accountMetrics?.[selectedCountry]?.[w]?.newFollowers || 0);
  const accountFollowerCompare = displayWeeks.map((w) => {
    const idx = weekMeta.map(wm => wm.key).indexOf(w);
    const prevKey = idx > 0 ? weekMeta[idx - 1].key : null;
    const accountNow = accountNewFollowersAt(w);
    const accountPrev = prevKey ? accountNewFollowersAt(prevKey) : null;
    const accountGrowthRate = accountPrev ? Number((((accountNow - accountPrev) / accountPrev) * 100).toFixed(1)) : (accountPrev === 0 ? 0 : null);
    const feedNow = weeklyTotals(selectedCountry, w).newFollowers;
    const feedPrev = prevKey ? weeklyTotals(selectedCountry, prevKey).newFollowers : null;
    const feedGrowthRate = feedPrev ? Number((((feedNow - feedPrev) / feedPrev) * 100).toFixed(1)) : (feedPrev === 0 ? 0 : null);
    return { week: w, feedFollows: feedNow, accountNewFollowers: accountNow, accountGrowthRate, feedGrowthRate, hasPrevAccount: accountPrev != null, hasPrevFeed: feedPrev != null };
  });

  const updateContent = (item) => {
    const list = weekContents.map((c) => (c.id === item.id ? item : c));
    onFeedContentsChange({ ...feedContents, [selectedCountry]: { ...countryContents, [selectedWeek]: list } });
  };
  const deleteContent = (id) => { const list = weekContents.filter((c) => c.id !== id); onFeedContentsChange({ ...feedContents, [selectedCountry]: { ...countryContents, [selectedWeek]: list } }); };
  const addContent = () => { const allIds = Object.values(feedContents).flatMap((byWeek) => Object.values(byWeek).flat()).map((c) => c.id); const newId = (allIds.length ? Math.max(...allIds) : 0) + 1; const list = [...weekContents, blankItem(newId, '새 콘텐츠', FEED_KEYS)]; onFeedContentsChange({ ...feedContents, [selectedCountry]: { ...countryContents, [selectedWeek]: list } }); };
  const handleSyncFeedContent = (item) => {
    if (onSyncContent && (item.hypothesis || item.analysis || item.salesImpact)) {
      onSyncContent({ type: 'content', country: selectedCountry, week: selectedWeek, category: '피드', url: item.link, title: item.title, hypothesis: item.hypothesis, analysis: item.analysis, salesImpact: item.salesImpact });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>피드 콘텐츠 · {selectedWeek}</h2>
        <div className="flex gap-1.5">
          {COUNTRIES.map((c) => <button key={c.key} onClick={() => setSelectedCountry(c.key)} style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, border: `1px solid ${c.key === selectedCountry ? C.ink : C.border}`, background: c.key === selectedCountry ? C.ink : '#fff', color: c.key === selectedCountry ? '#fff' : C.sub }}>{c.label}</button>)}
        </div>
      </div>

      <div className="mb-8" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px' }}>피드 월간 지표 추이 (저장·공유·프로필 활동)</h3>
            <div style={{ fontSize: 12, color: C.sub }}>
              {currentYear}년 전체 월별 데이터 · 첫 달 대비 지수(=100)로 정규화하여 스케일이 다른 지표를 한눈에 비교합니다.
            </div>
          </div>
          <button onClick={() => setShowFeedMonthlyTable((v) => !v)} className="flex items-center gap-1.5"
            style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: showFeedMonthlyTable ? C.ink : '#fff', color: showFeedMonthlyTable ? '#fff' : C.sub, cursor: 'pointer' }}>
            {showFeedMonthlyTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />} 데이터표
          </button>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={monthlyTrendNorm} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip labels={feedLabels} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => feedLabels[v] || v} />
              <Line type="monotone" dataKey="saves" stroke={FEED_METRICS.saves.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="shares" stroke={FEED_METRICS.shares.color} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="profileActivity" stroke={FEED_METRICS.profileActivity.color} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {showFeedMonthlyTable && (
          <div style={{ marginTop: 14, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['월', '피드 저장수', '피드 공유수', '피드 프로필 활동'].map((h) => (
                    <th key={h} style={{ textAlign: h === '월' ? 'left' : 'right', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C.sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyTrendNorm.map((d, i) => (
                  <tr key={d.month} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.bg : '#fff' }}>
                    <td style={{ padding: '7px 10px', fontWeight: 700, color: C.ink }}>{d.month}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d._raw_saves)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d._raw_shares)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(d._raw_profileActivity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, boxShadow: SHADOW, marginBottom: 24 }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
          <div className="flex items-center gap-2">
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>주차별 피드 발생 팔로우 · 계정 전체 신규 팔로우 증감률</h3>
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
          </div>
        )}
      </div>

      <button onClick={addContent} className="flex items-center gap-1 mb-4" style={{ fontSize: 13, fontWeight: 700, padding: '7px 12px', borderRadius: 8, border: 'none', background: C.ink, color: '#fff' }}><Plus size={14} /> 피드 콘텐츠 추가</button>
      
      <div className="flex flex-col gap-2.5">
        {weekContents.length === 0 && <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, padding: '24px 0', border: `1px dashed ${C.border}`, borderRadius: 12 }}>등록된 피드 콘텐츠가 없습니다.</div>}
        {weekContents.map((item) => <ContentCard key={item.id} item={item} coreKeys={FEED_CORE} subKeys={FEED_SUB} metricsMap={FEED_METRICS} onSave={updateContent} onDelete={deleteContent} onSyncInsight={handleSyncFeedContent} showThumbnailUpload />)}
      </div>
    </div>
  );
}

// ============================================================
// 메인 앱
// ============================================================
export default function App() {
  const [view, setView] = useState('summary');
  const [weekMeta, setWeekMeta] = useState(initialWeekMeta);
  const [selectedWeek, setSelectedWeek] = useState('W24');
  const [feedContents, setFeedContents] = useState(initialFeedContents);
  const [allContents, setAllContents] = useState(initialAllContents);
  const [accountMetrics, setAccountMetrics] = useState(initialAccountMetrics);
  const [countryInsights, setCountryInsights] = useState(initialCountryInsights);
  const [productSales, setProductSales] = useState(initialProductSales);
  
  const [loading, setLoading] = useState(true);
  const [gasUrl, setGasUrl] = useState('');
  const [gasInput, setGasInput] = useState('');
  const [showGasPanel, setShowGasPanel] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const insightSyncTimer = useRef(null);

  // 시트 저장용 (POST)
  const syncToGAS = useCallback(async (payload) => {
    if (!gasUrl || !gasUrl.startsWith('http')) return;
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

  // 화면 초기화 및 시트 연동 (GET)
  useEffect(() => {
    (async () => {
      try {
        const gasR = await window.storage?.get(STORAGE_GAS_URL_KEY, true).catch(() => null);
        const currentGasUrl = gasR?.value || ''; 
        
        setGasUrl(currentGasUrl);
        setGasInput(currentGasUrl);

        if (currentGasUrl && currentGasUrl.startsWith('http')) {
          const res = await fetch(currentGasUrl + '?type=all');
          const data = await res.json();
          if (data.ok) {
            if (data.weekMeta && data.weekMeta.length > 0) {
              setWeekMeta(data.weekMeta);
              setSelectedWeek(data.weekMeta[data.weekMeta.length - 1].key);
            }
            if (data.accountMetrics) setAccountMetrics(data.accountMetrics);
            if (data.allContents) setAllContents(data.allContents);
            if (data.feedContents) setFeedContents(data.feedContents);
            if (data.productSales) setProductSales(data.productSales);
            if (data.countryInsights) setCountryInsights(data.countryInsights); 
          }
        }
      } catch (e) {
        console.error('load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveGasUrl = async () => {
    const url = gasInput.trim();
    setGasUrl(url);
    try { await window.storage?.set(STORAGE_GAS_URL_KEY, url, true); } catch (e) {}
    setShowGasPanel(false);
    window.location.reload(); 
  };

  const onInsightChange = useCallback((country, week, value) => {
    const next = { ...countryInsights, [country]: { ...countryInsights[country], [week]: value } };
    setCountryInsights(next);
    
    clearTimeout(insightSyncTimer.current);
    insightSyncTimer.current = setTimeout(() => {
      syncToGAS({ type: 'weekly', country, week, insight: value });
    }, 1000);
  }, [countryInsights, syncToGAS]);

  if (loading) {
    return <div className="flex items-center justify-center" style={{ height: '100vh', fontFamily: FONT, color: C.sub }}><Loader2 className="animate-spin" size={20} style={{ marginRight: 8 }} /> 구글 시트 데이터 동기화 중...</div>;
  }

  const weekKeys = weekMeta.map((w) => w.key);
  const endIdx = weekKeys.indexOf(selectedWeek);
  const displayWeeks = weekKeys.slice(Math.max(0, endIdx - 6), endIdx + 1);

  return (
    <div style={{ fontFamily: FONT, background: C.bg, minHeight: '100vh', color: C.ink }}>
      <div className="max-w-[1400px] mx-auto w-full" style={{ padding: '24px 20px' }}>
        
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>한/미 SNS 성과 대시보드</h1>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {weekKeys.map((w, i) => (
              <button key={w} onClick={() => setSelectedWeek(w)}
                style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: `1px solid ${w === selectedWeek ? C.accent : C.border}`, background: w === selectedWeek ? C.accent : '#fff', color: w === selectedWeek ? '#fff' : C.sub }}>
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-6">
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

        {showGasPanel && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 12 }}>구글 시트 웹앱 URL 설정</div>
            <div className="flex gap-2">
              <input type="text" value={gasInput} onChange={(e) => setGasInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, width: '100%' }} />
              <button onClick={saveGasUrl} style={{ padding: '8px 16px', borderRadius: 8, background: C.mint, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>저장</button>
            </div>
          </div>
        )}

        {view === 'summary' && <SummaryView weekMeta={weekMeta} selectedWeek={selectedWeek} displayWeeks={displayWeeks} accountMetrics={accountMetrics} allContents={allContents} productSales={productSales} />}
        {(view === 'KR' || view === 'US') && (
          <CountryView
            countryKey={view} weekMeta={weekMeta} selectedWeek={selectedWeek} displayWeeks={displayWeeks}
            accountMetrics={accountMetrics} countryInsights={countryInsights} onInsightChange={onInsightChange}
            allContents={allContents} onAllContentsChange={()=>{}} onSyncContent={syncToGAS}
          />
        )}
        {view === 'feed' && (
          <FeedView weekMeta={weekMeta} selectedWeek={selectedWeek} displayWeeks={displayWeeks} feedContents={feedContents} accountMetrics={accountMetrics} onFeedContentsChange={()=>{}} onSyncContent={syncToGAS} />
        )}

        <div style={{ fontSize: 11, color: C.subLite, textAlign: 'center', marginTop: 30 }}>
          모든 데이터는 시트 원본을 바라보고 있으며, 인사이트 수정시 시트에 자동 기록됩니다.
          <div className="flex items-center justify-center gap-3" style={{ marginTop: 10 }}>
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