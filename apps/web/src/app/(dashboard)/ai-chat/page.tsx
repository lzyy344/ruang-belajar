import { Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export const metadata = { title: 'AI Asisten - Ruang Belajar' };

export default function AIAsistenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="w-7 h-7 text-primary" />
          AI Asisten
        </h1>
        <p className="text-muted-foreground mt-1">Tanya apa saja kepada asisten AI belajar kamu</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Bot className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">Segera Hadir</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Fitur AI Asisten sedang dalam pengembangan dan akan segera tersedia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
