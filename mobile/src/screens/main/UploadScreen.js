/**
 * EduMentor AI - Upload Screen
 * Document/Image upload with AI processing - Multiple files support
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Header, Button, Badge } from '../../components';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';

const MAX_FILES = 10;

const UploadScreen = ({ navigation }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [processing, setProcessing] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const addFiles = (newFiles) => {
    const remainingSlots = MAX_FILES - selectedFiles.length;
    
    if (remainingSlots <= 0) {
      Alert.alert('Giới hạn', `Chỉ có thể tải lên tối đa ${MAX_FILES} file`);
      return;
    }
    
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    if (newFiles.length > remainingSlots) {
      Alert.alert(
        'Thông báo',
        `Chỉ thêm được ${remainingSlots} file. Giới hạn tối đa ${MAX_FILES} file.`
      );
    }
    
    setSelectedFiles((prev) => [...prev, ...filesToAdd]);
  };

  const pickDocuments = async () => {
    animatePress();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: true, // Enable multiple selection
      });
      
      if (!result.canceled && result.assets?.length > 0) {
        const newFiles = result.assets.map((file, index) => ({
          id: `doc_${Date.now()}_${index}`,
          name: file.name,
          size: file.size,
          uri: file.uri,
          type: file.mimeType || 'application/pdf',
          progress: 0,
          status: 'pending', // pending, uploading, done, error
        }));
        
        addFiles(newFiles);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn tài liệu');
    }
  };

  const pickImages = async () => {
    animatePress();
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true, // Enable multiple selection
        selectionLimit: MAX_FILES - selectedFiles.length,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const newFiles = result.assets.map((image, index) => ({
          id: `img_${Date.now()}_${index}`,
          name: image.fileName || `image_${Date.now()}_${index}.jpg`,
          size: image.fileSize || 0,
          uri: image.uri,
          type: 'image/jpeg',
          progress: 0,
          status: 'pending',
        }));
        
        addFiles(newFiles);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const takePhoto = async () => {
    animatePress();
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền sử dụng camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const image = result.assets[0];
        const newFile = {
          id: `photo_${Date.now()}`,
          name: `photo_${Date.now()}.jpg`,
          size: image.fileSize || 0,
          uri: image.uri,
          type: 'image/jpeg',
          progress: 0,
          status: 'pending',
        };
        
        addFiles([newFile]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTotalSize = () => {
    const total = selectedFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    return formatFileSize(total);
  };

  const removeFile = (fileId) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const clearAllFiles = () => {
    Alert.alert(
      'Xóa tất cả',
      'Bạn có chắc muốn xóa tất cả file đã chọn?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            setSelectedFiles([]);
            setUploadProgress({});
          }
        },
      ]
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setCurrentUploadIndex(0);
    
    // Upload files sequentially
    for (let i = 0; i < selectedFiles.length; i++) {
      setCurrentUploadIndex(i);
      const file = selectedFiles[i];
      
      // Update status to uploading
      setSelectedFiles((prev) => 
        prev.map((f) => f.id === file.id ? { ...f, status: 'uploading' } : f)
      );
      
      // Simulate upload progress for each file
      await new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 25;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Update file status to done
            setSelectedFiles((prev) => 
              prev.map((f) => f.id === file.id ? { ...f, status: 'done', progress: 100 } : f)
            );
            setUploadProgress((prev) => ({ ...prev, [file.id]: 100 }));
            
            resolve();
          } else {
            setUploadProgress((prev) => ({ ...prev, [file.id]: progress }));
            setSelectedFiles((prev) => 
              prev.map((f) => f.id === file.id ? { ...f, progress } : f)
            );
          }
        }, 200);
      });
    }
    
    setUploading(false);
    setProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setProcessing(false);
      const fileCount = selectedFiles.length;
      Alert.alert(
        '✨ Xử lý thành công!',
        `AI đã phân tích ${fileCount} tài liệu của bạn. Bạn có muốn xem bài học ngay?`,
        [
          { text: 'Để sau', style: 'cancel' },
          { 
            text: 'Xem ngay', 
            onPress: () => {
              setSelectedFiles([]);
              setUploadProgress({});
              navigation.navigate('Lessons');
            }
          },
        ]
      );
    }, 2000);
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image')) return 'image';
    if (file.type?.includes('pdf')) return 'document-text';
    return 'document';
  };

  const pendingFiles = selectedFiles.filter(f => f.status !== 'done');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Tải lên" 
        subtitle={selectedFiles.length > 0 ? `${selectedFiles.length} file đã chọn` : "Tải tài liệu để AI phân tích"}
        centerTitle={false}
        rightIcon={selectedFiles.length > 0 ? "trash-outline" : undefined}
        onRightPress={selectedFiles.length > 0 ? clearAllFiles : undefined}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Upload Area */}
        <Animated.View style={[styles.uploadArea, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={[Colors.primary + '08', Colors.primary + '15']}
            style={styles.uploadGradient}
          >
            <View style={styles.uploadIcon}>
              <Ionicons name="cloud-upload" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.uploadTitle}>Chọn tài liệu</Text>
            <Text style={styles.uploadSubtitle}>Hỗ trợ nhiều file • PDF, ảnh bài giảng, đề thi...</Text>
            
            {/* Upload Options */}
            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.optionBtn} onPress={pickDocuments}>
                <View style={[styles.optionIcon, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name="documents" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.optionText}>PDF</Text>
                <Text style={styles.optionHint}>Nhiều file</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.optionBtn} onPress={pickImages}>
                <View style={[styles.optionIcon, { backgroundColor: Colors.secondary + '15' }]}>
                  <Ionicons name="images" size={24} color={Colors.secondary} />
                </View>
                <Text style={styles.optionText}>Thư viện</Text>
                <Text style={styles.optionHint}>Nhiều ảnh</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.optionBtn} onPress={takePhoto}>
                <View style={[styles.optionIcon, { backgroundColor: Colors.accent + '15' }]}>
                  <Ionicons name="camera" size={24} color={Colors.accent} />
                </View>
                <Text style={styles.optionText}>Camera</Text>
                <Text style={styles.optionHint}>Chụp ảnh</Text>
              </TouchableOpacity>
            </View>
            
            {/* File limit info */}
            <View style={styles.limitInfo}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.limitText}>
                Tối đa {MAX_FILES} file • {selectedFiles.length}/{MAX_FILES} đã chọn
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <View style={styles.filesSection}>
            <View style={styles.filesSectionHeader}>
              <Text style={styles.filesSectionTitle}>
                📁 File đã chọn ({selectedFiles.length})
              </Text>
              <Text style={styles.totalSize}>Tổng: {getTotalSize()}</Text>
            </View>
            
            {selectedFiles.map((file) => {
              const progress = uploadProgress[file.id] || file.progress || 0;
              const isUploading = file.status === 'uploading';
              const isDone = file.status === 'done';
              
              return (
                <View key={file.id} style={styles.fileCard}>
                  <View style={styles.fileInfo}>
                    <View style={[
                      styles.fileIconWrapper,
                      isDone && { backgroundColor: Colors.success + '15' }
                    ]}>
                      {isDone ? (
                        <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
                      ) : (
                        <Ionicons name={getFileIcon(file)} size={28} color={Colors.primary} />
                      )}
                    </View>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      <View style={styles.fileMeta}>
                        <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                        {isDone && (
                          <Badge text="✓ Đã tải" variant="success" size="small" />
                        )}
                        {isUploading && (
                          <Badge text="Đang tải..." variant="primary" size="small" />
                        )}
                      </View>
                    </View>
                    {!uploading && !processing && (
                      <TouchableOpacity 
                        style={styles.removeBtn} 
                        onPress={() => removeFile(file.id)}
                      >
                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Progress Bar */}
                  {(isUploading || (progress > 0 && progress < 100)) && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[styles.progressFill, { width: `${progress}%` }]} 
                        />
                      </View>
                      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Processing Status */}
        {processing && (
          <View style={styles.processingCard}>
            <View style={styles.processingIcon}>
              <Ionicons name="sparkles" size={32} color={Colors.primary} />
            </View>
            <View style={styles.processingContent}>
              <Text style={styles.processingTitle}>AI đang phân tích...</Text>
              <Text style={styles.processingSubtitle}>
                Đang xử lý {selectedFiles.length} tài liệu
              </Text>
            </View>
          </View>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && !uploading && !processing && pendingFiles.length > 0 && (
          <View style={styles.uploadBtnContainer}>
            <Button
              title={`✨ Tải lên ${selectedFiles.length} file`}
              onPress={handleUpload}
              size="large"
            />
            {uploading && (
              <Text style={styles.uploadingInfo}>
                Đang tải file {currentUploadIndex + 1}/{selectedFiles.length}...
              </Text>
            )}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Mẹo sử dụng</Text>
          
          <View style={styles.tipCard}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.tipText}>Chọn nhiều file cùng lúc để tiết kiệm thời gian</Text>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.tipText}>Chụp rõ, đủ sáng để OCR chính xác</Text>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.tipText}>AI sẽ tự động nhận diện và phân loại môn học</Text>
          </View>
        </View>

        {/* Recent Uploads */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>📁 Tải lên gần đây</Text>
          
          {[
            { name: 'Đề thi THPT 2024 - Toán.pdf', date: '2 giờ trước', count: 3 },
            { name: 'Bài giảng Vật lý 12.jpg', date: 'Hôm qua', count: 5 },
            { name: 'Hóa học - Chương 5.pdf', date: '3 ngày trước', count: 2 },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.recentItem}>
              <View style={styles.recentIcon}>
                <Ionicons 
                  name={item.name.includes('.pdf') ? 'document-text' : 'image'} 
                  size={20} 
                  color={Colors.primary} 
                />
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.recentDate}>{item.date} • {item.count} bài học</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </TouchableOpacity>
          ))}
        </View>

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
  content: {
    padding: Spacing.lg,
  },
  
  // Upload Area
  uploadArea: {
    marginBottom: Spacing.lg,
  },
  uploadGradient: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  uploadSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  optionBtn: {
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  optionText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  optionHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  limitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '20',
  },
  limitText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  
  // Files Section
  filesSection: {
    marginBottom: Spacing.lg,
  },
  filesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filesSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalSize: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  
  // File Card
  fileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fileSize: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray100,
    borderRadius: 3,
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    width: 40,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'right',
  },
  
  // Processing
  processingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  processingIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  processingContent: {
    flex: 1,
  },
  processingTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  processingSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // Upload Button
  uploadBtnContainer: {
    marginBottom: Spacing.lg,
  },
  uploadingInfo: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  
  // Tips
  tipsSection: {
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  
  // Recent
  recentSection: {
    marginBottom: Spacing.lg,
  },
  recentTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  recentDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default UploadScreen;
