import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";

const MapScreen = ({ studentProject, studentBooth }) => {
  // Mock companies data for nearby section
  const companies = [
    {
      id: 1,
      name: "Tech Solutions Co.",
      logo: "https://logo.clearbit.com/microsoft.com",
      booth: "E-01",
    },
    {
      id: 2,
      name: "Innovation Labs",
      logo: "https://logo.clearbit.com/google.com",
      booth: "E-02",
    },
    {
      id: 3,
      name: "Digital Dynamics",
      logo: "https://logo.clearbit.com/amazon.com",
      booth: "E-03",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.mapHeader}>
        <Text style={styles.sectionTitle}>Expo Floor Plan</Text>
        <TouchableOpacity style={styles.mapLegendButton}>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={Colors.mainColor}
          />
          <Text style={styles.mapLegendText}>Legend</Text>
        </TouchableOpacity>
      </View>

      {/* Map Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: Colors.mainColor }]}
          />
          <Text style={styles.legendText}>Student Projects</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FF9800" }]} />
          <Text style={styles.legendText}>Companies</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>Your Booth</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <Image
          source={require("../assets/icons/expo-logo.png")}
          style={styles.mapPlaceholderIcon}
          resizeMode="contain"
        />
        <Ionicons
          name="map-outline"
          size={80}
          color={Colors.mainColor}
          style={{ opacity: 0.3 }}
        />
        <Text style={styles.mapPlaceholderTitle}>Interactive Map</Text>
        <Text style={styles.mapPlaceholderText}>
          3D floor plan with navigation will be available soon
        </Text>
      </View>

      {/* Quick Location Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="navigate-circle-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={styles.cardTitle}>Your Booth Location</Text>
        </View>
        <View style={styles.locationCard}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationBooth}>
              Booth {studentBooth || "A-12"}
            </Text>
            <Text style={styles.locationProject}>
              {studentProject || "Smart Campus Navigator"}
            </Text>
          </View>
          <TouchableOpacity style={styles.navigateButton}>
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nearby Companies */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="business-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={styles.cardTitle}>Nearby Companies</Text>
        </View>
        {companies.map((company) => (
          <TouchableOpacity key={company.id} style={styles.nearbyItem}>
            <Image source={{ uri: company.logo }} style={styles.nearbyLogo} />
            <View style={styles.nearbyInfo}>
              <Text style={styles.nearbyName}>{company.name}</Text>
              <Text style={styles.nearbyBooth}>Booth {company.booth}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  mapLegendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  mapLegendText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  legendContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  mapContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapPlaceholderIcon: {
    width: 80,
    height: 80,
    marginBottom: 10,
    opacity: 0.5,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  locationCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationInfo: {
    flex: 1,
  },
  locationBooth: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.mainColor,
    marginBottom: 4,
  },
  locationProject: {
    fontSize: 14,
    color: "#666",
  },
  navigateButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  navigateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  nearbyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  nearbyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  nearbyInfo: {
    flex: 1,
  },
  nearbyName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  nearbyBooth: {
    fontSize: 12,
    color: "#999",
  },
});

export default MapScreen;
