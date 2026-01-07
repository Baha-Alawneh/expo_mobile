# React Native Expo Map - Complete Build Instructions

## Overview
Build an interactive exhibition floor plan for a React Native Expo app using `react-native-svg` with exact booth positions, borders, and visual elements matching the web implementation.

---

## Core Specifications

### Canvas & Scale
- **Canvas Size**: 2800px × 1400px
- **Scale**: 1 meter = 20 pixels (1m = 20px)
- **Default Booth Size**: 60px × 60px (3m × 3m in real world)
- **Gap Between Booths**: 4px

### Zone Colors
```javascript
ZONES = {
  engineering: { color: '#0EA5E9', name: 'Engineering Projects' },    // Blue
  sponsor: { color: '#8B5CF6', name: 'Sponsor Companies' },            // Purple
  service: { color: '#F59E0B', name: 'Service Companies' },            // Amber
  science: { color: '#EF4444', name: 'Science Projects' },             // Red
  standard: { color: '#6b7280', name: 'Standard Zone' }                // Gray
}
```

---

## Booth Layout - 156 Booths Total

### 1. Top Left Corner (Booths 96-107) - Engineering Zone
**Position**: Top-left corner starting at (80, 80)

**Configuration**:
- **Top Row (96-103)**: 8 booths, horizontal, LEFT to RIGHT
  - Booth 103: (80, 80)
  - Booth 102: (144, 80)
  - Booth 101: (208, 80)
  - Booth 100: (272, 80)
  - Booth 99: (336, 80)
  - Booth 98: (400, 80)
  - Booth 97: (464, 80)
  - Booth 96: (528, 80)

- **Left Column (104-107)**: 4 booths, vertical, TOP to BOTTOM (below booth 103)
  - Booth 104: (80, 144)
  - Booth 105: (80, 208)
  - Booth 106: (80, 272)
  - Booth 107: (80, 336)

**Spacing**: Each booth is 60px × 60px with 4px gap between them

---

### 2. Left Engineering Loop (Booths 82-95) - Engineering Zone
**Position**: 6 meters (120px) to the right and down from Section 1

**Starting Point**: 
- X: 80 + 60 + 6×20 = 200px
- Y: 80 + 60 + 6×20 = 200px

**Configuration** (forms a rectangular loop):
- **Top Row (89-93)**: 5 booths, horizontal
  - Booth 89: (200, 200)
  - Booth 90: (264, 200)
  - Booth 91: (328, 200)
  - Booth 92: (392, 200)
  - Booth 93: (456, 200)

- **Left Column (88, 87, 86)**: 3 booths, vertical (below 89)
  - Booth 88: (200, 264)
  - Booth 87: (200, 328)
  - Booth 86: (200, 392)

- **Bottom Row (85, 84, 83, 82)**: 4 booths, horizontal (starts at 86)
  - Booth 85: (264, 392)
  - Booth 84: (328, 392)
  - Booth 83: (392, 392)
  - Booth 82: (456, 392)

- **Right Column (94, 95)**: 2 booths, vertical (below 93)
  - Booth 94: (456, 264)
  - Booth 95: (456, 328)

