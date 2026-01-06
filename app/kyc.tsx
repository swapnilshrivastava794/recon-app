import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ScrollView, useWindowDimensions, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from './context/AuthContext';

type FileData = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
} | null;

const ID_TYPES = [
  { label: 'Aadhaar Card', value: 'AADHAAR' },
  { label: 'Passport', value: 'PASSPORT' },
  { label: 'Driving License', value: 'DRIVING_LICENSE' },
  { label: 'Voter ID', value: 'VOTER_ID' },
];

export default function KYCScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signup } = useAuth();
  const { width } = useWindowDimensions();
  const isWebOrTablet = width > 768;

  // Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idType, setIdType] = useState('AADHAAR'); // Default
  const [showIdPicker, setShowIdPicker] = useState(false);
  const [bio, setBio] = useState('');
  
  // File State
  const [files, setFiles] = useState<{
    id: FileData;
    selfie: FileData;
  }>({
    id: null,
    selfie: null,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleComplete = async () => {
    // Validation
    if (!phoneNumber || !city || !state || !pincode || !idNumber) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (!files.id || !files.selfie) {
       Alert.alert('Missing Documents', 'Please upload both your ID and a Selfie.');
       return;
    }

    setLoading(true);

    try {
        const formData = new FormData();
        
        // Account Info (passed from Signup)
        const nameStr = (params.name as string) || '';
        const emailStr = (params.email as string) || '';
        const passStr = (params.password as string) || '';
        const usernameStr = (params.username as string) || '';
        
        // Use passed username or fallback to auto-generated
        const finalUsername = usernameStr || nameStr.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);

        formData.append('username', finalUsername);
        formData.append('email', emailStr);
        formData.append('password', passStr);
        formData.append('role', 'reporter');
        
        // Profile Info
        formData.append('phone_number', phoneNumber);
        formData.append('city', city);
        formData.append('state', state);
        formData.append('pincode', pincode);
        formData.append('bio', bio);
        formData.append('id_proof_number', idNumber);
        formData.append('id_proof_type', idType);
        
        // Optional/Empty fields
        formData.append('years_of_experience', ''); 
        formData.append('address_line1', ''); 
        formData.append('address_line2', ''); 

        // Files
        if (files.selfie) {
            // @ts-ignore
            formData.append('selfie_photo', {
                uri: files.selfie.uri,
                name: files.selfie.name,
                type: files.selfie.mimeType || 'image/jpeg',
            });
        }
        
        if (files.id) {
            // @ts-ignore
            formData.append('id_proof_document', {
                uri: files.id.uri,
                name: files.id.name,
                type: files.id.mimeType || 'application/pdf',
            });
        }

        const success = await signup(formData);
        
        if (success) {
            setSubmitted(true);
        } else {
            Alert.alert("Registration Failed", "Please check your details and try again.");
        }

    } catch (e) {
        Alert.alert("Error", "Something went wrong.");
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const pickDocument = async (type: 'id' | 'selfie') => {
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
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSelfieSelection = async (mode: 'camera' | 'gallery') => {
    try {
      let result;
      if (mode === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission required', 'Camera permission is required.');
            return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
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
       Alert.alert('Error', 'Could not capture image.');
    }
  };

  const renderSuccessView = () => (
    <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.successContainer}>
      <View style={styles.successIconBg}>
        <Ionicons name="checkmark" size={50} color="#10B981" />
      </View>
      <Text style={styles.successTitle}>Registration Successful</Text>
      <Text style={styles.successText}>
        Your account has been created and your documents are under review. You can now log in.
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderIdPickerModal = () => (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }]}>
       <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowIdPicker(false)} />
       <Animated.View entering={FadeInUp.duration(300)} style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select ID Document Type</Text>
          {ID_TYPES.map((type) => (
            <TouchableOpacity 
              key={type.value} 
              style={[styles.modalOption, idType === type.value && styles.modalOptionSelected]}
              onPress={() => {
                setIdType(type.value);
                setShowIdPicker(false);
              }}
            >
              <Text style={[styles.modalOptionText, idType === type.value && styles.modalOptionTextSelected]}>
                {type.label}
              </Text>
              {idType === type.value && <Ionicons name="checkmark" size={20} color="#0F172A" />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowIdPicker(false)}>
             <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
       </Animated.View>
    </View>
  );

  const UploadItem = ({ title, desc, icon, type }: { title: string, desc: string, icon: string, type: 'id' | 'selfie' }) => {
    const file = files[type];
    const isSelected = !!file;

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
          <Ionicons name={isSelected ? "checkmark" : icon as any} size={24} color={isSelected ? "#FFF" : "#0F172A"} />
        </View>
        <View style={styles.uploadInfo}>
          <Text style={[styles.uploadTitle, isSelected && styles.textSelected]}>{title}</Text>
          <Text style={[styles.uploadDesc, isSelected && styles.textSelected]} numberOfLines={1}>
            {isSelected ? file?.name : desc}
          </Text>
        </View>
        <View style={styles.uploadAction}>
          {isSelected && (
             <TouchableOpacity style={styles.removeBtn} onPress={(e) => {
               e.stopPropagation();
               setFiles(prev => ({ ...prev, [type]: null }));
             }}>
               <Ionicons name="close-circle" size={24} color="#EF4444" />
             </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style={isWebOrTablet ? 'dark' : 'light'} />
      {showIdPicker && renderIdPickerModal()}

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
                    <Text style={styles.title}>Complete Your Profile</Text>
                    <Text style={styles.subtitle}>
                      We need a few more details to set up your reporter account.
                    </Text>
                  </Animated.View>

                  <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.cardsContainer}>
                    
                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="1234567890" 
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>

                    {/* ID Details */}
                    <View style={styles.rowInputs}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>ID Type</Text>
                            <TouchableOpacity 
                                style={[styles.input, styles.pickerTrigger]} 
                                onPress={() => setShowIdPicker(true)}
                            >
                                <Text style={styles.pickerText}>
                                   {ID_TYPES.find(d => d.value === idType)?.label}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
                             <Text style={styles.label}>ID Number</Text>
                             <TextInput 
                                style={styles.input} 
                                placeholder="AADHAAR Number" 
                                value={idNumber}
                                onChangeText={setIdNumber}
                            />
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.rowInputs}>
                         <View style={[styles.inputGroup, { flex: 1 }]}>
                             <Text style={styles.label}>City</Text>
                             <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
                         </View>
                         <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                             <Text style={styles.label}>State</Text>
                             <TextInput style={styles.input} placeholder="State" value={state} onChangeText={setState} />
                         </View>
                    </View>
                     <View style={styles.inputGroup}>
                         <Text style={styles.label}>Pincode</Text>
                         <TextInput 
                            style={styles.input} 
                            placeholder="500000" 
                            keyboardType="number-pad"
                            value={pincode}
                            onChangeText={setPincode}
                        />
                     </View>

                    {/* Bio */}
                    <View style={styles.inputGroup}>
                         <Text style={styles.label}>Bio (Optional)</Text>
                         <TextInput 
                            style={[styles.input, { minHeight: 80, paddingVertical: 12 }]} 
                            placeholder="Tell us about yourself..." 
                            multiline
                            textAlignVertical="top"
                            value={bio}
                            onChangeText={setBio}
                        />
                     </View>

                    <Text style={styles.sectionHeader}>Documents</Text>

                    <UploadItem 
                      title="Upload ID Document" 
                      desc="Aadhaar Card or ID Proof (PDF/Image)" 
                      icon="id-card-outline"
                      type="id"
                    />

                    <UploadItem 
                      title="Take/Upload Selfie" 
                      desc="Your photo for profile and verification" 
                      icon="camera-outline"
                      type="selfie"
                    />

                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={[styles.submitButton, loading && { opacity: 0.7 }]} 
                        onPress={handleComplete}
                        disabled={loading}
                      >
                         {loading ? (
                            <ActivityIndicator color="#FFF" />
                         ) : (
                            <Text style={styles.submitButtonText}>Complete Registration</Text>
                         )}
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
                 <Ionicons name="documents" size={48} color="#FFF" />
               </View>
               <Text style={styles.brandingTitle}>Almost There</Text>
               <Text style={styles.brandingText}>
                 Your profile details help us maintain a high-quality network of reporters.
               </Text>
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
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  inputGroup: {
      marginBottom: 0,
  },
  rowInputs: {
      flexDirection: 'row',
  },
  label: {
      fontSize: 13,
      fontWeight: '600',
      color: '#334155',
      marginBottom: 6,
      marginLeft: 2,
  },
  input: {
      height: 48,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 15,
      color: '#0F172A',
      backgroundColor: '#F8FAFC',
      marginBottom: 16,
  },
  sectionHeader: {
      fontSize: 16,
      fontWeight: '700',
      color: '#0F172A',
      marginTop: 8,
      marginBottom: 8,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  uploadDesc: {
    fontSize: 12,
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
  pickerTrigger: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 15,
    color: '#0F172A',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionSelected: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#0F172A',
    fontWeight: '700',
  },
  modalCloseBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
});
