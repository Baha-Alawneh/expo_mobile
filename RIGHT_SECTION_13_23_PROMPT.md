# Fix Right Section Booths (13-23) - CRITICAL POSITION ERROR

## ⚠️ MAJOR ISSUE
**Booths 13-23 are positioned TOO HIGH on the canvas. They need to be moved DOWN significantly to match the web layout.**

## Current Problem

**Current Y positions**:
- Booth 13-16: y = 321
- Booth 17: y = 257
- Booth 23: y = -127 (NEGATIVE - extends above canvas!)

**This is WRONG!** The entire section needs to shift DOWN.

## Web Reference Analysis

From the web map image, the right section (13-23) has this structure:

### Horizontal Row (13-16) - Service Zone
**Visual Layout**:
```
┌────┬────┬────┬────┐
│ 13 │ 14 │ 15 │ 16 │
└────┴────┴────┴────┘
```

These 4 booths are horizontally aligned in a single row at approximately mid-height of the canvas.

### Vertical Stack (17-23)
**Visual Layout** (bottom to top):
```
23 ─┐
22  │
21  │
20  │
19  │
18  │
17 ─┘
```

This vertical column of 7 booths is positioned:
- **At the SAME X position as booth 16** (aligned with right edge)
- **ABOVE the horizontal row** (extending upward)
- Numbers increase going UP (17 at bottom, 23 at top)

## Current Implementation Check

Based on the coordinates in mapData.js:

```javascript
// Horizontal row (correct)
Booth 13: (1734, 321) - width: 62px
Booth 14: (1800, 321) - width: 60px
Booth 15: (1864, 321) - width: 60px
Booth 16: (1928, 321) - width: 67px

// Vertical stack (needs verification)
Booth 17: (1928, 257) - 64px above booth 16
Booth 18: (1928, 193) - 64px above booth 17
Booth 19: (1928, 129) - 64px above booth 18
Booth 20: (1928, 65) - 64px above booth 19
Booth 21: (1928, 1) - 64px above booth 20
Booth 22: (1928, -63) - 64px above booth 21
Booth 23: (1928, -127) - 64px above booth 22, width: 62px
```

## Alignment Rules

### Horizontal Alignment
1. Booth 13 starts at x=1734
2. Each subsequent booth: previous_x + previous_width + 4px gap
3. Total row width: 62 + 4 + 60 + 4 + 60 + 4 + 67 = 261px

### Vertical Alignment
1. Booth 17 starts 64px above booth 16 (321 - 60 - 4 = 257)
2. Each booth above: previous_y - 60 - 4 = previous_y - 64
3. Stack extends from y=257 down to y=-127 (384px total height)

### Key Positioning Notes
- **Booth 16 X position**: Should be at 1734 + 62 + 4 + 60 + 4 + 60 + 4 = 1928px ✓
- **Booth 17-23 X position**: Must match booth 16's X = 1928px ✓
- **Y-axis**: Booths 22 and 23 have NEGATIVE Y values (extending above canvas top)

## Correct Visual Relationship to Other Sections

**KEY OBSERVATION from web image**:

The horizontal row (13-16) should be positioned so that:
- It aligns **LOWER**, approximately at the same height as the MIDDLE SECTIONS
- Looking at the web image, booth 13-16 appear to be at roughly y=500-600 range
- The vertical stack (17-23) extends UPWARD from that position
- NO booths should have negative Y coordinates!

**Visual alignment in web image**:
```
Top sections: y=80-400
Middle gap area
Right section 13-16: y≈500-600  ← SHOULD BE HERE
Bottom sections: y=650-900
```

## Correct Y Position Calculation

Looking at the web layout image more carefully:
ORRECTED Position Requirements

Based on the web layout image:

1. **Booths 13-16** form a horizontal row on the right side at LOWER position
   - **New Y position**: Approximately y = 490 (not 321!)
   
