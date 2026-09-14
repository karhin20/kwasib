import { Router, Request, Response } from 'express';
import { supabase } from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/enquiries  (admin only) ──────────────────────────────────────
router.get('/', requireAuth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (data ?? []).map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      phone: row.phone,
      email: row.email,
      category: row.category,
      source: row.source,
      message: row.message,
      aiConversationSnippet: row.ai_conversation_snippet,
      itemTitle: row.item_title,
      listingId: row.listing_id,
      timestamp: new Date(row.created_at).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /enquiries error:', err);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

// ─── POST /api/enquiries (public quote / enquiry submission) ────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { customerName, phone, email, category, source, message, itemTitle, listingId } =
    req.body as {
      customerName?: string;
      phone?: string;
      email?: string;
      category?: string;
      source?: string;
      message?: string;
      itemTitle?: string;
      listingId?: string;
    };

  if (!customerName || !phone || !message) {
    res.status(400).json({ error: 'customerName, phone, and message are required' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        customer_name: customerName,
        phone,
        email: email ?? null,
        category: category ?? 'Service Quote',
        source: source ?? 'form',
        message,
        item_title: itemTitle ?? null,
        listing_id: listingId ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, id: data.id });
  } catch (err) {
    console.error('POST /enquiries error:', err);
    res.status(500).json({ error: 'Failed to create enquiry' });
  }
});

// ─── DELETE /api/enquiries/:id  (admin only) ───────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /enquiries/:id error:', err);
    res.status(500).json({ error: 'Failed to delete enquiry' });
  }
});

export default router;
