import { BookOpen, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

export default function MaterialDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/library"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Perpustakaan
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary" />
          Detail Materi
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">ID: {params.id}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">Segera Hadir</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Halaman detail materi sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