2. **Booths 17-23** form a vertical stack directly ABOVE and ALIGNED with booth 16
   - **Booth 17**: y = 490 - 64 = 426
   - **Booth 18**: y = 426 - 64 = 362
   - **Booth 19**: y = 362 - 64 = 298
   - **Booth 20**: y = 298 - 64 = 234
   - **Booth 21**: y = 234 - 64 = 170
   - **Booth 22**: y = 170 - 64 = 106
   - **Booth 23**: y = 106 - 64 = 42 (POSITIVE Y, visible on canvas!)

3. The vertical stack uses the same X coordinate as booth 16 (x = 1928)

4. Booth numbers increase going upward (17 lowest, 23 highest)

## Updated Coordinates

```javascript
// Horizontal row (13-16) - MOVED DOWN
{ booth_id: 13, booth_number: 13, x: 1734, y: 490, width: 62, height: 60, zone_type: 'service', shape: 'rectangle' },
{ booth_id: 14, booth_number: 14, x: 1800, y: 490, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },
{ booth_id: 15, booth_number: 15, x: 1864, y: 490, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },
{ booth_id: 16, booth_number: 16, x: 1928, y: 490, width: 67, height: 60, zone_type: 'service', shape: 'rectangle' },

// Vertical stack (17-23) - ALL POSITIVE Y VALUES
{ booth_id: 17, booth_number: 17, x: 1928, y: 426, width: 60, height: 60, zone_type: 'standard', shape: 'rectangle' },
{ booth_id: 18, booth_number: 18, x: 1928, y: 362, width: 60, height: 60, zone_type: 'service', shape: 'rectangle' },
{ booth_id: 19, booth_number: 19, x: 1928, y: 298, width: 60, height: 60, zone_type: 'standard', shape: 'rectangle' },
{ booth_id: 20, booth_number: 20, x: 1928, y: 234, width: 60, height: 60, zone_type: 'standard', shape: 'rectangle' },
{ booth_id: 21, booth_number: 21, x: 1928, y: 170, width: 60, height: 60, zone_type: 'standard', shape: 'rectangle' },
{ booth_id: 22, booth_number: 22, x: 1928, y: 106, width: 60, height: 60, zone_type: 'standard', shape: 'rectangle' },
{ booth_id: 23, booth_number: 23, x: 1928, y: 42, width: 62, height: 60, zone_type: 'standard', shape: 'rectangle' }
```
This would make booth 17-23 stack from y=480 going UP to around y=100, which matches the web layout where they're visible and positioned in the upper-middle area.

## Corrected Understanding from Image

Looking at the web layout image provided:

1. **Booths 13-16** form a horizontal row on the right side
2. **Booths 17-23** form a vertical stack directly ABOVE and ALIGNED with booth 16
3. The vertical stack uses the same X coordinate as booth 16
4. Booth numbers increase going upward (17 lowest, 23 highest)

## Border Requirements

According to the web implementation, there should be brown borders:

1. **Bottom horizontal line**: Under booths 13-16
   - From booth 13's left edge to booth 16's right edge
   - Y position: 321 + 60 = 381

2. **Right vertical line**: Along the entire right side
   - From top of booth 23 to bottom of booth 16
   - X position: 1928 + width
   - From y=-127 to y=381

3. **Left extension**: From bottom-left of booth 13
   - Extends down 1.5m (30px)
   - From (1734, 381) to (1734, 411)

## Implementation Verification

The current coordinates appear correct. Verify that:

1. ✓ Booths 13-16 are horizontally aligned at y=321
2. ✓ Booths 17-23 are vertically stacked at x=1928
3. ✓ Gap between each vertical booth is 4px (64px total spacing)
4. ✓ Booth 16 and booth 17-23 share the same X coordinate
5. ? Border lines are drawn correctly

## Border Drawing Code

