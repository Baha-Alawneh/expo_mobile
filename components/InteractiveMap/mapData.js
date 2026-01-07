/**
 * Exhibition Map Data - White Plaza, Najah National University
 * 156 booths with EXACT positions matching the web implementation
 */

export const SCALE = 20; // 1 meter = 20 pixels
export const CANVAS_WIDTH = 2800;
export const CANVAS_HEIGHT = 1400;

// Zone definitions
export const ZONES = {
  ENGINEERING: {
    id: 'engineering',
    name: 'Engineering Projects',
    color: '#0EA5E9',
    boothCount: 63
  },
  SPONSOR: {
    id: 'sponsor',
    name: 'Sponsor Companies',
    color: '#8B5CF6',
    boothCount: 23
  },
  SERVICE: {
    id: 'service',
    name: 'Service Companies',
    color: '#F59E0B',
    boothCount: 9
  },
  SCIENCE: {
    id: 'science',
    name: 'Science Projects',
    color: '#EF4444',
    boothCount: 14
  },
  STANDARD: {
    id: 'standard',
    name: 'Standard Zone',
    color: '#6b7280',
    boothCount: 7
  }
};

// Complete booth layout with exact positions from web implementation (all 156 booths)
export const BOOTH_DATA = [
  // Section 1: Top Left Corner (96-107) - Engineering
  { booth_id: 103, booth_number: 103, x: 80, y: 80, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 102, booth_number: 102, x: 144, y: 80, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 101, booth_number: 101, x: 208, y: 80, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 100, booth_number: 100, x: 272, y: 80, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 99, booth_number: 99, x: 336, y: 80, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 98, booth_number: 98, x: 400, y: 80, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 97, booth_number: 97, x: 464, y: 80, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 96, booth_number: 96, x: 528, y: 80, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 104, booth_number: 104, x: 80, y: 144, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 105, booth_number: 105, x: 80, y: 208, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 106, booth_number: 106, x: 80, y: 272, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 107, booth_number: 107, x: 80, y: 336, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },

  // Section 2: Left Loop (82-95) - Engineering Box
  { booth_id: 89, booth_number: 89, x: 200, y: 200, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 90, booth_number: 90, x: 264, y: 200, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 91, booth_number: 91, x: 328, y: 200, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 92, booth_number: 92, x: 392, y: 200, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 93, booth_number: 93, x: 456, y: 200, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 88, booth_number: 88, x: 200, y: 264, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 87, booth_number: 87, x: 200, y: 328, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 86, booth_number: 86, x: 200, y: 392, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 85, booth_number: 85, x: 264, y: 392, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 84, booth_number: 84, x: 328, y: 392, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 83, booth_number: 83, x: 392, y: 392, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 82, booth_number: 82, x: 456, y: 392, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 94, booth_number: 94, x: 456, y: 264, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 95, booth_number: 95, x: 456, y: 328, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },

  // Section 3: Center Complex (150-156) - Sponsors U-Shape
  { booth_id: 152, booth_number: 152, x: 710, y: 92, width: 70, height: 108, zone_type: 'sponsor', shape: 'l-shape-left' },
  { booth_id: 153, booth_number: 153, x: 784, y: 92, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 154, booth_number: 154, x: 848, y: 92, width: 70, height: 108, zone_type: 'sponsor', shape: 'l-shape-right' },
  { booth_id: 151, booth_number: 151, x: 710, y: 204, width: 50, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 150, booth_number: 150, x: 710, y: 268, width: 50, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 155, booth_number: 155, x: 868, y: 204, width: 50, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 156, booth_number: 156, x: 868, y: 268, width: 50, height: 60, zone_type: 'sponsor', shape: 'rectangle' },

  // Section 4: Top Right Strip (24-31) - Science Zone
  { booth_id: 31, booth_number: 31, x: 1134, y: 100, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 30, booth_number: 30, x: 1198, y: 100, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 29, booth_number: 29, x: 1262, y: 100, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 28, booth_number: 28, x: 1326, y: 100, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 27, booth_number: 27, x: 1390, y: 100, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 26, booth_number: 26, x: 1454, y: 100, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 25, booth_number: 25, x: 1518, y: 100, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 24, booth_number: 24, x: 1582, y: 100, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },

  // Section 5: Right Loop (32-45) - Mixed Zone Box
  { booth_id: 32, booth_number: 32, x: 1134, y: 200, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 33, booth_number: 33, x: 1198, y: 200, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 34, booth_number: 34, x: 1262, y: 200, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 35, booth_number: 35, x: 1326, y: 200, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 36, booth_number: 36, x: 1390, y: 200, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },
  { booth_id: 45, booth_number: 45, x: 1134, y: 264, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 44, booth_number: 44, x: 1134, y: 328, width: 60, height: 60, zone_type: 'science', shape: 'rectangle' },
  { booth_id: 43, booth_number: 43, x: 1134, y: 392, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 42, booth_number: 42, x: 1198, y: 392, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 41, booth_number: 41, x: 1262, y: 392, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 40, booth_number: 40, x: 1326, y: 392, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 39, booth_number: 39, x: 1390, y: 392, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },
  { booth_id: 37, booth_number: 37, x: 1390, y: 264, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },
  { booth_id: 38, booth_number: 38, x: 1390, y: 328, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },

  // Bottom Blocks - Block 1 (Left Group)
  // Top Row (72-79): Engineering
  { booth_id: 72, booth_number: 72, x: 261, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 73, booth_number: 73, x: 325, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 74, booth_number: 74, x: 389, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 75, booth_number: 75, x: 453, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 76, booth_number: 76, x: 517, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 77, booth_number: 77, x: 581, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 78, booth_number: 78, x: 645, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 79, booth_number: 79, x: 709, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  
  // Bottom Row (64-71): Sponsors
  { booth_id: 71, booth_number: 71, x: 261, y: 714, width: 62, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 70, booth_number: 70, x: 327, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 69, booth_number: 69, x: 391, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 68, booth_number: 68, x: 455, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 67, booth_number: 67, x: 519, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 66, booth_number: 66, x: 583, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 65, booth_number: 65, x: 647, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 64, booth_number: 64, x: 711, y: 714, width: 62, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  
  // Vertical Stack (80, 81)
  { booth_id: 80, booth_number: 80, x: 709, y: 586, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 81, booth_number: 81, x: 709, y: 522, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },

  // Bottom Blocks - Block 2 (Center Group)
  { booth_id: 46, booth_number: 46, x: 918, y: 522, width: 62, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 47, booth_number: 47, x: 918, y: 586, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 48, booth_number: 48, x: 918, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  
  // Top row (49-55): Engineering
  { booth_id: 49, booth_number: 49, x: 982, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 50, booth_number: 50, x: 1046, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 51, booth_number: 51, x: 1110, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 52, booth_number: 52, x: 1174, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 53, booth_number: 53, x: 1238, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 54, booth_number: 54, x: 1302, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 55, booth_number: 55, x: 1366, y: 650, width: 62, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  
  // Bottom row (63-56): Sponsors
  { booth_id: 63, booth_number: 63, x: 918, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 62, booth_number: 62, x: 982, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 61, booth_number: 61, x: 1046, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 60, booth_number: 60, x: 1110, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 59, booth_number: 59, x: 1174, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 58, booth_number: 58, x: 1238, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 57, booth_number: 57, x: 1302, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },
  { booth_id: 56, booth_number: 56, x: 1366, y: 714, width: 60, height: 60, zone_type: 'sponsor', shape: 'rectangle' },

  // Bottom Strips (1-12)
  // Strip 1 (1-6): Engineering
  { booth_id: 1, booth_number: 1, x: 391, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 2, booth_number: 2, x: 455, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 3, booth_number: 3, x: 519, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 4, booth_number: 4, x: 583, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 5, booth_number: 5, x: 647, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 6, booth_number: 6, x: 711, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  
  // Strip 2 (7-12): Engineering
  { booth_id: 7, booth_number: 7, x: 917, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 8, booth_number: 8, x: 981, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 9, booth_number: 9, x: 1045, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 10, booth_number: 10, x: 1109, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 11, booth_number: 11, x: 1173, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 12, booth_number: 12, x: 1237, y: 906, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },

  // Right Section (13-23) - Matching najah-white-plaza layout
  // Horizontal row (13-16) at y: 714
  { booth_id: 13, booth_number: 13, x: 1734, y: 714, width: 62, height: 60, zone_type: 'service', shape: 'rectangle' },
  { booth_id: 14, booth_number: 14, x: 1800, y: 714, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },
  { booth_id: 15, booth_number: 15, x: 1864, y: 714, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },
  { booth_id: 16, booth_number: 16, x: 1928, y: 714, width: 67, height: 60, zone_type: 'service', shape: 'rectangle' },
  // Vertical stack (17-23) from y: 650 going up
  { booth_id: 17, booth_number: 17, x: 1928, y: 650, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 18, booth_number: 18, x: 1928, y: 586, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },
  { booth_id: 19, booth_number: 19, x: 1928, y: 522, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 20, booth_number: 20, x: 1928, y: 458, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 21, booth_number: 21, x: 1928, y: 394, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 22, booth_number: 22, x: 1928, y: 330, width: 60, height: 60, zone_type: 'engineering', shape: 'rectangle' },
  { booth_id: 23, booth_number: 23, x: 1928, y: 266, width: 62, height: 60, zone_type: 'engineering', shape: 'rectangle' }
];

// Helper function to get zone by booth number
export const getZoneByBoothNumber = (boothNumber) => {
  const booth = BOOTH_DATA.find(b => b.booth_number === boothNumber);
  if (booth) {
    return ZONES[booth.zone_type.toUpperCase()];
  }
  return ZONES.ENGINEERING;
};
