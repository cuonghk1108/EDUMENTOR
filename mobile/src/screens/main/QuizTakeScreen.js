/**
 * EduMentor AI - Quiz Take Screen
 * Interactive quiz with progress tracking
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';

const { width } = Dimensions.get('window');

// Dummy quiz data
const QUIZ_DATA = {
  title: 'Quiz: Tích phân xác định',
  subject: 'Toán 12',
  totalTime: 300, // 5 minutes in seconds
  questions: [
    {
      id: 1,
      question: 'Tích phân ∫₀¹ x² dx bằng bao nhiêu?',
      options: ['1/3', '1/2', '1', '2/3'],
      correct: 0,
    },
    {
      id: 2,
      question: 'Công thức Newton-Leibniz được viết là:',
      options: [
        '∫ₐᵇ f(x)dx = F(a) - F(b)',
        '∫ₐᵇ f(x)dx = F(b) - F(a)',
        '∫ₐᵇ f(x)dx = F(a) + F(b)',
        '∫ₐᵇ f(x)dx = F(b) + F(a)',
      ],
      correct: 1,
    },
    {
      id: 3,
      question: 'Nếu ∫₀² f(x)dx = 4 và ∫₀² g(x)dx = 3, thì ∫₀² [f(x) + g(x)]dx = ?',
      options: ['1', '7', '12', '-1'],
      correct: 1,
    },
    {
      id: 4,
      question: 'Tích phân ∫₁² (1/x) dx có giá trị là:',
      options: ['1', 'ln 2', '0', '2'],
      correct: 1,
    },
    {
      id: 5,
      question: 'Diện tích hình phẳng giới hạn bởi y = x², trục Ox và x = 2 là:',
      options: ['4/3', '8/3', '4', '2'],
      correct: 1,
    },
  ],
};

const QuizTakeScreen = ({ navigation, route }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DATA.totalTime);
  const [showResult, setShowResult] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Update progress animation
    Animated.timing(progressAnim, {
      toValue: (currentQuestion + 1) / QUIZ_DATA.questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIndex) => {
    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_DATA.questions.length - 1) {
      // Fade transition
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setCurrentQuestion(currentQuestion + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setCurrentQuestion(currentQuestion - 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      });
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Nộp bài',
      `Bạn đã trả lời ${Object.keys(selectedAnswers).length}/${QUIZ_DATA.questions.length} câu. Xác nhận nộp bài?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Nộp bài', 
          onPress: () => {
            const score = calculateScore();
            navigation.replace('QuizResult', { 
              score, 
              total: QUIZ_DATA.questions.length,
              answers: selectedAnswers,
              quiz: QUIZ_DATA,
            });
          }
        },
      ]
    );
  };

  const calculateScore = () => {
    let correct = 0;
    QUIZ_DATA.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correct++;
      }
    });
    return correct;
  };

  const question = QUIZ_DATA.questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== undefined;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            Alert.alert('Thoát', 'Bạn có chắc muốn thoát? Tiến độ sẽ không được lưu.', [
              { text: 'Ở lại' },
              { text: 'Thoát', onPress: () => navigation.goBack(), style: 'destructive' },
            ]);
          }}
        >
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.quizTitle}>{QUIZ_DATA.title}</Text>
          <Text style={styles.quizSubject}>{QUIZ_DATA.subject}</Text>
        </View>
        
        {/* Timer */}
        <View style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>
          <Ionicons 
            name="time-outline" 
            size={16} 
            color={timeLeft < 60 ? Colors.error : Colors.primary} 
          />
          <Text style={[styles.timerText, timeLeft < 60 && styles.timerTextWarning]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1}/{QUIZ_DATA.questions.length}
        </Text>
      </View>

      {/* Question Navigator */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.questionNav}
        contentContainerStyle={styles.questionNavContent}
      >
        {QUIZ_DATA.questions.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.questionDot,
              currentQuestion === index && styles.questionDotActive,
              selectedAnswers[index] !== undefined && styles.questionDotAnswered,
            ]}
            onPress={() => setCurrentQuestion(index)}
          >
            <Text style={[
              styles.questionDotText,
              (currentQuestion === index || selectedAnswers[index] !== undefined) && 
                styles.questionDotTextActive,
            ]}>
              {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Question Content */}
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.questionBadge}>
                <Text style={styles.questionBadgeText}>Câu {currentQuestion + 1}</Text>
              </View>
            </View>
            
            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              const optionLetter = ['A', 'B', 'C', 'D'][index];
              
              return (
                <Animated.View
                  key={index}
                  style={{ transform: [{ scale: isSelected ? scaleAnim : 1 }] }}
                >
                  <TouchableOpacity
                    style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                    onPress={() => handleSelectAnswer(index)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                      <Text style={[styles.optionLetterText, isSelected && styles.optionLetterTextSelected]}>
                        {optionLetter}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navBtn, currentQuestion === 0 && styles.navBtnDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={currentQuestion === 0 ? Colors.gray300 : Colors.primary} 
          />
          <Text style={[styles.navBtnText, currentQuestion === 0 && styles.navBtnTextDisabled]}>
            Trước
          </Text>
        </TouchableOpacity>

        {currentQuestion === QUIZ_DATA.questions.length - 1 ? (
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.submitBtnGradient}
            >
              <Text style={styles.submitBtnText}>Nộp bài ({answeredCount}/{QUIZ_DATA.questions.length})</Text>
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navBtn}
            onPress={handleNext}
          >
            <Text style={styles.navBtnText}>Sau</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
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
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  quizTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quizSubject: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  timerWarning: {
    backgroundColor: Colors.error + '15',
  },
  timerText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  timerTextWarning: {
    color: Colors.error,
  },
  
  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  
  // Question Nav
  questionNav: {
    maxHeight: 50,
  },
  questionNavContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  questionDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  questionDotActive: {
    backgroundColor: Colors.primary,
  },
  questionDotAnswered: {
    backgroundColor: Colors.success,
  },
  questionDotText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  questionDotTextActive: {
    color: Colors.white,
  },
  
  // Question Content
  questionContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  questionBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  questionBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  questionText: {
    fontSize: FontSize.lg,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  
  // Options
  optionsContainer: {
    marginBottom: Spacing.lg,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.gray200,
    ...Shadow.sm,
  },
  optionBtnSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionLetterSelected: {
    backgroundColor: Colors.primary,
  },
  optionLetterText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  optionLetterTextSelected: {
    color: Colors.white,
  },
  optionText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  
  // Navigation
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.surface,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  navBtnTextDisabled: {
    color: Colors.gray300,
  },
  submitBtn: {
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  submitBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
    marginRight: Spacing.sm,
  },
});

export default QuizTakeScreen;