```javascript
// Border around booths 13-23
<G>
  {(() => {
    const booth13 = booths.find(b => b.booth_number === 13);
    const booth16 = booths.find(b => b.booth_number === 16);
    const booth23 = booths.find(b => b.booth_number === 23);
    if (!booth13 || !booth16 || !booth23) return null;
    
    const bottomY = booth13.y + booth13.height; // 381
    const leftX = booth13.x; // 1734
    const rightX = booth16.x + booth16.width; // 1928 + 67 = 1995
    const topY = booth23.y; // -127
    
    return (
      <>
        {/* Bottom horizontal line under 13-16 */}
        <Line 
          x1={leftX} 
          y1={bottomY} 
          x2={rightX} 
           - ACTION REQUIRED

**CRITICAL FIX NEEDED**: Update mapData.js with the corrected Y positions shown above.

Changes needed:
1. ✅ X positions are correct (1734, 1800, 1864, 1928)
2. ❌ Y positions need to shift DOWN by ~170px
3. ❌ Change booth 13-16 from y=321 to y=490
4. ❌ Recalculate booths 17-23 to stack upward from y=426 to y=42
5. ✅ All booths should have POSITIVE Y coordinates
6. ✅ Border lines will need Y coordinate updates to match new positions
7. ✅ Zone colors remain: 13-16 and 18 are service (amber), 17, 19-23 are standard (gray)

**Visual Check**: After updating, booth 23 should be near the top of the canvas at y=42, and booth 13-16 should be in the middle-lower area around y=490, matching the web layout.
          x1={rightX} 
          y1={topY} 
          x2={rightX} 
          y2={bottomY}
          stroke="#8B4513"
          strokeWidth="3"
        />
        
        {/* Left extension down from booth 13 */}
        <Line 
          x1={leftX} 
          y1={bottomY} 
          x2={leftX} 
          y2={bottomY + 30}
          stroke="#8B4513"
          strokeWidth="3"
        />
      </>
    );
  })()}
</G>
```

## Border Implementation (From Web)

The web implementation draws brown borders (`#8B4513`, strokeWidth `3`) around the right section (booths 13-23):

### Border Structure

```javascript
<g className="pointer-events-none" stroke="#8B4513" strokeWidth="3">
  {(() => {
    const booth13 = booths.find(b => b.booth_number === 13);
    const booth16 = booths.find(b => b.booth_number === 16);
    const booth23 = booths.find(b => b.booth_number === 23);
    const booth12 = booths.find(b => b.booth_number === 12);
    if (!booth13 || !booth16 || !booth23 || !booth12) return null;
    
    const leftEdge = booth13.x;
    const rightEdge = booth16.x + booth16.width;
    const bottomEdge = booth13.y + booth13.height;
    const topEdge = booth23.y;
    
    return (
      <>
        {/* Bottom horizontal line under booths 13-16 */}
        <line 
          x1={leftEdge} 
          y1={bottomEdge} 
          x2={rightEdge} 
          y2={bottomEdge}
        />
        
        {/* Right vertical line from top of booth 23 to bottom of booth 16 */}
        <line 
          x1={rightEdge} 
          y1={topEdge} 
          x2={rightEdge} 
          y2={bottomEdge}
        />
        
        {/* Left vertical extension down from bottom-left of booth 13 */}
        {/* Extends down 1.5m (30px) to align with booth 12's border */}
        <line 
          x1={leftEdge} 
          y1={bottomEdge} 
          x2={leftEdge} 
          y2={booth12.y + booth12.height + 1.5*20}
        />
      </>
    );
  })()}
</g>
```

### Border Visual Layout

```
              23 ┐
              22 │
              21 │
              20 │  Right vertical line
              19 │  (brown, 3px)
              18 │
              17 ┘
┌────┬────┬────┬────┐
│ 13 │ 14 │ 15 │ 16 │  Bottom horizontal line
└────┴────┴────┴────┘  (brown, 3px)
│
│ Left extension
│ (30px down)
```

### Key Border Details

1. **Bottom Line**: Runs under the horizontal row (13-16)
   - Start: Left edge of booth 13
   - End: Right edge of booth 16
   
2. **Right Line**: Runs along the right side
   - Start: Top of booth 23
   - End: Bottom of booth 16
   - Connects the vertical stack to the horizontal row
   
