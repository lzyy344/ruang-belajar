import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export const metadata = { title: 'Pomodoro - Ruang Belajar' };

export default function PomodoroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-7 h-7 text-primary" />
          Pomodoro
        </h1>
        <p className="text-muted-foreground mt-1">Kelola waktu belajar dengan teknik Pomodoro</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Clock className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">Segera Hadir</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Fitur Pomodoro sedang dalam pengembangan dan akan segera tersedia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
