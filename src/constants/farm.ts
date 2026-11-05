import type { CropType, District } from '@/types/farmer';

/** Crops and districts the platform serves (the API rejects anything else). */
export const CROP_TYPES: CropType[] = ['Maize', 'Rice', 'Tomato', 'Cassava', 'Cocoa'];
export const DISTRICTS: District[] = ['Ho West', 'Kpando', 'Hohoe', 'Afadzato South'];
