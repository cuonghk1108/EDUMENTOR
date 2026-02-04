/**
 * EduMentor AI - Quiz Result Screen
 * Display quiz results with score and review
 */

import React, { useRef, useEffect } from 'react';
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
import { Button, Badge } from '../../components';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';

const { width } = Dimensions.get('window');

const QuizResultScreen = ({ navigation, route }) => {
  const { score = 4, total = 5, answers = {}, quiz } = route?.params || {};
  
  const percentage = Math.round((score / total) * 100);
  const isPassed = percentage >= 60;
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const getResultConfig = () => {
    if (percentage >= 90) {
      return {
        icon: 'trophy',
        title: 'Xuất sắc! 🎉',
        subtitle: 'Bạn đã nắm vững kiến thức',
        color: Colors.success,
        gradient: ['#10B981', '#059669'],
      };
    } else if (percentage >= 70) {
      return {
        icon: 'happy',
        title: 'Tốt lắm! 👍',
        subtitle: 'Tiếp tục phát huy nhé',
        color: Colors.primary,
        gradient: [Colors.primary, Colors.primaryDark],
      };
    } else if (percentage >= 60) {
      return {
        icon: 'thumbs-up',
        title: 'Đạt yêu cầu',
        subtitle: 'Cần ôn tập thêm một chút',
        color: Colors.warning,
        gradient: ['#F59E0B', '#D97706'],
      };
    } else {
      return {
        icon: 'refresh',
        title: 'Cần cố gắng hơn',
        subtitle: 'Hãy xem lại bài học và thử lại',
        color: Colors.error,
        gradient: ['#EF4444', '#DC2626'],
      };
    }
  };

  const config = getResultConfig();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎓 Kết quả Quiz EduMentor AI\n📝 ${quiz?.title || 'Quiz'}\n✅ Điểm: ${score}/${total} (${percentage}%)\n${isPassed ? '🏆 Đạt!' : '📚 Cần cố gắng thêm'}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Result Card */}
        <Animated.View
          style={[
            styles.resultCard,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={config.gradient}
            style={styles.resultGradient}
          >
            {/* Animated Trophy/Icon */}
            <Animated.View
              style={[
                styles.resultIconContainer,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <Ionicons name={config.icon} size={64} color={Colors.white} />
            </Animated.View>
            
            <Text style={styles.resultTitle}>{config.title}</Text>
            <Text style={styles.resultSubtitle}>{config.subtitle}</Text>
            
            {/* Score Circle */}
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{percentage}%</Text>
              <Text style={styles.scoreLabel}>{score}/{total} câu đúng</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Đúng</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="close-circle" size={28} color={Colors.error} />
            <Text style={styles.statValue}>{total - score}</Text>
            <Text style={styles.statLabel}>Sai</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time" size={28} color={Colors.primary} />
            <Text style={styles.statValue}>4:32</Text>
            <Text style={styles.statLabel}>Thời gian</Text>
          </View>
        </Animated.View>

        {/* Quick Review */}
        <Animated.View style={[styles.reviewSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>📝 Kết quả chi tiết</Text>
          
          {quiz?.questions?.map((q, index) => {
            const isCorrect = answers[index] === q.correct;
            return (
              <View key={index} style={styles.reviewItem}>
                <View style={[
                  styles.reviewIcon,
                  { backgroundColor: isCorrect ? Colors.success + '15' : Colors.error + '15' }
                ]}>
                  <Ionicons
                    name={isCorrect ? 'checkmark' : 'close'}
                    size={18}
                    color={isCorrect ? Colors.success : Colors.error}
                  />
                </View>
                <Text style={styles.reviewText} numberOfLines={1}>Câu {index + 1}</Text>
                <Badge 
                  text={isCorrect ? 'Đúng' : 'Sai'} 
                  variant={isCorrect ? 'success' : 'error'}
                  size="small"
                />
              </View>
            );
          }) || (
            // Fallback if no quiz data
            [0, 1, 2, 3, 4].map((index) => {
              const isCorrect = index < score;
              return (
                <View key={index} style={styles.reviewItem}>
                  <View style={[
                    styles.reviewIcon,
                    { backgroundColor: isCorrect ? Colors.success + '15' : Colors.error + '15' }
                  ]}>
                    <Ionicons
                      name={isCorrect ? 'checkmark' : 'close'}
                      size={18}
                      color={isCorrect ? Colors.success : Colors.error}
                    />
                  </View>
                  <Text style={styles.reviewText}>Câu {index + 1}</Text>
                  <Badge 
                    text={isCorrect ? 'Đúng' : 'Sai'} 
                    variant={isCorrect ? 'success' : 'error'}
                    size="small"
                  />
                </View>
              );
            })
          )}
        </Animated.View>

        {/* Recommendations */}
        {!isPassed && (
          <Animated.View style={[styles.recommendSection, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>💡 Gợi ý</Text>
            <View style={styles.recommendCard}>
              <Ionicons name="bulb" size={24} color={Colors.warning} />
              <View style={styles.recommendContent}>
                <Text style={styles.recommendTitle}>Xem lại bài học</Text>
                <Text style={styles.recommendDesc}>
                  Ôn tập các phần còn yếu để cải thiện điểm số
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View style={[styles.actionButtons, { opacity: fadeAnim }]}>
          <Button
            title="📖 Xem đáp án chi tiết"
            variant="outline"
            onPress={() => navigation.navigate('QuizReview', { answers, quiz })}
            style={{ marginBottom: Spacing.md }}
          />
          
          <Button
            title="🔄 Làm lại Quiz"
            variant="secondary"
            onPress={() => navigation.replace('QuizTake', route?.params)}
            style={{ marginBottom: Spacing.md }}
          />
          
          <Button
            title="🏠 Về trang chủ"
            onPress={() => navigation.navigate('Home')}
          />
        </Animated.View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color={Colors.primary} />
          <Text style={styles.shareBtnText}>Chia sẻ kết quả</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  
  // Result Card
  resultCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  resultGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  resultIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  resultSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.lg,
  },
  scoreCircle: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scoreLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    ...Shadow.sm,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  
  // Review
  reviewSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  reviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  reviewText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  
  // Recommendations
  recommendSection: {
    marginTop: Spacing.lg,
  },
  recommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  recommendContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  recommendTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  recommendDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // Actions
  actionButtons: {
    marginTop: Spacing.xl,
  },
  
  // Share
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  shareBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
});

export default QuizResultScreen;