**Visual Elements**:
- Draw X-mark inside courtyard (dashed diagonal lines)
- Draw blue (#0EA5E9) border around entire rectangular loop (3px strokeWidth)

---

### 3. Center Sponsor Complex (Booths 150-156) - Sponsor Zone
**Position**: 9.5 meters (190px) to the right of Loop 82-95, shifted up 5.4m (108px)

**Starting Point**:
- X: 200 + 5×64 + 9.5×20 = 710px
- Y: 200 - 5.4×20 = 92px

**Configuration** (U-shaped with L-shaped booths):

- **Booth 152** (L-shaped left): (710, 92), width: 70px, height: 108px
  - Shape: Vertical bar on right side, horizontal extends left at bottom
  - Path definition: vertical section (width 35px) + horizontal bottom section (height 59px)

- **Booth 153** (Standard): (784, 92), 60px × 60px

- **Booth 154** (L-shaped right): (848, 92), width: 70px, height: 108px
  - Shape: Vertical bar on left side, horizontal extends right at bottom
  - Path definition: vertical section (width 35px) + horizontal bottom section (height 59px)

- **Booth 151**: (710, 204), 50px × 60px
- **Booth 150**: (710, 268), 50px × 60px
- **Booth 155**: (868, 204), 50px × 60px
- **Booth 156**: (868, 268), 50px × 60px

**Visual Elements**:
- Draw X-mark inside U-shaped courtyard (dashed diagonal lines)

---

### 4. Top Right Strip (Booths 24-31) - Science Zone
**Position**: Aligned with Right Loop (section 5), y=100

**Configuration**: 8 booths, horizontal, RIGHT to LEFT
- Booth 31: (1134, 100)
- Booth 30: (1198, 100)
- Booth 29: (1262, 100)
- Booth 28: (1326, 100)
- Booth 27: (1390, 100)
- Booth 26: (1454, 100)
- Booth 25: (1518, 100)
- Booth 24: (1582, 100)

---

### 5. Right Mixed Loop (Booths 32-45)
**Position**: 10 meters (200px) to the right of Sponsor Complex

**Starting Point**:
- X: 868 + 50 + 10×20 = 1134px (approximately)
- Y: Same as Left Loop = 200px

**Configuration** (forms a rectangular loop, mixed zones):
- **Top Row (32-36)**: 5 booths
  - Booth 32 (science): (1134, 200)
  - Booth 33 (science): (1198, 200)
  - Booth 34 (science): (1262, 200)
  - Booth 35 (science): (1326, 200)
  - Booth 36 (service): (1390, 200)

- **Left Column (45, 44, 43)**:
  - Booth 45 (science): (1134, 264)
  - Booth 44 (science): (1134, 328)
  - Booth 43 (engineering): (1134, 392)

- **Bottom Row (42, 41, 40, 39)**:
  - Booth 42 (engineering): (1198, 392)
  - Booth 41 (engineering): (1262, 392)
  - Booth 40 (engineering): (1326, 392)
  - Booth 39 (service): (1390, 392)

- **Right Column (37, 38)**:
  - Booth 37 (service): (1390, 264)
  - Booth 38 (service): (1390, 328)

**Visual Elements**:
- Draw X-mark inside courtyard (dashed diagonal lines)
- Draw red (#EF4444) border around entire rectangular loop (3px strokeWidth)

---

### 6. Bottom Left Group (Booths 72-79, 64-71, 80-81)
**Position**: y=650

**Top Row - Engineering (72-79)**:
- 8 booths, horizontal, 60px × 60px each
- Starting X: 261px
- Booth 72: (261, 650)
- Booth 73: (325, 650)
- Booth 74: (389, 650)
- Booth 75: (453, 650)
- Booth 76: (517, 650)
- Booth 77: (581, 650)
- Booth 78: (645, 650)
- Booth 79: (709, 650)

**Bottom Row - Sponsors (64-71)**:
- 8 booths, horizontal, y=714
- Booth 71: (261, 714), width: 62px
- Booth 70: (327, 714), width: 60px
- Booth 69: (391, 714), width: 60px
- Booth 68: (455, 714), width: 60px
- Booth 67: (519, 714), width: 60px
- Booth 66: (583, 714), width: 60px
- Booth 65: (647, 714), width: 60px
- Booth 64: (711, 714), width: 62px

**Vertical Stack (80, 81) - Engineering**:
- Booth 80: (709, 586)
- Booth 81: (709, 522)

**Visual Elements**:
- Draw brown (#8B4513) rectangle border around entire group (3px strokeWidth)
- Border extends from booth 71 to booth 79, top to bottom of booth 71

---

### 7. Bottom Right Group (Booths 48-55, 63-56, 46-47)
**Position**: Aligned with Sponsor Complex Section 3

**Vertical Stack Above (46, 47) - Engineering**:
- Booth 46: (918, 522), width: 62px
- Booth 47: (918, 586), width: 60px

**Top Row - Engineering (48-55)**:
- Booth 48: (918, 650)
- Booth 49: (982, 650)
- Booth 50: (1046, 650)
- Booth 51: (1110, 650)
- Booth 52: (1174, 650)
- Booth 53: (1238, 650)
- Booth 54: (1302, 650)
- Booth 55: (1366, 650), width: 62px

**Bottom Row - Sponsors (63-56)**:
- 8 booths, horizontal, y=714, 60px × 60px each
- Booth 63: (918, 714)
- Booth 62: (982, 714)
- Booth 61: (1046, 714)
- Booth 60: (1110, 714)
- Booth 59: (1174, 714)
- Booth 58: (1238, 714)
- Booth 57: (1302, 714)
- Booth 56: (1366, 714)

**Visual Elements**:
- Draw brown (#8B4513) rectangle border around entire group (3px strokeWidth)

---

### 8. Bottom Strips (Booths 1-12) - Engineering Zone
**Position**: y=906, 6.6 meters (132px) below Section 6/7

**Strip 1 (1-6)**: 6 booths, horizontal, 60px × 60px each
- Booth 1: (391, 906)
- Booth 2: (455, 906)
- Booth 3: (519, 906)
- Booth 4: (583, 906)
- Booth 5: (647, 906)
- Booth 6: (711, 906)

**Gap**: 7.3 meters (146px) between Strip 1 and Strip 2

**Strip 2 (7-12)**: 6 booths, horizontal, 60px × 60px each
- Booth 7: (917, 906)
- Booth 8: (981, 906)
- Booth 9: (1045, 906)
- Booth 10: (1109, 906)
- Booth 11: (1173, 906)
- Booth 12: (1237, 906)

**Visual Elements**:
- Brown (#8B4513) border lines (3px strokeWidth):
  - Top horizontal line over booths 1-6
  - Bottom horizontal line under booths 1-6
  - Left vertical line extending 6.6m left from booth 1, then down 1.5m (30px)
  - Vertical line down 1.5m from bottom-right of booth 6
  - Top horizontal line over booths 7-12
  - Bottom horizontal line under booths 7-12
  - Vertical line down 1.5m from bottom-left of booth 7
  - Right vertical line extending 6.6m right from booth 12, then down 1.5m (30px)

---

### 9. Right Vertical Section (Booths 13-23)
**Position**: 14 meters (280px) to the right of Right Loop (section 5)

**Horizontal Row (13-16) - Service Zone**:
- Y position: 321px (aligned with gap between booth 55 and 56)
- Booth 13: (1734, 321), width: 62px
- Booth 14: (1800, 321), width: 60px
- Booth 15: (1864, 321), width: 60px
- Booth 16: (1928, 321), width: 67px

**Vertical Stack (17-23)**: Above booth 16, going UP
- Booth 17 (standard): (1928, 257)
- Booth 18 (service): (1928, 193)
- Booth 19 (standard): (1928, 129)
- Booth 20 (standard): (1928, 65)
- Booth 21 (standard): (1928, 1)
- Booth 22 (standard): (1928, -63)
- Booth 23 (standard): (1928, -127), width: 62px

**Visual Elements**:
- Brown (#8B4513) border lines (3px strokeWidth):
  - Bottom horizontal line under booths 13-16
  - Right vertical line from top of booth 23 down to bottom of booth 16
  - Left vertical line from bottom of booth 13 extending down 1.5m (30px)

---

## L-Shaped Booth Rendering

### Booth 152 (L-shape Left)
```javascript
const renderLShapeBooth152 = (x, y, width, height) => {
  // width=70px, height=108px
  // Vertical section: right side, width 35px (50% of total width)
  // Horizontal section: bottom part, height 59px (55% of total height)
  
  const verticalWidth = width * 0.5;
  const horizontalHeight = height * 0.55;
  
  const path = `
    M ${x + width - verticalWidth} ${y}
    L ${x + width} ${y}
    L ${x + width} ${y + height}
    L ${x} ${y + height}
    L ${x} ${y + height - horizontalHeight}
    L ${x + width - verticalWidth} ${y + height - horizontalHeight}
    Z
  `;
  
  return <Path d={path} fill={color} stroke={strokeColor} />;
};
```

### Booth 154 (L-shape Right)
```javascript
const renderLShapeBooth154 = (x, y, width, height) => {
  // width=70px, height=108px
  // Vertical section: left side, width 35px (50% of total width)
  // Horizontal section: bottom part, height 59px (55% of total height)
  
  const verticalWidth = width * 0.5;
  const horizontalHeight = height * 0.55;
  
  const path = `
    M ${x} ${y}
    L ${x + verticalWidth} ${y}
    L ${x + verticalWidth} ${y + height - horizontalHeight}
    L ${x + width} ${y + height - horizontalHeight}
    L ${x + width} ${y + height}
    L ${x} ${y + height}
    Z
  `;
  
  return <Path d={path} fill={color} stroke={strokeColor} />;
};
```

---

## Border Specifications

### 1. Engineering Loop Border (82-95)
- **Type**: Rectangle
- **Color**: #0EA5E9 (blue)
- **Stroke Width**: 3px
- **Position**: Surrounds booths 89-93 (top), 88-86 (left), 85-82 (bottom), 94-95 (right)
- **Coordinates**: x=200, y=200, width=320px, height=256px

### 2. Science Loop Border (32-45)
- **Type**: Rectangle
- **Color**: #EF4444 (red)
- **Stroke Width**: 3px
- **Position**: Surrounds entire Right Loop
- **Coordinates**: Calculate from booth positions

### 3. Bottom Left Group Border (72-79, 64-71, 80-81)
- **Type**: Rectangle
- **Color**: #8B4513 (brown)
- **Stroke Width**: 3px
- **Coordinates**: From booth 71 (left-top) to booth 64/79 (right-bottom)

### 4. Bottom Right Group Border (48-55, 63-56, 46-47)
- **Type**: Rectangle
- **Color**: #8B4513 (brown)
- **Stroke Width**: 3px
- **Coordinates**: From booth 63/46 to booth 55/56

### 5. Bottom Strip Borders (1-12)
- **Type**: Multiple lines
- **Color**: #8B4513 (brown)
- **Stroke Width**: 3px
- **Elements**:
  - Top horizontal lines above each strip
  - Bottom horizontal lines below each strip
  - Vertical extensions (6.6m horizontal + 1.5m vertical on ends)

### 6. Right Section Border (13-23)
- **Type**: Multiple lines
- **Color**: #8B4513 (brown)
- **Stroke Width**: 3px
- **Elements**:
  - Bottom horizontal under 13-16
  - Right vertical along booth 16-23
  - Left vertical extension below booth 13

---

## X-Mark Courtyard Indicators

### 1. Engineering Loop Courtyard (82-95)
- **Position**: Inside rectangular loop
- **Color**: #94a3b8 (slate)
- **Stroke Width**: 1px
- **Stroke Dasharray**: "5 5"
- **Lines**: Two diagonal lines forming X
  - Top-left to bottom-right
  - Top-right to bottom-left
- **Coordinates**:
  - leftInner: booth89.x + booth89.width
  - rightInner: booth93.x
  - topInner: booth89.y + booth89.height
  - bottomInner: booth86.y

### 2. Sponsor Complex Courtyard (150-156)
- **Position**: Inside U-shaped area
- **Color**: #94a3b8 (slate)
- **Stroke Width**: 1px
- **Stroke Dasharray**: "5 5"
- **Lines**: Two diagonal lines forming X
- **Coordinates**: Calculate based on L-shaped booth positions
  - Account for L-shaped geometry (use 40% and 60% offsets)

### 3. Right Loop Courtyard (32-45)
- **Position**: Inside rectangular loop
- **Color**: #94a3b8 (slate)
- **Stroke Width**: 1px
- **Stroke Dasharray**: "5 5"
- **Lines**: Two diagonal lines forming X
- **Coordinates**:
  - leftInner: booth32.x
  - rightInner: booth36.x + booth36.width
  - topInner: booth32.y
  - bottomInner: booth43.y + booth43.height

---

## Booth Rendering Styles

### Standard Booth
```jsx
<Rect
  x={booth.x}
  y={booth.y}
  width={booth.width}
  height={booth.height}
  fill={boothColor}
  opacity={boothOpacity}
  stroke={isUserBooth ? '#10B981' : '#D1D5DB'}
  strokeWidth={isUserBooth ? 3 : 2}
  rx={6}
/>
```

### Booth Colors
- **User's Booth**: #10B981 (green) - always full opacity
- **Assigned Booth**: Zone color - full opacity (1.0)
- **Available Booth**: #E5E7EB (gray) - reduced opacity (0.4)

### Booth Number Label
```jsx
<SvgText
  x={booth.x + booth.width / 2}
  y={booth.y + booth.height / 2 + 5}
  fontSize="14"
  fontWeight="bold"
  fill={boothOpacity > 0.5 ? '#fff' : '#374151'}
  textAnchor="middle"
>
  {booth.booth_number}
</SvgText>
```

---

## Interactive Features

### Pan & Zoom
- Use `react-native-gesture-handler`
- `PanGestureHandler` for map dragging
- `PinchGestureHandler` for zoom (scale 0.3x - 2x)
- Zoom buttons: + and - (increment/decrement by 0.2)

### Booth Press Handler
```javascript
const handleBoothPress = (booth) => {
  setSelectedBooth(booth);
  // Show modal with booth details
};
```

### Legend
- Engineering Zone (#0EA5E9)
- Sponsor Zone (#8B5CF6)
- Service Zone (#F59E0B)
- Science Zone (#EF4444)
- Standard Zone (#6b7280)
- Your Booth (#10B981)
- Available (#E5E7EB)

---

## Implementation Checklist

- [ ] Setup SVG canvas (2800×1400px)
- [ ] Implement all 156 booth positions with exact coordinates
- [ ] Render standard rectangular booths
- [ ] Render L-shaped booths (152, 154) using Path
- [ ] Apply zone colors to booths
- [ ] Implement booth opacity based on assignment status
- [ ] Draw all border lines (brown, blue, red)
- [ ] Draw X-marks in courtyards (dashed diagonals)
- [ ] Add booth number labels centered in each booth
- [ ] Implement pan gesture handling
- [ ] Implement pinch-to-zoom gesture
- [ ] Add zoom control buttons (+/-)
- [ ] Create booth press handler
- [ ] Build booth details modal
- [ ] Create collapsible legend component
- [ ] Highlight user's assigned booth (green with thicker border)
- [ ] Integrate with booth assignment API
- [ ] Add loading states
- [ ] Test on iOS and Android

---

## API Integration

### Fetch Booths
```javascript
const fetchBooths = async () => {
  const response = await fetch(`${API_URL}/booths`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const apiData = await response.json();
  
  // Merge API data with layout data
  const mergedBooths = BOOTH_DATA.map(layoutBooth => {
    const apiBooth = apiData.find(b => b.booth_number === layoutBooth.booth_number);
    return apiBooth ? { ...layoutBooth, ...apiBooth } : layoutBooth;
  });
  
  return mergedBooths;
};
```

### Find User's Booth
```javascript
const userBooth = booths.find(b => 
  (userRole === 'student' && b.assigned_to_student_id === userId) ||
  (userRole === 'company' && b.assigned_to_company_id === userId)
);
```

---

## Performance Optimizations

1. **Memoize booth rendering** - Use React.memo for booth components
2. **Virtualization** - Only render booths visible in viewport (advanced)
3. **Gesture debouncing** - Limit re-renders during pan/zoom
4. **Cache booth positions** - Don't recalculate on every render
5. **Use native driver** - For smooth animations

---

## Notes

- All measurements use pixels (derived from real-world meters × 20)
- Booth gaps are consistent at 4px unless specified otherwise
- Border strokeWidth is consistently 3px for major borders
- X-marks use 1px strokeWidth with "5 5" dasharray
- Background color: #F9FAFB
- Some booths have custom widths (62px, 67px, 50px, 70px)
- Negative Y coordinates (booths 21-23) extend above canvas top
