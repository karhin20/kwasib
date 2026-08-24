/**
 * Seed Script — populates Supabase with mock listings and creates the default admin user.
 * Run once: cd backend && npm run seed
 */
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Mock listings data ───────────────────────────────────────────────────────
const LISTINGS = [
  {
    id: 'prop-ridge-townhouse-3bed',
    title: '3 Bedroom Townhouse for Sale in Accra',
    category: 'properties',
    sub_category: 'Townhouse',
    property_type: 'Townhouse',
    transaction_type: 'For Sale',
    status: 'published',
    price: 3870669,
    currency: 'GH₵',
    price_formatted: 'GH₵ 3,870,669',
    price_usd: 'USD 350,000',
    featured: true,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Executive 3-Bedroom Apartment for Sale in Ridge, Accra.\n\nOwn a premium residence in the prestigious Ridge neighborhood of Accra. This executive 3-bedroom apartment combines spacious interiors, modern finishes, and a functional layout.',
    location: 'Ridge (North/West/East Ridge), Accra, Ghana',
    city: 'Accra',
    beds: 3,
    baths: 3,
    showers: 3,
    sqm: 285,
    parking: '1',
    conditioning: 'Air',
    updated_time: '1 day ago',
    video_count: 0,
    features: [
      '3 spacious bedrooms, all en-suite',
      'Additional study / home office or TV room',
      '3 storage rooms for added convenience',
      'Dedicated car parking area',
      'Secure and well-maintained development with 24/7 security',
    ],
    layout_details: [
      {
        title: 'Main Level',
        items: [
          'Expansive living area ideal for entertaining',
          'Dedicated dining space with hardwood accents',
          'Fully fitted modern kitchen with refrigerator & laundry station',
        ],
      },
      {
        title: 'Upper Level',
        items: [
          'Master suite with custom walk-in closet and deluxe bathroom',
          '2 additional well-proportioned en-suite bedrooms',
          'Family lounge / study nook opening to balcony',
        ],
      },
    ],
    specs: [
      { label: 'Beds', value: '3 Beds', icon: 'bed' },
      { label: 'Baths', value: '3 Baths', icon: 'shower' },
      { label: 'Parking', value: '1 Slot', icon: 'local_parking' },
      { label: 'Conditioning', value: 'Air Conditioned', icon: 'ac_unit' },
    ],
    seller: {
      name: 'E. Wells Realty',
      phone: '+233 30 278 0090',
      whatsapp: '+233 24 412 3456',
      verified: true,
      location: 'Ridge & Airport Residential, Accra',
    },
  },
  {
    id: 'mach-cat-320gc-2022',
    title: '2022 Caterpillar 320 GC',
    category: 'heavy_machinery',
    sub_category: 'Excavator',
    status: 'published',
    price: 1450000,
    currency: 'GHS',
    price_formatted: 'GHS 1,450,000',
    price_usd: 'USD ~115,000',
    featured: true,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Hydraulic Excavator - Excellent Condition. Equipped with standard boom, 1.2m³ heavy-duty bucket, Cat C4.4 engine, and digital grade assist system. Ready for immediate deployment.',
    location: 'Tema Port, Greater Accra',
    city: 'Tema',
    year: 2022,
    hours: 1200,
    body_type: 'Heavy Equipment',
    make: 'Caterpillar',
    model: '320 GC',
    tonnage: '20.5 Tons',
    weight: '20.5 Tons',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    condition: 'Excellent Condition',
    updated_time: '2 days ago',
    features: [
      'Original Cat C4.4 ACERT turbocharged diesel engine',
      'Heavy-duty 1.2m³ rock digging bucket',
      'Operator ROPS/FOPS certified enclosed cabin with high-output AC',
      'Factory electronic grade assist & payload tracking',
    ],
    specs: [
      { label: 'Hours', value: '1,200 hrs', icon: 'schedule' },
      { label: 'Location', value: 'Tema Port', icon: 'location_on' },
      { label: 'Weight', value: '20.5 Tons', icon: 'weight' },
      { label: 'Status', value: 'Dealer Serviced', icon: 'build' },
    ],
    seller: {
      name: 'Mantrac Ghana Certified Pre-Owned',
      phone: '+233 30 221 4500',
      whatsapp: '+233 24 412 3456',
      verified: true,
      location: 'Tema Heavy Industrial Area, Ghana',
    },
  },
  {
    id: 'veh-toyota-hilux-2021',
    title: '2021 Toyota Hilux D/Cab',
    category: 'cars_vehicles',
    sub_category: 'Pickup',
    status: 'published',
    price: 520000,
    currency: 'GHS',
    price_formatted: 'GHS 520,000',
    price_usd: 'USD ~41,000',
    featured: true,
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
    ],
    description: '4x4 Manual Diesel - Excellent Condition. Fully serviced, accident-free double cabin pickup with heavy duty bullbar, bed liner, reverse camera, and touch infotainment display.',
    location: 'Spintex Road, Accra',
    city: 'Accra',
    year: 2021,
    mileage: '45,000 km',
    body_type: 'Pickup',
    make: 'Toyota',
    model: 'Hilux Revo 2.8L',
    fuel_type: 'Diesel',
    transmission: 'Manual',
    condition: 'Excellent Condition',
    updated_time: '3 days ago',
    features: [
      '2.8L D-4D Turbo Diesel engine delivering 201 HP',
      'Selectable 4WD with high and low range transfer box & rear diff lock',
      'Heavy-duty steel front bullbar and side rock sliders',
    ],
    specs: [
      { label: 'Mileage', value: '45k km', icon: 'speed' },
      { label: 'Location', value: 'Accra Central', icon: 'location_on' },
      { label: 'Fuel', value: 'Diesel', icon: 'local_gas_station' },
      { label: 'Gearbox', value: '6-Speed Manual', icon: 'settings' },
    ],
    seller: {
      name: 'Akwasi Prime Motors Ltd',
      phone: '+233 24 555 8920',
      whatsapp: '+233 24 555 8920',
      verified: true,
      location: 'Spintex Road, Accra',
    },
  },
  {
    id: 'veh-lc300-2023',
    title: '2023 Toyota Land Cruiser 300 VXR',
    category: 'cars_vehicles',
    sub_category: 'SUV',
    status: 'published',
    price: 1850000,
    currency: 'GHS',
    price_formatted: 'GHS 1,850,000',
    price_usd: 'USD ~148,000',
    featured: true,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
    ],
    description: '3.5L V6 Twin-Turbo Petrol - Fullest Option VXR. Brand new zero mileage executive SUV with JBL 14-speaker audio, rear seat entertainment displays, 360 camera, adaptive variable suspension.',
    location: 'Airport Residential Area, Accra',
    city: 'Accra',
    year: 2023,
    mileage: '1,500 km',
    body_type: 'SUV',
    make: 'Toyota',
    model: 'Land Cruiser 300 VXR',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    condition: 'Brand New',
    updated_time: '1 day ago',
    features: [
      '3.5L V6 Twin-Turbo Petrol Engine generating 409 HP',
      '10-speed Direct Shift automatic transmission',
      'JBL Premium 14-Speaker surround sound system',
    ],
    specs: [
      { label: 'Mileage', value: '1.5k km', icon: 'speed' },
      { label: 'Location', value: 'Airport Residential', icon: 'location_on' },
      { label: 'Engine', value: '3.5L V6 Twin Turbo', icon: 'local_gas_station' },
      { label: 'Transmission', value: '10-Speed Auto', icon: 'settings' },
    ],
    seller: {
      name: 'Accra Executive Auto Gallery',
      phone: '+233 24 333 4455',
      whatsapp: '+233 24 333 4455',
      verified: true,
      location: 'Airport Residential, Accra',
    },
  },
  {
    id: 'veh-mb-gle450-2022',
    title: '2022 Mercedes-Benz GLE 450 4MATIC',
    category: 'cars_vehicles',
    sub_category: 'SUV',
    status: 'published',
    price: 1350000,
    currency: 'GHS',
    price_formatted: 'GHS 1,350,000',
    price_usd: 'USD ~108,000',
    featured: false,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    ],
    description: '3.0L Turbo Inline-6 with EQ Boost. AMG Line styling package, panoramic sunroof, Burmester sound, ambient lighting, and dual 12.3-inch MBUX displays.',
    location: 'Cantonments, Accra',
    city: 'Accra',
    year: 2022,
    mileage: '22,000 km',
    body_type: 'SUV',
    make: 'Mercedes-Benz',
    model: 'GLE 450 4MATIC AMG Line',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    condition: 'Excellent Condition',
    updated_time: '2 days ago',
    specs: [
      { label: 'Mileage', value: '22k km', icon: 'speed' },
      { label: 'Location', value: 'Cantonments', icon: 'location_on' },
      { label: 'Fuel', value: 'Petrol', icon: 'local_gas_station' },
      { label: 'Drivetrain', value: '4MATIC AWD', icon: 'settings' },
    ],
    seller: {
      name: 'Star Motors Ghana',
      phone: '+233 30 277 8899',
      whatsapp: '+233 24 111 2233',
      verified: true,
      location: 'Cantonments, Accra',
    },
  },
  {
    id: 'mach-bobcat-s570-2019',
    title: '2019 Bobcat S570',
    category: 'heavy_machinery',
    sub_category: 'Loaders',
    status: 'published',
    price: 280000,
    currency: 'GHS',
    price_formatted: 'GHS 280,000',
    price_usd: 'USD ~22,500',
    featured: false,
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Skid-Steer Loader with standard bucket attachment. Enclosed cab with AC, high-flow auxiliary hydraulics, pneumatic heavy-duty tires.',
    location: 'Takoradi Harbour Zone',
    city: 'Takoradi',
    year: 2019,
    hours: 3400,
    body_type: 'Heavy Equipment',
    make: 'Bobcat',
    model: 'S570',
    tonnage: '2.9 Tons',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    condition: 'Used',
    specs: [
      { label: 'Hours', value: '3,400 hrs', icon: 'schedule' },
      { label: 'Location', value: 'Takoradi Harbour', icon: 'location_on' },
      { label: 'Payload', value: '950 kg', icon: 'fitness_center' },
      { label: 'Engine', value: 'Kubota 2.4L Diesel', icon: 'build' },
    ],
    seller: {
      name: 'Western Region Equipment Hire',
      phone: '+233 31 202 8810',
      whatsapp: '+233 24 999 1122',
      verified: true,
      location: 'Harbour Road, Takoradi',
    },
  },
  {
    id: 'mach-komatsu-d61ex-2021',
    title: 'Komatsu D61EX-24',
    category: 'heavy_machinery',
    sub_category: 'Bulldozers',
    status: 'published',
    price: 1200000,
    currency: 'GH₵',
    price_formatted: 'GH₵ 1,200,000',
    price_usd: 'USD ~96,000',
    featured: false,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Heavy crawler bulldozer with power-angle-tilt (PAT) blade, slant nose design for exceptional blade visibility, and hydrostatic transmission.',
    location: 'Industrial Area, Accra',
    city: 'Accra',
    year: 2021,
    hours: 2100,
    body_type: 'Heavy Equipment',
    make: 'Komatsu',
    model: 'D61EX-24',
    tonnage: '19.5 Tons',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    condition: 'Dealer Certified',
    specs: [
      { label: 'Hours', value: '2,100 hrs', icon: 'schedule' },
      { label: 'Blade', value: 'PAT 3.8m³', icon: 'build' },
      { label: 'Weight', value: '19.5 Tons', icon: 'weight' },
    ],
    seller: {
      name: 'Ghana Earthmovers Network',
      phone: '+233 20 444 3322',
      whatsapp: '+233 20 444 3322',
      verified: true,
      location: 'Industrial Area, Accra',
    },
  },
  {
    id: 'prop-cantonments-luxury-2024',
    title: 'The Cantonments Luxury Suites',
    category: 'properties',
    sub_category: 'Apartment',
    status: 'published',
    price: 4500000,
    currency: 'GHS',
    price_formatted: 'GHS 4,500,000',
    price_usd: 'USD ~360,000',
    featured: true,
    transaction_type: 'For Sale',
    property_type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Striking modern luxury apartment building in Cantonments, Accra. Expansive floor-to-ceiling glass windows, private balcony garden, swimming pool, 24/7 security, and backup power.',
    location: 'Cantonments, Accra',
    city: 'Accra',
    beds: 3,
    baths: 3,
    showers: 3,
    sqm: 240,
    parking: '2',
    conditioning: 'Air',
    features: [
      'Floor-to-ceiling double glazed UV protected windows',
      'Fitted kitchen with integrated SMEG appliances',
      'Resort-style communal lap pool & fitness center',
    ],
    specs: [
      { label: 'Beds', value: '3 Beds', icon: 'bed' },
      { label: 'Showers', value: '3 Showers', icon: 'shower' },
      { label: 'Area', value: '240 sqm', icon: 'square_foot' },
      { label: 'Parking', value: '2 Covered Slots', icon: 'local_parking' },
    ],
    seller: {
      name: 'Akwasi Luxury Properties',
      phone: '+233 30 277 8899',
      whatsapp: '+233 24 555 1212',
      verified: true,
      location: 'Cantonments, Accra',
    },
  },
  {
    id: 'prop-labone-villa-2024',
    title: 'Labone Executive Villa',
    category: 'properties',
    sub_category: 'House / Villa',
    status: 'published',
    price: 8200000,
    currency: 'GHS',
    price_formatted: 'GHS 8,200,000',
    price_usd: 'USD ~650,000',
    featured: false,
    transaction_type: 'For Sale',
    property_type: 'House / Villa',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Ultra-modern 4-bedroom detached villa in prestigious Labone. Features an infinity swimming pool, fitted smart kitchen with German appliances, solar hybrid power, and staff quarters.',
    location: 'Labone, Accra',
    city: 'Accra',
    beds: 4,
    baths: 4,
    showers: 4,
    sqm: 450,
    parking: '3',
    conditioning: 'Air',
    specs: [
      { label: 'Beds', value: '4 Beds', icon: 'bed' },
      { label: 'Showers', value: '4 Showers', icon: 'shower' },
      { label: 'Plot Area', value: '450 sqm', icon: 'square_foot' },
      { label: 'Pool', value: 'Private Infinity Pool', icon: 'pool' },
    ],
    seller: {
      name: 'Prime Heritage Homes',
      phone: '+233 24 777 6655',
      whatsapp: '+233 24 777 6655',
      verified: true,
      location: 'Labone, Accra',
    },
  },
  {
    id: 'veh-mb-actros-2018',
    title: '2018 MB Actros 3344',
    category: 'cars_vehicles',
    sub_category: 'Commercial Truck',
    status: 'published',
    price: 850000,
    currency: 'GHS',
    price_formatted: 'GHS 850,000',
    price_usd: 'USD ~68,000',
    featured: false,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Tractor Head - 6x4 Prime Mover. Euro 5 V6 Turbo Diesel engine, EPS automatic transmission, reinforced chassis, ideal for long-distance container haulage and mining transit.',
    location: 'Suame Magazine, Kumasi',
    city: 'Kumasi',
    year: 2018,
    mileage: '210k km',
    body_type: 'Commercial Truck',
    make: 'Mercedes-Benz',
    model: 'Actros 3344 6x4',
    tonnage: '33 Tons',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    condition: 'Excellent Condition',
    updated_time: '4 days ago',
    specs: [
      { label: 'Mileage', value: '210k km', icon: 'speed' },
      { label: 'Location', value: 'Kumasi Depot', icon: 'location_on' },
      { label: 'Config', value: '6x4 Tractor Head', icon: 'local_shipping' },
      { label: 'Engine', value: 'V6 Turbo 440HP', icon: 'engineering' },
    ],
    seller: {
      name: 'Ashanti Logistics & Haulage',
      phone: '+233 32 203 1180',
      whatsapp: '+233 50 123 7890',
      verified: true,
      location: 'Suame Magazine, Kumasi',
    },
  },
];

async function seed() {
  console.log('🌱 Starting seed...\n');

  // ── 1. Upsert listings ─────────────────────────────────────────────────────
  console.log(`Seeding ${LISTINGS.length} listings...`);
  const { error: listingsError } = await supabase
    .from('listings')
    .upsert(LISTINGS, { onConflict: 'id' });

  if (listingsError) {
    console.error('❌ Listings seed error:', listingsError.message);
    process.exit(1);
  }
  console.log(`✅ ${LISTINGS.length} listings seeded.\n`);

  // ── 2. Create admin user ───────────────────────────────────────────────────
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';

  console.log(`Creating admin user: "${username}"...`);

  // Check if already exists
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('username', username)
    .single();

  if (existing) {
    console.log('⚠️  Admin user already exists, skipping.');
  } else {
    const passwordHash = await bcrypt.hash(password, 12);

    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({ username, password_hash: passwordHash });

    if (adminError) {
      console.error('❌ Admin user creation error:', adminError.message);
      process.exit(1);
    }
    console.log(`✅ Admin user "${username}" created.\n`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   ⚠️  Change this password immediately in production!\n`);
  }

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
