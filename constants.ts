import { Project } from './types';

// UNIT DEFINITION
// The layout is now much looser and non-uniform to match the "scattered" aesthetic.
// We define a large unit area and place items at varied (x, y) coordinates to create
// negative space and irregular alignments.

// UNIT TOTAL:
// Width: 1728 (Wide canvas for spacing)
// Height: 1600 (Increased to accommodate scattered layout with varied heights)

export const UNIT_WIDTH = 1728;
export const UNIT_HEIGHT = 1600;

export const TILE_DIMENSIONS = {
  desktop: { width: 600, height: 360 },
  mobile: { width: 288, height: 600 },
  square: { width: 288, height: 288 },
  largeSquare: { width: 360, height: 360 },
};

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Finance Dash',
    category: 'Web App',
    description: 'Real-time crypto trading terminal.',
    imageUrl: 'https://picsum.photos/600/360?random=1',
    mediaType: 'image',
    link: '#',
    tileType: 'desktop',
    x: 50,
    y: 50,
    width: 600,
    height: 360, 
  },
  {
    id: '2',
    title: 'FitTrack',
    category: 'Mobile App',
    description: 'Daily activity & macro logger.',
    imageUrl: 'https://picsum.photos/600/360?random=2',
    mediaType: 'image',
    link: '#',
    tileType: 'desktop',
    x: 850,
    y: 150,
    width: 600,
    height: 360,
  },
  {
    id: '3',
    title: 'Social Connect',
    category: 'Mobile App',
    description: 'Voice-first messaging platform.',
    imageUrl: 'https://picsum.photos/360/360?random=3',
    mediaType: 'image',
    link: '#',
    tileType: 'largeSquare', // 20% of tiles (1 out of 5)
    x: 150,
    y: 550, 
    width: 360,
    height: 360,
  },
  {
    id: '4',
    title: 'Core UI',
    category: 'Design System',
    description: 'Atomic lib.',
    imageUrl: 'https://picsum.photos/600/360?random=4',
    mediaType: 'image',
    link: '#',
    tileType: 'desktop',
    x: 700,
    y: 650, 
    width: 600,
    height: 360,
  },
  {
    id: '5',
    title: 'E-Shop Pro',
    category: 'Web App',
    description: 'Modern headless commerce storefront.',
    imageUrl: 'https://picsum.photos/600/360?random=5',
    mediaType: 'image',
    link: '#',
    tileType: 'desktop',
    x: 400, 
    y: 1100, 
    width: 600,
    height: 360, 
  },
];