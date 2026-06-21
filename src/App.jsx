import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LabelList
} from 'recharts';
import {
  Bookmark, Share2, UserCheck, Eye, Heart, MessageCircle, UserPlus, Plus, Trash2, Pencil,
  Check, X, ExternalLink, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Loader2,
  ArrowDownToLine, NotebookPen, Activity, PlayCircle, MousePointerClick, LayoutDashboard,
  Globe, Rss, Lightbulb, Sparkles, CheckCircle, AlertCircle, RefreshCw, Settings, Target, Leaf, FileStack, Flame
} from 'lucide-react';

// ============================================================
// 디자인 토큰 & 메타
// ============================================================
const C = { bg: '#F4EEE8', card: '#FFFFFF', panel: '#FBF7F3', ink: '#241F1B', sub: '#6B6259', subLite: '#9A928A', border: '#E7DCD3', accent: '#E8546B', mint: '#2E9E89', mintSoft: '#E4F2EE' };
const FONT = "'Apple SD Gothic Neo', -apple-system, sans-serif";
const SHADOW = '0 1px 3px rgba(40,28,18,0.05), 0 1px 2px rgba(40,28,18,0.03)';
const COUNTRIES = [{ key: 'KR', label: '한국', flag: '🇰🇷' }, { key: 'US', label: '미국', flag: '🇺🇸' }];
const NAV = [
  { key: 'summary', label: '통합 요약', icon: LayoutDashboard },
  { key: 'KR', label: '한국 대시보드', icon: Globe },
  { key: 'US', label: '미국 대시보드', icon: Globe },
  { key: 'feed', label: '피드 콘텐츠', icon: Rss },
];

const ACCOUNT_METRICS = {
  reach: { label: '도달수', icon: Eye, color: '#3E8FB0' }, organicReach: { label: '오가닉 도달', icon: Leaf, color: '#2E9E89' },
  views: { label: '조회수', icon: PlayCircle, color: '#4C6FBF' }, organicViews: { label: '오가닉 조회수', icon: Leaf, color: '#2E9E89' },
  engagement: { label: '참여수', icon: Activity, color: '#6C5CE7' }, newFollowers: { label: '신규 팔로우 수', icon: UserPlus, color: '#2E9E89' },
  followers: { label: '팔로워(누적)', icon: UserCheck, color: '#2E9E89' }, contentsCount: { label: '콘텐츠 수', icon: FileStack, color: '#E08A2B' },
  profileVisits: { label: '프로필 방문', icon: UserCheck, color: '#E8546B' }, websiteClicks: { label: '웹사이트 클릭', icon: MousePointerClick, color: '#E08A2B' },
  sales: { label: '매출', icon: TrendingUp, color: '#E8546B' }, inflow: { label: '유입', icon: ArrowDownToLine, color: '#2E9E89' },
  salesAchieveRate: { label: '매출 달성률', icon: Check, color: '#6C5CE7' }, inflowAchieveRate: { label: '유입 달성률', icon: Check,