3. **Left Extension**: Drops down from booth 13
   - Start: Bottom-left corner of booth 13
   - End: 30px (1.5m) down to align with booth 12's bottom border
   - This connects the right section to the bottom section visually

### Mobile Implementation for React Native

```javascript
// In InteractiveMapMobile.jsx, add after booth rendering:

{/* Border around right section (booths 13-23) */}
<G>
  {(() => {
    const booth13 = BOOTH_DATA.find(b => b.booth_number === 13);
    const booth16 = BOOTH_DATA.find(b => b.booth_number === 16);
    const booth23 = BOOTH_DATA.find(b => b.booth_number === 23);
    const booth12 = BOOTH_DATA.find(b => b.booth_number === 12);
    if (!booth13 || !booth16 || !booth23 || !booth12) return null;
    
    const leftEdge = booth13.x;
    const rightEdge = booth16.x + booth16.width;
    const bottomEdge = booth13.y + booth13.height; // Will be 490 + 60 = 550
    const topEdge = booth23.y; // Will be 42
    
    return (
      <>
        {/* Bottom horizontal line */}
        <Line 
          x1={leftEdge} 
          y1={bottomEdge} 
          x2={rightEdge} 
          y2={bottomEdge}
          stroke="#8B4513"
          strokeWidth="3"
        />
        
        {/* Right vertical line */}
        <Line 
          x1={rightEdge} 
          y1={topEdge} 
          x2={rightEdge} 
          y2={bottomEdge}
          stroke="#8B4513"
          strokeWidth="3"
        />
        
        {/* Left extension down */}
        <Line 
          x1={leftEdge} 
          y1={bottomEdge} 
          x2={leftEdge} 
          y2={booth12.y + booth12.height + 30}
          stroke="#8B4513"
          strokeWidth="3"
        />
      </>
    );
  })()}
</G>
```

## L-Shaped Booths (152, 154) - CRITICAL ISSUE

### Web Implementation Analysis

From the web code, booths 152 and 154 are L-shaped booths in the sponsor zone (purple):

**Booth 152 (L-shape-left)**:
```javascript
// Path structure:
// Upper horizontal bar: 3.5m wide × 3m tall (70px × 60px)
// Lower vertical bar: 2.5m wide × 2.4m tall (50px × 48px) - LEFT side

M x, y                                    // Start top-left
L x + 70, y                              // Top edge (70px right)
L x + 70, y + 60                         // Right edge down 60px
L x + 50, y + 60                         // Step in 20px (to 50px from left)
L x + 50, y + 108                        // Down to bottom (60 + 48 = 108px total height)
L x, y + 108                             // Bottom edge back to left
Z                                         // Close path
```

**Booth 154 (L-shape-right)**:
```javascript
// Path structure:
// Upper horizontal bar: 3.5m wide × 3m tall (70px × 60px)  
// Lower vertical bar: 2.5m wide × 2.4m tall (50px × 48px) - RIGHT side

M x, y                                    // Start top-left
L x + 70, y                              // Top edge (70px right)
L x + 70, y + 108                        // Right edge all the way down (108px total)
L x + 20, y + 108                        // Bottom edge left (stop at 20px from left)
L x + 20, y + 60                         // Up to where vertical bar starts
L x, y + 60                              // Left to original x
Z                                         // Close path
```

### Visual Structure

```
BOOTH 152 (L-shape-left)         BOOTH 154 (L-shape-right)
┌──────────────┐                 ┌──────────────┐
│   3.5m × 3m  │                 │   3.5m × 3m  │
│ (Horizontal) │                 │ (Horizontal) │
├──────┐       │                 │       ┌──────┤
│ 2.5m │       │                 │       │ 2.5m │
│ ×    │                                 │ ×    │
│ 2.4m │                                 │ 2.4m │
└──────┘                                 └──────┘
LEFT aligned vertical              RIGHT aligned vertical
```

### Dimensions
- **Upper bar (both)**: 70px wide × 60px tall
- **Lower vertical bar**: 50px wide × 48px tall
- **Total height**: 108px (60 + 48)
- **Vertical bar offset**: 
  - Booth 152: Starts at left (x + 0)
  - Booth 154: Starts at right (x + 20, leaving 50px for vertical bar)

