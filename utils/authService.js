import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../firebase";
import { createOrUpdateUser, getUserData } from "./chatService";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error signing in:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create user document in Firestore
    await createOrUpdateUser(userCredential.user.uid, {
      email: userCredential.user.email,
      ...userData,
      createdAt: new Date(),
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error signing up:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in with Google
 * Returns user and a flag indicating if this is a new user
 */
export const signInWithGoogle = async (idToken) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);

    // Check if user exists in Firestore
    const userDataResult = await getUserData(userCredential.user.uid);

    return {
      success: true,
      user: userCredential.user,
      isNewUser: !userDataResult.success,
      userData: userDataResult.data || null,
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete Google sign-up by adding user type
 */
export const completeGoogleSignUp = async (
  userId,
  userType,
  displayName,
  photoURL,
  email
) => {
  try {
    await createOrUpdateUser(userId, {
      name: displayName,
      email: email,
      type: userType,
      photoUrl: photoURL || "",
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error completing Google sign-up:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("userType");
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
