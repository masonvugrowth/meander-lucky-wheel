export const BRANCH_META = {
  taipei: {
    label: 'Meander Taipei',
    flag: '🇹🇼',
    city: 'Taipei',
    accent: '#8fac65',
    slices: ['#e8f0d8','#d4e5b8','#c2d89a','#b0cc7c','#9fbc60','#8fac65','#7d9c58'],
  },
  osaka: {
    label: 'Meander Osaka',
    flag: '🇯🇵',
    city: 'Osaka',
    accent: '#79885f',
    slices: ['#eaeddf','#d5dac0','#c2c8a3','#afb687','#9da56c','#79885f','#6a7852'],
  },
  saigon: {
    label: 'Meander Saigon',
    flag: '🇻🇳',
    city: 'Saigon',
    accent: '#038781',
    slices: ['#d0eeed','#a3dcdb','#77c9c8','#4db6b5','#24a3a2','#038781','#027470'],
  },
  '1948': {
    label: 'Meander 1948',
    flag: '🏮',
    city: '1948',
    accent: '#5b8260',
    slices: ['#e2ede4','#c6dcc9','#aacbaf','#8fbb96','#76ab7e','#5b8260','#4d7252'],
  },
}

// Image paths are resolved against Vite's BASE_URL (e.g. '/meander-lucky-wheel/').
// Drop matching files into `public/prizes/` and they will be picked up automatically.
const PRIZE_IMG = (file) => `${import.meta.env.BASE_URL}prizes/${file}`

export const DEFAULT_REWARDS = [
  { id: 'toiletry',   display_name: 'Waterproof Toiletry Bag',       emoji: '🧴', image: PRIZE_IMG('toiletry.png'),   tier: 'rare',     probability_weight: 5,  inventory_count: 15 },
  { id: 'toothpaste', display_name: 'Konnyaku Toothpaste',            emoji: '🪥', image: PRIZE_IMG('toothpaste.png'), tier: 'common',   probability_weight: 35, inventory_count: 50 },
  { id: 'toothbrush', display_name: 'Organic Bamboo Toothbrush',      emoji: '🌿', image: PRIZE_IMG('toothbrush.png'), tier: 'common',   probability_weight: 30, inventory_count: 50 },
  { id: 'laundry',    display_name: 'Eco Fabric Laundry Mousse',      emoji: '🫧', image: PRIZE_IMG('laundry.png'),    tier: 'common',   probability_weight: 28, inventory_count: 40 },
  { id: 'mist',       display_name: 'Antibacterial Garment Mist',     emoji: '✨', image: PRIZE_IMG('mist.png'),       tier: 'uncommon', probability_weight: 15, inventory_count: 25 },
  { id: 'towel',      display_name: 'SHIZUKU Osaka Towel',            emoji: '🎋', image: PRIZE_IMG('towel.png'),      tier: 'uncommon', probability_weight: 12, inventory_count: 20 },
  { id: 'socks',      display_name: '10th Anniversary Socks',         emoji: '🧦', image: PRIZE_IMG('socks.png'),      tier: 'ultra',    probability_weight: 3,  inventory_count: 10 },
]

export const TIER_LABELS = {
  common:   { label: 'Common',    color: '#8a857c' },
  uncommon: { label: 'Uncommon',  color: '#8fac65' },
  rare:     { label: 'Rare',      color: '#c9a84c' },
  ultra:    { label: 'Ultra Rare',color: '#c0556e' },
}

export const STORAGE_KEY = 'meander_wheel_v2'
export const ADMIN_PASSWORD = 'meander2025'
