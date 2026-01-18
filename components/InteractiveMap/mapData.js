/**
 * Exhibition Map Data - White Plaza, Najah National University
 * 156 booths with EXACT positions matching the web implementation
 */

export const SCALE = 20; // 1 meter = 20 pixels
export const CANVAS_WIDTH = 9600;   // 24000/2.5 = 9600
export const CANVAS_HEIGHT = 6400;  // 16000/2.5 = 6400

// Zone definitions
export const ZONES = {
  ENGINEERING: { id: 'engineering', name: 'Engineering', color: '#0EA5E9' },
  SCIENCE: { id: 'science', name: 'Science', color: '#EF4444' },
  SPONSOR: { id: 'sponsor', name: 'Sponsors', color: '#8B5CF6' },
  SERVICE: { id: 'service', name: 'Services', color: '#F59E0B' },
  STANDARD: { id: 'standard', name: 'Standard', color: '#6b7280' }
};
