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

const ProjectsScreen = () => {
  // Mock projects data
  const projects = [
    {
      id: 1,
      studentName: "Ahmed & Sara",
      photo:
        "https://img.freepik.com/premium-photo/robotic-illustration-with-white-background_7145-2344.jpg",
      major: "Software Engineering",
      year: "",
      projectTitle: "AI-Powered Study Assistant",
      booth: "B-08",
      technologies: ["AI/ML", "Python", "TensorFlow"],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Other Projects</Text>
        <Text style={styles.sectionSubtitle}>{projects.length} projects</Text>
      </View>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.studentCard}>
            <Image source={{ uri: item.photo }} style={styles.studentPhoto} />
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.projectTitle}</Text>
              <Text style={styles.studentMajor}>
                {item.studentName} • {item.year}
              </Text>
              <Text style={styles.studentProject} numberOfLines={1}>
                {item.major}
              </Text>
              <View style={styles.studentSkills}>
                {item.technologies.slice(0, 2).map((tech, index) => (
                  <View key={index} style={styles.studentSkillChip}>
                    <Text style={styles.studentSkillText}>{tech}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.studentActions}>
              <View style={styles.boothBadge}>
                <Ionicons name="location" size={12} color="#fff" />
                <Text style={styles.boothBadgeText}>{item.booth}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={Colors.mainColor}
              />
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
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  studentMajor: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  studentProject: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 8,
  },
  studentSkills: {
    flexDirection: "row",
    gap: 6,
  },
  studentSkillChip: {
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  studentSkillText: {
    fontSize: 11,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  studentActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  boothBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.mainColor,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    marginBottom: 10,
  },
  boothBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});

export default ProjectsScreen;
