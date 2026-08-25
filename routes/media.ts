import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadBuffer, deleteByUrl, deleteByPublicId } from '../cloudinary.js';

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

// DELETE /api/media/delete
// Accepts { url?: string, public_id?: string }
router.post('/delete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, public_id } = req.body as { url?: string; public_id?: string };

    if (!url && !public_id) {
      res.status(400).json({ error: 'url or public_id is required' });
      return;
    }

    let success = false;
    if (public_id) {
      success = await deleteByPublicId(public_id);
    } else if (url) {
      success = await deleteByUrl(url);
    }

    res.json({ success, message: success ? 'Image deleted from Cloudinary' : 'Image not found or delete skipped' });
  } catch (err) {
    console.error('Media delete error:', err);
    res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
  }
});

export default router;
