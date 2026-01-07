# Interactive Expo Map - Mobile Implementation

A fully interactive exhibition floor plan for React Native showing White Plaza booth layout at Najah National University.

## 📱 Features

### For All Users
- **Interactive SVG Map**: Pan, zoom, and tap booths to view details
- **Visual Legend**: Color-coded zones (Engineering, Sponsor, Service, Science)
- **Booth Information**: View booth assignments, dimensions, and location
- **My Booth Navigation**: Quick button to find your assigned booth (highlighted in green)
- **Smooth Gestures**: Pinch-to-zoom and pan navigation
- **Offline Support**: Map layout cached, fresh data fetched when online

### For Admin Users
- **Assign/De-assign**: Tap booth → Assign to project/company or remove assignment
- **Visual Feedback**: Assigned booths show zone colors, unassigned are gray
- **Direct Navigation**: Tap assigned booth → View project/company details

## 🗂️ File Structure

```
expo/
├── components/
│   └── InteractiveMap/
│       ├── InteractiveMapMobile.jsx    # Main map component (SVG rendering)
│       ├── BoothDetailsModal.jsx       # Booth info modal
│       ├── MapLegend.jsx               # Color legend panel
│       └── mapData.js                  # Booth layout data (156 booths)
└── screens/
    ├── MapScreenNew.jsx                # New interactive map screen
    └── MapScreen.jsx                   # Old placeholder (can be replaced)
```

## 🚀 Usage

### 1. Replace Old Map Screen

In your navigation file (e.g., `Student.jsx`, `Company.jsx`, `Admin.jsx`):

```jsx
import MapScreenNew from '../screens/MapScreenNew';

// In your navigator:
<Stack.Screen
  name="Map"
  component={MapScreenNew}
  options={{ title: 'Expo Map' }}
  initialParams={{
    userRole: user?.role,
    userId: user?.id
  }}
/>
```

### 2. API Integration

The map expects these backend endpoints:

```
GET  /api/v1/booths              - Fetch all booths with assignments
POST /api/v1/booths/:id/deassign - Remove booth assignment
POST /api/v1/booths/:id/assign   - Assign booth to project/company
```

**Booth Response Format:**
```json
{
  "booth_id": 1,
  "booth_number": 1,
  "zone_type": "engineering",
  "assigned_to_project": 123,
  "assigned_to_company": null,
  "project_name": "Smart Campus Navigator",
  "company_name": null,
  "logo_url": "https://...",
  "description": "..."
}
```

### 3. Pass User Context

```jsx
<MapScreenNew
  navigation={navigation}
  userRole={user?.role}      // 'admin' | 'student' | 'company'
  userId={user?.id}          // Current user ID
/>
```

## 🎨 Map Layout

- **156 Booths** organized in 4 zones
- **Engineering Zone** (Top Left): Booths 1-50
- **Sponsor Zone** (Top Right): Booths 51-80
- **Service Zone** (Bottom Left): Booths 81-120
- **Science Zone** (Bottom Right): Booths 121-156

## 🔧 Customization

### Modify Booth Layout

Edit `mapData.js` to change booth positions, sizes, or add more booths:

```js
booths.push({
  booth_id: 157,
  booth_number: 157,
  x: 100,              // X position in pixels
  y: 100,              // Y position in pixels
  width: 100,          // Width in pixels (100px = 5m)
  height: 100,         // Height in pixels
  zone_type: 'engineering',
  shape: 'rectangle'   // 'rectangle' | 'l-left' | 'l-right'
});
```

### Change Colors

Update zone colors in `mapData.js`:

```js
export const ZONES = {
  ENGINEERING: {
    color: '#0EA5E9',  // Change this
    // ...
  }
};
```

## 📦 Dependencies

All required packages are already in your `package.json`:

- `react-native-svg` (15.12.1) - SVG rendering
- `react-native-gesture-handler` (2.28.0) - Pan/zoom gestures
- `@react-native-async-storage/async-storage` - Offline caching
- `axios` or `fetch` - API calls

## 🐛 Troubleshooting

### Map not rendering?
- Ensure `react-native-gesture-handler` is properly installed
- Check that SVG components are imported correctly

### Booths not clickable?
- Verify `onPress` is enabled in SVG `<G>` component
- Check that GestureHandler is wrapping the SVG properly

### API errors?
- Verify backend is running and accessible
- Check token in AsyncStorage: `await AsyncStorage.getItem('token')`
- Fallback to layout-only data is built-in

## 🚀 Next Steps

1. **Search Feature**: Add search bar to find booths by number/name
2. **Auto-Assignment**: Admin button to auto-assign all projects/companies
3. **Filters**: Show only assigned/unassigned booths
4. **Animations**: Add pulsing effect for user's booth
5. **Export**: Generate PDF map of current layout

## 📝 Notes

- Map uses 20px = 1 meter scale (100px booth = 5m × 5m)
- Canvas size: 2800×1400px (140m × 70m)
- Initial zoom: 0.4x (fits most screens)
- Max zoom: 2x, Min zoom: 0.3x
