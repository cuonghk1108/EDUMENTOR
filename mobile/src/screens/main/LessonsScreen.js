/**
 * EduMentor AI - Lessons Screen
 * List of all lessons with categories
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header, SearchInput, Badge, LessonCard } from '../../components';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';

const { width } = Dimensions.get('window');

// Dummy data
const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'grid', count: 24 },
  { id: 'math', name: 'Toán', icon: 'calculator', count: 8 },
  { id: 'physics', name: 'Vật lý', icon: 'flash', count: 6 },
  { id: 'chemistry', name: 'Hóa học', icon: 'flask', count: 5 },
  { id: 'biology', name: 'Sinh học', icon: 'leaf', count: 3 },
  { id: 'literature', name: 'Văn học', icon: 'book', count: 2 },
];

const LESSONS = [
  {
    id: 1,
    title: 'Tích phân xác định',
    subject: 'Toán 12',
    chapter: 'Chương 3',
    duration: 45,
    completed: true,
    score: 85,
    category: 'math',
  },
  {
    id: 2,
    title: 'Dao động điều hòa',
    subject: 'Vật lý 12',
    chapter: 'Chương 1',
    duration: 30,
    completed: true,
    score: 72,
    category: 'physics',
  },
  {
    id: 3,
    title: 'Cấu tạo nguyên tử',
    subject: 'Hóa học 10',
    chapter: 'Chương 2',
    duration: 35,
    completed: false,
    score: null,
    category: 'chemistry',
  },
  {
    id: 4,
    title: 'Hình học không gian',
    subject: 'Toán 12',
    chapter: 'Chương 4',
    duration: 50,
    completed: false,
    score: null,
    category: 'math',
  },
  {
    id: 5,
    title: 'Điện xoay chiều',
    subject: 'Vật lý 12',
    chapter: 'Chương 3',
    duration: 40,
    completed: false,
    score: null,
    category: 'physics',
  },
  {
    id: 6,
    title: 'Di truyền học',
    subject: 'Sinh học 12',
    chapter: 'Chương 2',
    duration: 55,
    completed: false,
    score: null,
    category: 'biology',
  },
];

const LessonsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredLessons = LESSONS.filter((lesson) => {
    const matchCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    const matchSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       lesson.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const renderCategoryItem = ({ item }) => {
    const isActive = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryItem, isActive && styles.categoryItemActive]}
        onPress={() => setSelectedCategory(item.id)}
      >
        <View style={[styles.categoryIcon, isActive && styles.categoryIconActive]}>
          <Ionicons
            name={item.icon}
            size={20}
            color={isActive ? Colors.white : Colors.textSecondary}
          />
        </View>
        <Text style={[styles.categoryName, isActive && styles.categoryNameActive]}>
          {item.name}
        </Text>
        <Badge 
          text={item.count.toString()} 
          variant={isActive ? 'primary' : 'default'} 
          size="small" 
        />
      </TouchableOpacity>
    );
  };

  const renderLessonItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={() => navigation.navigate('LessonDetail', { lesson: item })}
        activeOpacity={0.7}
      >
        <View style={styles.lessonHeader}>
          <View style={[styles.lessonIcon, { 
            backgroundColor: item.completed ? Colors.success + '15' : Colors.primary + '15' 
          }]}>
            <Ionicons
              name={item.completed ? 'checkmark-circle' : 'book'}
              size={24}
              color={item.completed ? Colors.success : Colors.primary}
            />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.lessonSubject}>{item.subject} • {item.chapter}</Text>
          </View>
          {item.completed && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{item.score}%</Text>
            </View>
          )}
        </View>
        
        <View style={styles.lessonFooter}>
          <View style={styles.lessonMeta}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.lessonDuration}>{item.duration} phút</Text>
          </View>
          
          <View style={styles.lessonActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="volume-high-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="help-circle-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Progress bar for incomplete lessons */}
        {!item.completed && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '30%' }]} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Bài học" 
        subtitle={`${filteredLessons.length} bài học`}
        centerTitle={false}
        rightIcon="options"
        onRightPress={() => {}}
      />
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm bài học..."
        />
      </View>

      {/* Categories */}
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {LESSONS.filter(l => l.completed).length}/{LESSONS.length}
          </Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(LESSONS.filter(l => l.completed).reduce((sum, l) => sum + (l.score || 0), 0) / 
            LESSONS.filter(l => l.completed).length || 0)}%
          </Text>
          <Text style={styles.statLabel}>Điểm TB</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {LESSONS.reduce((sum, l) => sum + l.duration, 0)} phút
          </Text>
          <Text style={styles.statLabel}>Tổng thời gian</Text>
        </View>
      </View>

      {/* Lessons List */}
      <Animated.FlatList
        data={filteredLessons}
        renderItem={renderLessonItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lessonList}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={Colors.gray300} />
            <Text style={styles.emptyText}>Không tìm thấy bài học</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  
  // Categories
  categoryList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    ...Shadow.sm,
  },
  categoryItemActive: {
    backgroundColor: Colors.primary,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  categoryIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryName: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  categoryNameActive: {
    color: Colors.white,
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray200,
    marginVertical: Spacing.xs,
  },
  
  // Lessons
  lessonList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  lessonCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  lessonSubject: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scoreContainer: {
    backgroundColor: Colors.success + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  scoreText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.success,
  },
  lessonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonDuration: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  lessonActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray100,
    borderRadius: 2,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  
  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});

export default LessonsScreen;
