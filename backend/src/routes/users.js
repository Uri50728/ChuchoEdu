const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const { name, avatar, theme } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, avatar, theme },
      select: { id: true, name: true, email: true, role: true, avatar: true, theme: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my enrollments
router.get('/my-courses', async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            teacher: true,
            lessons: true,
            _count: { select: { lessons: true } }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my certificates
router.get('/certificates', async (req, res) => {
  try {
    const certs = await prisma.certificate.findMany({
      where: { userId: req.user.id },
      include: { course: { include: { teacher: true } } },
      orderBy: { issuedAt: 'desc' }
    });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
