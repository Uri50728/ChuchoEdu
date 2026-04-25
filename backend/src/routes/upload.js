const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Memoria temporal, no disco
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB input max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  }
});

// POST /api/upload/image
// Recibe imagen, la comprime fuerte y devuelve base64
// Aprox: imagen de 5MB → ~40KB en base64
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });

    const compressed = await sharp(req.file.buffer)
      .resize(640, 360, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 40 })
      .toBuffer();

    const base64 = `data:image/webp;base64,${compressed.toString('base64')}`;
    const sizeKB = Math.round(compressed.length / 1024);

    res.json({ url: base64, sizeKB });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar imagen' });
  }
});

// POST /api/upload/avatar
// Avatar más pequeño aún: 120x120
router.post('/avatar', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });

    const compressed = await sharp(req.file.buffer)
      .resize(120, 120, { fit: 'cover' })
      .webp({ quality: 50 })
      .toBuffer();

    const base64 = `data:image/webp;base64,${compressed.toString('base64')}`;
    const sizeKB = Math.round(compressed.length / 1024);

    res.json({ url: base64, sizeKB });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar imagen' });
  }
});

module.exports = router;
