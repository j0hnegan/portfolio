export type TileType = 'mobile' | 'desktop' | 'square' | 'largeSquare';
export type MediaType = 'image' | 'video' | 'lottie';

export interface Project {
  id: string;
  title: string;
  category: 'Mobile App' | 'Web App' | 'Dashboard' | 'Design System';
  description: string;
  imageUrl: string; // Stores Data URI for Image/Video, or JSON string for Lottie
  mediaType: MediaType;
  link?: string; // Destination URL
  tileType: TileType; // For resizing logic in CMS
  x: number; // Relative X position in the grid unit
  y: number; // Relative Y position in the grid unit
  width: number; // Width of the card
  height: number; // Height of the card
}

export interface Point {
  x: number;
  y: number;
}