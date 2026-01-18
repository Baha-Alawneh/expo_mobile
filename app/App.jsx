import { useState } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignUp from "../screens/SignUp";
import Login from "../screens/Login";
import Verify from "../screens/Verify";
import Student from "../screens/Student";
import Company from "../screens/Company";
import Visitor from "../screens/Visitor";
import Admin from "../screens/Admin";
import MyProjectScreen from "../screens/MyProjectScreen";
import MyOfferingScreen from "../screens/MyOfferingScreen";
import ProjectDetailsScreen from "../screens/ProjectDetailsScreen";
import CompanyDetailsScreen from "../screens/CompanyDetailsScreen";
import StudentDetailsScreen from "../screens/StudentDetailsScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ConversationScreen from "../screens/ConversationScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import ReelsScreen from "../screens/ReelsScreen";
import Toast from "react-native-toast-message";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Verify"
            component={Verify}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Student"
            component={Student}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Company"
            component={Company}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Visitor"
            component={Visitor}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Admin"
            component={Admin}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MyProject"
            component={MyProjectScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MyOffering"
            component={MyOfferingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProjectDetails"
            component={ProjectDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CompanyDetailsScreen"
            component={CompanyDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StudentDetailsScreen"
            component={StudentDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatListScreen"
            component={ChatListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ConversationScreen"
            component={ConversationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatbotScreen"
            component={ChatbotScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ReelsScreen"
            component={ReelsScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
