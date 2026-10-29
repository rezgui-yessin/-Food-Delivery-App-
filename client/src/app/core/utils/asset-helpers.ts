export interface PresetAsset {
  label: string;
  url: string;
}

export const PRESET_DISH_IMAGES: PresetAsset[] = [
  { label: 'Truffle Mushroom Burger', url: '/assets/images/dishes/truffle-burger.jpg' },
  { label: 'Smash Cheeseburger', url: '/assets/images/dishes/smash-burger.jpg' },
  { label: 'Margherita Pizza', url: '/assets/images/dishes/margherita-pizza.jpg' },
  { label: 'Spicy Pepperoni Pizza', url: '/assets/images/dishes/pepperoni-pizza.jpg' },
  { label: 'Fresh Salmon Nigiri', url: '/assets/images/dishes/salmon-nigiri.jpg' },
  { label: 'Dragon Avocado Roll', url: '/assets/images/dishes/dragon-roll.jpg' },
  { label: 'Superfood Quinoa Bowl', url: '/assets/images/dishes/quinoa-bowl.jpg' },
  { label: 'Garden Green Salad', url: '/assets/images/dishes/green-salad.jpg' },
  { label: 'Molten Lava Cake', url: '/assets/images/dishes/lava-cake.jpg' },
  { label: 'Strawberry Cheesecake', url: '/assets/images/dishes/strawberry-cheesecake.jpg' },
  { label: 'Traditional Pad Thai', url: '/assets/images/dishes/pad-thai.jpg' },
  { label: 'Crispy Pork Gyoza', url: '/assets/images/dishes/pork-gyoza.jpg' },
  { label: 'Slow-Cooked Beef Tacos', url: '/assets/images/dishes/beef-tacos.jpg' },
  { label: 'Iced Matcha Green Tea Latte', url: '/assets/images/dishes/matcha-latte.jpg' }
];

export const PRESET_RESTAURANT_IMAGES: PresetAsset[] = [
  { label: 'Burger Haven', url: '/assets/images/restaurants/burger-haven.jpg' },
  { label: 'Pizza Palace', url: '/assets/images/restaurants/pizza-palace.jpg' },
  { label: 'Tokyo Sushi Bar', url: '/assets/images/restaurants/tokyo-sushi.jpg' },
  { label: 'Green Bowl Organics', url: '/assets/images/restaurants/green-bowl.jpg' },
  { label: 'Sweet Delights Bakery', url: '/assets/images/restaurants/sweet-delights.jpg' },
  { label: 'Wok Express Asian Street Food', url: '/assets/images/restaurants/wok-express.jpg' }
];

export function getDishImage(name?: string, existingUrl?: string): string {
  if (existingUrl && (existingUrl.startsWith('http') || existingUrl.startsWith('/assets/'))) {
    return existingUrl;
  }
  const n = (name || '').toLowerCase();
  if (n.includes('truffle') || (n.includes('burger') && !n.includes('smash'))) return '/assets/images/dishes/truffle-burger.jpg';
  if (n.includes('smash') || n.includes('burger')) return '/assets/images/dishes/smash-burger.jpg';
  if (n.includes('pepperoni')) return '/assets/images/dishes/pepperoni-pizza.jpg';
  if (n.includes('pizza') || n.includes('margherita')) return '/assets/images/dishes/margherita-pizza.jpg';
  if (n.includes('salmon') || n.includes('nigiri') || n.includes('sashimi')) return '/assets/images/dishes/salmon-nigiri.jpg';
  if (n.includes('dragon') || n.includes('roll') || n.includes('sushi') || n.includes('maki')) return '/assets/images/dishes/dragon-roll.jpg';
  if (n.includes('quinoa') || (n.includes('bowl') && !n.includes('poke'))) return '/assets/images/dishes/quinoa-bowl.jpg';
  if (n.includes('salad') || n.includes('green') || n.includes('caesar')) return '/assets/images/dishes/green-salad.jpg';
  if (n.includes('lava') || n.includes('chocolate') || n.includes('brownie')) return '/assets/images/dishes/lava-cake.jpg';
  if (n.includes('cheesecake') || n.includes('strawberry') || n.includes('cake') || n.includes('dessert')) return '/assets/images/dishes/strawberry-cheesecake.jpg';
  if (n.includes('pad thai') || n.includes('noodle') || n.includes('ramen')) return '/assets/images/dishes/pad-thai.jpg';
  if (n.includes('gyoza') || n.includes('dumpling') || n.includes('dim sum')) return '/assets/images/dishes/pork-gyoza.jpg';
  if (n.includes('taco') || n.includes('burrito') || n.includes('fajita') || n.includes('mexican')) return '/assets/images/dishes/beef-tacos.jpg';
  if (n.includes('latte') || n.includes('matcha') || n.includes('tea') || n.includes('coffee') || n.includes('drink') || n.includes('beverage')) return '/assets/images/dishes/matcha-latte.jpg';
  return '/assets/images/dishes/truffle-burger.jpg';
}

export function getRestaurantImage(name?: string, cuisine?: string, existingUrl?: string): string {
  if (existingUrl && (existingUrl.startsWith('http') || existingUrl.startsWith('/assets/'))) {
    return existingUrl;
  }
  const text = `${name || ''} ${cuisine || ''}`.toLowerCase();
  if (text.includes('burger')) return '/assets/images/restaurants/burger-haven.jpg';
  if (text.includes('pizza') || text.includes('italian')) return '/assets/images/restaurants/pizza-palace.jpg';
  if (text.includes('sushi') || text.includes('japanese')) return '/assets/images/restaurants/tokyo-sushi.jpg';
  if (text.includes('healthy') || text.includes('salad') || text.includes('vegan') || text.includes('green')) return '/assets/images/restaurants/green-bowl.jpg';
  if (text.includes('sweet') || text.includes('bakery') || text.includes('dessert') || text.includes('pastry')) return '/assets/images/restaurants/sweet-delights.jpg';
  if (text.includes('asian') || text.includes('wok') || text.includes('thai') || text.includes('chinese')) return '/assets/images/restaurants/wok-express.jpg';
  return '/assets/images/restaurants/burger-haven.jpg';
}
