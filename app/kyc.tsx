import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, useColorScheme, Platform, ScrollView, useWindowDimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

type FileData = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
} | null;

export default function KYCScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWebOrTablet = width > 768;

  const [files, setFiles] = useState<{
    id: FileData;
    selfie: FileData;
    address: FileData;
  }>({
    id: null,
    selfie: null,
    address: null,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleComplete = () => {
    // If no files selected, confirm partial skip or normal skip
    if (!files.id && !files.selfie && !files.address) {
      Alert.alert(
        'No documents selected', 
        'Proceed without verification?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: () => router.replace('/(tabs)') }
        ]
      );
      return;
    }
    
    // Show success view (simulating API submit)
    setSubmitted(true);
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const pickDocument = async (type: 'id' | 'selfie' | 'address') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setFiles(prev => ({
        ...prev,
        [type]: {
          name: asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType,
          size: asset.size,
        }
      }));

    } catch (err) {
      console.error('Error picking document', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSelfieSelection = async (mode: 'camera' | 'gallery') => {
    try {
      let result;
      if (mode === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission required', 'Camera permission is required to take a selfie.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        const asset = result.assets[0];
        setFiles(prev => ({
          ...prev,
          selfie: {
            name: `selfie_${Date.now()}.jpg`,
            uri: asset.uri,
            mimeType: asset.mimeType || 'image/jpeg',
            size: asset.fileSize,
          }
        }));
      }
    } catch (error) {
       console.log('Error processing selfie:', error);
       Alert.alert('Error', 'Could not capture image.');
    }
  };

  const renderSuccessView = () => (
    <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.successContainer}>
      <View style={styles.successIconBg}>
        <Ionicons name="checkmark" size={50} color="#10B981" />
      </View>
      <Text style={styles.successTitle}>Verification Submitted</Text>
      <Text style={styles.successText}>
        Thank you! Our team will review your documents shortly to approve your ID. You will be notified once verified.
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const UploadItem = ({ title, desc, icon, type }: { title: string, desc: string, icon: string, type: 'id' | 'selfie' | 'address' }) => {
    const file = files[type];
    const isSelected = !!file;

    // Special render for Selfie if not selected
    if (type === 'selfie' && !isSelected) {
       return (
        <View style={styles.uploadCard}>
          <View style={styles.iconBox}>
            <Ionicons name="camera-outline" size={24} color="#0F172A" />
          </View>
          <View style={styles.uploadInfo}>
            <Text style={styles.uploadTitle}>{title}</Text>
            <Text style={styles.uploadDesc}>{desc}</Text>
            
            <View style={styles.selfieActions}>
               <TouchableOpacity style={styles.actionBtnSmall} onPress={() => handleSelfieSelection('camera')}>
                 <Ionicons name="camera" size={16} color="#FFF" style={{marginRight:6}} />
                 <Text style={styles.actionBtnText}>Camera</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.actionBtnSmall, styles.actionBtnOutline]} onPress={() => handleSelfieSelection('gallery')}>
                 <Ionicons name="images" size={16} color="#0F172A" style={{marginRight:6}} />
                 <Text style={[styles.actionBtnText, {color: '#0F172A'}]}>Gallery</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
       );
    }

    return (
      <TouchableOpacity 
        style={[styles.uploadCard, isSelected && styles.uploadCardSelected]} 
        onPress={() => pickDocument(type)}
      >
        <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
          <Ionicons 
            name={isSelected ? "checkmark" : icon as any} 
            size={24} 
            color={isSelected ? "#FFF" : "#0F172A"} 
          />
        </View>
        <View style={styles.uploadInfo}>
          <Text style={[styles.uploadTitle, isSelected && styles.textSelected]}>{title}</Text>
          <Text style={[styles.uploadDesc, isSelected && styles.textSelected]} numberOfLines={1}>
            {isSelected ? file?.name : desc}
          </Text>
        </View>
        <View style={styles.uploadAction}>
          {isSelected ? (
             <TouchableOpacity style={styles.removeBtn} onPress={(e) => {
               e.stopPropagation();
               setFiles(prev => ({ ...prev, [type]: null }));
             }}>
               <Ionicons name="close-circle" size={24} color="#EF4444" />
             </TouchableOpacity>
          ) : (
             <Ionicons name="cloud-upload-outline" size={20} color="#94A3B8" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style={isWebOrTablet ? 'dark' : 'light'} />
      
      <View style={[styles.contentContainer, isWebOrTablet ? styles.contentContainerRow : styles.contentContainerCol]}>
        
        {/* Left Panel - Verification Form */}
        <SafeAreaView style={[styles.leftPanel, { width: isWebOrTablet ? '50%' : '100%' }]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formWrapper}>
              
              {!submitted ? (
                <>
                  <Animated.View entering={FadeInUp.delay(200).duration(800)}>
                     <View style={styles.logoRow}>
                       <View style={styles.logoIcon}>
                         <View style={styles.logoInner} />
                       </View>
                       <Text style={styles.brandName}>Recon</Text>
                     </View>
                    <Text style={styles.title}>Identity Verification</Text>
                    <Text style={styles.subtitle}>
                      Build trust with your audience. This step is <Text style={{fontWeight: '700', color: '#0F172A'}}>optional</Text> but recommended.
                    </Text>
                  </Animated.View>

                  <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.cardsContainer}>
                    
                    <UploadItem 
                      title="Government ID" 
                      desc="Passport, Driver's License, or National ID" 
                      icon="id-card-outline"
                      type="id"
                    />

                    <UploadItem 
                      title="Take a Selfie" 
                      desc="Capture a photo or upload from gallery" 
                      icon="camera-outline"
                      type="selfie"
                    />

                    <UploadItem 
                      title="Address Proof" 
                      desc="Utility Bill or Bank Statement" 
                      icon="document-text-outline"
                      type="address"
                    />

                    <View style={styles.actionButtons}>
                      <TouchableOpacity style={styles.submitButton} onPress={handleComplete}>
                        <Text style={styles.submitButtonText}>Submit Verification</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipButtonText}>Skip for now</Text>
                      </TouchableOpacity>
                    </View>

                  </Animated.View>
                </>
              ) : (
                renderSuccessView()
              )}

            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Right Panel - Branding */}
        <View style={[
            styles.rightPanel, 
            { width: isWebOrTablet ? '50%' : '100%', display: isWebOrTablet ? 'flex' : 'none' } 
          ]}>
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={styles.gradientBg}
          >
             <View style={[styles.circle, { width: 300, height: 300, top: '20%', right: -50, opacity: 0.1 }]} />
             <View style={[styles.circle, { width: 150, height: 150, bottom: '10%', left: 50, opacity: 0.1 }]} />

             <View style={styles.brandingContent}>
               <View style={styles.verifiedBadge}>
                 <Ionicons name="shield-checkmark" size={48} color="#FFF" />
               </View>
               
               <Text style={styles.brandingTitle}>News Integrity Matters</Text>
               <Text style={styles.brandingText}>
                 Verified reporters get 3x more visibility and higher trust scores on Recon.
               </Text>

               <View style={styles.benefitsList}>
                 <View style={styles.benefitItem}>
                   <Ionicons name="checkmark-circle" size={20} color="#38BDF8" style={{marginRight: 10}} />
                   <Text style={styles.benefitText}>Blue Verified Badge</Text>
                 </View>
                 <View style={styles.benefitItem}>
                   <Ionicons name="checkmark-circle" size={20} color="#38BDF8" style={{marginRight: 10}} />
                   <Text style={styles.benefitText}>Priority Content Review</Text>
                 </View>
                 <View style={styles.benefitItem}>
                   <Ionicons name="checkmark-circle" size={20} color="#38BDF8" style={{marginRight: 10}} />
                   <Text style={styles.benefitText}>Access to Premium Tools</Text>
                 </View>
               </View>

             </View>
          </LinearGradient>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  contentContainerRow: {
    flexDirection: 'row',
  },
  contentContainerCol: {
    flexDirection: 'column',
  },
  leftPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  formWrapper: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoInner: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  uploadCardSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0F172A',
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBoxSelected: {
    backgroundColor: '#0F172A',
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  uploadDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  textSelected: {
    color: '#0F172A',
    fontWeight: '700',
  },
  uploadAction: {
    padding: 8,
  },
  removeBtn: {
    padding: 4,
  },
  actionButtons: {
    marginTop: 24,
    gap: 16,
  },
  submitButton: {
    backgroundColor: '#0F172A',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  rightPanel: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  brandingContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  verifiedBadge: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brandingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  brandingText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  benefitsList: {
    alignSelf: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  selfieActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  actionBtnSmall: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0F172A',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconBg: {
    width: 100,
    height: 100,
    backgroundColor: '#ECFDF5',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#0F172A',
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
