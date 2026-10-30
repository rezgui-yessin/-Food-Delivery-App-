/**
 * Seed script using the application's REST API endpoints.
 * Run with: node scripts/seed-api.js [http://localhost:8081/api]
 */
const API_URL = process.argv[2] || 'http://localhost:8081/api';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  try {
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      return { ok: false, status: res.status, error: data };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

async function run() {
  console.log(`Starting API population at ${API_URL}...`);

  // 1. Health / ping test
  const ping = await request('/restaurants');
  if (!ping.ok && ping.status === 0) {
    console.error(`Cannot connect to backend at ${API_URL}. Please ensure backend is running.`);
    process.exit(1);
  }
  console.log('✓ Backend is online and responding.');

  // 2. Register / Login users
  const users = [
    { fullName: 'Chef Mario Rossi', email: 'mario.api@gustoitalia.com', password: 'Password123!', role: 'RESTAURANT_OWNER' },
    { fullName: 'Sakura Tanaka', email: 'sakura.api@tokyobites.com', password: 'Password123!', role: 'RESTAURANT_OWNER' },
    { fullName: 'Alex Rider', email: 'alex.courier@fooddelivery.com', password: 'Password123!', role: 'DELIVERY_DRIVER' },
    { fullName: 'Emma Watson', email: 'emma.customer@gmail.com', password: 'Password123!', role: 'CUSTOMER' },
    { fullName: 'John Doe', email: 'john.customer@gmail.com', password: 'Password123!', role: 'CUSTOMER' }
  ];

  const tokens = {};

  for (const u of users) {
    // Try register
    const reg = await request('/auth/register', { method: 'POST', body: JSON.stringify(u) });
    if (reg.ok) {
      tokens[u.email] = reg.data.token;
      console.log(`✓ Registered: ${u.email} (${u.role})`);
    } else {
      // Try login if already registered
      const log = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: u.email, password: u.password }) });
      if (log.ok) {
        tokens[u.email] = log.data.token;
        console.log(`✓ Logged in: ${u.email} (${u.role})`);
      } else {
        console.warn(`! Could not authenticate ${u.email}:`, log.error);
      }
    }
  }

  // 3. Admin login (bootstrapped by DatabaseDataSeeder)
  const adminLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@fooddelivery.com', password: 'Admin@123456' }) });
  let adminToken = adminLogin.ok ? adminLogin.data.token : null;
  if (adminToken) {
    console.log('✓ Admin authenticated successfully.');
  } else {
    console.warn('! Admin login skipped (will be available once backend initializes with DatabaseDataSeeder)');
  }

  // 4. Create Restaurant for Mario
  const marioToken = tokens['mario.api@gustoitalia.com'];
  if (marioToken) {
    const resCreate = await request('/restaurants', {
      method: 'POST',
      headers: { Authorization: `Bearer ${marioToken}` },
      body: JSON.stringify({
        name: 'Trattoria Bella Napoli',
        description: 'Authentic wood-fired Neapolitan pizza and homemade pasta.',
        address: '142 Mulberry St, New York, NY 10013',
        phone: '+1 212-555-0144',
        cuisineType: 'Italian',
        deliveryFee: 2.99,
        deliveryTimeMin: 25,
        deliveryTimeMax: 35,
        minimumOrderAmount: 15.00,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        tags: ['Pizza', 'Pasta', 'Italian', 'Wood-fired'],
        openingHours: {
          monday: '11:00 AM - 10:00 PM',
          tuesday: '11:00 AM - 10:00 PM',
          wednesday: '11:00 AM - 10:00 PM',
          thursday: '11:00 AM - 10:00 PM',
          friday: '11:00 AM - 11:00 PM',
          saturday: '11:00 AM - 11:00 PM',
          sunday: '12:00 PM - 9:00 PM'
        }
      })
    });

    if (resCreate.ok) {
      const restId = resCreate.data.id;
      console.log(`✓ Created Restaurant: "${resCreate.data.name}" (ID: ${restId})`);

      // Add category
      const catCreate = await request(`/restaurants/${restId}/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${marioToken}` },
        body: JSON.stringify({ name: 'Neapolitan Pizza', description: 'Wood-fired with San Marzano tomatoes', displayOrder: 1, active: true })
      });
      if (catCreate.ok) console.log(`✓ Added Category: "${catCreate.data.name}"`);

      // Add menu items
      const item1 = await request(`/restaurants/${restId}/menu-items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${marioToken}` },
        body: JSON.stringify({
          name: 'Margherita Verace D.O.P.',
          description: 'San Marzano tomatoes, fresh buffalo mozzarella, fresh basil, extra virgin olive oil.',
          price: 18.50,
          category: 'Neapolitan Pizza',
          available: true,
          imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80'
        })
      });
      if (item1.ok) console.log(`✓ Added Menu Item: "${item1.data.name}" (\${item1.data.price})`);

      const item2 = await request(`/restaurants/${restId}/menu-items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${marioToken}` },
        body: JSON.stringify({
          name: 'Truffle Tagliatelle',
          description: 'Egg tagliatelle in black truffle butter sauce and aged Parmigiano Reggiano.',
          price: 24.00,
          category: 'Neapolitan Pizza',
          available: true,
          imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281781?w=600&auto=format&fit=crop&q=80'
        })
      });
      if (item2.ok) console.log(`✓ Added Menu Item: "${item2.data.name}" (\${item2.data.price})`);
    }
  }

  // 5. Customer Addresses & Order
  const emmaToken = tokens['emma.customer@gmail.com'];
  if (emmaToken) {
    const addr = await request('/users/me/addresses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${emmaToken}` },
      body: JSON.stringify({
        label: 'Home Penthouse',
        street: '180 Riverside Blvd, Apt 14B',
        city: 'New York',
        postalCode: '10069',
        isDefault: true
      })
    });
    if (addr.ok) console.log(`✓ Saved address for Emma: ${addr.data.street}`);
  }

  console.log('✓ API population routine completed successfully.');
}

run();
