// =============================================================================
// Database Seed Script
// =============================================================================
import { PrismaClient, Role, Difficulty, MaterialType, MaterialStatus, AchievementCategory, ChallengeType, BookingStatus, NotificationType, ProcessingJobType, JobStatus, SessionType, PomodoroMode, QuestionType, XPSource, MessageRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ruangbelajar.app' },
    update: {},
    create: {
      email: 'admin@ruangbelajar.app',
      name: 'Admin',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  // Create demo user
  const userPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'budi@ruangbelajar.app' },
    update: {},
    create: {
      email: 'budi@ruangbelajar.app',
      name: 'Budi Utama',
      passwordHash: userPassword,
      role: Role.STUDENT,
      emailVerified: new Date(),
    },
  });

  // Create user profile
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      bio: 'Mahasiswa fisika yang suka belajar dengan AI',
      timezone: 'Asia/Jakarta',
      studyGoalMinutes: 30,
      streakDays: 14,
      longestStreak: 14,
      lastStudyDate: new Date(),
      totalXP: 1240,
      level: 8,
      xpToNextLevel: 1000,
      settings: {
        theme: 'light',
        notifications: { email: true, push: true, inApp: true },
        studyReminder: { enabled: true, time: '19:00', timezone: 'Asia/Jakarta' },
        challengeNotifications: true,
        forumNotifications: true,
        achievementNotifications: true,
        language: 'id',
      },
    },
  });

  // Create admin profile
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      bio: 'Administrator Ruang Belajar',
      timezone: 'Asia/Jakarta',
      studyGoalMinutes: 60,
      settings: {
        theme: 'dark',
        notifications: { email: true, push: true, inApp: true },
        studyReminder: { enabled: false, time: '08:00', timezone: 'Asia/Jakarta' },
        challengeNotifications: true,
        forumNotifications: true,
        achievementNotifications: true,
        language: 'id',
      },
    },
  });

  // Create achievements
  const achievements = [
    // Streak achievements
    { key: 'streak_3', name: 'Streak 3 Hari', description: 'Belajar 3 hari berturut-turut', icon: 'ti-flame', category: AchievementCategory.STREAK, requirement: { type: 'streak', value: 3 }, xpReward: 50 },
    { key: 'streak_7', name: 'Streak 7 Hari', description: 'Belajar 7 hari berturut-turut', icon: 'ti-flame', category: AchievementCategory.STREAK, requirement: { type: 'streak', value: 7 }, xpReward: 100 },
    { key: 'streak_14', name: 'Streak 14 Hari', description: 'Belajar 14 hari berturut-turut', icon: 'ti-flame', category: AchievementCategory.STREAK, requirement: { type: 'streak', value: 14 }, xpReward: 200 },
    { key: 'streak_30', name: 'Streak 30 Hari', description: 'Belajar 30 hari berturut-turut', icon: 'ti-calendar', category: AchievementCategory.STREAK, requirement: { type: 'streak', value: 30 }, xpReward: 500 },
    { key: 'streak_100', name: 'Streak 100 Hari', description: 'Belajar 100 hari berturut-turut', icon: 'ti-crown', category: AchievementCategory.STREAK, requirement: { type: 'streak', value: 100 }, xpReward: 2000 },

    // Quiz achievements
    { key: 'quiz_first', name: 'Kuis Pertama', description: 'Selesaikan kuis pertama', icon: 'ti-help-circle', category: AchievementCategory.QUIZ, requirement: { type: 'quiz_count', value: 1 }, xpReward: 50 },
    { key: 'quiz_10', name: 'Pecinta Kuis', description: 'Selesaikan 10 kuis', icon: 'ti-help-circle', category: AchievementCategory.QUIZ, requirement: { type: 'quiz_count', value: 10 }, xpReward: 200 },
    { key: 'quiz_50', name: 'Master Kuis', description: 'Selesaikan 50 kuis', icon: 'ti-trophy', category: AchievementCategory.QUIZ, requirement: { type: 'quiz_count', value: 50 }, xpReward: 500 },
    { key: 'quiz_perfect', name: 'Sempurna', description: 'Dapat nilai 100% pada kuis', icon: 'ti-star', category: AchievementCategory.QUIZ, requirement: { type: 'quiz_perfect', value: 1 }, xpReward: 100 },
    { key: 'quiz_perfect_5', name: 'Juara Kuis', description: 'Dapat nilai 100% pada 5 kuis', icon: 'ti-crown', category: AchievementCategory.QUIZ, requirement: { type: 'quiz_perfect', value: 5 }, xpReward: 500 },

    // Learning achievements
    { key: 'material_1', name: 'Pemula', description: 'Selesaikan materi pertama', icon: 'ti-book', category: AchievementCategory.LEARNING, requirement: { type: 'material_count', value: 1 }, xpReward: 50 },
    { key: 'material_10', name: 'Penjelajah', description: 'Selesaikan 10 materi', icon: 'ti-map', category: AchievementCategory.LEARNING, requirement: { type: 'material_count', value: 10 }, xpReward: 200 },
    { key: 'material_50', name: 'Ahli', description: 'Selesaikan 50 materi', icon: 'ti-graduation-cap', category: AchievementCategory.LEARNING, requirement: { type: 'material_count', value: 50 }, xpReward: 1000 },

    // Social achievements
    { key: 'forum_first_post', name: 'Penulis', description: 'Buat postingan forum pertama', icon: 'ti-pencil', category: AchievementCategory.SOCIAL, requirement: { type: 'forum_post', value: 1 }, xpReward: 50 },
    { key: 'forum_10_posts', name: 'Aktif di Forum', description: 'Buat 10 postingan forum', icon: 'ti-messages', category: AchievementCategory.SOCIAL, requirement: { type: 'forum_post', value: 10 }, xpReward: 200 },

    // Special achievements
    { key: 'pomodoro_10', name: 'Fokus', description: 'Selesaikan 10 sesi Pomodoro', icon: 'ti-clock', category: AchievementCategory.SPECIAL, requirement: { type: 'pomodoro_count', value: 10 }, xpReward: 100 },
    { key: 'night_owl', name: 'Malam Minggu', description: 'Belajar setelah pukul 22:00', icon: 'ti-moon', category: AchievementCategory.SPECIAL, requirement: { type: 'streak', value: 1, metadata: { hour: 22 } }, xpReward: 100, isSecret: true },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {},
      create: ach,
    });
  }

  // Create challenges
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const challenges = [
    { key: 'weekly_quiz_5', name: 'Juara Kuis Mingguan', description: 'Selesaikan 5 kuis minggu ini', type: ChallengeType.WEEKLY, target: 5, xpReward: 500, badgeReward: 'quiz_master_weekly', startsAt: weekStart, endsAt: weekEnd, isActive: true },
    { key: 'weekly_study_3h', name: 'Rajin Belajar', description: 'Belajar total 3 jam minggu ini', type: ChallengeType.WEEKLY, target: 180, xpReward: 300, startsAt: weekStart, endsAt: weekEnd, isActive: true },
    { key: 'weekly_pomodoro_10', name: 'Fokus Mingguan', description: 'Selesaikan 10 sesi Pomodoro', type: ChallengeType.WEEKLY, target: 10, xpReward: 300, startsAt: weekStart, endsAt: weekEnd, isActive: true },
  ];

  for (const ch of challenges) {
    await prisma.challenge.upsert({
      where: { key: ch.key },
      update: {},
      create: ch,
    });
  }

  // Create demo materials for user
  const materials = [
    {
      userId: user.id,
      title: 'Kuliah Fisika Quantum — Pertemuan 4',
      description: 'Prinsip ketidakpastian Heisenberg, fungsi gelombang, dan superposisi kuantum',
      type: MaterialType.VIDEO,
      status: MaterialStatus.COMPLETED,
      duration: 54 * 60,
      category: 'Fisika',
      difficulty: Difficulty.MEDIUM,
      tags: ['kuantum', 'heisenberg', 'superposisi'],
      estimatedStudyTime: 60,
      progress: 65,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      title: 'Rekaman Diskusi Kelompok — Ekonomi',
      description: 'Pembahasan teori penawaran dan permintaan, elastisitas harga',
      type: MaterialType.AUDIO,
      status: MaterialStatus.COMPLETED,
      duration: 32 * 60,
      category: 'Ekonomi',
      difficulty: Difficulty.BASIC,
      tags: ['ekonomi', 'elastisitas', 'diskusi'],
      estimatedStudyTime: 40,
      progress: 100,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      title: 'Kuliah Algoritma — Sesi 3',
      description: 'Dynamic programming: memoization vs tabulation',
      type: MaterialType.VIDEO,
      status: MaterialStatus.COMPLETED,
      duration: 48 * 60,
      category: 'Algoritma',
      difficulty: Difficulty.MEDIUM,
      tags: ['algoritma', 'dynamic-programming', 'memoization'],
      estimatedStudyTime: 55,
      progress: 30,
    },
    {
      userId: user.id,
      title: 'Matematika Dasar — Kalkulus Integral',
      description: 'Integral tak tentu, teknik substitusi, dan integral parsial',
      type: MaterialType.VIDEO,
      status: MaterialStatus.COMPLETED,
      duration: 61 * 60,
      category: 'Matematika',
      difficulty: Difficulty.BASIC,
      tags: ['kalkulus', 'integral', 'matematika'],
      estimatedStudyTime: 70,
      progress: 80,
    },
  ];

  for (const mat of materials) {
    await prisma.material.create({
      data: mat,
    });
  }

  // Create XP transactions for demo user
  const xpTransactions = [
    { userId: user.id, amount: 100, source: XPSource.MATERIAL_COMPLETE, referenceId: null, description: 'Menyelesaikan materi: Rekaman Diskusi Kelompok — Ekonomi' },
    { userId: user.id, amount: 50, source: XPSource.QUIZ_COMPLETE, referenceId: null, description: 'Menyelesaikan kuis Fisika Quantum' },
    { userId: user.id, amount: 100, source: XPSource.QUIZ_PERFECT, referenceId: null, description: 'Skor sempurna pada kuis Ekonomi' },
    { userId: user.id, amount: 25, source: XPSource.POMODORO_COMPLETE, referenceId: null, description: 'Selesai sesi Pomodoro fokus' },
    { userId: user.id, amount: 10, source: XPSource.DAILY_STREAK, referenceId: null, description: 'Streak harian 14 hari' },
    { userId: user.id, amount: 200, source: XPSource.ACHIEVEMENT_UNLOCK, referenceId: null, description: 'Membuka lencana: Streak 14 Hari' },
    { userId: user.id, amount: 5, source: XPSource.NOTE_CREATE, referenceId: null, description: 'Membuat catatan pribadi' },
  ];

  for (const xp of xpTransactions) {
    await prisma.xPTransaction.create({ data: xp });
  }

  // Unlock some achievements for demo user
  const userAchievements = ['streak_3', 'streak_7', 'streak_14', 'quiz_first', 'quiz_perfect', 'material_1', 'forum_first_post', 'pomodoro_10', 'night_owl'];
  for (const key of userAchievements) {
    const ach = await prisma.achievement.findUnique({ where: { key } });
    if (ach) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: user.id, achievementId: ach.id } },
        update: {},
        create: { userId: user.id, achievementId: ach.id },
      });
    }
  }

  // Create forum posts
  const forumPosts = [
    {
      userId: user.id,
      title: 'Ada yang bisa jelaskan eksperimen Schrödinger?',
      content: 'Hei semua! Ada yang bisa jelaskan lebih lanjut tentang eksperimen Schrödinger? Saya masih bingung kenapa kucing bisa "hidup dan mati" sekaligus.',
      category: 'Fisika',
      tags: ['Fisika', 'Pertanyaan', 'Kuantum'],
      likeCount: 5,
      replyCount: 2,
    },
    {
      userId: admin.id,
      title: 'Catatan lengkap kuliah Fisika Quantum Pertemuan 1–4',
      content: 'Saya upload catatan lengkap kuliah Fisika Quantum Pertemuan 1–4 di perpustakaan. Semoga bermanfaat! 📚',
      category: 'Fisika',
      tags: ['Fisika', 'Catatan', 'Bagikan'],
      likeCount: 12,
      replyCount: 7,
    },
    {
      userId: user.id,
      title: 'Soal kuis minggu lalu tentang fungsi gelombang',
      content: 'Soal kuis minggu lalu yang nomor 3 tentang fungsi gelombang — menurut saya jawabannya bisa ambigu. Ada yang mau diskusi?',
      category: 'Fisika',
      tags: ['Fisika', 'Diskusi', 'Kuis'],
      likeCount: 3,
      replyCount: 4,
    },
  ];

  for (const post of forumPosts) {
    await prisma.forumPost.create({ data: post });
  }

  // Create tutor profiles
  const tutors = [
    {
      userId: admin.id,
      bio: 'Dosen Fisika di Universitas Indonesia dengan spesialisasi Mekanika Kuantum. Berpengalaman mengajar 15+ tahun.',
      subjects: ['Fisika Kuantum', 'Mekanika Statistik', 'Fisika Modern'],
      hourlyRate: 250000,
      rating: 4.9,
      reviewCount: 142,
      totalSessions: 142,
      isVerified: true,
      isActive: true,
    },
  ];

  for (const tutor of tutors) {
    await prisma.tutor.upsert({
      where: { userId: tutor.userId },
      update: {},
      create: tutor,
    });
  }

  // Create analytics events
  const events = [
    { userId: user.id, eventType: 'material_opened', eventData: { materialId: '1' }, materialId: '1' },
    { userId: user.id, eventType: 'material_completed', eventData: { materialId: '2' }, materialId: '2' },
    { userId: user.id, eventType: 'quiz_started', eventData: { quizId: '1' }, materialId: '1' },
    { userId: user.id, eventType: 'quiz_completed', eventData: { quizId: '1', score: 80 }, materialId: '1' },
    { userId: user.id, eventType: 'answer_correct', eventData: { questionId: '1' }, materialId: '1' },
    { userId: user.id, eventType: 'pomodoro_completed', eventData: { mode: 'WORK', duration: 1500 } },
    { userId: user.id, eventType: 'note_created', eventData: { materialId: '1' }, materialId: '1' },
  ];

  for (const event of events) {
    await prisma.analyticsEvent.create({ data: event });
  }

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });