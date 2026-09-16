import { Router, Request, Response } from 'express';
import { supabase } from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── Default Fallback Services ──────────────────────────────────────────────────
const DEFAULT_SERVICES = [
  {
    id: 'srv-fumigation',
    title: 'Industrial & Commercial Fumigation',
    slug: 'fumigation',
    category: 'Fumigation',
    description: 'EPA-approved commercial fumigation treatments for shipping containers, agro-storage facilities, commercial office buildings, and residential complexes with official compliance certification.',
    features: [
      'Pre-construction soil and foundation treatment',
      'Warehouse pest management & grain silos',
      'EPA Ghana & Health Ministry Compliance certification',
      'Residential & commercial termite protection',
    ],
    icon: 'Bug',
    image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=1200&q=80',
    coverage: 'Greater Accra, Ashanti & Western Regions',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-property-mgmt',
    title: 'Commercial Property & Asset Management',
    slug: 'management',
    category: 'Property Management',
    description: 'End-to-end commercial asset custody: facility management, vetted tenant matching, commercial lease drafting under Ghana real estate regulations, and 24/7 facility upkeep.',
    features: [
      'Facility maintenance & HVAC/power scheduling',
      'Tenant vetting & commercial lease management',
      '24/7 Security coordination & access control',
      'Rent collection & financial reporting',
    ],
    icon: 'Building2',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    coverage: 'Nationwide (Accra, Kumasi, Takoradi)',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-logistics',
    title: 'Heavy Machinery Logistics & Inspection',
    slug: 'logistics',
    category: 'Machinery Logistics',
    description: 'Heavy equipment transport, lowbed trailer logistics, cross-regional haulage, and site inspection services for mining, construction, and agricultural equipment in Ghana.',
    features: [
      'Lowbed heavy haulage transport across Ghana & ECOWAS',
      'Pre-purchase machinery inspection & technical evaluation',
      'Site mobilization & demobilization coordination',
      'Certified equipment operators dispatch',
    ],
    icon: 'Truck',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    coverage: 'Ghana Nationwide & ECOWAS Corridor',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// Memory store fallback if DB table doesn't exist yet
let memoryServices = [...DEFAULT_SERVICES];

// Helper to map DB row to API response model
function mapServiceRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug || row.id,
    category: row.category || 'General Service',
    description: row.description,
    features: Array.isArray(row.features) ? row.features : [],
    icon: row.icon || 'ShieldCheck',
    image: row.image || '',
    coverage: row.coverage || 'Ghana Nationwide',
    isActive: row.is_active ?? true,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// ─── GET /api/services (Public / Admin) ───────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeInactive } = req.query;

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        // Table not initialized yet, use memory fallback
        let list = memoryServices;
        if (includeInactive !== 'true') {
          list = list.filter((s) => s.is_active);
        }
        res.json(list.map(mapServiceRow));
        return;
      }
      throw error;
    }

    let services = data ?? [];

    if (services.length === 0 && memoryServices.length > 0) {
      services = memoryServices;
    }

    let mapped = services.map(mapServiceRow);

    if (includeInactive !== 'true') {
      mapped = mapped.filter((s) => s.isActive);
    }

    res.json(mapped);
  } catch (err: unknown) {
    console.error('GET /services error:', err);
    // Fallback gracefully to memory services
    res.json(memoryServices.map(mapServiceRow));
  }
});

// ─── POST /api/services (Admin only) ──────────────────────────────────────────
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, category, description, features, icon, image, coverage, isActive } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newRecord = {
      title: title.trim(),
      slug,
      category: category ? String(category).trim() : 'Enterprise Service',
      description: description.trim(),
      features: Array.isArray(features) ? features : [],
      icon: icon ? String(icon).trim() : 'ShieldCheck',
      image: image ? String(image).trim() : '',
      coverage: coverage ? String(coverage).trim() : 'Ghana Nationwide',
      is_active: isActive !== false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('services')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        // Table missing, append to memory fallback
        const memoryRecord = {
          ...newRecord,
          id: `srv-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        memoryServices.unshift(memoryRecord);
        res.status(201).json(mapServiceRow(memoryRecord));
        return;
      }
      throw error;
    }

    res.status(201).json(mapServiceRow(data));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create service';
    console.error('POST /services error:', err);
    res.status(500).json({ error: msg });
  }
});

// ─── PATCH /api/services/:id (Admin only) ─────────────────────────────────────
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, category, description, features, icon, image, coverage, isActive } = req.body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = String(title).trim();
    if (category !== undefined) updates.category = String(category).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (features !== undefined) updates.features = Array.isArray(features) ? features : [];
    if (icon !== undefined) updates.icon = String(icon).trim();
    if (image !== undefined) updates.image = String(image).trim();
    if (coverage !== undefined) updates.coverage = String(coverage).trim();
    if (isActive !== undefined) updates.is_active = Boolean(isActive);

    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        // Memory fallback update
        const idx = memoryServices.findIndex((s) => s.id === id);
        if (idx !== -1) {
          memoryServices[idx] = {
            ...memoryServices[idx],
            ...updates,
          };
          res.json(mapServiceRow(memoryServices[idx]));
          return;
        }
      }
      throw error;
    }

    res.json(mapServiceRow(data));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update service';
    console.error('PATCH /services/:id error:', err);
    res.status(500).json({ error: msg });
  }
});

// ─── DELETE /api/services/:id (Admin only) ────────────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42P01') {
        memoryServices = memoryServices.filter((s) => s.id !== id);
        res.json({ success: true });
        return;
      }
      throw error;
    }

    res.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete service';
    console.error('DELETE /services/:id error:', err);
    res.status(500).json({ error: msg });
  }
});

export default router;
