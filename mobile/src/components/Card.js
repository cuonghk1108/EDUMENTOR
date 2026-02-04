/**
 * EduMentor AI - Card Component
 * Reusable card with multiple variants
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, FontSize, Spacing, Shadow } from '../theme';

const Card = ({
  title,
  subtitle,
  description,
  icon,
  image,
  onPress,
  variant = 'default', // default, gradient, outlined
  gradientColors,
  children,
  style,
  disabled = false,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  const cardContent = (
    <>
      {image && (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          {title && <Text style={styles.title} numberOfLines={2}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          {description && <Text style={styles.description} numberOfLines={3}>{description}</Text>}
        </View>
        {children}
      </View>
    </>
  );

  if (variant === 'gradient' && gradientColors) {
    return (
      <Wrapper
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.touchable, style]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.gradientCard]}
        >
          {cardContent}
        </LinearGradient>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.card,
        variant === 'outlined' && styles.outlined,
        disabled && styles.disabled,
        style,
      ]}
    >
      {cardContent}
    </Wrapper>
  );
};

// Feature Card - for home screen
export const FeatureCard = ({ title, icon, onPress, color = Colors.primary }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.featureCard}
  >
    <View style={[styles.featureIcon, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
  </TouchableOpacity>
);

// Stat Card - for dashboard
export const StatCard = ({ title, value, icon, change, color = Colors.primary }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {change && (
      <Text style={[styles.statChange, { color: change >= 0 ? Colors.success : Colors.error }]}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
      </Text>
    )}
  </View>
);

// Lesson Card - for lesson list
export const LessonCard = ({ title, subject, progress, duration, onPress, image }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.lessonCard}>
    {image ? (
      <Image source={{ uri: image }} style={styles.lessonImage} />
    ) : (
      <View style={[styles.lessonImage, styles.lessonImagePlaceholder]}>
        <Text style={styles.lessonImageText}>{subject?.charAt(0) || '📚'}</Text>
      </View>
    )}
    <View style={styles.lessonContent}>
      <Text style={styles.lessonSubject}>{subject}</Text>
      <Text style={styles.lessonTitle} numberOfLines={2}>{title}</Text>
      <View style={styles.lessonMeta}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.lessonDuration}>{duration}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  touchable: {
    borderRadius: BorderRadius.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
    overflow: 'hidden',
  },
  gradientCard: {
    ...Shadow.lg,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.gray200,
    ...Shadow.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: Spacing.md,
  },
  iconContainer: {
    marginBottom: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  
  // Feature Card
  featureCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  featureTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  
  // Stat Card
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.xs,
    ...Shadow.sm,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statChange: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  
  // Lesson Card
  lessonCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  lessonImage: {
    width: 100,
    height: 100,
  },
  lessonImagePlaceholder: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonImageText: {
    fontSize: 32,
  },
  lessonContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  lessonSubject: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lessonTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  lessonDuration: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

export default Card;
