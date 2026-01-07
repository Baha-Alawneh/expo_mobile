# Fix L-Shaped Booths (152 & 154) - Correction Based on Web Reference

## Issue
The L-shaped booths 152 and 154 are not rendering correctly. Looking at the web implementation, the L-shapes have the wrong orientation.

## Web Reference Analysis

From the web map image, booths 152 and 154 have this structure:

### Booth 152 (Left L-Shape)
**Position**: (710, 92), Width: 70px, Height: 108px

**Correct Structure**:
```
The L-shape consists of:
1. A WIDE HORIZONTAL BAR at the TOP (full width 70px)
2. A NARROW VERTICAL BAR extending DOWN from the LEFT side

Visual representation:
┌─────────────┐  ← Top horizontal bar (70px wide, ~40px tall)
│             │
├──┐          
│  │          ← Narrow vertical bar (35px wide, extends down ~68px)
│  │
│  │
└──┘

The booth looks like a backwards "⌐" shape
```

**Path Definition** (corrected):
```javascript
const renderLShapeBooth152 = (x, y, width, height) => {
  // width = 70px, height = 108px
  // Top horizontal section: Full width (70px), height ~37% of total (~40px)
  // Bottom vertical section: Left side only, width ~50% of total (35px), extends to bottom
  
  const verticalWidth = width * 0.5;  // 35px - width of the narrow vertical bar
  const topBarHeight = height * 0.37; // 40px - height of the top horizontal bar
  
  // Start from top-left, draw clockwise
  const path = `
    M ${x} ${y}
    L ${x + width} ${y}
    L ${x + width} ${y + topBarHeight}
    L ${x + verticalWidth} ${y + topBarHeight}
    L ${x + verticalWidth} ${y + height}
    L ${x} ${y + height}
    Z
  `;
  
  return <Path d={path} fill={color} stroke={strokeColor} />;
};
```

### Booth 154 (Right L-Shape - Mirrored)
**Position**: (848, 92), Width: 70px, Height: 108px

**Correct Structure**:
```
The L-shape is MIRRORED from 152:
1. A WIDE HORIZONTAL BAR at the TOP (full width 70px)
2. A NARROW VERTICAL BAR extending DOWN from the RIGHT side

Visual representation:
┌─────────────┐  ← Top horizontal bar (70px wide, ~40px tall)
│             │
          ┌──┤
          │  │  ← Narrow vertical bar (35px wide, extends down ~68px)
          │  │
          │  │
          └──┘

The booth looks like a "¬" shape
```

**Path Definition** (corrected):
```javascript
const renderLShapeBooth154 = (x, y, width, height) => {
  // width = 70px, height = 108px
  // Top horizontal section: Full width (70px), height ~37% of total (~40px)
  // Bottom vertical section: Right side only, width ~50% of total (35px), extends to bottom
  
  const verticalWidth = width * 0.5;  // 35px - width of the narrow vertical bar
  const topBarHeight = height * 0.37; // 40px - height of the top horizontal bar
  
  // Start from top-left, draw clockwise
  const path = `
    M ${x} ${y}
    L ${x + width} ${y}
    L ${x + width} ${y + height}
    L ${x + width - verticalWidth} ${y + height}
    L ${x + width - verticalWidth} ${y + topBarHeight}
    L ${x} ${y + topBarHeight}
    Z
  `;
  
  return <Path d={path} fill={color} stroke={strokeColor} />;
};
```

## Current Implementation (WRONG)

The current code has the vertical bar extending down from the BOTTOM, which is incorrect:
- Current: Vertical bar at bottom, horizontal extends at bottom level
- Correct: Horizontal bar at TOP, vertical extends down from top bar

## Booth Number Label Position

Since the L-shapes have most of their mass at the top, adjust the label position:

```javascript
// For L-shaped booths, position label higher (in the top horizontal bar)
const labelY = booth.shape === 'l-shape-left' || booth.shape === 'l-shape-right'
  ? booth.y + (booth.height * 0.2)  // Position in top 37% bar
  : booth.y + booth.height / 2;      // Center for regular booths

<SvgText
  x={booth.x + booth.width / 2}
  y={labelY}
  fontSize="14"
  fontWeight="bold"
  fill={boothOpacity > 0.5 ? '#fff' : '#374151'}
  textAnchor="middle"
>
  {booth.booth_number}
</SvgText>
```

## Summary of Changes

1. **Booth 152**: Top horizontal bar (full width) + left vertical bar extending down
2. **Booth 154**: Top horizontal bar (full width) + right vertical bar extending down
3. **Proportions**: Top bar is ~37% of total height, vertical bar is ~50% of total width
4. **Label position**: Move to upper portion of L-shape for better visibility

## Visual Comparison

**WRONG (Current)**:
```
152:          154:
     ┌──┐     ┌──┐
     │  │     │  │
┌────┘  │     │  └────┐
└───────┘     └───────┘
```

**CORRECT (Should Be)**:
```
152:          154:
┌────────┐    ┌────────┐
│        │    │        │
├──┐            ┌──┤
│  │            │  │
│  │            │  │
└──┘            └──┘
```

## Implementation Note

Make sure the X-mark in the sponsor courtyard (150-156) accounts for this correct L-shape geometry when calculating the diagonal lines.
