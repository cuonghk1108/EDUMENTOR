/**
 * EduMentor AI - Header Component
 * App header with navigation support
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Shadow } from '../theme';

const Header = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightIcon,
  onRightPress,
  rightComponent,
  transparent = false,
  light = false,
  centerTitle = true,
}) => {
  const insets = useSafeAreaInsets();
  
  const textColor = light ? Colors.white : Colors.textPrimary;
  const iconColor = light ? Colors.white : Colors.textPrimary;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm },
        transparent && styles.transparent,
        !transparent && Shadow.sm,
      ]}
    >
      <View style={styles.content}>
        {/* Left */}
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center */}
        <View style={[styles.center, !centerTitle && styles.centerLeft]}>
          <Text
            style={[styles.title, { color: textColor }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: light ? Colors.gray200 : Colors.textSecondary }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right */}
        <View style={styles.right}>
          {rightComponent ? (
            rightComponent
          ) : rightIcon ? (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.rightButton}
              activeOpacity={0.7}
            >
              <Ionicons name={rightIcon} size={24} color={iconColor} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

// Home Header with greeting
export const HomeHeader = ({ userName, avatarUrl, onNotificationPress, onProfilePress }) => {
  const insets = useSafeAreaInsets();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <View style={[styles.homeHeader, { paddingTop: insets.top + Spacing.md }]}>
      <TouchableOpacity onPress={onProfilePress} style={styles.profileSection}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{userName?.charAt(0) || '👋'}</Text>
          )}
        </View>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>{getGreeting()} 👋</Text>
          <Text style={styles.userName}>{userName || 'Học sinh'}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onNotificationPress} style={styles.notificationBtn}>
        <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        <View style={styles.notificationBadge} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingBottom: Spacing.sm,
  },
  transparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  left: {
    width: 44,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  centerLeft: {
    alignItems: 'flex-start',
    paddingLeft: Spacing.sm,
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  rightButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // Home Header
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '600',
  },
  greeting: {},
  greetingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
});

export default Header;
