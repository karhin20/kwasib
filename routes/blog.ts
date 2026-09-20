import { Router, Request, Response } from 'express';
import { supabase } from '../db.js';

const router = Router();

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  gallery?: string[];
  author: string;
  author_role?: string;
  read_time?: string;
  tags?: string[];
  featured?: boolean;
  published: boolean;
  published_at: string;
  views?: number;
}

// ── Default Fallback Articles ──────────────────────────────────────────────────
const DEFAULT_BLOG_POSTS: BlogPostRow[] = [
  {
    id: 'blog-1',
    title: 'Essential Pre-Purchase Checklist for Heavy Machinery in Ghana',
    slug: 'heavy-machinery-pre-purchase-checklist-ghana',
    category: 'Machinery & Equipment',
    excerpt: 'Navigating hydraulic pressure testing, hour-meter verification, and customs clearing documentation when acquiring excavators and bulldozers in West Africa.',
    content: `Acquiring heavy equipment such as excavators, wheel loaders, and motor graders represents a major capital expenditure for Ghanaian mining contractors, civil engineering firms, and agricultural ventures. 

### 1. Engine & Hydraulic Pressure Diagnostics
Before closing any transaction, insist on a full load-test of the hydraulic pump system. In Ghana's tropical environment with high humidity and heat, worn hydraulic pumps quickly lose pressure after 30 minutes of heavy operation. Check for micro-flakes of metal in the hydraulic fluid filters.

### 2. Hour Meter & Electronic Control Module (ECM) Audit
Analog hour meters are prone to tampering. Always request a digital diagnostic scan of the ECM (Electronic Control Module) to verify actual engine run-hours versus chassis wear. Look out for discrepancy patterns between bucket pin play and claimed operating hours.

### 3. Chassis Integrity & Track Wear
Inspect the undercarriage thoroughly. Track chains, sprockets, and bottom rollers account for nearly 45% of an excavator's long-term maintenance costs. Check for stress cracks around the boom foot and stick joints, especially on machinery previously deployed in quarrying or hard-rock mining in Western or Ashanti regions.

### 4. Import & Customs Clearing Documentation
Ensure the seller provides authentic GRA Customs Entry paperwork, Bill of Lading, and tax clearance proof. Unregistered machinery imported via informal routes can incur severe penalties or seizure during road haulage.`,
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ],
    author: 'Ing. Kwame Mensah',
    author_role: 'Senior Plant Manager',
    read_time: '5 min read',
    tags: ['Heavy Machinery', 'CAT', 'Komatsu', 'Equipment Inspection', 'Ghana Construction'],
    featured: true,
    published: true,
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    views: 342,
  },
  {
    id: 'blog-2',
    title: 'EPA Ghana Fumigation Compliance Standards for Warehouses & Storage',
    slug: 'epa-ghana-fumigation-compliance-standards-storage',
    category: 'Pest Control & Fumigation',
    excerpt: 'Understanding mandatory Environmental Protection Agency (EPA) pest control requirements for cocoa sheds, grain silos, shipping containers, and commercial plazas.',
    content: `Pest management in tropical commercial facilities is not merely about comfort—it is a legal and regulatory requirement in Ghana. The Environmental Protection Agency (EPA) and Ministry of Health mandate strict standards for pest containment in agricultural storage and food processing facilities.

### Key Fumigation Regulations in Ghana
1. **Certified Chemical Deployment**: Only registered bio-pesticides and EPA-approved phosphine or sulfuryl fluoride fumigants may be deployed in commercial warehouses.
2. **Container & Export Clearance**: Cocoa, timber, and cashew export containers require phytosanitary clearance certificates issued post-fumigation.
3. **Termite Barrier Pre-Treatment**: Pre-construction soil poisoning is now required for commercial buildings to prevent subterranean termite invasion of structural timber and cable conduits.

Regular quarterly inspection schedules protect your commercial assets and maintain compliance during municipal health inspections.`,
    image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    ],
    author: 'Dr. Abena Osei',
    author_role: 'Environmental Health Lead',
    read_time: '4 min read',
    tags: ['Fumigation', 'EPA Compliance', 'Warehouse Safety', 'Pest Control', 'Ghana'],
    featured: false,
    published: true,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    views: 189,
  },
  {
    id: 'blog-3',
    title: '2026 Commercial Real Estate & Land Title Trends in Greater Accra',
    slug: '2026-commercial-real-estate-land-title-trends-accra',
    category: 'Real Estate & Properties',
    excerpt: 'An in-depth look into industrial park demand in Tema, office space yields in Airport Residential, and land title verification under the Ghana Land Act 2020.',
    content: `Greater Accra's real estate market continues to expand rapidly, driven by industrialization along the Tema Motorway corridor and high demand for commercial warehousing near the port.

### Navigating the Land Act 2020 (Act 1036)
Investors must register titles under the updated statutory framework. Always conduct dual verification at both the Lands Commission (Search Certificate) and the local Customary Land Secretariat (stool/family title check).

### High-Yield Commercial Segments
- **Cold Storage & Logistics Plazas**: Tema Free Zones and Spintex enclave.
- **Corporate Head Offices**: Airport Residential, Cantonments, and Ridge.
- **Retail Plazas & Showrooms**: East Legon and Kumasi Ahodwo corridors.`,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    author: 'Kofi Annan Jr.',
    author_role: 'Commercial Property Analyst',
    read_time: '6 min read',
    tags: ['Real Estate', 'Commercial Property', 'Accra Land Title', 'Property Management'],
    featured: false,
    published: true,
    published_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    views: 412,
  },
];

