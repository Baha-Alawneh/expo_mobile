import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import {
  getUserRegistrations,
  getTopRatedProjects,
  getTopRatedOfferings,
} from '../apis/admin/Admin';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 60;
const CHART_HEIGHT = 250;

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [registrations, setRegistrations] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const [topOfferings, setTopOfferings] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Fetch projects and offerings once on mount
  useEffect(() => {
    fetchProjectsAndOfferings();
  }, []);

  // Fetch registrations when time range changes
  useEffect(() => {
    fetchRegistrations();
  }, [timeRange]);

  const fetchRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      const regResponse = await getUserRegistrations(timeRange);
      console.log('Registrations response:', regResponse);

      if (regResponse.success) {
        setRegistrations(regResponse.data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const fetchProjectsAndOfferings = async () => {
    setLoading(true);
    try {
      const [projectsResponse, offeringsResponse] = await Promise.all([
        getTopRatedProjects(),
        getTopRatedOfferings(),
      ]);

      console.log('Projects response:', projectsResponse);
      console.log('Offerings response:', offeringsResponse);

      if (projectsResponse.success) {
        console.log('Setting top projects:', projectsResponse.data);
        setTopProjects(projectsResponse.data);
      }
      if (offeringsResponse.success) {
        console.log('Setting top offerings:', offeringsResponse.data);
        setTopOfferings(offeringsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLineChart = () => {
    if (!registrations || registrations.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No registration data available</Text>
        </View>
      );
    }

    const maxCount = Math.max(...registrations.map(r => r.count), 1);
    const padding = 40;
    const chartInnerWidth = CHART_WIDTH - padding * 2;
    const chartInnerHeight = CHART_HEIGHT - padding * 2;
    
    // Fix xStep calculation to avoid division by zero
    const xStep = registrations.length > 1 
      ? chartInnerWidth / (registrations.length - 1) 
      : chartInnerWidth / 2;
    
    // Calculate y-axis maximum and step for correct scaling
    const yMax = maxCount;
    const yStep = Math.max(1, Math.ceil(yMax / 4));

    return (
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.chart}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (chartInnerHeight / 4) * i;
          const value = Math.round(yStep * (4 - i));
          return (
            <G key={`grid-${i}`}>
              <Line
                x1={padding}
                y1={y}
                x2={CHART_WIDTH - padding}
                y2={y}
                stroke="#E8E8E8"
                strokeWidth="1"
              />
              <SvgText
                x={padding - 10}
                y={y + 5}
                fontSize="10"
                fill="#666"
                textAnchor="end"
              >
                {value}
              </SvgText>
            </G>
          );
        })}

        {/* Line and points */}
        {registrations.map((item, index) => {
          const x = padding + xStep * index;
          // Calculate y position correctly based on actual value and yMax
          const y = padding + chartInnerHeight - (item.count / yMax) * chartInnerHeight;
          
          // Determine how many labels to show based on data length
          let labelInterval;
          if (registrations.length <= 7) {
            labelInterval = 1; // Show all dates for week view
          } else if (registrations.length <= 30) {
            labelInterval = Math.ceil(registrations.length / 6); // Show ~6 labels for month
          } else {
            labelInterval = Math.ceil(registrations.length / 8); // Show ~8 labels for all time
          }
          
          // Draw line to next point
          if (index < registrations.length - 1) {
            const nextItem = registrations[index + 1];
            const nextX = padding + xStep * (index + 1);
            const nextY = padding + chartInnerHeight - (nextItem.count / yMax) * chartInnerHeight;
            
            return (
              <G key={`line-${index}`}>
                <Line
                  x1={x}
                  y1={y}
                  x2={nextX}
                  y2={nextY}
                  stroke="#4A90E2"
                  strokeWidth="2"
                />
                <Circle cx={x} cy={y} r="4" fill="#4A90E2" />
                {/* Count value - show on all points */}
                <SvgText
                  x={x}
                  y={y - 10}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#4A90E2"
                  textAnchor="middle"
                >
                  {item.count}
                </SvgText>
                {/* Date labels */}
                {index % labelInterval === 0 && (
                  <SvgText
                    x={x}
                    y={CHART_HEIGHT - 10}
                    fontSize="9"
                    fill="#666"
                    textAnchor="middle"
                    transform={`rotate(-45, ${x}, ${CHART_HEIGHT - 10})`}
                  >
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </SvgText>
                )}
              </G>
            );
          } else {
            // Last point - always show label and value
            return (
              <G key={`point-${index}`}>
                <Circle cx={x} cy={y} r="4" fill="#4A90E2" />
                {/* Show count value for last point */}
                <SvgText
                  x={x}
                  y={y - 10}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#4A90E2"
                  textAnchor="middle"
                >
                  {item.count}
                </SvgText>
                <SvgText
                  x={x}
                  y={CHART_HEIGHT - 10}
                  fontSize="9"
                  fill="#666"
                  textAnchor="middle"
                  transform={`rotate(-45, ${x}, ${CHART_HEIGHT - 10})`}
                >
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </SvgText>
              </G>
            );
          }
        })}
      </Svg>
    );
  };

  const renderBarChart = (data, nameKey) => {
    console.log('Bar chart rendering with data:', data, 'nameKey:', nameKey);
    
    const padding = 40;
    const chartInnerWidth = CHART_WIDTH - padding * 2;
    const chartInnerHeight = CHART_HEIGHT - padding * 2;
    const barWidth = chartInnerWidth / (data.length * 2);
    const maxRating = 5; // Ratings are out of 5

    return (
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.chart}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = padding + (chartInnerHeight / 5) * i;
          return (
            <G key={`grid-${i}`}>
              <Line
                x1={padding}
                y1={y}
                x2={CHART_WIDTH - padding}
                y2={y}
                stroke="#E8E8E8"
                strokeWidth="1"
              />
              <SvgText
                x={padding - 10}
                y={y + 5}
                fontSize="10"
                fill="#666"
                textAnchor="end"
              >
                {(5 - i).toFixed(1)}
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (parseFloat(item.average_rating) / maxRating) * chartInnerHeight;
          const x = padding + (chartInnerWidth / data.length) * index + barWidth / 2;
          const y = padding + chartInnerHeight - barHeight;

          // Truncate long names
          const itemName = item[nameKey] || 'Unknown';
          const displayName = itemName.length > 15 
            ? itemName.substring(0, 12) + '...' 
            : itemName;

          return (
            <G key={`bar-${index}`}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#50C878"
                rx="4"
              />
              {/* Rating value on top of bar */}
              <SvgText
                x={x + barWidth / 2}
                y={y - 5}
                fontSize="12"
                fontWeight="bold"
                fill="#333"
                textAnchor="middle"
              >
                {parseFloat(item.average_rating).toFixed(1)}
              </SvgText>
              {/* Name below bar */}
              <SvgText
                x={x + barWidth / 2}
                y={CHART_HEIGHT - 15}
                fontSize="10"
                fill="#666"
                textAnchor="middle"
                transform={`rotate(-45, ${x + barWidth / 2}, ${CHART_HEIGHT - 15})`}
              >
                {displayName}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#4A90E2', '#50C878']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Analytics...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4A90E2', '#50C878']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Analytics Dashboard</Text>

        {/* User Registrations Line Chart with Time Filter */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>User Registrations Over Time</Text>
          <View style={styles.filterButtons}>
            {['week', 'month', 'all'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.filterButton,
                  timeRange === range && styles.filterButtonActive,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    timeRange === range && styles.filterButtonTextActive,
                  ]}
                >
                  {range === 'week' ? 'Last Week' : range === 'month' ? 'Last Month' : 'All Time'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {renderLineChart()}
        </View>

        {/* Top 5 Projects Bar Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top 5 Highest-Rated Projects</Text>
          {topProjects && topProjects.length > 0 ? (
            renderBarChart(topProjects, 'project_title')
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>No rated projects available yet</Text>
              <Text style={styles.emptySubtext}>Projects need ratings from users to appear here</Text>
            </View>
          )}
        </View>

        {/* Top 5 Offerings Bar Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top 5 Highest-Rated Offerings</Text>
          {topOfferings && topOfferings.length > 0 ? (
            renderBarChart(topOfferings, 'name')
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>No rated offerings available yet</Text>
              <Text style={styles.emptySubtext}>Offerings need ratings from users to appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,},
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    alignSelf: 'center',
  },
  emptyChart: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
  