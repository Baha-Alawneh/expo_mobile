# Complete Border & L-Shaped Booth Implementation Guide

## Overview
This document explains ALL border lines and X-mark indicators visible in the web map, plus the correct L-shaped booth rendering for booths 152 and 154.

---

## 1. Brown Borders - Booth Group Outlines

### A. Bottom Section (Booths 1-12)

**Visual Layout:**
```
        ├────────┬─────┬─────┬─────┬─────┬─────┐    ┌─────┬─────┬─────┬─────┬─────┬─────┤
        │   1    │  2  │  3  │  4  │  5  │  6  │    │  7  │  8  │  9  │ 10  │ 11  │ 12  │
        └────────┴─────┴─────┴─────┴─────┴─────┘    └─────┴─────┴─────┴─────┴─────┴─────┘
             │                                  │    │                                  │
             └──────────────────────────────────┘    └──────────────────────────────────┘
```

**Border Elements:**
1. **Bottom line under booths 1-6** (horizontal)
2. **Bottom line under booths 7-12** (horizontal)
3. **Left extension** from booth 1 - extends LEFT 6.6m (132px), then DOWN 1.5m (30px)
4. **Center divider** - vertical line down from booth 6 (30px)
5. **Center divider** - vertical line down from booth 7 (30px)
6. **Right extension** from booth 12 - extends RIGHT 6.6m (132px), then DOWN 1.5m (30px)

**Code:**
```javascript
<g className="pointer-events-none" stroke="#8B4513" strokeWidth="3">
  {(() => {
    const booth1 = booths.find(b => b.booth_number === 1);
    const booth6 = booths.find(b => b.booth_number === 6);
    const booth7 = booths.find(b => b.booth_number === 7);
    const booth12 = booths.find(b => b.booth_number === 12);
    if (!booth1 || !booth6 || !booth7 || !booth12) return null;
    
    const topEdge = booth1.y;
    const bottomEdge = booth1.y + booth1.height;
    const horizontalExtension = 6.6 * 20; // 132px
    const verticalLength = 1.5 * 20; // 30px
    
    return (
      <>
        {/* Bottom line under 1-6 */}
        <line 
          x1={booth1.x} 
          y1={bottomEdge} 
          x2={booth6.x + booth6.width} 
          y2={bottomEdge}
        />
        
        {/* Bottom line under 7-12 */}
        <line 
          x1={booth7.x} 
          y1={bottomEdge} 
          x2={booth12.x + booth12.width} 
          y2={bottomEdge}
        />
        
        {/* Left extension - horizontal */}
        <line 
          x1={booth1.x} 
          y1={topEdge} 
          x2={booth1.x - horizontalExtension} 
          y2={topEdge}
        />
        {/* Left extension - vertical down */}
        <line 
          x1={booth1.x - horizontalExtension} 
          y1={topEdge} 
          x2={booth1.x - horizontalExtension} 
          y2={bottomEdge + verticalLength}
        />
        
        {/* Center divider - booth 6 */}
        <line 
          x1={booth6.x + booth6.width} 
          y1={bottomEdge} 
          x2={booth6.x + booth6.width} 
          y2={bottomEdge + verticalLength}
        />
        
        {/* Center divider - booth 7 */}
        <line 
          x1={booth7.x} 
          y1={bottomEdge} 
          x2={booth7.x} 
          y2={bottomEdge + verticalLength}
        />
        
        {/* Right extension - horizontal */}
        <line 
          x1={booth12.x + booth12.width} 
          y1={topEdge} 
          x2={booth12.x + booth12.width + horizontalExtension} 
          y2={topEdge}
        />
        {/* Right extension - vertical down */}
        <line 
          x1={booth12.x + booth12.width + horizontalExtension} 
          y1={topEdge} 
          x2={booth12.x + booth12.width + horizontalExtension} 
          y2={bottomEdge + verticalLength}
        />
      </>
    );
  })()}
</g>
```

---

### B. Right Section (Booths 13-23)

**Visual Layout:**
```
              23 ┐
              22 │
              21 │
              20 │  Right vertical
              19 │
              18 │
              17 ┘
┌────┬────┬────┬────┐
│ 13 │ 14 │ 15 │ 16 │  Bottom horizontal
└────┴────┴────┴────┘
│
│ Left extension (30px down)
```

