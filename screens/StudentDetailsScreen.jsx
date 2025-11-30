import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import { getStudentDataByEmail } from "../apis/student/Student";

const StudentDetailsScreen = ({ navigation, route }) => {
  const { email, student } = route.params || {};
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("StudentDetailsScreen params:", { email, student });

    // Get email from either direct param or student object
    const studentEmail = email || student?.email;

    if (studentEmail) {
      fetchStudentData(studentEmail);
    } else {
      setError("No student email provided");
      setLoading(false);
    }
  }, [email, student]);

  const fetchStudentData = async (studentEmail) => {
    try {
      setLoading(true);
      console.log("Fetching student data for email:", studentEmail);

      const result = await getStudentDataByEmail(studentEmail);
      console.log("Student data result:", result);

      if (result.success && result.data) {
        const fetchedData = result.data;

        // Parse skills if it's a string
        let parsedSkills = [];
        if (fetchedData.skills) {
          if (Array.isArray(fetchedData.skills)) {
            parsedSkills = fetchedData.skills;
          } else if (typeof fetchedData.skills === "string") {
            try {
              parsedSkills = JSON.parse(fetchedData.skills);
            } catch (e) {
              console.error("Error parsing skills:", e);
              parsedSkills = [];
            }
          }
        }

        setStudentData({
          name: fetchedData.name || "Unknown Student",
          email: fetchedData.email || "",
          major: fetchedData.major || "",
          year: fetchedData.year_of_study || fetchedData.year || "",
          skills: parsedSkills,
          bio: fetchedData.bio || "",
          photo: fetchedData.photo_url || "https://via.placeholder.com/150",
          photo_url: fetchedData.photo_url || null,
          photo_name: fetchedData.photo_name || null,
          cv_name: fetchedData.cv_name
            ? fetchedData.cv_name.split("/").pop()
            : null,
          cv_url: fetchedData.cv_url || null,
          project: fetchedData.project || { title: "", booth: "" },
        });
        setError(null);
      } else {
        setError(result.message || "Failed to load student data");
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("An error occurred while loading student data");
    } finally {
      setLoading(false);
    }
  };

  const downloadCV = async () => {
    if (!studentData?.cv_url) {
      Alert.alert("No CV", "No CV file available for this student");
      return;
    }

    try {
      const { Linking } = require("react-native");
      const canOpen = await Linking.canOpenURL(studentData.cv_url);
      if (canOpen) {
        await Linking.openURL(studentData.cv_url);
      } else {
        Alert.alert("Error", "Cannot open CV URL");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download CV");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Student Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Loading State */}
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.mainColor} />
            <Text style={styles.loadingText}>Loading student profile...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !studentData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Student Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Error State */}
          <View style={styles.centerContainer}>
            <Ionicons name="person-outline" size={80} color="#CCC" />
            <Text style={styles.errorText}>{error || "Student not found"}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                const studentEmail = email || student?.email;
                if (studentEmail) {
                  fetchStudentData(studentEmail);
                }
              }}
            >
              <Ionicons name="refresh" size={20} color={Colors.mainColor} />
              <Text style={[styles.retryText, { marginLeft: 8 }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: studentData.photo }}
                style={styles.profileImageLarge}
              />
              <View style={styles.statusIndicator} />
            </View>
            <Text style={styles.profileNameLarge}>{studentData.name}</Text>
            <Text style={styles.profileMajor}>
              {studentData.major}
              {studentData.year ? ` • ${studentData.year}` : ""}
            </Text>
            <Text style={styles.profileEmail}>{studentData.email}</Text>
          </View>

          {/* Project Card */}
          {studentData.project?.title && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color={Colors.mainColor}
                />
                <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                  Project
                </Text>
              </View>
              <Text style={styles.projectTitle}>
                {studentData.project.title}
              </Text>
              {studentData.project.booth && (
                <View style={styles.boothTag}>
                  <Ionicons
                    name="location"
                    size={16}
                    color={Colors.mainColor}
                  />
                  <Text style={[styles.boothText, { marginLeft: 8 }]}>
                    {studentData.project.booth}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Skills Card */}
          {studentData.skills && studentData.skills.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="code-slash-outline"
                  size={24}
                  color={Colors.mainColor}
                />
                <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                  Skills
                </Text>
              </View>
              <View style={styles.skillsContainer}>
                {studentData.skills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* About Me Card */}
          {studentData.bio && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={Colors.mainColor}
                />
                <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                  About Me
                </Text>
              </View>
              <Text style={styles.bioText}>{studentData.bio}</Text>
            </View>
          )}

          {/* CV Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={Colors.mainColor}
              />
              <Text style={[styles.cardTitle, { marginLeft: 8 }]}>Resume</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.cvButton,
                !studentData.cv_url && styles.cvButtonDisabled,
              ]}
              onPress={downloadCV}
              disabled={!studentData.cv_url}
            >
              <Ionicons
                name="download-outline"
                size={20}
                color={studentData.cv_url ? Colors.mainColor : "#999"}
              />
              <Text
                style={[
                  styles.cvButtonText,
                  !studentData.cv_url && styles.cvButtonTextDisabled,
                  { marginLeft: 8 },
                ]}
              >
                {studentData.cv_url ? `Download Resume` : "No resume uploaded"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.mainColor,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: Colors.mainColor,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F0F4FF",
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.mainColor,
  },
  profileHeader: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.mainColor,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileNameLarge: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  profileMajor: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#999",
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  boothTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  boothText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillChip: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  skillText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  bioText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  cvButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    padding: 15,
    borderRadius: 10,
  },
  cvButtonDisabled: {
    backgroundColor: "#F5F5F5",
  },
  cvButtonText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  cvButtonTextDisabled: {
    color: "#999",
  },
});

export default StudentDetailsScreen;
