import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

    if (error || !adminUser) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, adminUser.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { adminId: adminUser.id, username: adminUser.username },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({ token, username: adminUser.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/verify — check if token is still valid
router.post('/verify', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ valid: false });
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { username: string };
    res.json({ valid: true, username: decoded.username });
  } catch {
    res.status(401).json({ valid: false });
  }
});

export default router;
