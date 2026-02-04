/**
 * EduMentor AI - Profile Screen
 * User profile and settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header, Badge } from '../../components';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';

const ProfileScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const user = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    grade: 'Lớp 12',
    school: 'THPT Chuyên Lê Hồng Phong',
    avatar: null,
    stats: {
      lessons: 18,
      quizzes: 45,
      streak: 7,
    },
  };

  const menuSections = [
    {
      title: 'Tài khoản',
      items: [
        { icon: 'person-outline', label: 'Thông tin cá nhân', screen: 'EditProfile' },
        { icon: 'school-outline', label: 'Học vấn', screen: 'Education' },
        { icon: 'shield-checkmark-outline', label: 'Bảo mật', screen: 'Security' },
      ],
    },
    {
      title: 'Học tập',
      items: [
        { icon: 'bookmark-outline', label: 'Bài học đã lưu', screen: 'SavedLessons' },
        { icon: 'time-outline', label: 'Lịch sử học tập', screen: 'History' },
        { icon: 'trophy-outline', label: 'Thành tích', screen: 'Achievements' },
      ],
    },
    {
      title: 'Cài đặt',
      items: [
        { icon: 'notifications-outline', label: 'Thông báo', toggle: true, value: notifications, onToggle: setNotifications },
        { icon: 'moon-outline', label: 'Chế độ tối', toggle: true, value: darkMode, onToggle: setDarkMode },
        { icon: 'volume-high-outline', label: 'Tự động phát audio', toggle: true, value: autoPlay, onToggle: setAutoPlay },
      ],
    },
    {
      title: 'Khác',
      items: [
        { icon: 'help-circle-outline', label: 'Trợ giúp & FAQ', screen: 'Help' },
        { icon: 'information-circle-outline', label: 'Về EduMentor AI', screen: 'About' },
        { icon: 'star-outline', label: 'Đánh giá ứng dụng', action: 'rate' },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', onPress: () => navigation.replace('Login'), style: 'destructive' },
      ]
    );
  };

  const renderMenuItem = (item, index, isLast) => {
    if (item.toggle) {
      return (
        <View key={index} style={[styles.menuItem, isLast && styles.menuItemLast]}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={22} color={Colors.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: Colors.gray200, true: Colors.primary + '50' }}
            thumbColor={item.value ? Colors.primary : Colors.gray300}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        style={[styles.menuItem, isLast && styles.menuItemLast]}
        onPress={() => {
          if (item.screen) {
            // navigation.navigate(item.screen);
            Alert.alert('Coming Soon', `${item.label} đang được phát triển`);
          } else if (item.action === 'rate') {
            Alert.alert('Cảm ơn!', 'Cảm ơn bạn đã sử dụng EduMentor AI!');
          }
        }}
      >
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIcon}>
            <Ionicons name={item.icon} size={22} color={Colors.primary} />
          </View>
          <Text style={styles.menuLabel}>{item.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Hồ sơ" centerTitle={false} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.profileCard}
        >
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={styles.userTags}>
            <Badge text={user.grade} variant="light" />
            <View style={{ width: 8 }} />
            <Badge text={user.school} variant="light" />
          </View>
          
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.lessons}</Text>
              <Text style={styles.statLabel}>Bài học</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.quizzes}</Text>
              <Text style={styles.statLabel}>Quiz</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.streak}🔥</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => 
                renderMenuItem(item, index, index === section.items.length - 1)
              )}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>EduMentor AI v1.0.0</Text>

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
  
  // Profile Card
  profileCard: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.md,
  },
  userTags: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.xs,
  },
  
  // Menu
  menuSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.lg,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  
  // Version
  versionText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
});

export default ProfileScreen;
