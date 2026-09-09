import { Router, Request, Response } from 'express';
import { supabase } from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

/**
 * Helper to normalize phone numbers (e.g. Ghana numbers 0241234567 -> +233241234567)
 */
function normalizePhoneNumber(rawPhone: string): string {
  let cleaned = rawPhone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '+233' + cleaned.slice(1);
  } else if (!cleaned.startsWith('+') && cleaned.length >= 9) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

// ─── POST /api/subscriptions (Public opt-in) ──────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, name, categories } = req.body;

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      res.status(400).json({ error: 'Valid phone number is required' });
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phone.trim());
    const selectedCategories = Array.isArray(categories) && categories.length > 0 ? categories : ['all'];

    // Upsert subscriber by phone
    const { data, error } = await supabase
      .from('subscribers')
      .upsert(
        {
          phone: normalizedPhone,
          name: name ? String(name).trim() : null,
          categories: selectedCategories,
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'phone' }
      )
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        res.status(500).json({ error: 'Subscribers table not initialized on Supabase.' });
        return;
      }
      throw error;
    }

    res.json({
      success: true,
      message: 'Successfully subscribed to SMS updates!',
      subscriber: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Subscription failed';
    console.error('POST /subscriptions error:', err);
    res.status(500).json({ error: message });
  }
});

// ─── GET /api/subscriptions (Admin only) ──────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, status, search } = req.query;

    let query = supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && typeof status === 'string' && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === '42P01') {
        res.json([]);
        return;
      }
      throw error;
    }

    let subscribers = (data ?? []).map((row) => ({
      id: row.id,
      phone: row.phone,
      name: row.name || 'Anonymous',
      categories: row.categories || ['all'],
      status: row.status || 'active',
      createdAt: row.created_at
        ? new Date(row.created_at).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A',
    }));

    if (category && typeof category === 'string' && category !== 'all') {
      subscribers = subscribers.filter(
        (s) => s.categories.includes('all') || s.categories.includes(category)
      );
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      subscribers = subscribers.filter(
        (s) => s.phone.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    res.json(subscribers);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch subscribers';
    console.error('GET /subscriptions error:', err);
    res.status(500).json({ error: message });
  }
});

// ─── PATCH /api/subscriptions/:id (Admin only) ────────────────────────────────
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['active', 'unsubscribed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const { error } = await supabase
      .from('subscribers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update subscriber';
    console.error('PATCH /subscriptions/:id error:', err);
    res.status(500).json({ error: message });
  }
});

// ─── DELETE /api/subscriptions/:id (Admin only) ───────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete subscriber';
    console.error('DELETE /subscriptions/:id error:', err);
    res.status(500).json({ error: message });
  }
});

export default router;
