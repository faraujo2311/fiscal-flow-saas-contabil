export type ThemeColor = 'blue' | 'emerald' | 'indigo' | 'slate' | 'violet';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  hex: string;
  bgPrimary: string;
  bgPrimaryHover: string;
  textPrimary: string;
  textPrimaryLight: string;
  borderPrimary: string;
  borderPrimaryLight: string;
  bgLight: string;
  badgeBg: string;
  badgeText: string;
  ringFocus: string;
  navActive: string;
  shadowColor: string;
}

export const themeConfigs: Record<ThemeColor, ThemeConfig> = {
  blue: {
    id: 'blue',
    name: 'Azul Executivo',
    hex: '#2563EB',
    bgPrimary: 'bg-blue-600',
    bgPrimaryHover: 'hover:bg-blue-700',
    textPrimary: 'text-blue-600',
    textPrimaryLight: 'text-blue-400',
    borderPrimary: 'border-blue-600',
    borderPrimaryLight: 'border-blue-200',
    bgLight: 'bg-blue-50',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    ringFocus: 'focus:ring-blue-500',
    navActive: 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold',
    shadowColor: 'shadow-blue-500/20',
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Esmeralda',
    hex: '#059669',
    bgPrimary: 'bg-emerald-600',
    bgPrimaryHover: 'hover:bg-emerald-700',
    textPrimary: 'text-emerald-600',
    textPrimaryLight: 'text-emerald-400',
    borderPrimary: 'border-emerald-600',
    borderPrimaryLight: 'border-emerald-200',
    bgLight: 'bg-emerald-50',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    ringFocus: 'focus:ring-emerald-500',
    navActive: 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 font-semibold',
    shadowColor: 'shadow-emerald-500/20',
  },
  indigo: {
    id: 'indigo',
    name: 'Índigo Moderno',
    hex: '#4F46E5',
    bgPrimary: 'bg-indigo-600',
    bgPrimaryHover: 'hover:bg-indigo-700',
    textPrimary: 'text-indigo-600',
    textPrimaryLight: 'text-indigo-400',
    borderPrimary: 'border-indigo-600',
    borderPrimaryLight: 'border-indigo-200',
    bgLight: 'bg-indigo-50',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    ringFocus: 'focus:ring-indigo-500',
    navActive: 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold',
    shadowColor: 'shadow-indigo-500/20',
  },
  slate: {
    id: 'slate',
    name: 'Slate Corporativo',
    hex: '#334155',
    bgPrimary: 'bg-slate-700',
    bgPrimaryHover: 'hover:bg-slate-800',
    textPrimary: 'text-slate-700',
    textPrimaryLight: 'text-slate-300',
    borderPrimary: 'border-slate-600',
    borderPrimaryLight: 'border-slate-300',
    bgLight: 'bg-slate-100',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-800',
    ringFocus: 'focus:ring-slate-500',
    navActive: 'bg-slate-700/30 text-slate-200 border border-slate-600/50 font-semibold',
    shadowColor: 'shadow-slate-500/20',
  },
  violet: {
    id: 'violet',
    name: 'Violeta Premium',
    hex: '#7C3AED',
    bgPrimary: 'bg-violet-600',
    bgPrimaryHover: 'hover:bg-violet-700',
    textPrimary: 'text-violet-600',
    textPrimaryLight: 'text-violet-400',
    borderPrimary: 'border-violet-600',
    borderPrimaryLight: 'border-violet-200',
    bgLight: 'bg-violet-50',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    ringFocus: 'focus:ring-violet-500',
    navActive: 'bg-violet-600/15 text-violet-400 border border-violet-500/30 font-semibold',
    shadowColor: 'shadow-violet-500/20',
  },
};

export function getTheme(color?: string): ThemeConfig {
  if (color && color in themeConfigs) {
    return themeConfigs[color as ThemeColor];
  }
  return themeConfigs.blue;
}
