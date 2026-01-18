import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BuildingModal = ({
  visible,
  building,
  onClose,
}) => {
  if (!building) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {building.building_number && `#${building.building_number} `}
                {building.name}
              </Text>
              <Text style={styles.headerSubtitle}>Campus Building</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Description */}
            {building.description && (
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={20} color="#64748b" />
                  <Text style={styles.infoLabel}>Description</Text>
                </View>
                <Text style={styles.description}>{building.description}</Text>
              </View>
            )}

            {/* Visual Indicator */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="color-palette" size={20} color="#64748b" />
                <Text style={styles.infoLabel}>Building Color</Text>
              </View>
              <View
                style={[
                  styles.colorPreview,
                  {
                    backgroundColor: building.color || '#ffffff',
                    borderColor: building.stroke_color || '#6b7280',
                  },
                ]}
              >
                <Text style={[styles.colorPreviewText, { color: building.label_color || '#374151' }]}>
                  Building Preview
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#64748b',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  description: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  coordinatesContainer: {
    gap: 12,
  },
  coordinateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  colorPreview: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    borderWidth: 3,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPreviewText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeFooterButton: {
    backgroundColor: '#64748b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BuildingModal;
