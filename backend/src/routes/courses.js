const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// List all published courses
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        teacher: true,
        _count: { select: { enrollments: true, ratings: true } },
        ratings: { select: { stars: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = courses.map(c => ({
      ...c,
      avgRating: c.ratings.length ? c.ratings.reduce((a, r) => a + r.stars, 0) / c.ratings.length : 0
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single course (public info)
router.get('/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        teacher: true,
        lessons: { orderBy: { order: 'asc' } },
        ratings: { include: { user: { select: { name: true, avatar: true } } } },
        _count: { select: { enrollments: true } }
      }
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const avgRating = course.ratings.length
      ? course.ratings.reduce((a, r) => a + r.stars, 0) / course.ratings.length
      : 0;

    res.json({ ...course, avgRating });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Enroll
router.post('/:id/enroll', authenticate, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user.id;

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (existing) return res.status(400).json({ error: 'Already enrolled' });

    const enrollment = await prisma.enrollment.create({ data: { userId, courseId } });
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my enrollment + progress
router.get('/:id/my-progress', authenticate, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user.id;

    const [enrollment, progress, course] = await Promise.all([
      prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } }),
      prisma.lessonProgress.findMany({ where: { userId, lesson: { courseId } } }),
      prisma.course.findUnique({
        where: { id: courseId },
        include: { lessons: { orderBy: { order: 'asc' } } }
      })
    ]);

    res.json({ enrollment, progress, lessons: course?.lessons || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark lesson as watched
router.post('/lessons/:lessonId/watch', authenticate, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.user.id;

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.courseId } }
    });
    if (!enrollment) return res.status(403).json({ error: 'Not enrolled' });

    // Get all lessons in order
    const lessons = await prisma.lesson.findMany({
      where: { courseId: lesson.courseId },
      orderBy: { order: 'asc' }
    });

    // Find previous lesson
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      const prevProgress = await prisma.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId: prevLesson.id } }
      });
      if (!prevProgress?.watched) {
        return res.status(400).json({ error: 'Must complete previous lesson first' });
      }
    }

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { watched: true, watchedAt: new Date() },
      create: { userId, lessonId, watched: true, watchedAt: new Date() }
    });

    // Check if course is complete
    const allProgress = await prisma.lessonProgress.findMany({
      where: { userId, lessonId: { in: lessons.map(l => l.id) }, watched: true }
    });

    let completed = false;
    if (allProgress.length === lessons.length) {
      await prisma.enrollment.update({
        where: { userId_courseId: { userId, courseId: lesson.courseId } },
        data: { completed: true, completedAt: new Date() }
      });
      completed = true;
    }

    res.json({ progress, completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rate course (only after completion)
router.post('/:id/rate', authenticate, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user.id;
    const { stars, comment } = req.body;

    if (!stars || !comment) return res.status(400).json({ error: 'Stars and comment required' });
    if (stars < 1 || stars > 5) return res.status(400).json({ error: 'Stars must be 1-5' });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (!enrollment?.completed) {
      return res.status(403).json({ error: 'Must complete course before rating' });
    }

    const existing = await prisma.rating.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (existing) return res.status(400).json({ error: 'Already rated this course' });

    const rating = await prisma.rating.create({
      data: { userId, courseId, stars: parseInt(stars), comment }
    });

    // Generate certificate
    let cert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (!cert) {
      cert = await prisma.certificate.create({ data: { userId, courseId } });
    }

    res.status(201).json({ rating, certificate: cert });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user certificate for a course
router.get('/:id/certificate', authenticate, async (req, res) => {
  try {
    const cert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: parseInt(req.params.id) } },
      include: {
        user: { select: { name: true } },
        course: { include: { teacher: true } }
      }
    });
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
