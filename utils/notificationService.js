import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy, doc, deleteDoc } from "firebase/firestore";

// Track active subscriptions to prevent duplicates
const activeSubscriptions = new Map();

// Get notification icon color based on type
export const getIconColorForType = (iconName) => {
  // Success/Approval notifications - Green
  if (
    iconName === "checkmark-circle" ||
    iconName === "checkmark-done" ||
    iconName === "shield-checkmark"
  ) {
    return "#00B894"; // Green
  }
  
  // Info/Message notifications - Blue
  if (
    iconName === "mail" ||
    iconName === "chatbubble" ||
    iconName === "information-circle" ||
    iconName === "notifications"
  ) {
    return "#74B9FF"; // Blue
  }
  
  // Warning/Alert notifications - Orange
  if (
    iconName === "warning" ||
    iconName === "alert-circle" ||
    iconName === "alert" ||
    iconName === "flame"
  ) {
    return "#FDCB6E"; // Orange
  }
  
  // Error/Rejection - Red
  if (
    iconName === "close-circle" ||
    iconName === "remove-circle" ||
    iconName === "trash"
  ) {
    return "#FF7675"; // Red
  }
  
  // Megaphone/Announcement - Purple
  if (iconName === "megaphone") {
    return "#6C5CE7"; // Purple
  }
  
  // Default - Blue
  return "#74B9FF";
};

// Subscribe to topic (listen to Firestore for real-time notifications)
export async function subscribeToTopic(role, userId, callback) {
  try {
    if (!userId) {
      console.error("UserId is required to subscribe to notifications");
      return null;
    }

    const subscriptionKey = `${role}-${userId}`;
    
    // Check if already subscribed
    if (activeSubscriptions.has(subscriptionKey)) {
      console.warn(`[${role}:${userId}] Already subscribed! This might cause duplicates. Unsubscribing previous listener.`);
      const prevUnsubscribe = activeSubscriptions.get(subscriptionKey);
      if (prevUnsubscribe && typeof prevUnsubscribe === 'function') {
        prevUnsubscribe();
      }
    }

    console.log(`Setting up real-time notification listener for user ${userId} with role ${role}`);

    // Load existing notifications to track which ones are already shown (user-specific)
    const existingNotifications = await loadNotifications(userId);
    const existingIds = new Set(existingNotifications.map(n => n.id));
    console.log(`Loaded ${existingNotifications.length} existing notifications. IDs:`, Array.from(existingIds));

    // Create Firestore listener for user's notifications
    const notificationsRef = collection(
      db,
      "notifications",
      userId.toString(),
      "userNotifications"
    );
    const q = query(notificationsRef, orderBy("createdAt", "desc"));

    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log(`[${role}:${userId}] Firestore snapshot received. Changes count:`, snapshot.docChanges().length);
      const newNotifications = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          console.log(`[${role}:${userId}] Processing added notification:`, change.doc.id, "Already seen?", existingIds.has(change.doc.id));
          
          // Only process if this notification hasn't been seen before
          if (!existingIds.has(change.doc.id)) {
            const notification = {
              id: change.doc.id,
              title: data.title,
              message: data.message,
              icon: data.icon || "notifications",
              iconColor: data.iconColor || getIconColorForType(data.icon || "notifications"),
              type: data.type || "info",
              time: formatTime(data.time),
              read: data.read || false,
            };
            newNotifications.push(notification);
            existingIds.add(change.doc.id); // Mark as seen
            console.log(`[${role}:${userId}] Added notification ${change.doc.id} to new list`);
          }
        }
      });

      // If there are new notifications, trigger callback once with all notifications
      if (newNotifications.length > 0 && callback) {
        console.log(`[${role}:${userId}] Calling callback with ${newNotifications.length} new notifications`);
        callback(newNotifications); // Pass array instead of calling for each
      } else {
        console.log(`[${role}:${userId}] No new notifications to process`);
      }
    });

    // Store the unsubscribe function
    activeSubscriptions.set(subscriptionKey, unsubscribe);
    console.log(`[${role}:${userId}] Subscription registered. Active subscriptions:`, activeSubscriptions.size);

    // Return a wrapped unsubscribe function that also cleans up the Map
    return () => {
      console.log(`[${role}:${userId}] Unsubscribing and cleaning up`);
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
      activeSubscriptions.delete(subscriptionKey);
      console.log(`[${role}:${userId}] Active subscriptions remaining:`, activeSubscriptions.size);
    };
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    return null;
  }
}

// Format timestamp to relative time
function formatTime(timestamp) {
  if (!timestamp) return "Just now";
  
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// Add notification received listener (now handled by Firestore)
export function addNotificationReceivedListener(callback) {
  // This is now handled by subscribeToTopic with Firestore real-time listener
  console.log("Notifications will be received via Firestore real-time listener");
  return { remove: () => {} };
}

// Load notifications from storage (user-specific)
export async function loadNotifications(userId = null) {
  try {
    // If no userId provided, try to get it from AsyncStorage
    if (!userId) {
      userId = await AsyncStorage.getItem("userId");
    }
    
    if (!userId) {
      console.log("[loadNotifications] No userId available");
      return [];
    }
    
    const storageKey = `notifications_${userId}`;
    const stored = await AsyncStorage.getItem(storageKey);
    
    if (stored) {
      const notifications = JSON.parse(stored);
      
      // Remove duplicates based on notification ID
      const uniqueNotifications = Array.from(
        new Map(notifications.map(n => [n.id, n])).values()
      );
      
      // If we found duplicates, save the cleaned version
      if (uniqueNotifications.length !== notifications.length) {
        console.log(`[loadNotifications] Found ${notifications.length - uniqueNotifications.length} duplicates, cleaning...`);
        await AsyncStorage.setItem(storageKey, JSON.stringify(uniqueNotifications));
      }
      
      return uniqueNotifications;
    }
    return [];
  } catch (error) {
    console.error("Error loading notifications:", error);
    return [];
  }
}

// Save notifications to storage (user-specific)
export async function saveNotifications(notifications, userId = null) {
  try {
    // If no userId provided, try to get it from AsyncStorage
    if (!userId) {
      userId = await AsyncStorage.getItem("userId");
    }
    
    if (!userId) {
      console.error("[saveNotifications] No userId available");
      return;
    }
    
    const storageKey = `notifications_${userId}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(notifications));
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId, userId = null) {
  try {
    const notifications = await loadNotifications(userId);
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    await saveNotifications(updated, userId);
    return updated;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return [];
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId = null) {
  try {
    const notifications = await loadNotifications(userId);
    const updated = notifications.map((n) => ({ ...n, read: true }));
    await saveNotifications(updated, userId);
    return updated;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return [];
  }
}

// Delete notification from Firestore and local storage
export async function deleteNotification(userId, notificationId) {
  try {
    console.log(`Deleting notification ${notificationId} for user ${userId}`);
    
    // Delete from Firestore
    const notificationRef = doc(
      db,
      "notifications",
      userId.toString(),
      "userNotifications",
      notificationId
    );
    await deleteDoc(notificationRef);
    console.log(`Deleted from Firestore: notifications/${userId}/userNotifications/${notificationId}`);
    
    // Delete from local storage (user-specific)
    const notifications = await loadNotifications(userId);
    const updated = notifications.filter((n) => n.id !== notificationId);
    await saveNotifications(updated, userId);
    console.log(`Deleted from local storage. Remaining: ${updated.length}`);
    
    return updated;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return [];
  }
}

// Clear all notifications
export async function clearAllNotifications() {
  try {
    await AsyncStorage.removeItem("notifications");
    return [];
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return [];
  }
}
