/**
 * EduMentor AI - Components Index
 * Export all reusable components
 */

export { default as Button } from './Button';
export { default as Card, FeatureCard, StatCard, LessonCard } from './Card';
export { default as Input, SearchInput } from './Input';
export { default as Header, HomeHeader } from './Header';

// Loading Component
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../theme';

export const Loading = ({ size = 'large', text, fullScreen = false }) => (
  <View style={[styles.loadingContainer, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size={size} color={Colors.primary} />
    {text && <Text style={styles.loadingText}>{text}</Text>}
  </View>
);

// Empty State Component
export const EmptyState = ({ icon, title, description, action }) => (
  <View style={styles.emptyContainer}>
    {icon && <View style={styles.emptyIcon}>{icon}</View>}
    <Text style={styles.emptyTitle}>{title}</Text>
    {description && <Text style={styles.emptyDescription}>{description}</Text>}
    {action && <View style={styles.emptyAction}>{action}</View>}
  </View>
);

// Badge Component
export const Badge = ({ text, variant = 'primary', size = 'md' }) => (
  <View style={[
    styles.badge,
    styles[`badge_${variant}`],
    styles[`badge_${size}`],
  ]}>
    <Text style={[
      styles.badgeText,
      styles[`badgeText_${variant}`],
      styles[`badgeText_${size}`],
    ]}>
      {text}
    </Text>
  </View>
);

// Divider Component
export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

// Avatar Component
export const Avatar = ({ source, name, size = 40, style }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
    {source ? (
      <Image source={{ uri: source }} style={styles.avatarImage} />
    ) : (
      <Text style={[styles.avatarText, { fontSize: size / 2.5 }]}>
        {name?.charAt(0)?.toUpperCase() || '?'}
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  
  // Empty State
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: Spacing.lg,
  },
  
  // Badge
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
  },
  badge_primary: {
    backgroundColor: Colors.primary + '20',
  },
  badge_success: {
    backgroundColor: Colors.success + '20',
  },
  badge_warning: {
    backgroundColor: Colors.warning + '20',
  },
  badge_error: {
    backgroundColor: Colors.error + '20',
  },
  badge_sm: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  badge_md: {},
  badge_lg: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  badgeText: {
    fontWeight: '600',
  },
  badgeText_primary: {
    color: Colors.primary,
  },
  badgeText_success: {
    color: Colors.success,
  },
  badgeText_warning: {
    color: Colors.warning,
  },
  badgeText_error: {
    color: Colors.error,
  },
  badgeText_sm: {
    fontSize: FontSize.xs,
  },
  badgeText_md: {
    fontSize: FontSize.sm,
  },
  badgeText_lg: {
    fontSize: FontSize.md,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: Spacing.md,
  },
  
  // Avatar
  avatar: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '600',
  },
});