**Border Elements:**
1. **Bottom line** under booths 13-16
2. **Right vertical line** from booth 23 to booth 16
3. **Left extension** drops 30px from booth 13

**Code:**
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
        {/* Bottom horizontal */}
        <line 
          x1={leftEdge} 
          y1={bottomEdge} 
          x2={rightEdge} 
          y2={bottomEdge}
        />
        
        {/* Right vertical */}
        <line 
          x1={rightEdge} 
          y1={topEdge} 
          x2={rightEdge} 
          y2={bottomEdge}
        />
        
        {/* Left extension down */}
        <line 
          x1={leftEdge} 
          y1={bottomEdge} 
          x2={leftEdge} 
          y2={booth12.y + booth12.height + 30}
        />
      </>
    );
  })()}
</g>
```

---

### C. Top-Left Section (Booths 96-107)

**Visual Layout:**
```
┌──────────────────────┐
│ 103 102 101 100 99 98 97 96 │  Top horizontal
├────┐                 │
│104 │                 │ Right vertical (extends up 40px)
│105 │
│106 │
│107 │
└────┘ Left vertical (extends down to booth 1)
```

**Border Elements:**
1. **Top horizontal** from booth 103 to booth 96
2. **Left vertical** from booth 103 to booth 107, extends down to booth 1
3. **Right short vertical** down from booth 96
4. **Right extension** up 40px from booth 96

**Code:**
```javascript
<g className="pointer-events-none" stroke="#8B4513" strokeWidth="3">
  {(() => {
    const booth103 = booths.find(b => b.booth_number === 103);
    const booth96 = booths.find(b => b.booth_number === 96);
    const booth104 = booths.find(b => b.booth_number === 104);
    const booth107 = booths.find(b => b.booth_number === 107);
    const booth1 = booths.find(b => b.booth_number === 1);
    if (!booth103 || !booth96 || !booth104 || !booth107 || !booth1) return null;
    
    const topEdge = booth103.y;
    const leftEdge = booth103.x;
    const rightEdge = booth96.x + booth96.width;
    const bottomEdge = booth107.y + booth107.height;
    
    return (
      <>
        {/* Left vertical - full height */}
        <line 
          x1={leftEdge} 
          y1={bottomEdge} 
          x2={leftEdge} 
          y2={topEdge}
        />
        
        {/* Top horizontal */}
        <line 
          x1={leftEdge} 
          y1={topEdge} 
          x2={rightEdge} 
          y2={topEdge}
        />
        
        {/* Right vertical down */}
        <line 
          x1={rightEdge} 
          y1={topEdge} 
          x2={rightEdge} 
          y2={topEdge + booth96.height}
        />
        
        {/* Right extension up (40px) */}
        <line 
          x1={rightEdge} 
          y1={topEdge} 
          x2={rightEdge} 
          y2={topEdge - 40}
        />
        
        {/* Left extension down to booth 1 */}
        <line 
          x1={leftEdge} 
          y1={bottomEdge} 
          x2={leftEdge} 
          y2={booth1.y}
        />
      </>
    );
  })()}
</g>
```

---

### D. Top-Right Section (Booths 24-31)

**Visual Layout:**
```
     │  Vertical extension up (40px)
     │
─────┴───────────────────  Horizontal line extending to booth 23
     24 25 26 27 28 29 30 31
```

**Border Elements:**
1. **Top horizontal** from booth 31 extending RIGHT to booth 23
2. **Vertical extension** up 40px from booth 31

**Code:**
```javascript
<g className="pointer-events-none" stroke="#8B4513" strokeWidth="3">
  {(() => {
    const booth24 = booths.find(b => b.booth_number === 24);
    const booth31 = booths.find(b => b.booth_number === 31);
    const booth23 = booths.find(b => b.booth_number === 23);
    if (!booth24 || !booth31 || !booth23) return null;
    
    const leftEdge = booth31.x;
    const topEdge = booth24.y;
    const extendRight = booth23.x + booth23.width;
    const upDistance = 40; // 2m
    
    return (
      <>
        {/* Top horizontal extending to booth 23 */}
        <line 
          x1={leftEdge} 
          y1={topEdge} 
          x2={extendRight} 
          y2={topEdge} 
        />
        
        {/* Vertical extension up */}
        <line 
          x1={leftEdge} 
          y1={topEdge} 
          x2={leftEdge} 
          y2={topEdge - upDistance} 
        />
      </>
    );
  })()}
