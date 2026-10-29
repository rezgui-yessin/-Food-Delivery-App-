const fs = require('fs');
const path = require('path');
const https = require('https');

const baseDir = path.resolve(__dirname, '../public/assets');

const dirs = [
  'icons',
  'illustrations',
  'images/hero',
  'images/restaurants',
  'images/dishes',
  'images/cuisines',
  'sounds'
];

dirs.forEach(d => {
  const p = path.join(baseDir, d);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
});

console.log('Directories created successfully.');

// --- 1. SVGs: Brand Logo, Favicon, Illustrations ---

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48" fill="none">
  <defs>
    <linearGradient id="foodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5722"/>
      <stop offset="100%" stop-color="#FF9800"/>
    </linearGradient>
  </defs>
  <rect x="2" y="4" width="40" height="40" rx="12" fill="url(#foodGrad)" filter="drop-shadow(0 4px 6px rgba(255,87,34,0.3))"/>
  <path d="M12 24C12 18.4772 16.4772 14 22 14C27.5228 14 32 18.4772 32 24H12Z" fill="white"/>
  <rect x="11" y="26" width="22" height="3" rx="1.5" fill="#FFE082"/>
  <path d="M13 31C13 31 16 34 22 34C28 34 31 31 31 31H13Z" fill="white"/>
  <text x="52" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="24" font-weight="800" fill="#1E293B">Food<tspan fill="#FF5722">Rush</tspan></text>
</svg>`;

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5722"/>
      <stop offset="100%" stop-color="#FF9800"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="18" fill="url(#favGrad)"/>
  <path d="M16 32C16 23.1634 23.1634 16 32 16C40.8366 16 48 23.1634 48 32H16Z" fill="white"/>
  <rect x="14" y="35" width="36" height="4" rx="2" fill="#FFE082"/>
  <path d="M18 42C18 42 23 48 32 48C41 48 46 42 46 42H18Z" fill="white"/>
</svg>`;

const emptyCartSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" fill="none">
  <circle cx="160" cy="120" r="90" fill="#FFF7ED"/>
  <circle cx="160" cy="120" r="70" fill="#FFEDD5"/>
  <path d="M110 90H125L138 145H195L208 105H132" stroke="#FF5722" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="145" cy="165" r="9" fill="#1E293B"/>
  <circle cx="190" cy="165" r="9" fill="#1E293B"/>
  <path d="M140 115L180 115" stroke="#FDBA74" stroke-width="4" stroke-linecap="round" stroke-dasharray="4 6"/>
  <circle cx="215" cy="85" r="14" fill="#FF5722"/>
  <path d="M215 78V92M208 85H222" stroke="white" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const emptyOrdersSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" fill="none">
  <circle cx="160" cy="120" r="85" fill="#F1F5F9"/>
  <rect x="120" y="60" width="80" height="110" rx="10" fill="white" stroke="#94A3B8" stroke-width="4"/>
  <rect x="135" y="80" width="50" height="6" rx="3" fill="#CBD5E1"/>
  <rect x="135" y="96" width="35" height="6" rx="3" fill="#CBD5E1"/>
  <rect x="135" y="112" width="45" height="6" rx="3" fill="#CBD5E1"/>
  <circle cx="160" cy="142" r="12" fill="#E2E8F0"/>
  <path d="M156 142L159 145L165 139" stroke="#64748B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="205" cy="70" r="16" fill="#10B981"/>
  <path d="M199 70L203 74L211 66" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const deliveryCourierSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" fill="none">
  <circle cx="160" cy="120" r="90" fill="#ECFDF5"/>
  <circle cx="120" cy="160" r="22" stroke="#1E293B" stroke-width="6"/>
  <circle cx="210" cy="160" r="22" stroke="#1E293B" stroke-width="6"/>
  <path d="M120 160H160L185 125H210M185 125L170 95H130" stroke="#10B981" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="90" y="100" width="32" height="32" rx="6" fill="#FF5722"/>
  <path d="M106 108V124M98 116H114" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <circle cx="175" cy="80" r="10" fill="#F59E0B"/>
</svg>`;

fs.writeFileSync(path.join(baseDir, 'icons/logo.svg'), logoSvg);
fs.writeFileSync(path.join(baseDir, 'icons/favicon.svg'), faviconSvg);
fs.writeFileSync(path.join(baseDir, 'illustrations/empty-cart.svg'), emptyCartSvg);
fs.writeFileSync(path.join(baseDir, 'illustrations/empty-orders.svg'), emptyOrdersSvg);
fs.writeFileSync(path.join(baseDir, 'illustrations/delivery-courier.svg'), deliveryCourierSvg);

console.log('SVGs created successfully.');

// --- 2. Clean Kitchen Chime WAV Generator (Pure Node Math) ---
function generateChimeWav() {
  const sampleRate = 44100;
  const duration = 0.8; // seconds
  const totalSamples = Math.floor(sampleRate * duration);
  const dataSize = totalSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate dual chime tone: 880 Hz + 1320 Hz with exponential decay
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-4.5 * t);
    const wave = (Math.sin(2 * Math.PI * 880 * t) * 0.6 + Math.sin(2 * Math.PI * 1320 * t) * 0.4) * decay;
    const sample = Math.max(-1, Math.min(1, wave));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

fs.writeFileSync(path.join(baseDir, 'sounds/kitchen-bell.wav'), generateChimeWav());
console.log('Kitchen chime audio generated.');

// --- 3. Real High-Definition Photography Download List ---
const imagesToDownload = [
  // Hero Spread
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
    dest: 'images/hero/hero-spread.jpg'
  },
  // Cuisines
  {
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    dest: 'images/cuisines/pizza.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    dest: 'images/cuisines/burgers.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
    dest: 'images/cuisines/sushi.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    dest: 'images/cuisines/healthy.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    dest: 'images/cuisines/desserts.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    dest: 'images/cuisines/asian.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    dest: 'images/cuisines/mexican.jpg'
  },

  // Restaurant Covers
  {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    dest: 'images/restaurants/burger-haven.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80',
    dest: 'images/restaurants/pizza-palace.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1000&q=80',
    dest: 'images/restaurants/tokyo-sushi.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    dest: 'images/restaurants/green-bowl.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
    dest: 'images/restaurants/sweet-delights.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1000&q=80',
    dest: 'images/restaurants/wok-express.jpg'
  },

  // Dishes & Menu Items
  {
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/truffle-burger.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/smash-burger.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/margherita-pizza.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/pepperoni-pizza.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/salmon-nigiri.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/dragon-roll.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/quinoa-bowl.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/green-salad.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/lava-cake.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/strawberry-cheesecake.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/pad-thai.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/pork-gyoza.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/beef-tacos.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80',
    dest: 'images/dishes/matcha-latte.jpg'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(baseDir, destPath);
    if (fs.existsSync(fullPath)) {
      console.log(`Already exists: ${destPath}`);
      return resolve();
    }

    const file = fs.createWriteStream(fullPath);
    const sendReq = (u) => {
      https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return sendReq(res.headers.location);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(fullPath);
          return reject(new Error(`Failed to download ${u}: status ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log(`Downloaded: ${destPath}`);
            resolve();
          });
        });
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        reject(err);
      });
    };
    sendReq(url);
  });
}

async function run() {
  console.log(`Downloading ${imagesToDownload.length} real high-resolution images...`);
  for (const item of imagesToDownload) {
    try {
      await downloadFile(item.url, item.dest);
    } catch (err) {
      console.error(`Error downloading ${item.dest}:`, err.message);
    }
  }
  console.log('All real picture assets processed successfully!');
}

run();
