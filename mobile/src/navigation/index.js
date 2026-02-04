/**
 * EduMentor AI - Navigation Configuration
 * Bottom Tab + Stack Navigation with smooth transitions
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import {
  SplashScreen,
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  DashboardScreen,
  UploadScreen,
  LessonsScreen,
  LessonDetailScreen,
  QuizTakeScreen,
  QuizResultScreen,
  ChatScreen,
  ProfileScreen,
} from '../screens';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Background
const TabBarBackground = () => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={100}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surface }]} />;
};

// Custom Tab Bar Icon
const TabIcon = ({ focused, icon, label }) => {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
        <Ionicons
          name={focused ? icon : `${icon}-outline`}
          size={focused ? 24 : 22}
          color={focused ? Colors.primary : Colors.gray400}
        />
      </View>
      {focused && (
        <View style={styles.tabIndicator} />
      )}
    </View>
  );
};

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="home" label="Trang chủ" />
          ),
        }}
      />
      <Tab.Screen
        name="Lessons"
        component={LessonsScreen}
        options={{
          tabBarLabel: 'Bài học',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="book" label="Bài học" />
          ),
        }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarLabel: 'Tải lên',
          tabBarIcon: ({ focused }) => (
            <View style={styles.uploadIconContainer}>
              <View style={styles.uploadIconWrapper}>
                <Ionicons name="cloud-upload" size={26} color={Colors.white} />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Thống kê',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="stats-chart" label="Thống kê" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="person" label="Hồ sơ" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

// Main Stack (with nested tabs)
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen 
        name="QuizTake" 
        component={QuizTakeScreen}
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="QuizResult" 
        component={QuizResultScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  // In real app, check auth state here
  const isAuthenticated = false;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingTop: Spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    borderTopWidth: 0,
    elevation: 0,
    ...Shadow.lg,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapperActive: {
    backgroundColor: Colors.primary + '15',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  
  // Upload button (center)
  uploadIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  uploadIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});

export default RootNavigator;
