import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line, Path, Defs, Pattern, Circle } from 'react-native-svg';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ZONES, CANVAS_WIDTH, CANVAS_HEIGHT } from './mapData';
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
  borders = [],
  buildings = [],
  onBoothPress,
  onBuildingPress,
  userBooth = null,
  isAdmin = false,
  highlightBoothNumber = null,
  onToggleFullscreen,
  isFullscreen = false,
  onBoothDrag,
  onBoothDragEnd
}) => {
  // Divisor 2.5: bigger canvas (9600×6400), bigger booths AND distances
  // Start zoomed out to fit booths on screen without scrolling
  const [scale, setScale] = useState(0.5);
  const [translateX, setTranslateX] = useState(1550);
  const [translateY, setTranslateY] = useState(250);
  const [draggingBooth, setDraggingBooth] = useState(null);
  
  const baseScale = useRef(0.5);
  const pinchScale = useRef(1);
  const lastScale = useRef(0.5);
  const lastTranslate = useRef({ x: 1550, y: 250 });

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
    const { x, y, width, height } = booth;
    // L-shape proportions: horizontal bar at top, vertical extension below
    const horizontalWidth = width;  
    const horizontalHeight = height * 0.55;
    const verticalWidth = width * 0.7;
    const verticalHeight = height * 0.45;
    
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
    setScale(0.8);
    setTranslateX(0);
    setTranslateY(0);
    lastScale.current = 0.8;
    baseScale.current = 0.8;
    lastTranslate.current = { x: 0, y: 0 };
  };

  // Helper to find booth by number
  const findBooth = (boothNumber) => {
    return booths.find(b => (b.booth_number === boothNumber || b.boothNumber === boothNumber));
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

                {/* Database Borders - scaled by divisor 2.5 */}
                {borders && borders.length > 0 && borders.map((border, index) => {
                  // Scale border coordinates using divisor 2.5
                  const scaledBorder = {
                    x1: (border.x1 || 0) / 2.5,
                    y1: (border.y1 || 0) / 2.5,
                    x2: (border.x2 || 0) / 2.5,
                    y2: (border.y2 || 0) / 2.5,
                    thickness: Math.max(1, (border.thickness || 2) / 2.5),
                    color: border.color || '#94a3b8',
                    strokeStyle: border.stroke_style || 'solid'
                  };

                  // Determine stroke dash array based on style
                  const strokeDasharray = scaledBorder.strokeStyle === 'dashed' ? '5,5' : 
                                         scaledBorder.strokeStyle === 'dotted' ? '2,2' : 
                                         undefined;

                  return (
                    <Line
                      key={border.border_id || `border-${index}`}
                      x1={scaledBorder.x1}
                      y1={scaledBorder.y1}
                      x2={scaledBorder.x2}
                      y2={scaledBorder.y2}
                      stroke={scaledBorder.color}
                      strokeWidth={scaledBorder.thickness}
                      strokeDasharray={strokeDasharray}
                      opacity={0.8}
                    />
                  );
                })}

                {/* Database Buildings - scaled by divisor 2.5 */}
                {buildings && buildings.length > 0 && buildings.map((building, index) => {
                  // Scale building coordinates using divisor 2.5
                  const scaledBuilding = {
                    x: (building.x || 0) / 2.5,
                    y: (building.y || 0) / 2.5,
                    width: (building.width || 0) / 2.5,
                    height: (building.height || 0) / 2.5,
                    color: building.color || '#ffffff',
                    strokeColor: building.stroke_color || '#6b7280',
                    labelColor: building.label_color || '#374151',
                    name: building.name || building.building_number || '',
                  };

                  // Calculate label position (centered)
                  const labelX = scaledBuilding.x + scaledBuilding.width / 2;
                  const labelY = scaledBuilding.y + scaledBuilding.height / 2;

                  return (
                    <G 
                      key={building.building_id || `building-${index}`}
                      onPress={() => onBuildingPress && onBuildingPress(building)}
                    >
                      {/* Building background with fill */}
                      <Rect
                        x={scaledBuilding.x}
                        y={scaledBuilding.y}
                        width={scaledBuilding.width}
                        height={scaledBuilding.height}
                        fill={scaledBuilding.color}
                        stroke={scaledBuilding.strokeColor}
                        strokeWidth={2}
                        opacity={0.9}
                      />
                      {/* Building label */}
                      {scaledBuilding.name && (
                        <SvgText
                          x={labelX}
                          y={labelY}
                          fill={scaledBuilding.labelColor}
                          fontSize="16"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {building.building_number ? `#${building.building_number} ` : ''}{scaledBuilding.name}
                        </SvgText>
                      )}
                    </G>
                  );
                })}

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
