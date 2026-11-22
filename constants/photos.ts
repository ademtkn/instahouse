import { mediaUrl } from '../utils/media';

// The 16 bundled demo photos, offered to the admin panel as a quick photo
// library. A real upload flow arrives with Supabase storage in phase 2.
export const PHOTO_FILES = [
  'apt-1.jpg',
  'apt-2.jpg',
  'apt-3.jpg',
  'apt-4.jpg',
  'house-1.jpg',
  'house-2.jpg',
  'house-3.jpg',
  'house-4.jpg',
  'dacha-1.jpg',
  'dacha-2.jpg',
  'dacha-3.jpg',
  'dacha-4.jpg',
  'land-1.jpg',
  'land-2.jpg',
  'land-3.jpg',
  'land-4.jpg',
];

export const photoLibraryUri = (file: string) => mediaUrl(file);
