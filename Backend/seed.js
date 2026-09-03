/**
 * seed.js — populate the airbnb-clone DB with South African accommodations
 * Run:  node seed.js
 * Wipe: node seed.js --wipe
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./src/models/User');
const Accommodation = require('./src/models/Accommodation');

const SA_LISTINGS = [
  // ── Western Cape ──────────────────────────────────────────────────────
  {
    title: 'Clifton Beachfront Villa',
    description: 'Breathtaking Atlantic Ocean views from this sleek modern villa perched above Clifton 4th Beach. Private pool, outdoor braai deck, and direct beach access. Minutes from Cape Town city centre.',
    pricePerNight: 4200,
    location: { address: '14 Nettleton Road', city: 'Cape Town', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Private pool', 'Braai deck', 'WiFi', 'Beach access', 'Air conditioning', 'Kitchen', 'Parking'],
    maxGuests: 8, bedrooms: 4, bathrooms: 3,
    province: 'Western Cape',
  },
  {
    title: 'Stellenbosch Wine Estate Cottage',
    description: 'Tucked between vine-covered hills, this charming cottage sits on a working wine estate. Wake up to mountain views, enjoy complimentary wine tastings, and explore the Cape Winelands at your own pace.',
    pricePerNight: 1850,
    location: { address: 'R44 Wine Route', city: 'Stellenbosch', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Wine tasting', 'Mountain views', 'WiFi', 'Fireplace', 'Kitchen', 'Parking'],
    maxGuests: 4, bedrooms: 2, bathrooms: 1,
    province: 'Western Cape',
  },
  {
    title: 'Knysna Lagoon Houseboat',
    description: 'A one-of-a-kind floating home on the world-famous Knysna Lagoon. Kayak from your deck, watch the sun set over the Heads, and fall asleep to the sound of gentle waves.',
    pricePerNight: 2100,
    location: { address: 'Knysna Quays', city: 'Knysna', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Lagoon views', 'Kayak included', 'WiFi', 'Kitchen', 'Braai', 'Boat mooring'],
    maxGuests: 6, bedrooms: 3, bathrooms: 2,
    province: 'Western Cape',
  },

  // ── Gauteng ───────────────────────────────────────────────────────────
  {
    title: 'Sandton Luxury Apartment',
    description: 'High-rise apartment in the heart of Africa\'s richest square mile. Floor-to-ceiling windows reveal the Johannesburg skyline. Walk to Sandton City mall, Gautrain, and top restaurants.',
    pricePerNight: 1650,
    location: { address: '5 Maude Street', city: 'Sandton', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['City views', 'Gym', 'Pool', 'WiFi', 'Concierge', 'Parking', 'Air conditioning'],
    maxGuests: 4, bedrooms: 2, bathrooms: 2,
    province: 'Gauteng',
  },
  {
    title: 'Pretoria Jacaranda Guesthouse',
    description: 'Colonial-era guesthouse surrounded by Pretoria\'s famous jacaranda trees. Large garden, stoep seating, and a short drive to the Union Buildings and Voortrekker Monument.',
    pricePerNight: 950,
    location: { address: '22 Eastwood Street, Arcadia', city: 'Pretoria', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Garden', 'Stoep', 'WiFi', 'Breakfast included', 'Parking', 'Aircon'],
    maxGuests: 3, bedrooms: 2, bathrooms: 1,
    province: 'Gauteng',
  },

  // ── KwaZulu-Natal ─────────────────────────────────────────────────────
  {
    title: 'Umhlanga Beachfront Suite',
    description: 'Stylish ocean-facing suite steps from the famous Umhlanga Promenade and Lighthouse. Spend mornings surfing, afternoons at Gateway Theatre of Shopping, and evenings at award-winning seafood restaurants.',
    pricePerNight: 1980,
    location: { address: 'Lagoon Drive', city: 'Umhlanga', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Ocean views', 'Beach access', 'Pool', 'WiFi', 'Aircon', 'Parking'],
    maxGuests: 4, bedrooms: 2, bathrooms: 2,
    province: 'KwaZulu-Natal',
  },
  {
    title: 'Drakensberg Mountain Retreat',
    description: 'Completely off-grid eco-cabin in the uKhahlamba-Drakensberg World Heritage Site. Hike the Amphitheatre, go horse riding through the foothills, and stargaze from the fire pit under the Milky Way.',
    pricePerNight: 1350,
    location: { address: 'Champagne Valley Road', city: 'Drakensberg', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Mountain views', 'Fire pit', 'Horse riding', 'Hiking trails', 'Stargazing', 'Kitchen'],
    maxGuests: 6, bedrooms: 3, bathrooms: 2,
    province: 'KwaZulu-Natal',
  },

  // ── Limpopo ───────────────────────────────────────────────────────────
  {
    title: 'Kruger Bush Lodge',
    description: 'Authentic thatched-roof lodge on the banks of a dry riverbed frequented by elephant and buffalo. Game drives included, bush breakfasts served, and an elevated deck for sunset sundowners.',
    pricePerNight: 3800,
    location: { address: 'Klaserie Private Nature Reserve', city: 'Hoedspruit', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Game drives', 'Bush breakfast', 'Pool', 'WiFi', 'All meals included', 'Aircon'],
    maxGuests: 6, bedrooms: 3, bathrooms: 3,
    province: 'Limpopo',
  },
  {
    title: 'Tzaneen Tea Estate Cabin',
    description: 'Misty highland cabin surrounded by rolling tea plantations in Limpopo\'s lush Tzaneen region. Explore the nearby Debengeni Falls, go trout fishing, and enjoy sundowners on the veranda.',
    pricePerNight: 980,
    location: { address: 'Magoebaskloof Road', city: 'Tzaneen', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Tea plantation views', 'Fishing', 'Fireplace', 'Veranda', 'Kitchen', 'Parking'],
    maxGuests: 4, bedrooms: 2, bathrooms: 1,
    province: 'Limpopo',
  },

  // ── Mpumalanga ────────────────────────────────────────────────────────
  {
    title: 'Panorama Route Cliffside Suite',
    description: 'Dramatic cliffside suite overlooking the Three Rondavels and Blyde River Canyon — one of the world\'s largest green canyons. Perfect base for God\'s Window, Bourke\'s Luck Potholes, and Pilgrims Rest.',
    pricePerNight: 2250,
    location: { address: 'Panorama Route, R532', city: 'Graskop', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Canyon views', 'Breakfast included', 'WiFi', 'Aircon', 'Fireplace', 'Guided tours'],
    maxGuests: 2, bedrooms: 1, bathrooms: 1,
    province: 'Mpumalanga',
  },

  // ── Eastern Cape ──────────────────────────────────────────────────────
  {
    title: 'Addo Elephant Safari Tent',
    description: 'Luxury glamping tent inside the Addo Elephant National Park malaria-free zone. Watch elephants at the waterhole from your private deck. The park is home to the Big 7 — the Big 5 plus whale and shark.',
    pricePerNight: 2800,
    location: { address: 'Addo Elephant National Park', city: 'Addo', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Game viewing', 'Waterhole deck', 'All meals', 'WiFi', 'Pool', 'Guided walks'],
    maxGuests: 2, bedrooms: 1, bathrooms: 1,
    province: 'Eastern Cape',
  },
  {
    title: 'Port Elizabeth Beachfront Apartment',
    description: 'Contemporary apartment on Humewood Beach in the friendly city. Explore Nelson Mandela Bay, surf Pipe at nearby Pollock Beach, and take the short drive to Addo or the Sardinia Bay Nature Reserve.',
    pricePerNight: 890,
    location: { address: 'Marine Drive, Humewood', city: 'Port Elizabeth', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Beach access', 'Sea views', 'WiFi', 'Aircon', 'Kitchen', 'Parking'],
    maxGuests: 4, bedrooms: 2, bathrooms: 1,
    province: 'Eastern Cape',
  },

  // ── Free State ────────────────────────────────────────────────────────
  {
    title: 'Clarens Artists Village Cottage',
    description: 'Quaint sandstone cottage in the "Jewel of the Free State" — Clarens. Browse galleries, go fly-fishing in the Ash River, and hike the Golden Gate Highlands. Cosy fireplace for winter nights.',
    pricePerNight: 780,
    location: { address: 'Church Street', city: 'Clarens', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Fireplace', 'Mountain views', 'WiFi', 'Fishing', 'Art galleries nearby', 'Kitchen'],
    maxGuests: 4, bedrooms: 2, bathrooms: 1,
    province: 'Free State',
  },

  // ── North West ────────────────────────────────────────────────────────
  {
    title: 'Sun City Resort Villa',
    description: 'Elegant villa in the Valley of the Waves complex. Access to the wave pool, Gary Player golf course, and the Palace of the Lost City. Great for families and groups seeking premier resort luxury.',
    pricePerNight: 3200,
    location: { address: 'Sun City Resort', city: 'Sun City', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Wave pool', 'Golf', 'Spa', 'WiFi', 'Restaurant', 'Entertainment', 'Parking'],
    maxGuests: 8, bedrooms: 4, bathrooms: 3,
    province: 'North West',
  },

  // ── Northern Cape ─────────────────────────────────────────────────────
  {
    title: 'Namaqualand Flower Farmhouse',
    description: 'Remote farmhouse in the Northern Cape — during spring (Aug–Oct) the surrounding semi-desert transforms into a carpet of orange and yellow daisies visible from space. Perfect for stargazers and wildflower lovers.',
    pricePerNight: 1100,
    location: { address: 'N7 Namaqualand Route', city: 'Springbok', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Stargazing', 'Wildflower season', 'Braai', 'Kitchen', 'Hiking', 'Parking'],
    maxGuests: 6, bedrooms: 3, bathrooms: 2,
    province: 'Northern Cape',
  },

  // ── Mpumalanga (extra) ────────────────────────────────────────────────
  {
    title: 'White River Country House',
    description: 'Tropical country house surrounded by macadamia orchards and indigenous bush. The perfect base for Kruger game drives (20 minutes), river tubing on the Sabie, and artisan markets in Hazyview.',
    pricePerNight: 1650,
    location: { address: 'R40 Hazyview Road', city: 'White River', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Pool', 'Orchard views', 'Braai', 'WiFi', 'Kitchen', 'Aircon', 'Parking'],
    maxGuests: 6, bedrooms: 3, bathrooms: 2,
    province: 'Mpumalanga',
  },

  // ── KwaZulu-Natal (extra) ─────────────────────────────────────────────
  {
    title: 'iSimangaliso Wetland Treehouse',
    description: 'Elevated treehouse inside the iSimangaliso Wetland Park UNESCO World Heritage Site. Hippos grunt below at night, crocodiles bask on the banks, and whale watching tours depart from St Lucia village.',
    pricePerNight: 1750,
    location: { address: 'St Lucia Estuary Road', city: 'St Lucia', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Wildlife viewing', 'Whale watching', 'Kayaking', 'WiFi', 'Kitchen', 'Braai'],
    maxGuests: 4, bedrooms: 2, bathrooms: 1,
    province: 'KwaZulu-Natal',
  },

  // ── Gauteng (extra) ───────────────────────────────────────────────────
  {
    title: 'Soweto Heritage Home',
    description: 'Authentic home in vibrant Soweto — visit the Mandela House museum, tour Vilakazi Street, and experience legendary Orlando Towers bungee jumping. Breakfast includes umngqusho and morogo.',
    pricePerNight: 620,
    location: { address: 'Vilakazi Street, Orlando West', city: 'Soweto', country: 'South Africa' },
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=900&q=85',
    ],
    amenities: ['Cultural tours', 'Breakfast included', 'WiFi', 'Parking', 'Heritage site access'],
    maxGuests: 3, bedrooms: 2, bathrooms: 1,
    province: 'Gauteng',
  },
];

async function seed() {
  const writeUri = process.env.MONGO_URI_WRITE || process.env.MONGO_URI;
  await mongoose.connect(writeUri, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB');

  if (process.argv.includes('--wipe')) {
    await Accommodation.deleteMany({});
    await User.deleteMany({ email: 'seed-host@airbnb-sa.com' });
    console.log('🗑  Wiped accommodations and seed host');
    await mongoose.disconnect();
    return;
  }

  // Create or reuse seed host
  const hostEmail = 'seed-host@airbnb-sa.com';
  const hostPassword = 'Seed@1234';
  let host = await User.findOne({ email: hostEmail }).select('+password');
  if (!host) {
    host = await User.create({
      name: 'SA Host',
      email: hostEmail,
      password: hostPassword,
      role: 'host',
    });
    console.log('👤 Created seed host:', host.email);
  } else {
    host.password = hostPassword;
    host.role = 'host';
    await host.save();
    console.log('👤 Reusing existing seed host:', host.email);
  }

  let created = 0;
  for (const listing of SA_LISTINGS) {
    const exists = await Accommodation.findOne({ title: listing.title });
    if (exists) { console.log(`  ⏭  Skip (already exists): ${listing.title}`); continue; }
    await Accommodation.create({ ...listing, host: host._id });
    console.log(`  ✅ Seeded: ${listing.title} — ${listing.location.city}`);
    created++;
  }

  console.log(`\n🌍 Done — ${created} new listings seeded (${SA_LISTINGS.length - created} already existed)`);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error('Seed failed:', err.message); process.exit(1); });