</g>
```

---

## 2. Blue Border - Engineering Loop (Booths 82-95)

**Visual Layout:**
```
┌──────────────────────────┐  Blue rectangle
│ 89 90 91 92 93          │
│ 88     X-mark     94    │  
│ 87               95     │
│ 86 85 84 83 82          │
└──────────────────────────┘
```

**Code:**
```javascript
<g className="pointer-events-none" stroke="#3b82f6" strokeWidth="3">
  {(() => {
    const booth89 = booths.find(b => b.booth_number === 89);
    const booth93 = booths.find(b => b.booth_number === 93);
    const booth82 = booths.find(b => b.booth_number === 82);
    const booth86 = booths.find(b => b.booth_number === 86);
    if (!booth89 || !booth93 || !booth82 || !booth86) return null;
    
    const leftEdge = booth89.x;
    const rightEdge = booth93.x + booth93.width;
    const topEdge = booth89.y;
    const bottomEdge = booth86.y + booth86.height;
    
    return (
      <rect 
        x={leftEdge} 
        y={topEdge} 
        width={rightEdge - leftEdge} 
        height={bottomEdge - topEdge}
        fill="none"
      />
    );
  })()}
</g>
```

---

## 3. Red Border - Science Loop (Booths 32-45)

**Visual Layout:**
```
┌──────────────────────────┐  Red rectangle  
│ 32 33 34 35 36          │
│ 45     X-mark     37    │
│ 44               38     │
│ 43 42 41 40 39          │
└──────────────────────────┘
```

**Code:**
```javascript
<g className="pointer-events-none" stroke="#ef4444" strokeWidth="3">
  {(() => {
    const booth32 = booths.find(b => b.booth_number === 32);
    const booth36 = booths.find(b => b.booth_number === 36);
    const booth39 = booths.find(b => b.booth_number === 39);
    const booth43 = booths.find(b => b.booth_number === 43);
    if (!booth32 || !booth36 || !booth39 || !booth43) return null;
    
    const leftEdge = booth32.x;
    const rightEdge = booth36.x + booth36.width;
    const topEdge = booth32.y;
    const bottomEdge = booth43.y + booth43.height;
    
    return (
      <rect 
        x={leftEdge} 
        y={topEdge} 
        width={rightEdge - leftEdge} 
        height={bottomEdge - topEdge}
        fill="none"
      />
    );
  })()}
</g>
```

---

## 4. Purple Border - Sponsor Section (Booths 150-156)

**Visual Layout:**
```
┌─────────────────────┐  Purple rectangle
│ 152  153  154       │
│ 151  X-mark  155    │
│ 150        156      │
└─────────────────────┘
```

**Code:**
```javascript
<g className="pointer-events-none" stroke="#8b5cf6" strokeWidth="3">
  {(() => {
    const booth152 = booths.find(b => b.booth_number === 152);
    const booth154 = booths.find(b => b.booth_number === 154);
    const booth150 = booths.find(b => b.booth_number === 150);
    const booth156 = booths.find(b => b.booth_number === 156);
    if (!booth152 || !booth154 || !booth150 || !booth156) return null;
    
    const leftEdge = booth152.x;
    const rightEdge = booth154.x + booth154.width;
    const topEdge = booth152.y;
    const bottomEdge = booth150.y + booth150.height;
    
    return (
      <rect 
        x={leftEdge} 
        y={topEdge} 
        width={rightEdge - leftEdge} 
        height={bottomEdge - topEdge}
        fill="none"
      />
    );
  })()}
