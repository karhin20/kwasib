import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadBuffer } from '../cloudinary.js';

const router = Router();

// Memory storage — files go straight to Cloudinary, nothing written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

// POST /api/media/upload
// Accepts a multipart/form-data body with a field named "file"
// Optional query param: ?folder=akwasi/listings
router.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    try {
      const folder = (req.query.folder as string) ?? 'akwasi/listings';
      const result = await uploadBuffer(req.file.buffer, folder);
      res.json({ url: result.url, public_id: result.public_id });
    } catch (err) {
      console.error('Media upload error:', err);
      res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
    }
  }
);

export default router;
