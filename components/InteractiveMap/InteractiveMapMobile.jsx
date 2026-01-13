import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line, Path, Defs, Pattern, Circle } from 'react-native-svg';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ZONES, getZoneByBoothNumber, CANVAS_WIDTH, CANVAS_HEIGHT, BOOTH_DATA } from './mapData';
import { Colors } from '../../constants/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ZONE_COLORS = {
  engineering: '#0EA5E9',
  sponsor: '#8B5CF6',
  service: '#F59E0B',
  science: '#EF4444',
  standard: '#6b7280'
};

const InteractiveMapMobile = ({ 
  booths = [], 
  onBoothPress,
  userBooth = null,
  isAdmin = false,
  highlightBoothNumber = null,
  onToggleFullscreen,
  isFullscreen = false,
  onBoothDrag,
  onBoothDragEnd
}) => {
  const [scale, setScale] = useState(0.25);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [draggingBooth, setDraggingBooth] = useState(null);
  
  const baseScale = useRef(0.35);
  const pinchScale = useRef(1);
  const lastScale = useRef(0.35);
  const lastTranslate = useRef({ x: 50, y: 100 });

  // Get booth color based on status and zone
  const getBoothColor = (booth) => {
    if (userBooth && booth.booth_number === userBooth) {
      return '#10B981'; // Green for user's booth
    }
    
    const isAssigned = booth.assigned_to_project || booth.assigned_to_company || booth.assigned_to_student_id || booth.assigned_to_company_id || booth.status !== 'available';
    
    // All booths use the same base zone color
    const baseColor = ZONE_COLORS[booth.zone_type] || '#94a3b8';
    
    // Assigned booths get slightly lighter version (20% lighter)
    if (isAssigned) {
      const slightlyLighter = {
        engineering: '#3EB5F5',  // Slightly lighter blue
        science: '#F87171',      // Slightly lighter red
        sponsor: '#A78BFA',      // Slightly lighter purple
        service: '#FBBF24',      // Slightly lighter amber
      };
      return slightlyLighter[booth.zone_type] || baseColor;
    }
    
    return baseColor;
  };

  // Get booth opacity
  const getBoothOpacity = (booth) => {
    const isAssigned = booth.assigned_to_project || booth.assigned_to_company || booth.assigned_to_student_id || booth.assigned_to_company_id || booth.status !== 'available';
    return isAssigned ? 0.95 : 1.0; // Just slightly more transparent when assigned
  };

  // Render L-shaped booth (corrected: horizontal at top, vertical extends down)
  const renderLShapedBooth = (booth, isLeft) => {
    const { x, y } = booth;
    const horizontalWidth = 70;  // 3.5m
    const horizontalHeight = 60; // 3m
    const verticalWidth = 50;    // 2.5m
    const verticalHeight = 48;   // 2.4m
    
    let path;
    if (isLeft) {
      // Booth 152: Horizontal bar at top, vertical bar extends down on LEFT
      path = `M ${x} ${y} 
              L ${x + horizontalWidth} ${y} 
              L ${x + horizontalWidth} ${y + horizontalHeight} 
              L ${x + verticalWidth} ${y + horizontalHeight} 
              L ${x + verticalWidth} ${y + horizontalHeight + verticalHeight} 
              L ${x} ${y + horizontalHeight + verticalHeight} 
              Z`;
    } else {
      // Booth 154: Horizontal bar at top, vertical bar extends down on RIGHT
      const verticalOffset = horizontalWidth - verticalWidth; // 20px from left
      path = `M ${x} ${y} 
              L ${x + horizontalWidth} ${y} 
              L ${x + horizontalWidth} ${y + horizontalHeight + verticalHeight} 
              L ${x + verticalOffset} ${y + horizontalHeight + verticalHeight} 
              L ${x + verticalOffset} ${y + horizontalHeight} 
              L ${x} ${y + horizontalHeight} 
              Z`;
    }
    
    return path;
  };

  // Handle zoom
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.15, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.15, 0.2));
  };

  const handleResetView = () => {
    setScale(0.25);
    setTranslateX(0);
    setTranslateY(0);
    lastScale.current = 0.25;
    baseScale.current = 0.25;
    lastTranslate.current = { x: 0, y: 0 };
  };

  // Helper to find booth by number
  const findBooth = (boothNumber) => {
    const found = booths.find(b => (b.booth_number === boothNumber || b.boothNumber === boothNumber));
    // Fallback to BOOTH_DATA if not found in booths prop (for borders)
    if (!found) {
      return BOOTH_DATA.find(b => b.booth_number === boothNumber);
    }
    return found;
  };

  // Handle booth dragging (for admin only)
  const handleBoothLongPress = (booth) => {
    if (isAdmin && onBoothDrag) {
      setDraggingBooth(booth.booth_number);
    }
  };

  const handleBoothDragMove = (booth, event) => {
    if (isAdmin && draggingBooth === booth.booth_number && onBoothDrag) {
      // Convert screen coordinates to canvas coordinates
      const canvasX = (event.nativeEvent.locationX - translateX) / scale;
      const canvasY = (event.nativeEvent.locationY - translateY) / scale;
      onBoothDrag(booth.booth_number, canvasX, canvasY);
    }
  };

  const handleBoothDragEnd = (booth) => {
    if (isAdmin && draggingBooth === booth.booth_number && onBoothDragEnd) {
      onBoothDragEnd(booth.booth_number, booth.x, booth.y);
      setDraggingBooth(null);
    }
  };

  // Handle pinch gesture
  const onPinchEvent = (event) => {
    pinchScale.current = event.nativeEvent.scale;
    const newScale = baseScale.current * pinchScale.current;
    setScale(Math.max(0.2, Math.min(newScale, 2)));
  };

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current = scale;
      baseScale.current = scale;
      pinchScale.current = 1;
    }
  };

  // Handle pan gesture
  const onPanEvent = (event) => {
    setTranslateX(lastTranslate.current.x + event.nativeEvent.translationX);
    setTranslateY(lastTranslate.current.y + event.nativeEvent.translationY);
  };

  const onPanStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastTranslate.current = {
        x: translateX,
        y: translateY
      };
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Container */}
      <PanGestureHandler
        onGestureEvent={onPanEvent}
        onHandlerStateChange={onPanStateChange}
        minPointers={1}
        maxPointers={1}
      >
        <View style={styles.mapWrapper}>
          <PinchGestureHandler
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}
          >
            <View style={styles.svgContainer}>
              <Svg
                width={CANVAS_WIDTH * scale}
                height={CANVAS_HEIGHT * scale}
                viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                style={{
                  transform: [
                    { translateX },
                    { translateY }
                  ]
                }}
              >
                {/* Background Grid Pattern */}
                <Defs>
                  <Pattern
                    id="dotGrid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <Circle cx="2" cy="2" r="1" fill="#e2e8f0" />
                  </Pattern>
                </Defs>
                
                <Rect
                  x="0"
                  y="0"
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill="url(#dotGrid)"
                />

                {/* === STRUCTURAL BORDERS=== */}
                <G stroke="#8B4513" strokeWidth="4">
                
                {/* 1. Top-Left Corner (96-107) borders */}
                {findBooth(103) && findBooth(96) && findBooth(107) && findBooth(1) && (
                  <>
                    {/* Left vertical wall from 103 down past 107 to booth 1 level */}
                    <Line 
                      x1={findBooth(103).x} 
                      y1={findBooth(107).y + findBooth(107).height} 
                      x2={findBooth(103).x} 
                      y2={findBooth(103).y} 
                    />
                    {/* Top horizontal wall from 103 to 96 */}
                    <Line 
                      x1={findBooth(103).x} 
                      y1={findBooth(103).y} 
                      x2={findBooth(96).x + findBooth(96).width} 
                      y2={findBooth(103).y} 
                    />
                    {/* Short vertical stub down from 96 */}
                    <Line 
                      x1={findBooth(96).x + findBooth(96).width} 
                      y1={findBooth(103).y} 
                      x2={findBooth(96).x + findBooth(96).width} 
                      y2={findBooth(103).y + findBooth(96).height} 
                    />
                    {/* Short vertical stub up from 96 */}
                    <Line 
                      x1={findBooth(96).x + findBooth(96).width} 
                      y1={findBooth(103).y} 
                      x2={findBooth(96).x + findBooth(96).width} 
                      y2={findBooth(103).y - 2 * 20} 
                    />
                    {/* Left vertical wall continuing down to booth 1 level */}
                    <Line 
                      x1={findBooth(103).x} 
                      y1={findBooth(107).y + findBooth(107).height} 
                      x2={findBooth(103).x} 
                      y2={findBooth(1).y} 
                    />
                  </>
                )}

                {/* 2. Bottom strips (booths 1-12) borders */}
                {findBooth(1) && findBooth(6) && findBooth(7) && findBooth(12) && (
                  <>
                    {/* Bottom horizontal line under booths 1-6 */}
                    <Line 
                      x1={findBooth(1).x} 
                      y1={findBooth(1).y + findBooth(1).height} 
                      x2={findBooth(6).x + findBooth(6).width} 
                      y2={findBooth(1).y + findBooth(1).height} 
                    />
                    {/* Bottom horizontal line under booths 7-12 */}
                    <Line 
                      x1={findBooth(7).x} 
                      y1={findBooth(7).y + findBooth(7).height} 
                      x2={findBooth(12).x + findBooth(12).width} 
                      y2={findBooth(7).y + findBooth(7).height} 
                    />
                    {/* Left side - horizontal left from TOP LEFT corner of booth 1 */}
                    <Line 
                      x1={findBooth(1).x} 
                      y1={findBooth(1).y} 
                      x2={findBooth(1).x - 6.6 * 20} 
                      y2={findBooth(1).y} 
                    />
                    {/* Left side - vertical down */}
                    <Line 
                      x1={findBooth(1).x - 6.6 * 20} 
                      y1={findBooth(1).y} 
                      x2={findBooth(1).x - 6.6 * 20} 
                      y2={findBooth(1).y + findBooth(1).height + 1.5 * 20} 
                    />
                    {/* Vertical line from bottom right of booth 6 going down 1.5m */}
                    <Line 
                      x1={findBooth(6).x + findBooth(6).width} 
                      y1={findBooth(1).y + findBooth(1).height} 
                      x2={findBooth(6).x + findBooth(6).width} 
                      y2={findBooth(1).y + findBooth(1).height + 1.5 * 20} 
                    />
                    {/* Vertical line from bottom left of booth 7 going down 1.5m */}
                    <Line 
                      x1={findBooth(7).x} 
                      y1={findBooth(7).y + findBooth(7).height} 
                      x2={findBooth(7).x} 
                      y2={findBooth(7).y + findBooth(7).height + 1.5 * 20} 
                    />
                    {/* Right side - horizontal right from TOP RIGHT corner of booth 12 */}
                    <Line 
                      x1={findBooth(12).x + findBooth(12).width} 
                      y1={findBooth(12).y} 
                      x2={findBooth(12).x + findBooth(12).width + 6.6 * 20} 
                      y2={findBooth(12).y} 
                    />
                    {/* Right side - vertical down */}
                    <Line 
                      x1={findBooth(12).x + findBooth(12).width + 6.6 * 20} 
                      y1={findBooth(12).y} 
                      x2={findBooth(12).x + findBooth(12).width + 6.6 * 20} 
                      y2={findBooth(12).y + findBooth(12).height + 1.5 * 20} 
                    />
                  </>
                )}

                {/* 3. L-shaped section (booths 13-23) borders */}
                {findBooth(13) && findBooth(16) && findBooth(23) && findBooth(12) && (
                  <>
                    {/* Bottom horizontal line under booths 13-16 */}
                    <Line 
                      x1={findBooth(13).x} 
                      y1={findBooth(13).y + findBooth(13).height} 
                      x2={findBooth(16).x + findBooth(16).width} 
                      y2={findBooth(13).y + findBooth(13).height} 
                    />
                    {/* Right vertical line from top to bottom */}
                    <Line 
                      x1={findBooth(16).x + findBooth(16).width} 
                      y1={findBooth(23).y} 
                      x2={findBooth(16).x + findBooth(16).width} 
                      y2={findBooth(13).y + findBooth(13).height} 
                    />
                    {/* Vertical line from bottom left of booth 13 down to same level as booth 12's border */}
                    <Line 
                      x1={findBooth(13).x} 
                      y1={findBooth(13).y + findBooth(13).height} 
                      x2={findBooth(13).x} 
                      y2={findBooth(12).y + findBooth(12).height + 1.5 * 20} 
                    />
                  </>
                )}

                {/* 4. Top strip (booths 24-31) borders */}
                {findBooth(24) && findBooth(31) && findBooth(23) && (
                  <>
                    {/* Top horizontal line extending to right edge of booth 23 */}
                    <Line 
                      x1={findBooth(31).x} 
                      y1={findBooth(24).y} 
                      x2={findBooth(23).x + findBooth(23).width} 
                      y2={findBooth(24).y} 
                    />
                    {/* Vertical line going up from top-left corner of booth 31 */}
                    <Line 
                      x1={findBooth(31).x} 
                      y1={findBooth(24).y} 
                      x2={findBooth(31).x} 
                      y2={findBooth(24).y - 2 * 20} 
                    />
                  </>
                )}

                {/* 6. Center Sponsors (150-156) - Complete rectangular border */}
                {findBooth(150) && findBooth(152) && findBooth(154) && (
                  <>
                    <Line 
                      x1={findBooth(152).x} 
                      y1={findBooth(152).y} 
                      x2={findBooth(154).x + 70} 
                      y2={findBooth(152).y} 
                    />
                    <Line 
                      x1={findBooth(154).x + 70} 
                      y1={findBooth(152).y} 
                      x2={findBooth(154).x + 70} 
                      y2={findBooth(150).y + findBooth(150).height} 
                    />
                    <Line 
                      x1={findBooth(152).x} 
                      y1={findBooth(150).y + findBooth(150).height} 
                      x2={findBooth(154).x + 70} 
                      y2={findBooth(150).y + findBooth(150).height} 
                    />
                    <Line 
                      x1={findBooth(152).x} 
                      y1={findBooth(152).y} 
                      x2={findBooth(152).x} 
                      y2={findBooth(150).y + findBooth(150).height} 
                    />
                  </>
                )}
                </G>

                {/* 5. X-mark inside Left Engineering Loop (82-95) */}
                {findBooth(89) && findBooth(86) && findBooth(82) && findBooth(93) && (
                  <G stroke="#0891b2" strokeWidth="1.5" strokeDasharray="5,5" opacity="0.4">
                    {/* First diagonal */}
                    <Line 
                      x1={findBooth(93).x + findBooth(93).width} 
                      y1={findBooth(93).y} 
                      x2={findBooth(86).x} 
                      y2={findBooth(86).y + findBooth(86).height} 
                    />
                    {/* Second diagonal */}
                    <Line 
                      x1={findBooth(89).x} 
                      y1={findBooth(89).y} 
                      x2={findBooth(82).x + findBooth(82).width} 
                      y2={findBooth(82).y + findBooth(82).height} 
                    />
                  </G>
                )}

                {/* 6. Center Sponsors (150-156) - Complete rectangular border */}
                {findBooth(150) && findBooth(152) && findBooth(154) && (
                  <G stroke="#8B4513" strokeWidth="3">
                    <Line 
                      x1={findBooth(152).x} 
                      y1={findBooth(152).y} 
                      x2={findBooth(154).x + 70} 
                      y2={findBooth(152).y} 
                    />
                    <Line 
                      x1={findBooth(154).x + 70} 
                      y1={findBooth(152).y} 
                      x2={findBooth(154).x + 70} 
                      y2={findBooth(150).y + findBooth(150).height} 
                    />
                    <Line 
                      x1={findBooth(152).x} 
                      y1={findBooth(150).y + findBooth(150).height} 
                      x2={findBooth(154).x + 70} 
                      y2={findBooth(150).y + findBooth(150).height} 
                    />
                    <Line 
                      x1={findBooth(152).x} 
                      y1={findBooth(152).y} 
                      x2={findBooth(152).x} 
                      y2={findBooth(150).y + findBooth(150).height} 
                    />
                  </G>
                )}

                {/* 7. X-mark inside Right Loop (32-45) */}
                {findBooth(32) && findBooth(36) && findBooth(39) && findBooth(43) && (
                  <G stroke="#7f1d1d" strokeWidth="1.5" strokeDasharray="5,5" opacity="0.4">
                    {/* First diagonal: bottom right of 32 to top left of 39 */}
                    <Line 
                      x1={findBooth(32).x + findBooth(32).width} 
                      y1={findBooth(32).y + findBooth(32).height} 
                      x2={findBooth(39).x} 
                      y2={findBooth(39).y} 
                    />
                    {/* Second diagonal: bottom left of 36 to top right of 43 */}
                    <Line 
                      x1={findBooth(36).x} 
                      y1={findBooth(36).y + findBooth(36).height} 
                      x2={findBooth(43).x + findBooth(43).width} 
                      y2={findBooth(43).y} 
                    />
                  </G>
                )}

                {/* Booths */}
                {booths.map((booth) => {
                  const boothColor = getBoothColor(booth);
                  const boothOpacity = getBoothOpacity(booth);
                  const isUserBooth = userBooth && (booth.booth_number === userBooth || booth.boothNumber === userBooth);
                  const isHighlighted = highlightBoothNumber && (booth.booth_number === highlightBoothNumber || booth.boothNumber === highlightBoothNumber);
                  const isDragging = draggingBooth === booth.booth_number;
                  const isLShapeLeft = booth.shape === 'l-shape-left';
                  const isLShapeRight = booth.shape === 'l-shape-right';

                  return (
                    <G
                      key={booth.booth_id || booth.boothNumber}
                      onPress={() => {
                        if (!isDragging) {
                          onBoothPress && onBoothPress(booth);
                        }
                      }}
                      onLongPress={() => handleBoothLongPress(booth)}
                    >
                      {/* Booth Shape */}
                      {isLShapeLeft || isLShapeRight ? (
                        <Path
                          d={renderLShapedBooth(booth, isLShapeLeft)}
                          fill={boothColor}
                          opacity={isDragging ? 0.7 : boothOpacity}
                          stroke={
                            isDragging ? '#FFA500' :
                            isHighlighted ? '#10B981' : 
                            isUserBooth ? '#8B5CF6' : 
                            'rgba(0,0,0,0.05)'
                          }
                          strokeWidth={isDragging ? 8 : (isHighlighted || isUserBooth ? 6 : 3)}
                        />
                      ) : (
                        <Rect
                          x={booth.x}
                          y={booth.y}
                          width={booth.width}
                          height={booth.height}
                          fill={boothColor}
                          opacity={isDragging ? 0.7 : boothOpacity}
                          stroke={
                            isDragging ? '#FFA500' :
                            isHighlighted ? '#10B981' : 
                            isUserBooth ? '#8B5CF6' : 
                            'rgba(0,0,0,0.05)'
                          }
                          strokeWidth={isDragging ? 8 : (isHighlighted || isUserBooth ? 6 : 3)}
                          rx={4}
                        />
                      )}

                      {/* Booth Number */}
                      <SvgText
                        x={booth.x + booth.width / 2}
                        y={booth.y + (isLShapeLeft || isLShapeRight ? 35 : booth.height / 2 + 5)}
                        fontSize="12"
                        fontWeight="bold"
                        fill="#ffffff"
                        textAnchor="middle"
                      >
                        {booth.booth_number || booth.boothNumber}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>
            </View>
          </PinchGestureHandler>
        </View>
      </PanGestureHandler>

      {/* Enhanced Zoom Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
          <Ionicons name="remove" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlButton, styles.fitButton]} 
          onPress={onToggleFullscreen}
        >
          <Ionicons name={isFullscreen ? "contract" : "expand"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Admin Drag Mode Indicator */}
      {isAdmin && (
        <View style={styles.dragModeIndicator}>
          <Ionicons name="hand-left" size={16} color="#8B5CF6" />
          <Text style={styles.dragModeText}>Long-press booth to drag</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mapWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  svgContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    gap: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.mainColor || '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  fitButton: {
    backgroundColor: '#10B981',
  },
  dragModeIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  dragModeText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default InteractiveMapMobile;