</g>
```

---

## 5. X-Mark Indicators (Dashed Diagonals)

X-marks indicate courtyard/open spaces. Gray dashed lines (#94a3b8, strokeWidth 1, dasharray "5 5").

### A. Engineering Loop X-Mark (82-95)

```javascript
<g className="pointer-events-none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5 5">
  {(() => {
    const booth89 = booths.find(b => b.booth_number === 89);
    const booth93 = booths.find(b => b.booth_number === 93);
    const booth82 = booths.find(b => b.booth_number === 82);
    const booth86 = booths.find(b => b.booth_number === 86);
    if (!booth89 || !booth93 || !booth82 || !booth86) return null;
    
    const leftInner = booth89.x + booth89.width;
    const rightInner = booth93.x;
    const topInner = booth89.y + booth89.height;
    const bottomInner = booth86.y;
    
    return (
      <>
        {/* Top-left to bottom-right */}
        <line 
          x1={leftInner} 
          y1={topInner} 
          x2={rightInner} 
          y2={bottomInner}
        />
        {/* Top-right to bottom-left */}
        <line 
          x1={rightInner} 
          y1={topInner} 
          x2={leftInner} 
          y2={bottomInner}
        />
      </>
    );
  })()}
</g>
```

### B. Sponsor Loop X-Mark (150-156)

```javascript
<g className="pointer-events-none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5 5">
  {(() => {
    const booth152 = booths.find(b => b.booth_number === 152);
    const booth154 = booths.find(b => b.booth_number === 154);
    const booth150 = booths.find(b => b.booth_number === 150);
    const booth156 = booths.find(b => b.booth_number === 156);
    if (!booth152 || !booth154 || !booth150 || !booth156) return null;
    
    const leftInner = booth152.x;
    const rightInner = booth154.x + booth154.width;
    const topInner = booth152.y;
    const bottomInner = booth150.y + booth150.height;
    
    return (
      <>
        {/* Top-left to bottom-right */}
        <line 
          x1={leftInner} 
          y1={topInner} 
          x2={rightInner} 
          y2={bottomInner}
        />
        {/* Top-right to bottom-left */}
        <line 
          x1={rightInner} 
          y1={topInner} 
          x2={leftInner} 
          y2={bottomInner}
        />
      </>
    );
  })()}
</g>
```

### C. Science Loop X-Mark (32-45)

```javascript
<g className="pointer-events-none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5 5">
  {(() => {
    const booth32 = booths.find(b => b.booth_number === 32);
    const booth36 = booths.find(b => b.booth_number === 36);
    const booth39 = booths.find(b => b.booth_number === 39);
    const booth43 = booths.find(b => b.booth_number === 43);
    if (!booth32 || !booth36 || !booth39 || !booth43) return null;
    
    const leftInner = booth32.x;
    const rightInner = booth36.x + booth36.width;
    const topInner = booth32.y;
    const bottomInner = booth43.y + booth43.height;
    
    return (
      <>
        {/* Top-left to bottom-right */}
        <line 
          x1={leftInner} 
          y1={topInner} 
          x2={rightInner} 
          y2={bottomInner}
        />
        {/* Top-right to bottom-left */}
        <line 
          x1={rightInner} 
          y1={topInner} 
          x2={leftInner} 
          y2={bottomInner}
        />
      </>
    );
  })()}
