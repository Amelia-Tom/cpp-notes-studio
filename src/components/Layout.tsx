// EXPORTS: 默认导出 Layout 组件（全局侧栏 + 移动端抽屉）

import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, BookOpen, Code, GraduationCap, Home, Menu, NotebookPen, PenLine, X, type LucideIcon } from 'lucide-react';
import useProgress from '@/hooks/useProgress';
import { TOPICS } from '@/data';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: '首页', icon: Home, end: true },
  { to: '/topics', label: '知识点', icon: BookOpen },
  { to: '/gesp', label: 'GESP 大纲', icon: GraduationCap },
  { to: '/practice', label: '练习自测', icon: PenLine },
  { to: '/reading', label: '程序阅读', icon: Code },
  { to: '/mistakes', label: '错题本', icon: NotebookPen },
  { to: '/progress', label: '学习进度', icon: BarChart3 },
];

function navClass(isActive: boolean) {
  return cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14.5px] transition-colors',
    isActive
      ? 'bg-primary/10 font-medium text-primary'
      : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-[12.5px] font-semibold text-background"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        C++
      </span>
      <span className="leading-tight">
        <span className="block text-[14.5px] font-semibold tracking-tight text-foreground">C++ 笔记</span>
        <span className="mono-label block">for young coders</span>
      </span>
    </Link>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const progress = useProgress();
  const done = progress.completed.length;

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="glass sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-border px-4 py-5 md:flex">
        <Brand />

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => navClass(isActive)}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="flex items-baseline justify-between">
            <span className="mono-label">已学</span>
            <span className="text-xs text-muted-foreground">
              <span className="text-foreground">{done}</span> / {TOPICS.length}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${(done / TOPICS.length) * 100}%` }}
            />
          </div>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            进度保存在这台设备的浏览器里，换设备不会同步。
          </p>
        </div>
      </aside>

      <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          aria-label="打开菜单"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Brand />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              aria-label="关闭菜单"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(navClass(isActive), 'py-3 text-sm')}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

      <Toaster position="top-center" />
    </div>
  );
}
