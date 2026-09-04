# Panduan Deployment - Ruang Belajar

## Stack Deployment
- **Frontend (Web):** Vercel
- **Backend Worker:** Railway
- **Database:** Railway PostgreSQL
- **Redis:** Railway Redis / Upstash
- **Storage:** MinIO (self-hosted) atau AWS S3

---

## Langkah 1 — Setup Database di Railway

1. Buka [railway.app](https://railway.app) → New Project
2. Add Service → Database → PostgreSQL
3. Copy `DATABASE_URL` dari tab Variables

---

## Langkah 2 — Setup Redis di Railway

1. Di project Railway yang sama → Add Service → Database → Redis
2. Copy `REDIS_URL` dari tab Variables

---

## Langkah 3 — Jalankan Database Migration

```bash
# Di lokal, set DATABASE_URL ke Railway PostgreSQL
export DATABASE_URL="postgresql://..."

# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# (Opsional) Seed data awal
npm run db:seed
```

---

## Langkah 4 — Deploy Web ke Vercel

1. Push project ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import Repository
3. **Root Directory:** `apps/web`
4. **Build Command:** `cd ../.. && npm run build -- --filter=@ruang-belajar/web`
5. **Output Directory:** `.next`
6. Set Environment Variables (dari .env.example):
   - `DATABASE_URL`
   - `REDIS_URL`
   - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (URL Vercel kamu, misal: `https://ruang-belajar.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` (sama dengan NEXTAUTH_URL)
   - `OPENAI_API_KEY`
   - `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`

---

## Langkah 5 — Deploy Worker ke Railway

1. Di Railway project → Add Service → GitHub Repo
2. Pilih repository yang sama
3. Set **Start Command:** `node apps/api/dist/worker/index.js`
4. Set **Build Command:** `npm install && npm run build -- --filter=@ruang-belajar/api`
5. Set Environment Variables:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `OPENAI_API_KEY`
   - `ASSEMBLYAI_API_KEY`
   - `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
   - `WORKER_CONCURRENCY=2`

---

## Verifikasi Deployment

Setelah semua deploy, cek:
- [ ] Web bisa diakses di URL Vercel
- [ ] Login/Register berfungsi
- [ ] Dashboard terbuka tanpa error
- [ ] Railway worker service status: Active
- [ ] Database terkoneksi (lihat Railway logs)

---

## Troubleshooting

**Build gagal di Vercel:**
- Pastikan `NEXTAUTH_URL` sudah diset
- Cek bahwa `DATABASE_URL` valid

**Worker tidak start di Railway:**
- Cek logs Railway untuk error
- Pastikan `DATABASE_URL` dan `REDIS_URL` benar

**Login tidak berfungsi:**
- `NEXTAUTH_SECRET` harus sama di semua service
- `NEXTAUTH_URL` harus match dengan domain Vercel
