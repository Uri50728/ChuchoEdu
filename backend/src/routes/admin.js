const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate, requireAdmin);

// ─── TEACHERS ───────────────────────────────────────────

router.get('/teachers', async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/teachers', async (req, res) => {
  try {
    const { name, email, specialty } = req.body;
    if (!name || !email || !specialty)
      return res.status(400).json({ error: 'All fields required' });

    const exists = await prisma.teacher.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const teacher = await prisma.teacher.create({ data: { name, email, specialty } });
    res.status(201).json(teacher);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/teachers/:id', async (req, res) => {
  try {
    const { name, email, specialty } = req.body;
    const teacher = await prisma.teacher.update({
      where: { id: parseInt(req.params.id) },
      data: { name, email, specialty }
    });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  try {
    await prisma.teacher.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── COURSES ────────────────────────────────────────────

router.get('/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacher: true,
        lessons: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true, ratings: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const { title, description, thumbnail, teacherId, lessons } = req.body;
    if (!title || !teacherId) return res.status(400).json({ error: 'Title and teacher required' });

    const course = await prisma.course.create({
      data: {
        title, description, thumbnail,
        teacherId: parseInt(teacherId),
        lessons: lessons?.length ? {
          create: lessons.map((l, i) => ({ title: l.title, videoUrl: l.videoUrl, order: i + 1 }))
        } : undefined
      },
      include: { teacher: true, lessons: { orderBy: { order: 'asc' } } }
    });
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const { title, description, thumbnail, teacherId, isPublished } = req.body;
    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, thumbnail, teacherId: parseInt(teacherId), isPublished },
      include: { teacher: true }
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── LESSONS ────────────────────────────────────────────

router.post('/courses/:id/lessons', async (req, res) => {
  try {
    const { title, videoUrl, order } = req.body;
    const lesson = await prisma.lesson.create({
      data: { title, videoUrl, order: parseInt(order), courseId: parseInt(req.params.id) }
    });
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/lessons/:id', async (req, res) => {
  try {
    const { title, videoUrl, order } = req.body;
    const lesson = await prisma.lesson.update({
      where: { id: parseInt(req.params.id) },
      data: { title, videoUrl, order: parseInt(order) }
    });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/lessons/:id', async (req, res) => {
  try {
    await prisma.lesson.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── REPORTS ────────────────────────────────────────────

router.get('/reports', async (req, res) => {
  try {
    const [courses, totalUsers, totalEnrollments, recentRatings] = await Promise.all([
      prisma.course.findMany({
        include: {
          teacher: true,
          ratings: { include: { user: { select: { name: true } } } },
          _count: { select: { enrollments: true, ratings: true } }
        }
      }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.enrollment.count(),
      prisma.rating.findMany({
        include: { user: { select: { name: true } }, course: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const coursesWithStats = courses.map(c => ({
      ...c,
      avgRating: c.ratings.length
        ? c.ratings.reduce((a, r) => a + r.stars, 0) / c.ratings.length
        : 0,
      totalWatches: c._count.enrollments
    })).sort((a, b) => b.avgRating - a.avgRating);

    res.json({ courses: coursesWithStats, totalUsers, totalEnrollments, recentRatings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Stats for dashboard
router.get('/stats', async (req, res) => {
  try {
    const [users, courses, enrollments, ratings] = await Promise.all([
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.rating.aggregate({ _avg: { stars: true } })
    ]);
    res.json({ users, courses, enrollments, avgRating: ratings._avg.stars || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
