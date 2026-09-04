'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@ruang-belajar/shared';
import {
  LayoutDashboard,
  CloudUpload,
  BookOpen,
  HelpCircle,
  Gamepad2,
  Bot,
  Clock,
  MessageSquare,
  GraduationCap,
  BarChart3,
  Trophy,
  Settings,
  Brain,
  Moon,
  Sun,
  Bell,
  Search,
  Sparkles,
  ChevronLeft,
  Menu,
  X,
  User,
  LogOut,
  Flame,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload Materi', href: '/upload', icon: CloudUpload },
  { name: 'Perpustakaan', href: '/library', icon: BookOpen },
  { name: 'Kuis', href: '/quiz', icon: HelpCircle },
  { name: 'Mini Games', href: '/games', icon: Gamepad2 },
  { name: 'AI Asisten', href: '/ai-chat', icon: Bot },
  { name: 'Pomodoro', href: '/pomodoro', icon: Clock },
  { name: 'Forum', href: '/community', icon: MessageSquare, badge: 3 },
  { name: 'Tutor', href: '/tutors', icon: GraduationCap },
  { name: 'Analitik', href: '/analytics', icon: BarChart3 },
  { name: 'Pencapaian', href: '/achievements', icon: Trophy },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Ruang Belajar</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold text-primary-foreground bg-primary rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <Avatar.Fallback>BU</Avatar.Fallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Budi Utama</p>
                <p className="text-xs text-muted-foreground">Level 8 • 1,240 XP</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Page title */}
            <h1 className="flex-1 lg:hidden text-lg font-semibold truncate">
              {navigation.find(n => pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href)))?.name || 'Ruang Belajar'}
            </h1>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Cari materi..."
                  className="w-64 pl-10 pr-4 py-2 bg-accent border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  aria-label="Cari materi"
                />
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Notifikasi">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">3</span>
              </button>

              {/* AI Chat shortcut */}
              <Link href="/ai-chat" className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Sparkles className="w-4 h-4" />
                <span>AI Chat</span>
              </Link>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors">
                    <Avatar className="w-8 h-8">
                      <Avatar.Fallback>BU</Avatar.Fallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">Budi</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1 text-xs text-muted-foreground">budi@ruangbelajar.app</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 w-full" onClick={() => setSidebarOpen(false)}>
                      <Settings className="w-4 h-4" />
                      Pengaturan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => { /* handle logout */ }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}