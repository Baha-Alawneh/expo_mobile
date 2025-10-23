import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";

const CompaniesScreen = () => {
  // Mock companies data
  const companies = [
    {
      id: 1,
      name: "Tech Solutions Co.",
      logo: "https://logo.clearbit.com/microsoft.com",
      description:
        "Leading software development company specializing in enterprise solutions and cloud services.",
      industry: "Software Development",
      booth: "E-01",
      hiring: true,
    },
    {
      id: 2,
      name: "Innovation Labs",
      logo: "https://logo.clearbit.com/google.com",
      description:
        "AI and Machine Learning specialists focused on cutting-edge research and development.",
      industry: "AI & Machine Learning",
      booth: "E-02",
      hiring: true,
    },
    {
      id: 3,
      name: "Digital Dynamics",
      logo: "https://logo.clearbit.com/amazon.com",
      description:
        "Cloud computing and DevOps experts providing scalable infrastructure solutions.",
      industry: "Cloud & DevOps",
      booth: "E-03",
      hiring: false,
    },
    {
      id: 4,
      name: "CyberShield Inc.",
      logo: "https://logo.clearbit.com/ibm.com",
      description:
        "Cybersecurity firm protecting businesses from digital threats.",
      industry: "Cybersecurity",
      booth: "E-04",
      hiring: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Participating Companies</Text>
        <Text style={styles.sectionSubtitle}>{companies.length} companies</Text>
      </View>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.companyCard}>
            <View style={styles.companyLogoContainer}>
              <Image source={{ uri: item.logo }} style={styles.companyLogo} />
            </View>
            <View style={styles.companyInfo}>
              <View style={styles.companyHeader}>
                <Text style={styles.companyName}>{item.name}</Text>
                {item.hiring && (
                  <View style={styles.hiringBadge}>
                    <Text style={styles.hiringText}>Hiring</Text>
                  </View>
                )}
              </View>
              <Text style={styles.companyIndustry}>{item.industry}</Text>
              <Text style={styles.companyDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.companyFooter}>
                <View style={styles.boothTag}>
                  <Ionicons
                    name="location"
                    size={14}
                    color={Colors.mainColor}
                  />
                  <Text style={styles.boothText}>Booth {item.booth}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.mainColor}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  companyCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  companyLogoContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    overflow: "hidden",
  },
  companyLogo: {
    width: 50,
    height: 50,
  },
  companyInfo: {
    flex: 1,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  hiringBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  hiringText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  companyIndustry: {
    fontSize: 12,
    color: Colors.mainColor,
    fontWeight: "600",
    marginBottom: 6,
  },
  companyDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 10,
  },
  companyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boothTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  boothText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
  },
});

export default CompaniesScreen;
