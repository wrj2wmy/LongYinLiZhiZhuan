import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

// ── Design tokens inspired by reference editor ───────────────
// Light: white-forward modern with blue accent
// Dark: deep navy adaptation of the same palette

const SHARED_TOKEN = {
  colorPrimary: '#3b82f6',
  colorSuccess: '#10b981',
  colorWarning: '#f59e0b',
  colorError: '#ef4444',
  colorInfo: '#3b82f6',
  borderRadius: 8,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
  fontSize: 13,
};

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...SHARED_TOKEN,
    colorBgBase: '#0F172A',
    colorBgContainer: '#1E293B',
    colorBgElevated: '#334155',
    colorBgLayout: '#0B1120',
    colorText: '#E2E8F0',
    colorTextSecondary: '#94A3B8',
    colorTextTertiary: '#64748B',
    colorBorder: 'rgba(255,255,255,0.10)',
    colorBorderSecondary: 'rgba(255,255,255,0.06)',
  },
  components: {
    Layout: {
      headerBg: '#0F172A',
      siderBg: '#0F172A',
      bodyBg: '#0B1120',
      footerBg: '#0F172A',
      headerPadding: '0 16px',
      headerHeight: 48,
      footerPadding: '4px 16px',
    },
    Table: {
      headerBg: '#1E293B',
      rowHoverBg: 'rgba(59,130,246,0.08)',
      borderColor: 'rgba(255,255,255,0.06)',
      cellPaddingBlockSM: 8,
      cellPaddingInlineSM: 12,
    },
    Tabs: {
      cardBg: '#1E293B',
      itemColor: '#94A3B8',
      itemActiveColor: '#E2E8F0',
      itemSelectedColor: '#E2E8F0',
      inkBarColor: '#3b82f6',
    },
    Card: {
      headerFontSize: 13,
      colorBgContainer: '#1E293B',
      colorBorderSecondary: 'rgba(255,255,255,0.06)',
    },
    Input: {
      colorBgContainer: '#0F172A',
      activeBorderColor: '#3b82f6',
    },
    InputNumber: {
      colorBgContainer: '#0F172A',
      activeBorderColor: '#3b82f6',
    },
    Select: {
      colorBgContainer: '#0F172A',
      optionSelectedBg: 'rgba(59,130,246,0.15)',
    },
    Button: {
      defaultBg: '#1E293B',
      defaultBorderColor: 'rgba(255,255,255,0.10)',
      defaultColor: '#E2E8F0',
    },
    Checkbox: {
      colorBgContainer: '#0F172A',
    },
    Descriptions: {
      colorSplit: 'rgba(255,255,255,0.06)',
    },
  },
};

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...SHARED_TOKEN,
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorText: '#1e293b',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#64748b',
    colorBorder: 'rgba(0,0,0,0.12)',
    colorBorderSecondary: 'rgba(0,0,0,0.08)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#f8fafc',
      bodyBg: '#f8fafc',
      footerBg: '#ffffff',
      headerPadding: '0 16px',
      headerHeight: 48,
      footerPadding: '4px 16px',
    },
    Table: {
      headerBg: '#f8fafc',
      cellPaddingBlockSM: 8,
      cellPaddingInlineSM: 12,
    },
    Card: {
      headerFontSize: 13,
    },
  },
};

// ── Rarity color system (6-tier, from reference) ─────────────
export const RARITY_COLORS: Record<number, { color: string; label: string; bg: string }> = {
  0: { color: '#6b7280', label: '基础', bg: 'rgba(107,114,128,0.10)' },
  1: { color: '#059669', label: '进阶', bg: 'rgba(5,150,105,0.10)' },
  2: { color: '#3b82f6', label: '上乘', bg: 'rgba(59,130,246,0.10)' },
  3: { color: '#7c3aed', label: '秘传', bg: 'rgba(124,58,237,0.10)' },
  4: { color: '#d97706', label: '顶级', bg: 'rgba(217,119,6,0.10)' },
  5: { color: '#dc2626', label: '绝世', bg: 'rgba(220,38,38,0.10)' },
};

// ── Force level color system (6-tier) ────────────────────────
export const FORCE_LV_COLORS: Record<number, { color: string; label: string }> = {
  0: { color: '#6b7280', label: '外门弟子' },
  1: { color: '#059669', label: '入门弟子' },
  2: { color: '#3b82f6', label: '正式弟子' },
  3: { color: '#7c3aed', label: '亲传弟子' },
  4: { color: '#d97706', label: '长老' },
  5: { color: '#dc2626', label: '掌门' },
};

// ── Talent/tag category color system (8 categories) ──────────
// Each category has 3 tiers (value 1/2/3) with increasing saturation
export const TAG_CATEGORY_COLORS: Record<string, { color: string; bg: string; tiers: string[] }> = {
  '武学': { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', tiers: ['#60a5fa', '#3b82f6', '#2563eb'] },
  '天生': { color: '#10b981', bg: 'rgba(16,185,129,0.10)', tiers: ['#34d399', '#10b981', '#059669'] },
  '特效': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', tiers: ['#a78bfa', '#8b5cf6', '#7c3aed'] },
  '志向': { color: '#d97706', bg: 'rgba(217,119,6,0.10)', tiers: ['#fbbf24', '#d97706', '#b45309'] },
  '喜好': { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', tiers: ['#f87171', '#ef4444', '#dc2626'] },
  '高级': { color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', tiers: ['#a78bfa', '#7c3aed', '#6d28d9'] },
  '技艺': { color: '#06b6d4', bg: 'rgba(6,182,212,0.10)', tiers: ['#22d3ee', '#06b6d4', '#0891b2'] },
  '战法': { color: '#ea580c', bg: 'rgba(234,88,12,0.10)', tiers: ['#fb923c', '#ea580c', '#c2410c'] },
};

/** Get talent color based on category + value tier (1=basic, 2=mid, 3=advanced) */
export function getTagColor(category: string, value: number): string {
  const cat = TAG_CATEGORY_COLORS[category];
  if (!cat) return '#6b7280';
  const tierIdx = Math.min(Math.max((value || 1) - 1, 0), 2);
  return cat.tiers[tierIdx];
}

// ── Accent gold for wuxia flavor ─────────────────────────────
export const ACCENT_GOLD = '#d97706';
export const ACCENT_GOLD_LIGHT = '#f59e0b';