### Mobile Path Implementation

```javascript
// Booth 152 - L-shape-left
const renderLShapedBoothLeft = (booth, color, isUserBooth) => {
  const horizontalWidth = 70;  // 3.5m
  const horizontalHeight = 60; // 3m
  const verticalWidth = 50;    // 2.5m
  const verticalHeight = 48;   // 2.4m
  
  const path = `
    M ${booth.x} ${booth.y}
    L ${booth.x + horizontalWidth} ${booth.y}
    L ${booth.x + horizontalWidth} ${booth.y + horizontalHeight}
    L ${booth.x + verticalWidth} ${booth.y + horizontalHeight}
    L ${booth.x + verticalWidth} ${booth.y + horizontalHeight + verticalHeight}
    L ${booth.x} ${booth.y + horizontalHeight + verticalHeight}
    Z
  `;
  
  return (
    <Path
      d={path}
      fill={color}
      stroke={isUserBooth ? '#10B981' : '#D1D5DB'}
      strokeWidth={isUserBooth ? 3 : 2}
    />
  );
};

// Booth 154 - L-shape-right
const renderLShapedBoothRight = (booth, color, isUserBooth) => {
  const horizontalWidth = 70;  // 3.5m
  const horizontalHeight = 60; // 3m
  const verticalWidth = 50;    // 2.5m
  const verticalHeight = 48;   // 2.4m
  const verticalOffset = horizontalWidth - verticalWidth; // 20px from left
  
  const path = `
    M ${booth.x} ${booth.y}
    L ${booth.x + horizontalWidth} ${booth.y}
    L ${booth.x + horizontalWidth} ${booth.y + horizontalHeight + verticalHeight}
    L ${booth.x + verticalOffset} ${booth.y + horizontalHeight + verticalHeight}
    L ${booth.x + verticalOffset} ${booth.y + horizontalHeight}
    L ${booth.x} ${booth.y + horizontalHeight}
    Z
  `;
  
  return (
    <Path
      d={path}
      fill={color}
      stroke={isUserBooth ? '#10B981' : '#D1D5DB'}
      strokeWidth={isUserBooth ? 3 : 2}
    />
  );
};
```

### Booth Coordinates (from mapData.js)

```javascript
{ booth_id: 152, booth_number: 152, x: 318, y: 80, width: 70, height: 108, zone_type: 'sponsor', shape: 'l-shape-left' },
{ booth_id: 154, booth_number: 154, x: 392, y: 80, width: 70, height: 108, zone_type: 'sponsor', shape: 'l-shape-right' }
```

**IMPORTANT**: The shape property should be 'l-shape-left' or 'l-shape-right' to trigger the correct rendering function.

## Summary

### Position Fixes Required
1. ✅ X positions are correct (1734, 1800, 1864, 1928)
2. ❌ Y positions need to shift DOWN by ~170px
3. ❌ Change booth 13-16 from y=321 to y=490
4. ❌ Recalculate booths 17-23 to stack upward from y=426 to y=42
5. ✅ All booths should have POSITIVE Y coordinates

### Border Implementation Required
1. Brown borders (#8B4513, 3px width) around right section
2. Three border lines:
   - Bottom horizontal under booths 13-16
   - Right vertical from booth 23 to booth 16
   - Left extension down 30px from booth 13
3. Border coordinates will update after position fix

### L-Shaped Booths (152, 154)
1. Both are 70px wide × 108px tall overall
2. Upper bar: 70px × 60px (horizontal)
3. Lower vertical: 50px × 48px
4. Booth 152: Vertical on LEFT side
5. Booth 154: Vertical on RIGHT side
6. Use Path component with exact web coordinates
7. Zone color: Sponsor purple (#8B5CF6)

### Zone Colors
- Booths 13-16, 18: Service (amber #F59E0B)
- Booths 17, 19-23: Standard (gray #6b7280)
- Booths 152, 154: Sponsor (purple #8B5CF6)
