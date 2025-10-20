import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";

const Student = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Mock student data
  const [studentData, setStudentData] = useState({
    name: "Ahmed Hassan",
    photo: "https://i.pravatar.cc/300?img=12",
    email: "ahmed.hassan@university.edu",
    major: "Computer Science",
    year: "4th Year",
    skills: ["React Native", "UI/UX Design", "JavaScript", "Node.js", "Python"],
    bio: "Passionate computer science student specializing in mobile development and user experience design. Always eager to learn new technologies and solve real-world problems through innovative solutions.",
    cv: "ahmed_hassan_cv.pdf",
    project: {
      title: "Smart Campus Navigator",
      booth: "A-12",
    },
  });

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "approval",
      title: "Project Approved!",
      message:
        'Your project "Smart Campus Navigator" has been approved for the exhibition.',
      time: "2 hours ago",
      read: false,
      icon: "checkmark-circle",
      iconColor: "#4CAF50",
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message:
        "Tech Solutions Co. is interested in your project and sent you a message.",
      time: "5 hours ago",
      read: false,
      icon: "mail",
      iconColor: Colors.mainColor,
    },
    {
      id: 3,
      type: "message",
      title: "Connection Request",
      message: "Sarah Ahmed wants to connect with you.",
      time: "1 day ago",
      read: false,
      icon: "person-add",
      iconColor: Colors.mainColor,
    },
    {
      id: 4,
      type: "info",
      title: "Expo Reminder",
      message: "TEDI-Expo starts in 3 days. Make sure your booth is ready!",
      time: "2 days ago",
      read: true,
      icon: "information-circle",
      iconColor: "#FF9800",
    },
  ];

  // Mock students data
  const students = [
    {
      id: 1,
      name: "Sarah Ahmed",
      photo: "https://i.pravatar.cc/150?img=5",
      major: "Software Engineering",
      year: "3rd Year",
      project: "AI-Powered Study Assistant",
      booth: "B-08",
      skills: ["AI/ML", "Python", "TensorFlow"],
    },
    {
      id: 2,
      name: "Mohamed Ali",
      photo: "https://i.pravatar.cc/150?img=13",
      major: "Data Science",
      year: "4th Year",
      project: "Predictive Analytics Dashboard",
      booth: "C-15",
      skills: ["Data Analysis", "R", "SQL"],
    },
    {
      id: 3,
      name: "Fatima Ibrahim",
      photo: "https://i.pravatar.cc/150?img=9",
      major: "Cybersecurity",
      year: "4th Year",
      project: "Network Security Framework",
      booth: "A-23",
      skills: ["Security", "Python", "Ethical Hacking"],
    },
    {
      id: 4,
      name: "Omar Khalil",
      photo: "https://i.pravatar.cc/150?img=14",
      major: "Web Development",
      year: "3rd Year",
      project: "E-Commerce Platform",
      booth: "B-19",
      skills: ["React", "Node.js", "MongoDB"],
    },
  ];

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

  const renderProfileSection = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
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
          {studentData.major} • {studentData.year}
        </Text>
        <Text style={styles.profileEmail}>{studentData.email}</Text>
      </View>

      {/* Project Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cube-outline" size={24} color={Colors.mainColor} />
          <Text style={styles.cardTitle}>My Project</Text>
        </View>
        <Text style={styles.projectTitle}>{studentData.project.title}</Text>
        <View style={styles.boothTag}>
          <Ionicons name="location" size={16} color={Colors.mainColor} />
          <Text style={styles.boothText}>
            Booth {studentData.project.booth}
          </Text>
        </View>
      </View>

      {/* Skills Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="code-slash-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={styles.cardTitle}>Skills</Text>
        </View>
        <View style={styles.skillsContainer}>
          {studentData.skills.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bio Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-outline" size={24} color={Colors.mainColor} />
          <Text style={styles.cardTitle}>About Me</Text>
        </View>
        <Text style={styles.bioText}>{studentData.bio}</Text>
      </View>

      {/* CV Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={styles.cardTitle}>Curriculum Vitae</Text>
        </View>
        <TouchableOpacity style={styles.cvButton}>
          <Ionicons
            name="download-outline"
            size={20}
            color={Colors.mainColor}
          />
          <Text style={styles.cvButtonText}>{studentData.cv}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setShowEditProfile(true)}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStudentsSection = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Participating Students</Text>
        <Text style={styles.sectionSubtitle}>{students.length} students</Text>
      </View>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.studentCard}>
            <Image source={{ uri: item.photo }} style={styles.studentPhoto} />
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentMajor}>
                {item.major} • {item.year}
              </Text>
              <Text style={styles.studentProject} numberOfLines={1}>
                {item.project}
              </Text>
              <View style={styles.studentSkills}>
                {item.skills.slice(0, 2).map((skill, index) => (
                  <View key={index} style={styles.studentSkillChip}>
                    <Text style={styles.studentSkillText}>{skill}</Text>
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

  const renderCompaniesSection = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Participating Companies</Text>
        <Text style={styles.sectionSubtitle}>{companies.length} companies</Text>
      </View>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
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

  const renderMapSection = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
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
              Booth {studentData.project.booth}
            </Text>
            <Text style={styles.locationProject}>
              {studentData.project.title}
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
        {companies.slice(0, 3).map((company) => (
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.mainColor}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Image
                source={{ uri: studentData.photo }}
                style={styles.headerPhoto}
              />
              <View>
                <Text style={styles.headerGreeting}>Welcome back,</Text>
                <Text style={styles.headerName}>
                  {studentData.name.split(" ")[0]}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications-outline" size={28} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === "profile" && styles.activeTab]}
              onPress={() => setActiveTab("profile")}
            >
              <Ionicons
                name={activeTab === "profile" ? "person" : "person-outline"}
                size={20}
                color={activeTab === "profile" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "profile" && styles.activeTabText,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "students" && styles.activeTab]}
              onPress={() => setActiveTab("students")}
            >
              <Ionicons
                name={activeTab === "students" ? "people" : "people-outline"}
                size={20}
                color={activeTab === "students" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "students" && styles.activeTabText,
                ]}
              >
                Students
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "companies" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("companies")}
            >
              <Ionicons
                name={
                  activeTab === "companies" ? "business" : "business-outline"
                }
                size={20}
                color={activeTab === "companies" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "companies" && styles.activeTabText,
                ]}
              >
                Companies
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "map" && styles.activeTab]}
              onPress={() => setActiveTab("map")}
            >
              <Ionicons
                name={activeTab === "map" ? "map" : "map-outline"}
                size={20}
                color={activeTab === "map" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "map" && styles.activeTabText,
                ]}
              >
                Map
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content */}
        {activeTab === "profile" && renderProfileSection()}
        {activeTab === "students" && renderStudentsSection()}
        {activeTab === "companies" && renderCompaniesSection()}
        {activeTab === "map" && renderMapSection()}

        {/* Notifications Modal */}
        <Modal
          visible={showNotifications}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNotifications(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => setShowNotifications(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification,
                    ]}
                    onPress={() => {
                      // Mark as read logic
                      setUnreadCount(Math.max(0, unreadCount - 1));
                    }}
                  >
                    <View
                      style={[
                        styles.notificationIconContainer,
                        { backgroundColor: notification.iconColor + "20" },
                      ]}
                    >
                      <Ionicons
                        name={notification.icon}
                        size={24}
                        color={notification.iconColor}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {notification.time}
                      </Text>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditProfile}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditProfile(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.editPhotoContainer}>
                  <Image
                    source={{ uri: studentData.photo }}
                    style={styles.editPhoto}
                  />
                  <View style={styles.editPhotoButton}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput style={styles.input} value={studentData.name} />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.email}
                  editable={false}
                />

                <Text style={styles.inputLabel}>Major</Text>
                <TextInput style={styles.input} value={studentData.major} />

                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={studentData.bio}
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.inputLabel}>Skills (comma separated)</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.skills.join(", ")}
                />

                <TouchableOpacity style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    paddingTop: Platform.OS === "ios" ? 10 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#fff",
    marginRight: 12,
  },
  headerGreeting: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  headerName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  notificationButton: {
    position: "relative",
    padding: 5,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.mainColor,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  tabContainer: {
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabScroll: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    gap: 6,
    backgroundColor: "#F0F4FF",
  },
  activeTab: {
    backgroundColor: Colors.mainColor,
  },
  tabText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    flex: 1,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
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
    gap: 10,
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
    gap: 5,
  },
  boothText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
    gap: 10,
  },
  cvButtonText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: Platform.OS === "ios" ? 40 : 20,
    gap: 8,
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 12,
    alignItems: "flex-start",
  },
  unreadNotification: {
    backgroundColor: "#F0F8FF",
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.mainColor,
    marginTop: 5,
  },
  editPhotoContainer: {
    alignSelf: "center",
    marginVertical: 20,
    position: "relative",
  },
  editPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.mainColor,
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.mainColor,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: "#333",
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: Colors.mainColor,
    borderRadius: 25,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 25,
    alignItems: "center",
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Student;
