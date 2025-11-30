import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Create or update user document in Firestore
 */
export const createOrUpdateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...userData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user document from Firestore
 */
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error getting user:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all users by type (student, company, visitor) or all users
 */
export const getUsersByType = async (type = null) => {
  try {
    let q;
    if (type) {
      q = query(collection(db, "users"), where("type", "==", type));
    } else {
      q = query(collection(db, "users"));
    }

    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error getting users:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a chat room ID (sorted to ensure consistency)
 */
const getChatId = (userId1, userId2) => {
  return [userId1, userId2].sort().join("_");
};

/**
 * Create or get existing chat between two users
 */
export const createOrGetChat = async (currentUserId, otherUserId) => {
  try {
    const chatId = getChatId(currentUserId, otherUserId);
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      // Create new chat
      await setDoc(chatRef, {
        members: [currentUserId, otherUserId],
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        [`unreadCount_${currentUserId}`]: 0,
        [`unreadCount_${otherUserId}`]: 0,
      });
    }

    return { success: true, chatId };
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a message in a chat
 */
export const sendMessage = async (chatId, senderId, text, senderName) => {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const chatRef = doc(db, "chats", chatId);

    // Add message
    await addDoc(messagesRef, {
      senderId,
      senderName,
      text,
      createdAt: serverTimestamp(),
      isRead: false,
    });

    // Get chat members to determine who to increment unread count for
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const chatData = chatSnap.data();
      const otherUserId = chatData.members.find((id) => id !== senderId);

      // Update chat with last message and increment unread count for other user
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        [`unreadCount_${otherUserId}`]: increment(1),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to messages in a chat (real-time)
 */
export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    callback(messages);
  });
};

/**
 * Mark messages as read in a chat
 */
export const markMessagesAsRead = async (chatId, userId) => {
  try {
    const chatRef = doc(db, "chats", chatId);
    const messagesRef = collection(db, "chats", chatId, "messages");

    // Reset unread count for this user
    await updateDoc(chatRef, {
      [`unreadCount_${userId}`]: 0,
    });

    // Mark all unread messages as read
    const q = query(
      messagesRef,
      where("isRead", "==", false),
      where("senderId", "!=", userId)
    );

    const snapshot = await getDocs(q);
    const updatePromises = [];

    snapshot.forEach((doc) => {
      updatePromises.push(updateDoc(doc.ref, { isRead: true }));
    });

    await Promise.all(updatePromises);

    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all chats for a user (real-time)
 */
export const subscribeToChats = (userId, callback) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("members", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    const chats = [];

    for (const docSnap of snapshot.docs) {
      const chatData = docSnap.data();
      const otherUserId = chatData.members.find((id) => id !== userId);

      // Get other user's data
      const userResult = await getUserData(otherUserId);
      const otherUser = userResult.success ? userResult.data : {};

      chats.push({
        id: docSnap.id,
        ...chatData,
        otherUser: {
          id: otherUserId,
          name: otherUser.name || "Unknown User",
          photoUrl: otherUser.photoUrl || "",
          type: otherUser.type || "visitor",
        },
        unreadCount: chatData[`unreadCount_${userId}`] || 0,
        lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
      });
    }

    callback(chats);
  });
};

/**
 * Get total unread message count for a user (real-time)
 */
export const subscribeToUnreadCount = (userId, callback) => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("members", "array-contains", userId));

  return onSnapshot(q, (snapshot) => {
    let totalUnread = 0;

    snapshot.forEach((doc) => {
      const chatData = doc.data();
      totalUnread += chatData[`unreadCount_${userId}`] || 0;
    });

    callback(totalUnread);
  });
};

/**
 * Delete a chat (optional - for future use)
 */
export const deleteChat = async (chatId) => {
  try {
    // Note: In production, you'd want to delete subcollection messages too
    // This requires server-side function or batch delete
    const chatRef = doc(db, "chats", chatId);
    await deleteDoc(chatRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { success: false, error: error.message };
  }
};
