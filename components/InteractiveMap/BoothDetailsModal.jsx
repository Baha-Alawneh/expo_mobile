import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/constants';
import { ZONES } from './mapData';

const BoothDetailsModal = ({
  visible,
  booth,
  onClose,
  onAssign,
  onDeassign,
  onViewDetails,
  isAdmin = false,
}) => {
  if (!booth) return null;

  // Get zone info from booth's zone_type (from database)
  const zoneKey = booth.zone_type?.toUpperCase() || 'STANDARD';
  const zone = ZONES[zoneKey] || ZONES.STANDARD;
  const isAssigned = booth.assigned_to_project || booth.assigned_to_company;
  const assignedEntity = booth.project_name || booth.company_name;
  const assignedType = booth.assigned_to_project ? 'Project' : 'Company';

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
          <View style={[styles.header, { backgroundColor: zone.color }]}>
            <View>
              <Text style={styles.headerTitle}>Booth {booth.booth_number}</Text>
              <Text style={styles.headerSubtitle}>{zone.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Badge */}
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isAssigned
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(107, 114, 128, 0.1)',
                  },
                ]}
              >
                <Ionicons
                  name={isAssigned ? 'checkmark-circle' : 'alert-circle'}
                  size={20}
                  color={isAssigned ? '#10B981' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: isAssigned ? '#10B981' : '#6B7280' },
                  ]}
                >
                  {isAssigned ? 'Assigned' : 'Available'}
                </Text>
              </View>
            </View>

            {/* Booth Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={Colors.mainColor} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Zone</Text>
                  <Text style={styles.infoValue}>{zone.name}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="resize" size={20} color={Colors.mainColor} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Dimensions</Text>
                  <Text style={styles.infoValue}>
                    {booth.width / 20}m × {booth.height / 20}m
                  </Text>
                </View>
              </View>

              {booth.location_description && (
                <View style={styles.infoRow}>
                  <Ionicons name="information-circle" size={20} color={Colors.mainColor} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{booth.location_description}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Assignment Info */}
            {isAssigned && (
              <View style={styles.assignmentCard}>
                <Text style={styles.assignmentTitle}>Assigned To</Text>
                <View style={styles.assignmentInfo}>
                  {booth.logo_url && (
                    <Image
                      source={{ uri: booth.logo_url }}
                      style={styles.assignmentLogo}
                    />
                  )}
                  <View style={styles.assignmentTextContainer}>
                    <Text style={styles.assignmentType}>{assignedType}</Text>
                    <Text style={styles.assignmentName}>{assignedEntity}</Text>
                    {booth.description && (
                      <Text style={styles.assignmentDescription} numberOfLines={2}>
                        {booth.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* View Details Button */}
                {onViewDetails && (
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => onViewDetails(booth)}
                  >
                    <Text style={styles.detailsButtonText}>View Full Details</Text>
                    <Ionicons name="arrow-forward" size={20} color={Colors.mainColor} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Admin Actions */}
            {isAdmin && (
              <View style={styles.actionsContainer}>
                {isAssigned ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deassignButton]}
                    onPress={() => onDeassign && onDeassign(booth)}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>De-assign Booth</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.assignButton]}
                    onPress={() => onAssign && onAssign(booth)}
                  >
                    <Ionicons name="add-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Assign to Project/Company</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
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
  statusContainer: {
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  assignmentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  assignmentInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  assignmentLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  assignmentTextContainer: {
    flex: 1,
  },
  assignmentType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.mainColor,
    gap: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mainColor,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  assignButton: {
    backgroundColor: Colors.mainColor,
  },
  deassignButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default BoothDetailsModal;
