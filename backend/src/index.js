require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');

const prisma = new PrismaClient();
const app = express();

// Auto-create admin on startup if not exists
async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@eduplatform.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!exists) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: { name: 'Administrador', email: adminEmail, password: hashed, role: 'ADMIN' }
      });
      console.log(`✅ Admin creado: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin ya existe: ${adminEmail}`);
    }
  } catch (err) {
    console.error('Error creando admin:', err.message);
  }
}

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedAdmin();
});
