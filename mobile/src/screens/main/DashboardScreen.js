/**
 * EduMentor AI - Dashboard Screen
 * User statistics and progress overview
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header, StatCard, Badge } from '../../components';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';

const { width } = Dimensions.get('window');

// Dummy data
const STATS = {
  totalLessons: 24,
  completedLessons: 18,
  totalQuizzes: 45,
  avgScore: 82,
  studyTime: 1520, // minutes
  streak: 7,
};

const SUBJECTS = [
  { name: 'Toán', score: 85, color: Colors.primary },
  { name: 'Lý', score: 78, color: Colors.secondary },
  { name: 'Hóa', score: 72, color: Colors.success },
  { name: 'Sinh', score: 88, color: Colors.accent },
  { name: 'Văn', score: 65, color: Colors.warning },
];

const WEAK_POINTS = [
  { id: 1, topic: 'Hình học không gian', subject: 'Toán 12', score: 45 },
  { id: 2, topic: 'Tích phân', subject: 'Toán 12', score: 52 },
  { id: 3, topic: 'Điện xoay chiều', subject: 'Lý 12', score: 58 },
];

const DashboardScreen = ({ navigation }) => {
  const [period, setPeriod] = useState('week'); // week, month, all

  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProgress = () => {
    return Math.round((STATS.completedLessons / STATS.totalLessons) * 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Thống kê" subtitle="Tiến độ học tập của bạn" centerTitle={false} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'all'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Tất cả'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Card */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.overviewCard}
        >
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{getProgress()}%</Text>
              <Text style={styles.overviewLabel}>Tiến độ</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{STATS.streak}</Text>
              <Text style={styles.overviewLabel}>🔥 Streak</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{formatStudyTime(STATS.studyTime)}</Text>
              <Text style={styles.overviewLabel}>Thời gian học</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="book" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{STATS.totalLessons}</Text>
            <Text style={styles.statLabel}>Bài học</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.success + '20' }]}>
              <Ionicons name="checkmark-done" size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{STATS.completedLessons}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warning + '20' }]}>
              <Ionicons name="help-circle" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{STATS.totalQuizzes}</Text>
            <Text style={styles.statLabel}>Quiz</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.accent + '20' }]}>
              <Ionicons name="star" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{STATS.avgScore}%</Text>
            <Text style={styles.statLabel}>Điểm TB</Text>
          </View>
        </View>

        {/* Subject Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điểm theo môn</Text>
          <View style={styles.subjectsCard}>
            {SUBJECTS.map((subject, index) => (
              <View key={subject.name} style={styles.subjectRow}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <View style={styles.subjectBarContainer}>
                  <View
                    style={[
                      styles.subjectBar,
                      { width: `${subject.score}%`, backgroundColor: subject.color },
                    ]}
                  />
                </View>
                <Text style={[styles.subjectScore, { color: subject.color }]}>
                  {subject.score}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weak Points */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚠️ Phần cần cải thiện</Text>
            <Badge text="3 chủ đề" variant="warning" />
          </View>
          
          {WEAK_POINTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.weakCard}
              onPress={() => navigation.navigate('LessonDetail', { topic: item.topic })}
            >
              <View style={styles.weakContent}>
                <Text style={styles.weakTopic}>{item.topic}</Text>
                <Text style={styles.weakSubject}>{item.subject}</Text>
              </View>
              <View style={styles.weakScore}>
                <Text style={styles.weakScoreValue}>{item.score}%</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Biểu đồ tiến độ</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBars}>
              {[40, 65, 50, 80, 70, 90, 85].map((height, index) => (
                <View key={index} style={styles.chartBarWrapper}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: `${height}%` },
                      index === 6 && styles.chartBarActive,
                    ]}
                  />
                  <Text style={styles.chartDay}>
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Achievement */}
        <TouchableOpacity style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Ionicons name="trophy" size={32} color={Colors.warning} />
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>Thành tích mới!</Text>
            <Text style={styles.achievementDesc}>Hoàn thành 7 ngày học liên tiếp</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.gray400} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  periodBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    backgroundColor: Colors.gray100,
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.white,
  },
  
  // Overview Card
  overviewCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.white,
  },
  overviewLabel: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.8,
    marginTop: Spacing.xs,
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginRight: Spacing.md,
    ...Shadow.sm,
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.sm * 3) / 4,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    marginRight: Spacing.sm,
    ...Shadow.sm,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  
  // Section
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  
  // Subjects
  subjectsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  subjectName: {
    width: 50,
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  subjectBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    marginHorizontal: Spacing.sm,
  },
  subjectBar: {
    height: '100%',
    borderRadius: 4,
  },
  subjectScore: {
    width: 40,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
  
  // Weak Points
  weakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    ...Shadow.sm,
  },
  weakContent: {
    flex: 1,
  },
  weakTopic: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  weakSubject: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  weakScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weakScoreValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.warning,
    marginRight: Spacing.xs,
  },
  
  // Chart
  chartPlaceholder: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    height: 200,
    ...Shadow.sm,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 24,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
  },
  chartBarActive: {
    backgroundColor: Colors.primary,
  },
  chartDay: {
    marginTop: Spacing.sm,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  
  // Achievement
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  achievementDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default DashboardScreen;
