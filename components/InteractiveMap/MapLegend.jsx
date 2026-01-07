import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ZONES } from './mapData';

const MapLegend = ({ collapsed = false, onToggle }) => {
  return (
    <View style={[styles.container, collapsed && styles.containerCollapsed]}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="information-circle" size={20} color="#2563EB" />
          <Text style={styles.headerText}>Legend</Text>
        </View>
        <Ionicons
          name={collapsed ? 'chevron-down' : 'chevron-up'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {!collapsed && (
        <View style={styles.content}>
          {Object.values(ZONES).map((zone) => (
            <View key={zone.id} style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: zone.color }]} />
              <Text style={styles.legendText}>{zone.name}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Your Booth</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: '#E5E7EB' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  containerCollapsed: {
    right: undefined,
    width: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
});

export default MapLegend;