let inMemoryPosts = [...DEFAULT_BLOG_POSTS];

function mapRowToPost(row: any) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug || row.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: row.category || 'Industry News',
    excerpt: row.excerpt || '',
    content: row.content || '',
    image: row.image || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : (typeof row.gallery === 'string' ? JSON.parse(row.gallery || '[]') : []),
    author: row.author || 'Akwasi Team',
    authorRole: row.author_role || row.authorRole || 'Contributor',
    readTime: row.read_time || row.readTime || '3 min read',
    tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : []),
    featured: Boolean(row.featured),
    published: row.published !== false,
    publishedAt: row.published_at || row.publishedAt || new Date().toISOString(),
    views: row.views || 0,
  };
}

// GET /api/blog — Fetch blog posts
router.get('/', async (req: Request, res: Response) => {
  const includeDrafts = req.query.all === 'true';

  try {
    let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
    if (!includeDrafts) {
      query = query.eq('published', true);
    }
    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return res.json(data.map(mapRowToPost));
    }
  } catch (err) {
    console.warn('[Blog Route] Supabase query skipped/failed, using in-memory dataset:', err);
  }

  let results = inMemoryPosts;
  if (!includeDrafts) {
    results = results.filter((p) => p.published);
  }
  res.json(results.map(mapRowToPost));
});

// GET /api/blog/:id — Fetch single post by ID or slug
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (!error && data) {
      // Increment views asynchronously
      supabase.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then();
      return res.json(mapRowToPost(data));
    }
  } catch (err) {
    console.warn('[Blog Route] Supabase fetch single error:', err);
  }

  const post = inMemoryPosts.find((p) => p.id === id || p.slug === id);
  if (!post) {
    return res.status(404).json({ error: 'Article not found' });
  }

  post.views = (post.views || 0) + 1;
  res.json(mapRowToPost(post));
});

// POST /api/blog — Create new article
router.post('/', async (req: Request, res: Response) => {
  const {
    title,
    slug,
    category,
    excerpt,
    content,
    image,
    gallery,
    author,
    authorRole,
    readTime,
    tags,
    featured,
    published,
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const generatedSlug = (slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const newPostId = `blog-${Date.now()}`;
  const now = new Date().toISOString();

  const newPostRow: BlogPostRow = {
    id: newPostId,
    title: title.trim(),
    slug: generatedSlug,
    category: category || 'Industry News',
    excerpt: excerpt ? excerpt.trim() : content.slice(0, 160) + '...',
    content: content.trim(),
    image: image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    gallery: Array.isArray(gallery) ? gallery : [],
    author: author || 'Admin',
    author_role: authorRole || 'Editor',
    read_time: readTime || `${Math.max(2, Math.ceil(content.split(' ').length / 200))} min read`,
    tags: Array.isArray(tags) ? tags : [],
    featured: Boolean(featured),
    published: published !== false,
    published_at: now,
    views: 0,
  };

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([newPostRow])
      .select()
      .single();

    if (!error && data) {
      return res.status(201).json(mapRowToPost(data));
    }
  } catch (err) {
    console.warn('[Blog Route] Supabase insert error, saving to in-memory store:', err);
  }

  inMemoryPosts.unshift(newPostRow);
  res.status(201).json(mapRowToPost(newPostRow));
});

// PATCH /api/blog/:id — Update article
router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      return res.json(mapRowToPost(data));
    }
  } catch (err) {
    console.warn('[Blog Route] Supabase update error:', err);
  }

  const index = inMemoryPosts.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const existing = inMemoryPosts[index];
  const updated: BlogPostRow = {
    ...existing,
    title: updates.title !== undefined ? updates.title : existing.title,
    slug: updates.slug !== undefined ? updates.slug : existing.slug,
    category: updates.category !== undefined ? updates.category : existing.category,
    excerpt: updates.excerpt !== undefined ? updates.excerpt : existing.excerpt,
    content: updates.content !== undefined ? updates.content : existing.content,
    image: updates.image !== undefined ? updates.image : existing.image,
    gallery: updates.gallery !== undefined ? updates.gallery : existing.gallery,
    author: updates.author !== undefined ? updates.author : existing.author,
    author_role: updates.authorRole !== undefined ? updates.authorRole : existing.author_role,
    read_time: updates.readTime !== undefined ? updates.readTime : existing.read_time,
    tags: updates.tags !== undefined ? updates.tags : existing.tags,
    featured: updates.featured !== undefined ? updates.featured : existing.featured,
    published: updates.published !== undefined ? updates.published : existing.published,
  };

  inMemoryPosts[index] = updated;
  res.json(mapRowToPost(updated));
});

// DELETE /api/blog/:id — Delete article
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (!error) {
      return res.json({ success: true, message: 'Article deleted successfully' });
    }
  } catch (err) {
    console.warn('[Blog Route] Supabase delete error:', err);
  }

  inMemoryPosts = inMemoryPosts.filter((p) => p.id !== id);
  res.json({ success: true, message: 'Article deleted successfully' });
});

export default router;
