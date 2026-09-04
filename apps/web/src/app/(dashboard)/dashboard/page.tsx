'use client';

import { cn } from '@ruang-belajar/shared';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import {
  Flame,
  HelpCircle,
  Clock,
  Award,
  TrendingUp,
  Target,
  Brain,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

const stats = [
  { label: 'Hari Streak', value: '14', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', sub: 'Luar biasa!' },
  { label: 'Rata-rata Kuis', value: '86%', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', sub: 'Cukup baik' },
  { label: 'Total Belajar', value: '24h', icon: Clock, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', sub: 'Bulan ini' },
  { label: 'Total XP', value: '1.240', icon: Award, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', sub: 'Level 8' },
];

const recentMaterials = [
  { id: '1', title: 'Kuliah Fisika Quantum — Pertemuan 4', type: 'Video', duration: '54 mnt', category: 'Fisika', progress: 65, date: '3 hari lalu' },
  { id: '2', title: 'Rekaman Diskusi Kelompok — Ekonomi', type: 'Audio', duration: '32 mnt', category: 'Ekonomi', progress: 100, date: '5 hari lalu' },
  { id: '3', title: 'Kuliah Algoritma — Sesi 3', type: 'Video', duration: '48 mnt', category: 'Algoritma', progress: 30, date: '1 minggu lalu' },
];

const weeklyChallenge = {
  title: 'Tantangan Mingguan',
  description: 'Selesaikan 5 kuis minggu ini — 3 hari tersisa',
  progress: 60,
  completed: 3,
  total: 5,
  reward: 'Lencana + 500 XP',
};

const heatmapData = [
  0,0,1,2,1,3,4,2,0,1,3,2,4,3,1,2,0,3,4,2,1,3,2,4,4,3,2,1,
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Selamat belajar, Budi! 🎯 Streak <strong>14</strong> hari berturut-turut</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-sm text-muted-foreground">1,240 / 2,800 XP → Level 8</span>
          <div className="hidden sm:block w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '44%' }} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </div>
                <div className={cn('p-3 rounded-xl', stat.bg)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Streak Banner */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/30 dark:to-orange-900/30 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Flame className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Streak 14 hari! Luar biasa!</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Belajar 12 menit lagi hari ini untuk mempertahankan streak kamu.</p>
            </div>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              Lanjutkan Belajar
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Continue Learning & Weekly Challenge */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Lanjutkan Belajar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMaterials.map((material) => (
                <div key={material.id} className="group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{material.title}</span>
                        <Badge variant={material.type === 'Video' ? 'default' : 'secondary'}>{material.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{material.duration} · {material.category} · {material.date}</p>
                    </div>
                    <Badge variant={material.progress === 100 ? 'success' : 'default'}>
                      {material.progress === 100 ? 'Selesai ✓' : `${material.progress}%`}
                    </Badge>
                  </div>
                  <Progress value={material.progress} className="h-2 mt-2" />
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/material/${material.id}`}>
                        <BookOpen className="w-4 h-4 mr-1" />
                        Buka
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/quiz?material=${material.id}`}>
                        <HelpCircle className="w-4 h-4 mr-1" />
                        Kuis
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Challenge */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                {weeklyChallenge.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{weeklyChallenge.description}</p>
              <Progress value={weeklyChallenge.progress} className="h-3" />
              <p className="text-sm text-muted-foreground">{weeklyChallenge.completed} dari {weeklyChallenge.total} kuis selesai · Hadiah: {weeklyChallenge.reward}</p>
              <Button className="w-full" asChild>
                <Link href="/quiz">
                  Kerjakan kuis sekarang
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity & AI Assistant */}
        <div className="space-y-6">
          {/* Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Aktivitas Belajar (28 hari)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {heatmapData.map((level, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-4 rounded',
                      level === 0 && 'bg-muted',
                      level === 1 && 'bg-primary/20',
                      level === 2 && 'bg-primary/40',
                      level === 3 && 'bg-primary/60',
                      level === 4 && 'bg-primary'
                    )}
                    title={`Level ${level}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted" /> Tidak ada</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/20" /> Sedikit</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/60" /> Sedang</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary" /> Banyak</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Card */}
          <Card className="bg-gradient-to-br from-primary/10 via-purple-50/50 to-primary/10 border-primary/20 dark:from-primary/20 dark:via-purple-900/20 dark:to-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Asisten Belajar</h3>
                  <p className="text-sm text-muted-foreground">Tanya apa saja tentang materi</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">AI akan menjelaskan, merangkum, dan membuat kuis untukmu secara instan.</p>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
                  <Link href="/ai-chat?prompt=jelaskan+prinsip+ketidakpastian+heisenberg">
                    <Sparkles className="w-4 h-4" />
                    💡 Minta penjelasan
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" asChild>
                  <Link href="/ai-chat?prompt=buatkan+5+soal+latihan+fisika+kuantum">
                    <HelpCircle className="w-4 h-4" />
                    📝 Buat soal latihan
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" asChild>
                  <Link href="/ai-chat?prompt=tips+belajar+efektif+fisika+kuantum">
                    <Target className="w-4 h-4" />
                    🎯 Tips belajar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}