</g>
```

---

## 6. L-Shaped Booths (152, 154)

### Visual Structure

```
BOOTH 152 (L-shape-left)         BOOTH 154 (L-shape-right)
┌──────────────┐                 ┌──────────────┐
│   70px wide  │                 │   70px wide  │
│   60px tall  │                 │   60px tall  │
├──────┐       │                 │       ┌──────┤
│ 50px │       │                 │       │ 50px │
│ wide │                                 │ wide │
│ 48px │                                 │ 48px │
│ tall │                                 │ tall │
└──────┘                                 └──────┘
LEFT vertical bar                   RIGHT vertical bar
```

### Dimensions
- **Upper horizontal bar**: 70px wide × 60px tall (3.5m × 3m)
- **Lower vertical bar**: 50px wide × 48px tall (2.5m × 2.4m)
- **Total height**: 108px (5.4m)
- **Booth 152**: Vertical bar on LEFT side
- **Booth 154**: Vertical bar on RIGHT side

### Booth 152 (L-shape-left) - Path Definition

```javascript
const path = `
  M ${x} ${y}
  L ${x + 70} ${y}
  L ${x + 70} ${y + 60}
  L ${x + 50} ${y + 60}
  L ${x + 50} ${y + 108}
  L ${x} ${y + 108}
  Z
`;
```

**Step-by-step:**
1. Start at top-left (x, y)
2. Go RIGHT 70px to top-right
3. Go DOWN 60px (end of horizontal bar)
4. Go LEFT 20px to x+50 (step in)
5. Go DOWN 48px to y+108 (bottom of vertical bar)
6. Go LEFT 50px back to x (bottom-left)
7. Close path

### Booth 154 (L-shape-right) - Path Definition

```javascript
const path = `
  M ${x} ${y}
  L ${x + 70} ${y}
  L ${x + 70} ${y + 108}
  L ${x + 20} ${y + 108}
  L ${x + 20} ${y + 60}
  L ${x} ${y + 60}
  Z
`;
```

**Step-by-step:**
1. Start at top-left (x, y)
2. Go RIGHT 70px to top-right
3. Go DOWN 108px (full height on right side)
4. Go LEFT 50px to x+20 (bottom of vertical bar)
5. Go UP 48px to y+60 (top of vertical bar)
6. Go LEFT 20px back to x (end of horizontal bar)
7. Close path

### Mobile Implementation

```javascript
// Booth 152 - L-shape-left
const renderLShapedBoothLeft = (booth, color, isUserBooth) => {
  const path = `
    M ${booth.x} ${booth.y}
    L ${booth.x + 70} ${booth.y}
    L ${booth.x + 70} ${booth.y + 60}
    L ${booth.x + 50} ${booth.y + 60}
    L ${booth.x + 50} ${booth.y + 108}
    L ${booth.x} ${booth.y + 108}
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
  const path = `
    M ${booth.x} ${booth.y}
    L ${booth.x + 70} ${booth.y}
    L ${booth.x + 70} ${booth.y + 108}
    L ${booth.x + 20} ${booth.y + 108}
    L ${booth.x + 20} ${booth.y + 60}
    L ${booth.x} ${booth.y + 60}
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

// Usage in booth rendering
{BOOTH_DATA.map((booth) => {
  const boothColor = getBoothColor(booth);
  const isUserBooth = userId && booth.assigned_to === userId;
  
  if (booth.shape === 'l-shape-left') {
    return (
      <G key={booth.booth_id} onPress={() => handleBoothPress(booth)}>
        {renderLShapedBoothLeft(booth, boothColor, isUserBooth)}
        <SvgText
          x={booth.x + 35}
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
          x={booth.x + 35}
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

### MapData.js Updates

```javascript
{ booth_id: 152, booth_number: 152, x: 318, y: 80, width: 70, height: 108, zone_type: 'sponsor', shape: 'l-shape-left' },
{ booth_id: 154, booth_number: 154, x: 392, y: 80, width: 70, height: 108, zone_type: 'sponsor', shape: 'l-shape-right' }
```

---

## Summary - Implementation Checklist

### Brown Borders (#8B4513, 3px)
- [ ] Bottom section (1-12) - 8 line segments
- [ ] Right section (13-23) - 3 line segments
- [ ] Top-left section (96-107) - 5 line segments
- [ ] Top-right section (24-31) - 2 line segments

### Colored Loop Borders
- [ ] Blue engineering loop (82-95) - Rectangle, #3b82f6, 3px
- [ ] Red science loop (32-45) - Rectangle, #ef4444, 3px
- [ ] Purple sponsor loop (150-156) - Rectangle, #8b5cf6, 3px

### X-Mark Indicators (#94a3b8, 1px, dashed)
- [ ] Engineering courtyard (82-95) - 2 diagonal lines
- [ ] Sponsor courtyard (150-156) - 2 diagonal lines
- [ ] Science courtyard (32-45) - 2 diagonal lines

### L-Shaped Booths
- [ ] Update booth 152 shape to 'l-shape-left'
- [ ] Update booth 154 shape to 'l-shape-right'
- [ ] Create renderLShapedBoothLeft function
- [ ] Create renderLShapedBoothRight function
- [ ] Add conditional rendering logic
- [ ] Import Path from react-native-svg
- [ ] Test with sponsor purple color (#8B5CF6)

### Required Imports
```javascript
import { Svg, G, Rect, Line, Path, Text as SvgText } from 'react-native-svg';
```
