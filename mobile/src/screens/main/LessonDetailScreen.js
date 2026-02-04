/**
 * EduMentor AI - Lesson Detail Screen
 * Full lesson content with text, math, audio
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Header, Button, Badge } from '../../components';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';

const { width } = Dimensions.get('window');

// Dummy lesson content
const LESSON_CONTENT = {
  sections: [
    {
      type: 'heading',
      content: '1. Định nghĩa tích phân xác định',
    },
    {
      type: 'text',
      content: 'Cho hàm số f(x) liên tục trên đoạn [a, b]. Tích phân xác định của hàm số f(x) từ a đến b là giới hạn của tổng Riemann khi số phần tử tiến đến vô cùng.',
    },
    {
      type: 'math',
      content: '∫ₐᵇ f(x)dx = lim_{n→∞} Σᵢ₌₁ⁿ f(xᵢ)Δx',
    },
    {
      type: 'heading',
      content: '2. Công thức Newton-Leibniz',
    },
    {
      type: 'text',
      content: 'Nếu F(x) là một nguyên hàm của f(x) trên [a, b], thì:',
    },
    {
      type: 'math',
      content: '∫ₐᵇ f(x)dx = F(b) - F(a)',
    },
    {
      type: 'note',
      content: '💡 Mẹo: Luôn kiểm tra điều kiện liên tục của hàm số trước khi tính tích phân!',
    },
    {
      type: 'heading',
      content: '3. Ví dụ minh họa',
    },
    {
      type: 'text',
      content: 'Tính tích phân: ∫₀² (x² + 2x)dx',
    },
    {
      type: 'text',
      content: 'Giải: Ta có nguyên hàm F(x) = x³/3 + x²',
    },
    {
      type: 'math',
      content: '∫₀² (x² + 2x)dx = [x³/3 + x²]₀² = (8/3 + 4) - 0 = 20/3',
    },
  ],
};

const LessonDetailScreen = ({ navigation, route }) => {
  const lesson = route?.params?.lesson || {
    title: 'Tích phân xác định',
    subject: 'Toán 12',
    chapter: 'Chương 3',
    duration: 45,
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isSaved, setIsSaved] = useState(false);
  
  const soundRef = useRef(null);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const togglePlay = async () => {
    // In real app, this would play actual audio
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `📚 ${lesson.title}\n${lesson.subject} - ${lesson.chapter}\nHọc cùng EduMentor AI!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderSection = (section, index) => {
    switch (section.type) {
      case 'heading':
        return (
          <Text key={index} style={[styles.heading, { fontSize: fontSize + 4 }]}>
            {section.content}
          </Text>
        );
      case 'text':
        return (
          <Text key={index} style={[styles.paragraph, { fontSize }]}>
            {section.content}
          </Text>
        );
      case 'math':
        return (
          <View key={index} style={styles.mathContainer}>
            <LinearGradient
              colors={[Colors.primary + '08', Colors.primary + '15']}
              style={styles.mathGradient}
            >
              <Text style={[styles.mathText, { fontSize: fontSize + 2 }]}>
                {section.content}
              </Text>
            </LinearGradient>
          </View>
        );
      case 'note':
        return (
          <View key={index} style={styles.noteContainer}>
            <Text style={[styles.noteText, { fontSize: fontSize - 1 }]}>
              {section.content}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubject}>{lesson.subject}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSaved(!isSaved)}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isSaved ? Colors.primary : Colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Header */}
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.lessonMeta}>
            <Badge text={lesson.chapter} variant="primary" />
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.durationText}>{lesson.duration} phút</Text>
            </View>
          </View>
        </View>

        {/* Audio Player */}
        <View style={styles.audioPlayer}>
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.playBtnGradient}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={28}
                color={Colors.white}
              />
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.audioInfo}>
            <Text style={styles.audioTitle}>
              {isPlaying ? '🔊 Đang phát...' : '🎧 Nghe bài giảng'}
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '35%' }]} />
              </View>
              <Text style={styles.audioTime}>3:24 / 9:45</Text>
            </View>
          </View>

          <View style={styles.audioControls}>
            <TouchableOpacity style={styles.audioControlBtn}>
              <Ionicons name="play-back" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.audioControlBtn}>
              <Ionicons name="play-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Font Size Controls */}
        <View style={styles.fontControls}>
          <Text style={styles.fontLabel}>Cỡ chữ:</Text>
          <TouchableOpacity
            style={styles.fontBtn}
            onPress={() => setFontSize(Math.max(12, fontSize - 2))}
          >
            <Ionicons name="remove" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.fontValue}>{fontSize}</Text>
          <TouchableOpacity
            style={styles.fontBtn}
            onPress={() => setFontSize(Math.min(24, fontSize + 2))}
          >
            <Ionicons name="add" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {LESSON_CONTENT.sections.map(renderSection)}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Chat', { lessonId: lesson.id })}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.secondary + '15' }]}>
              <Ionicons name="chatbubbles" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.actionText}>Hỏi AI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('QuizTake', { lessonId: lesson.id })}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.accent + '15' }]}>
              <Ionicons name="help-circle" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.actionText}>Làm Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {}}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.success + '15' }]}>
              <Ionicons name="document-text" size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionText}>Tóm tắt</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Learning */}
        <View style={styles.continueSection}>
          <Button
            title="✅ Hoàn thành bài học"
            onPress={() => navigation.navigate('QuizTake', { lessonId: lesson.id })}
            size="large"
          />
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubject: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  
  // Lesson Header
  lessonHeader: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  lessonTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  durationText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  
  // Audio Player
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.md,
  },
  playBtn: {
    marginRight: Spacing.md,
  },
  playBtnGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  audioTime: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  audioControls: {
    flexDirection: 'row',
    marginLeft: Spacing.sm,
  },
  audioControlBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Font Controls
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  fontLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  fontBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginHorizontal: Spacing.sm,
    minWidth: 24,
    textAlign: 'center',
  },
  
  // Content
  content: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  heading: {
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: Spacing.md,
  },
  mathContainer: {
    marginVertical: Spacing.md,
  },
  mathGradient: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  mathText: {
    fontFamily: 'monospace',
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  noteContainer: {
    backgroundColor: Colors.warning + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  noteText: {
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  
  // Continue
  continueSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
});

export default LessonDetailScreen;
