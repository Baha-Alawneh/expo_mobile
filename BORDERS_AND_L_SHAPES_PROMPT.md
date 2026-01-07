# Border Implementation & L-Shaped Booths Fix

## Border Implementation (From Web)

The web implementation draws brown borders (`#8B4513`, strokeWidth `3`) around booth sections to create visual groupings.

### Right Section Border (Booths 13-23)

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

### Border Details

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
    const bottomEdge = booth13.y + booth13.height;
    const topEdge = booth23.y;
    
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

---

## L-Shaped Booths (152, 154) - CRITICAL FIX

### Web Implementation Analysis

From the web code, booths 152 and 154 are L-shaped booths in the sponsor zone (purple). They form a U-shaped courtyard.

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

### Usage in InteractiveMapMobile.jsx

```javascript
// In the booth rendering section:
{BOOTH_DATA.map((booth) => {
  const boothColor = getBoothColor(booth);
  const isUserBooth = userId && booth.assigned_to === userId;
  
  // Handle L-shaped booths
  if (booth.shape === 'l-shape-left') {
    return (
      <G key={booth.booth_id} onPress={() => handleBoothPress(booth)}>
        {renderLShapedBoothLeft(booth, boothColor, isUserBooth)}
        <SvgText
          x={booth.x + booth.width / 2}
          y={booth.y + 35}
          fill="#fff"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          {booth.booth_number}
        </SvgText>
      </G>
    );
  }
  
  if (booth.shape === 'l-shape-right') {
    return (
      <G key={booth.booth_id} onPress={() => handleBoothPress(booth)}>
        {renderLShapedBoothRight(booth, boothColor, isUserBooth)}
        <SvgText
          x={booth.x + booth.width / 2}
          y={booth.y + 35}
          fill="#fff"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          {booth.booth_number}
        </SvgText>
      </G>
    );
  }
  
  // Regular rectangular booths...
})}
```

### Booth Coordinates (from mapData.js)

```javascript
{ booth_id: 152, booth_number: 152, x: 318, y: 80, width: 70, height: 108, zone_type: 'sponsor', shape: 'l-shape-left' },
{ booth_id: 154, booth_number: 154, x: 392, y: 80, width: 70, height: 108, zone_type: 'sponsor', shape: 'l-shape-right' }
```

**IMPORTANT**: The shape property should be 'l-shape-left' or 'l-shape-right' to trigger the correct rendering function.

---

## Summary

### Border Implementation Checklist
- [ ] Add brown borders (#8B4513, 3px) around booth sections
- [ ] Bottom horizontal line under booths 13-16
- [ ] Right vertical line connecting booth 23 to booth 16
- [ ] Left extension dropping 30px from booth 13
- [ ] Import Line component from react-native-svg if not already imported

### L-Shaped Booths Checklist
- [ ] Update booth 152 shape property to 'l-shape-left' in mapData.js
- [ ] Update booth 154 shape property to 'l-shape-right' in mapData.js
- [ ] Create renderLShapedBoothLeft function
- [ ] Create renderLShapedBoothRight function
- [ ] Add conditional rendering in booth map for L-shaped booths
- [ ] Import Path component from react-native-svg
- [ ] Test rendering with sponsor zone color (#8B5CF6)
- [ ] Verify booth labels are centered correctly

### Zone Colors
- Booths 152, 154: Sponsor (purple #8B5CF6)
- Booths 13-16, 18: Service (amber #F59E0B)
- Booths 17, 19-23: Standard (gray #6b7280)
