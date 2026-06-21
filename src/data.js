import { 
  Eye, Heart, MessageCircle, UserPlus, UserCheck, FileText, 
  TrendingUp, ArrowDownToLine, Check, Activity, MousePointerClick, 
  LayoutDashboard, Globe, Rss, PlayCircle, Leaf, Bookmark, Share2, Target
} from 'lucide-react';

export const C = {
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

export const FONT = "'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
export const SHADOW = '0 1px 3px rgba(40,28,18,0.05), 0 1px 2px rgba(40,28,18,0.03)';

export const COUNTRIES = [
  { key: 'KR', label: '한국', flag: '🇰🇷', color: '#E8546B' },
  { key: 'US', label: '미국', flag: '🇺🇸', color: '#3E6FE0' },
];

export const NAV = [
  { key: 'summary', label: '통합 요약', icon: LayoutDashboard },
  { key: 'KR', label: '한국 대시보드', icon: Globe },
  { key: 'US', label: '미국 대시보드', icon: Globe },
  { key: 'feed', label: '피드 콘텐츠', icon: Rss },
];

export const ACCOUNT_METRICS = {
  reach: { label: '도달수', icon: Eye, color: '#3E8FB0' },
  organicReach: { label: '오가닉 도달', icon: Leaf, color: '#2E9E89' },
  views: { label: '조회수', icon: PlayCircle, color: '#4C6FBF' },
  organicViews: { label: '오가닉 조회수', icon: Leaf, color: '#2E9E89' },
  engagement: { label: '참여수', icon: Activity, color: '#6C5CE7' },
  newFollowers: { label: '신규 팔로우 수', icon: UserPlus, color: '#2E9E89' },
  followers: { label: '팔로워(누적)', icon: UserCheck, color: '#2E9E89' },
  contentsCount: { label: '콘텐츠 수', icon: FileText, color: '#E08A2B' },
  profileVisits: { label: '프로필 방문', icon: UserCheck, color: '#E8546B' },
  websiteClicks: { label: '웹사이트 클릭', icon: MousePointerClick, color: '#E08A2B' },
  sales: { label: '매출', icon: TrendingUp, color: '#E8546B' },
  inflow: { label: '유입', icon: ArrowDownToLine, color: '#2E9E89' },
  salesAchieveRate: { label: '매출 달성률', icon: Check, color: '#6C5CE7' },
  inflowAchieveRate: { label: '유입 달성률', icon: Check, color: '#6C5CE7' },
  pace: { label: 'Pace', icon: Activity, color: '#E08A2B' },
};

export const ALL_ACCOUNT_KEYS = ['sales', 'inflow', 'salesAchieveRate', 'inflowAchieveRate', 'pace', 'reach', 'organicReach', 'views', 'organicViews', 'engagement', 'newFollowers', 'followers', 'contentsCount', 'profileVisits', 'websiteClicks'];

export const CONTENT_METRICS = {
  reach: { label: '도달', icon: Eye, color: '#3E8FB0' },
  views: { label: '조회수', icon: PlayCircle, color: '#4C6FBF' },
  engagement: { label: '참여', icon: Activity, color: '#6C5CE7' },
  likes: { label: '좋아요', icon: Heart, color: '#E8546B' },
  comments: { label: '댓글', icon: MessageCircle, color: '#C9A24B' },
  saves: { label: '저장', icon: Bookmark, color: '#E8546B' },
  shares: { label: '공유', icon: Share2, color: '#E08A2B' },
};
export const CONTENT_CORE = ['reach', 'views', 'engagement'];
export const CONTENT_SUB = ['likes', 'comments', 'saves', 'shares'];

export const FEED_METRICS = {
  saves: { label: '저장수', icon: Bookmark, color: '#E8546B' },
  shares: { label: '공유수', icon: Share2, color: '#E08A2B' },
  profileActivity: { label: '프로필 활동', icon: UserCheck, color: '#6C5CE7' },
  reach: { label: '도달', icon: Eye, color: '#3E8FB0' },
  likes: { label: '좋아요', icon: Heart, color: '#E8546B' },
  comments: { label: '댓글', icon: MessageCircle, color: '#4C6FBF' },
  follows: { label: '팔로우', icon: UserPlus, color: '#2E9E89' },
};
export const FEED_CORE = ['saves', 'shares', 'profileActivity'];
export const FEED_SUB = ['reach', 'likes', 'comments', 'follows'];
export const FEED_KEYS = [...FEED_CORE, ...FEED_SUB];

export const PRODUCT_CATS = [
  { key: 'gelPressOn', label: '젤프레스온', color: '#E8546B' },
  { key: 'hardener',   label: '강화제',    color: '#6C5CE7' },
  { key: 'gelStrip',   label: '젤스트립',  color: '#2E9E89' },
  { key: 'otherCare',  label: '기타케어류', color: '#C9A24B' },
];

export const initialWeekMeta = [
  { key: 'W18', month: '2026-05' },
  { key: 'W19', month: '2026-05' },
  { key: 'W20', month: '2026-05' },
  { key: 'W21', month: '2026-05' },
  { key: 'W22', month: '2026-05' },
  { key: 'W23', month: '2026-06' },
  { key: 'W24', month: '2026-06' },
];

// 가데이터 셋을 완전히 채워서 연동 전 빈 화면 오류 원천 방지
export const initialAccountMetrics = {
  KR: {
    W18: { sales: 290000000, inflow: 200000, salesAchieveRate: 100, inflowAchieveRate: 100, pace: 100, reach: 3500000, organicReach: 1500000, views: 5000000, organicViews: 2000000, engagement: 80000, newFollowers: 1100, followers: 75000, contentsCount: 6, profileVisits: 20000, websiteClicks: 4000 },
    W19: { sales: 310000000, inflow: 220000, salesAchieveRate: 105, inflowAchieveRate: 102, pace: 104, reach: 3700000, organicReach: 1600000, views: 5200000, organicViews: 2100000, engagement: 90000, newFollowers: 1200, followers: 76200, contentsCount: 7, profileVisits: 22000, websiteClicks: 4100 },
    W20: { sales: 300000000, inflow: 210000, salesAchieveRate: 98, inflowAchieveRate: 95, pace: 97, reach: 3600000, organicReach: 1400000, views: 5100000, organicViews: 1900000, engagement: 85000, newFollowers: 1050, followers: 77250, contentsCount: 5, profileVisits: 21000, websiteClicks: 3900 },
    W21: { sales: 320000000, inflow: 230000, salesAchieveRate: 108, inflowAchieveRate: 106, pace: 107, reach: 4100000, organicReach: 1800000, views: 6000000, organicViews: 2500000, engagement: 110000, newFollowers: 1300, followers: 78550, contentsCount: 8, profileVisits: 25000, websiteClicks: 4300 },
    W22: { sales: 335000000, inflow: 281000, salesAchieveRate: 110, inflowAchieveRate: 105, pace: 102, reach: 4970000, organicReach: 1970000, views: 7210000, organicViews: 3100000, engagement: 167000, newFollowers: 1460, followers: 79800, contentsCount: 7, profileVisits: 24200, websiteClicks: 4200 },
    W23: { sales: 475000000, inflow: 260000, salesAchieveRate: 154, inflowAchieveRate: 130, pace: 140, reach: 5720000, organicReach: 2320000, views: 8650000, organicViews: 3560000, engagement: 243000, newFollowers: 2140, followers: 81900, contentsCount: 7, profileVisits: 29100, websiteClicks: 4700 },
    W24: { sales: 365000000, inflow: 216000, salesAchieveRate: 120, inflowAchieveRate: 111, pace: 115, reach: 4790000, organicReach: 1290000, views: 7800000, organicViews: 2050000, engagement: 125000, newFollowers: 1260, followers: 83200, contentsCount: 7, profileVisits: 17900, websiteClicks: 3900 },
  },
  US: {
    W18: { sales: 380000000, inflow: 250000, salesAchieveRate: 90, inflowAchieveRate: 92, pace: 91, reach: 6500000, organicReach: 6000000, views: 9000000, organicViews: 8500000, engagement: 210000, newFollowers: 1800, followers: 105000, contentsCount: 12, profileVisits: 12000, websiteClicks: 2100 },
    W19: { sales: 390000000, inflow: 260000, salesAchieveRate: 92, inflowAchieveRate: 94, pace: 93, reach: 6800000, organicReach: 6300000, views: 9500000, organicViews: 8900000, engagement: 230000, newFollowers: 1900, followers: 106900, contentsCount: 15, profileVisits: 13000, websiteClicks: 2200 },
    W20: { sales: 410000000, inflow: 265000, salesAchieveRate: 94, inflowAchieveRate: 93, pace: 94, reach: 7100000, organicReach: 6700000, views: 10200000, organicViews: 9600000, engagement: 270000, newFollowers: 2000, followers: 108900, contentsCount: 18, profileVisits: 14000, websiteClicks: 2400 },
    W21: { sales: 420000000, inflow: 270000, salesAchieveRate: 95, inflowAchieveRate: 94, pace: 95, reach: 7400000, organicReach: 7000000, views: 11000000, organicViews: 10400000, engagement: 290000, newFollowers: 2050, followers: 110950, contentsCount: 20, profileVisits: 14500, websiteClicks: 2500 },
    W22: { sales: 430000000, inflow: 277000, salesAchieveRate: 96, inflowAchieveRate: 94, pace: 99, reach: 7810000, organicReach: 7430000, views: 11630000, organicViews: 11110000, engagement: 317000, newFollowers: 2130, followers: 113080, contentsCount: 25, profileVisits: 15300, websiteClicks: 2700 },
    W23: { sales: 442000000, inflow: 291000, salesAchieveRate: 102, inflowAchieveRate: 98, pace: 101, reach: 3210000, organicReach: 2930000, views: 5240000, organicViews: 4760000, engagement: 128000, newFollowers: 960, followers: 114040, contentsCount: 15, profileVisits: 8600, websiteClicks: 1300 },
    W24: { sales: 339000000, inflow: 259000, salesAchieveRate: 92, inflowAchieveRate: 89, pace: 90, reach: 4420000, organicReach: 4140000, views: 7220000, organicViews: 6740000, engagement: 206000, newFollowers: 1341, followers: 115381, contentsCount: 14, profileVisits: 8300, websiteClicks: 900 },
  }
};

export const initialFeedContents = { KR: {}, US: {} };
export const initialAllContents = { KR: {}, US: {} };
export const initialCountryInsights = { KR: {}, US: {} };
export const initialProductSales = { KR: {}, US: {} };