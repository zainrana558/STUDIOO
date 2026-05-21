
export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  motion: {
    spring: { mass: number; tension: number; friction: number; };
    bezier: [number, number, number, number];
  };
  styles: {
    card: {
      borderRadius: string;
    }
  };
}

export const themes: Record<string, Theme> = {
  anime: {
    id: 'anime',
    name: 'Anime',
    description: 'Vibrant Japanese animation with epic storylines.',
    emoji: '🎌',
    colors: {
      primary: '#00F0FF',
      secondary: '#0d1117',
      accent: '#FF5C00',
      background: '#0d1117',
    },
    fonts: { display: 'font-orbitron', body: 'font-space-grotesk' },
    motion: {
      spring: { mass: 0.4, tension: 400, friction: 12 },
      bezier: [0.16, 1, 0.3, 1],
    },
    styles: { card: { borderRadius: 'rounded-sm' } },
  },
  cartoon: {
    id: 'cartoon',
    name: 'Cartoons',
    description: 'Fun animated shows for all ages.',
    emoji: '🎨',
    colors: {
      primary: '#FF007A',
      secondary: '#1a1a2e',
      accent: '#00E5FF',
      background: '#1a1a2e',
    },
    fonts: { display: 'font-fredoka-one', body: 'font-fredoka-one' },
    motion: {
      spring: { mass: 0.6, tension: 300, friction: 10 },
      bezier: [0.34, 1.56, 0.64, 1],
    },
    styles: { card: { borderRadius: 'rounded-2xl' } },
  },
  horror: {
    id: 'horror',
    name: 'Horror',
    description: 'Thrilling scares and dark mysteries.',
    emoji: '👻',
    colors: {
      primary: '#990000',
      secondary: '#050505',
      accent: '#4A5D4E',
      background: '#050505',
    },
    fonts: { display: 'font-creepster', body: 'font-playfair-display' },
    motion: {
      spring: { mass: 1.2, tension: 100, friction: 30 },
      bezier: [0.33, 1, 0.68, 1],
    },
    styles: { card: { borderRadius: 'rounded-none' } },
  },
  scifi: {
    id: 'scifi',
    name: 'Sci-Fi',
    description: 'Futuristic tales of adventure.',
    emoji: '🚀',
    colors: {
      primary: '#00FF66',
      secondary: '#0F172A',
      accent: '#7000FF',
      background: '#0F172A',
    },
    fonts: { display: 'font-orbitron', body: 'font-space-grotesk' },
    motion: {
      spring: { mass: 0.8, tension: 250, friction: 20 },
      bezier: [0.4, 0, 0.2, 1],
    },
    styles: { card: { borderRadius: 'rounded-md' } },
  },
  cinematic_classic: {
    id: 'cinematic_classic',
    name: 'Classic Cinema',
    description: 'Timeless masterpieces of film.',
    emoji: '🎬',
    colors: {
      primary: '#D4AF37',
      secondary: '#1C1917',
      accent: '#E7E5E4',
      background: '#1C1917',
    },
    fonts: { display: 'font-playfair-display', body: 'font-sans' },
    motion: {
      spring: { mass: 1, tension: 170, friction: 26 },
      bezier: [0.16, 1, 0.3, 1],
    },
    styles: { card: { borderRadius: 'rounded-lg' } },
  },
  default: {
    id: 'default',
    name: 'All Genres',
    description: 'Browse everything.',
    emoji: '🎥',
    colors: {
      primary: '#0070f3',
      secondary: '#000000',
      accent: '#ffffff',
      background: '#000000',
    },
    fonts: { display: 'font-sans', body: 'font-sans' },
    motion: {
      spring: { mass: 1, tension: 170, friction: 26 },
      bezier: [0.4, 0, 0.2, 1],
    },
    styles: { card: { borderRadius: 'rounded-lg' } },
  }
};
