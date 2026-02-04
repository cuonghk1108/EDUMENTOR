/**
 * EduMentor AI - Register Screen
 * New user registration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { Colors, FontSize, Spacing, BorderRadius } from '../../theme';

const { height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu ít nhất 6 ký tự';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // TODO: Call API register
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigation.replace('Main');
    } catch (error) {
      setErrors({ general: 'Đăng ký thất bại. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tạo tài khoản</Text>
          <Text style={styles.headerSubtitle}>Bắt đầu hành trình học tập của bạn</Text>
        </View>

        <View style={styles.wave}>
          <View style={styles.waveInner} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error Banner */}
          {errors.general && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={Colors.error} />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          {/* Name Input */}
          <Input
            label="Họ và tên"
            value={formData.name}
            onChangeText={(v) => updateForm('name', v)}
            placeholder="Nguyễn Văn A"
            autoCapitalize="words"
            error={errors.name}
            icon={<Ionicons name="person-outline" size={20} color={Colors.gray400} />}
          />

          {/* Email Input */}
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(v) => updateForm('email', v)}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            icon={<Ionicons name="mail-outline" size={20} color={Colors.gray400} />}
          />

          {/* Grade Selector */}
          <Input
            label="Lớp (tuỳ chọn)"
            value={formData.grade}
            onChangeText={(v) => updateForm('grade', v)}
            placeholder="VD: 12A1"
            autoCapitalize="characters"
            icon={<Ionicons name="school-outline" size={20} color={Colors.gray400} />}
          />

          {/* Password Input */}
          <Input
            label="Mật khẩu"
            value={formData.password}
            onChangeText={(v) => updateForm('password', v)}
            placeholder="Ít nhất 6 ký tự"
            secureTextEntry
            error={errors.password}
            icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.gray400} />}
          />

          {/* Confirm Password */}
          <Input
            label="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChangeText={(v) => updateForm('confirmPassword', v)}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            error={errors.confirmPassword}
            icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.gray400} />}
          />

          {/* Terms */}
          <Text style={styles.terms}>
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Text style={styles.termsLink}>Điều khoản sử dụng</Text>
            {' '}và{' '}
            <Text style={styles.termsLink}>Chính sách bảo mật</Text>
            {' '}của chúng tôi.
          </Text>

          {/* Register Button */}
          <Button
            title="Đăng ký"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.registerButton}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: height * 0.22,
    justifyContent: 'center',
    paddingTop: Spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.xxl + Spacing.md,
    left: Spacing.md,
    zIndex: 10,
    padding: Spacing.xs,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    opacity: 0.8,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    overflow: 'hidden',
  },
  waveInner: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    right: -20,
    height: 60,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorBannerText: {
    marginLeft: Spacing.sm,
    color: Colors.error,
    fontSize: FontSize.sm,
    flex: 1,
  },
  terms: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: Spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
