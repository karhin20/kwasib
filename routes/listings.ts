import { Router, Request, Response } from 'express';
import { supabase } from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Helper: map DB row to ListingItem shape
function dbToListing(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    subCategory: row.sub_category,
    status: row.status,
    price: row.price,
    currency: row.currency,
    priceFormatted: row.price_formatted,
    priceUsd: row.price_usd,
    pricePeriod: row.price_period,
    featured: row.featured,
    recentlyReduced: row.recently_reduced,
    image: row.image,
    gallery: row.gallery ?? [],
    description: row.description,
    location: row.location,
    city: row.city,
    year: row.year,
    hours: row.hours,
    mileage: row.mileage,
    bodyType: row.body_type,
    make: row.make,
    model: row.model,
    tonnage: row.tonnage,
    weight: row.weight,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    condition: row.condition,
    specs: row.specs ?? [],
    beds: row.beds,
    baths: row.baths,
    showers: row.showers,
    sqm: row.sqm,
    floors: row.floors,
    transactionType: row.transaction_type,
    propertyType: row.property_type,
    parking: row.parking,
    conditioning: row.conditioning,
    features: row.features ?? [],
    layoutDetails: row.layout_details ?? [],
    updatedTime: row.updated_time,
    videoCount: row.video_count,
    seller: row.seller,
    createdAt: row.created_at,
  };
}

// Helper: map ListingItem shape to DB columns
function listingToDb(body: Record<string, unknown>) {
  return {
    id: body.id,
    title: body.title,
    category: body.category,
    sub_category: body.subCategory,
    status: body.status ?? 'published',
    price: body.price,
    currency: body.currency ?? 'GHS',
    price_formatted: body.priceFormatted,
    price_usd: body.priceUsd,
    price_period: body.pricePeriod,
    featured: body.featured ?? false,
    recently_reduced: body.recentlyReduced ?? false,
    image: body.image,
    gallery: body.gallery ?? [],
    description: body.description,
    location: body.location,
    city: body.city,
    year: body.year,
    hours: body.hours,
    mileage: body.mileage,
    body_type: body.bodyType,
    make: body.make,
    model: body.model,
    tonnage: body.tonnage,
    weight: body.weight,
    fuel_type: body.fuelType,
    transmission: body.transmission,
    condition: body.condition,
    specs: body.specs ?? [],
    beds: body.beds,
    baths: body.baths,
    showers: body.showers,
    sqm: body.sqm,
    floors: body.floors,
    transaction_type: body.transactionType,
    property_type: body.propertyType,
    parking: body.parking != null ? String(body.parking) : null,
    conditioning: body.conditioning,
    features: body.features ?? [],
    layout_details: body.layoutDetails ?? [],
    updated_time: body.updatedTime,
    video_count: body.videoCount ?? 0,
    seller: body.seller,
  };
}

// ─── GET /api/listings ─────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, featured, status, limit, offset } = req.query;

    let query = supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category as string);
    }
    if (featured === 'true') {
      query = query.eq('featured', true);
    }
    if (status) {
      query = query.eq('status', status as string);
    }
    if (limit) {
      query = query.limit(Number(limit));
    }
    if (offset) {
      query = query.range(Number(offset), Number(offset) + Number(limit ?? 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json((data ?? []).map(dbToListing));
  } catch (err) {
    console.error('GET /listings error:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// ─── GET /api/listings/:id ─────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    res.json(dbToListing(data));
  } catch (err) {
    console.error('GET /listings/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// ─── POST /api/listings ────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;

    if (!body.title || !body.category) {
      res.status(400).json({ error: 'title and category are required' });
      return;
    }

    // Generate ID if not provided
    if (!body.id) {
      body.id = `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    const dbRow = listingToDb(body);

    const { data, error } = await supabase
      .from('listings')
      .insert(dbRow)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(dbToListing(data));
  } catch (err) {
    console.error('POST /listings error:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

import { deleteByUrl } from '../cloudinary.js';

// ─── PATCH /api/listings/:id  (admin only) ─────────────────────────────────
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    // If removedImages array is provided, delete those from Cloudinary
    if (Array.isArray(body.removedImages)) {
      for (const imgUrl of body.removedImages as string[]) {
        if (typeof imgUrl === 'string') {
          deleteByUrl(imgUrl).catch((err) => console.error('Cloudinary delete error:', err));
        }
      }
    }

    // Only update fields explicitly provided
    const fieldMap: Record<string, string> = {
      title: 'title',
      category: 'category',
      subCategory: 'sub_category',
      status: 'status',
      price: 'price',
      currency: 'currency',
      priceFormatted: 'price_formatted',
      priceUsd: 'price_usd',
      pricePeriod: 'price_period',
      featured: 'featured',
      recentlyReduced: 'recently_reduced',
      image: 'image',
      gallery: 'gallery',
      description: 'description',
      location: 'location',
      city: 'city',
      year: 'year',
      hours: 'hours',
      mileage: 'mileage',
      bodyType: 'body_type',
      make: 'make',
      model: 'model',
      tonnage: 'tonnage',
      weight: 'weight',
      fuelType: 'fuel_type',
      transmission: 'transmission',
      condition: 'condition',
      specs: 'specs',
      beds: 'beds',
      baths: 'baths',
      showers: 'showers',
      sqm: 'sqm',
      floors: 'floors',
      transactionType: 'transaction_type',
      propertyType: 'property_type',
      parking: 'parking',
      conditioning: 'conditioning',
      features: 'features',
      layoutDetails: 'layout_details',
      seller: 'seller',
    };

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (jsKey in body) {
        updates[dbKey] = body[jsKey];
      }
    }
    updates['updated_at'] = new Date().toISOString();

    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Listing not found or update failed' });
      return;
    }

    res.json(dbToListing(data));
  } catch (err) {
    console.error('PATCH /listings/:id error:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// ─── DELETE /api/listings/:id  (admin only) ────────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Fetch listing details to get image and gallery URLs
    const { data: listing } = await supabase
      .from('listings')
      .select('image, gallery')
      .eq('id', req.params.id)
      .single();

    if (listing) {
      const imagesToDelete: string[] = [];
      if (listing.image) imagesToDelete.push(listing.image);
      if (Array.isArray(listing.gallery)) {
        imagesToDelete.push(...listing.gallery);
      }

      // Delete from Cloudinary asynchronously
      for (const imgUrl of imagesToDelete) {
        deleteByUrl(imgUrl).catch((err) => console.error('Cloudinary delete error on listing removal:', err));
      }
    }

    // 2. Delete from Supabase
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /listings/:id error:', err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

export default router;
