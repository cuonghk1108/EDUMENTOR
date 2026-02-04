/**
 * EduMentor AI - Chat Screen
 * AI Chat interface with message bubbles
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';

// Initial messages
const INITIAL_MESSAGES = [
  {
    id: 1,
    type: 'bot',
    text: 'Xin chào! 👋 Tôi là trợ lý AI của EduMentor. Tôi có thể giúp bạn giải đáp thắc mắc về bài học, giải bài tập, hoặc giải thích các khái niệm.',
    time: '10:00',
  },
  {
    id: 2,
    type: 'bot',
    text: 'Bạn cần giúp gì hôm nay? 📚',
    time: '10:00',
  },
];

const SUGGESTIONS = [
  'Giải thích tích phân xác định',
  'Cho tôi ví dụ về đạo hàm',
  'Bài tập về hình học không gian',
  'Tóm tắt bài học Vật lý',
];

const ChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Typing animation
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isTyping]);

  const sendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss();
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI typing
    setIsTyping(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsTyping(false);
      
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: generateResponse(text.trim()),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, botResponse]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const generateResponse = (question) => {
    // Simulated AI responses
    if (question.toLowerCase().includes('tích phân')) {
      return '📐 **Tích phân xác định**\n\nTích phân xác định của hàm f(x) từ a đến b được tính theo công thức Newton-Leibniz:\n\n∫ₐᵇ f(x)dx = F(b) - F(a)\n\nTrong đó F(x) là nguyên hàm của f(x).\n\nVí dụ:\n∫₀¹ x² dx = [x³/3]₀¹ = 1/3 - 0 = 1/3\n\nBạn cần giải bài tập cụ thể nào không?';
    } else if (question.toLowerCase().includes('đạo hàm')) {
      return '📊 **Đạo hàm**\n\nĐạo hàm của hàm số y = f(x) tại điểm x₀ là:\n\nf\'(x₀) = lim_{Δx→0} [f(x₀+Δx) - f(x₀)]/Δx\n\nMột số công thức cơ bản:\n• (xⁿ)\' = n·xⁿ⁻¹\n• (sin x)\' = cos x\n• (eˣ)\' = eˣ\n\nBạn muốn tìm hiểu thêm về phần nào?';
    } else if (question.toLowerCase().includes('hình học')) {
      return '📦 **Hình học không gian**\n\nTrong hình học không gian, chúng ta nghiên cứu:\n\n1. **Quan hệ song song, vuông góc** giữa đường thẳng và mặt phẳng\n2. **Thể tích khối đa diện**: hình hộp, lăng trụ, chóp\n3. **Mặt cầu, hình trụ, hình nón**\n\nBạn cần giải bài tập về phần nào?';
    }
    
    return '🤔 Tôi đã hiểu câu hỏi của bạn. Hãy để tôi giúp bạn!\n\nĐây là một chủ đề thú vị. Bạn có thể cho tôi biết thêm chi tiết hoặc hỏi một câu hỏi cụ thể để tôi có thể hỗ trợ tốt hơn.\n\nTôi có thể giúp bạn:\n• Giải thích khái niệm\n• Giải bài tập\n• Đưa ra ví dụ minh họa\n• Tóm tắt bài học';
  };

  const renderMessage = (message, index) => {
    const isBot = message.type === 'bot';
    
    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isBot ? styles.botMessageContainer : styles.userMessageContainer,
        ]}
      >
        {isBot && (
          <View style={styles.botAvatar}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.avatarGradient}
            >
              <Ionicons name="sparkles" size={18} color={Colors.white} />
            </LinearGradient>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isBot ? styles.botBubble : styles.userBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isBot ? styles.botText : styles.userText,
          ]}>
            {message.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isBot ? styles.botTime : styles.userTime,
          ]}>
            {message.time}
          </Text>
        </View>
      </Animated.View>
    );
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
          <View style={styles.headerAvatar}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.headerAvatarGradient}
            >
              <Ionicons name="sparkles" size={20} color={Colors.white} />
            </LinearGradient>
          </View>
          <View>
            <Text style={styles.headerTitle}>Trợ lý AI</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? 'Đang gõ...' : 'Online'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map(renderMessage)}
        
        {/* Typing Indicator */}
        {isTyping && (
          <View style={[styles.messageContainer, styles.botMessageContainer]}>
            <View style={styles.botAvatar}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.avatarGradient}
              >
                <Ionicons name="sparkles" size={18} color={Colors.white} />
              </LinearGradient>
            </View>
            <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
              <View style={styles.typingDots}>
                {[0, 1, 2].map((i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.typingDot,
                      {
                        opacity: typingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: i === 1 ? [0.4, 1] : [1, 0.4],
                        }),
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggestions */}
      {messages.length <= 3 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
        >
          {SUGGESTIONS.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => sendMessage(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="attach" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Nhập câu hỏi..."
              placeholderTextColor={Colors.gray400}
              multiline
              maxLength={500}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={inputText.trim() ? [Colors.primary, Colors.primaryDark] : [Colors.gray300, Colors.gray300]}
              style={styles.sendBtnGradient}
            >
              <Ionicons name="send" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    backgroundColor: Colors.surface,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  headerAvatar: {
    marginRight: Spacing.sm,
  },
  headerAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerStatus: {
    fontSize: FontSize.sm,
    color: Colors.success,
  },
  moreBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    marginRight: Spacing.sm,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  botBubble: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xs,
    ...Shadow.sm,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: BorderRadius.xs,
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  botText: {
    color: Colors.textPrimary,
  },
  userText: {
    color: Colors.white,
  },
  messageTime: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  botTime: {
    color: Colors.textSecondary,
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  
  // Typing
  typingBubble: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: 2,
  },
  
  // Suggestions
  suggestionsContainer: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    backgroundColor: Colors.surface,
  },
  suggestionsContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  suggestionText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  attachBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.sm,
    maxHeight: 120,
  },
  input: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;
