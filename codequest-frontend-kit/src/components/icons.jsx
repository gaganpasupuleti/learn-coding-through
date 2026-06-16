import {
  LayoutDashboard,
  GraduationCap,
  Code2,
  BookOpen,
  ClipboardList,
  FileText,
  TrendingUp,
  Settings,
  Braces,
  Database,
  Brain,
  Target,
  LogOut,
} from 'lucide-react';

const ICONS = {
  LayoutDashboard,
  GraduationCap,
  Code2,
  BookOpen,
  ClipboardList,
  FileText,
  TrendingUp,
  Settings,
  Braces,
  Database,
  Brain,
  Target,
  LogOut,
};

export function NavIcon({ name, className = 'h-4 w-4 shrink-0', strokeWidth = 1.75 }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
