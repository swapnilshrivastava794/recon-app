import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, useColorScheme, Platform, ScrollView, Alert, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const { width } = useWindowDimensions();
  const isWebOrTablet = width > 768;

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isKycRequired, setIsKycRequired] = useState(true);

  // Auto-fill username when name changes, unless user manually edits username (simplified for now: just auto-fill)
  const handleNameChange = (text: string) => {
    setName(text);
    // Auto-generate username: lowercase, replace spaces with underscores, remove special chars
    const autoUsername = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_');
    setUsername(autoUsername);
  };

  const handleSignup = () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    // Navigate to KYC screen with params
    router.push({
      pathname: '/kyc',
      params: { 
        name,
        username, // Pass username
        email, 
        password 
      }
    });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style={isWebOrTablet ? 'dark' : 'light'} />
      <View style={[styles.contentContainer, isWebOrTablet ? styles.contentContainerRow : styles.contentContainerCol]}>
        
        {/* Left Panel - Form */}
        <SafeAreaView style={[styles.leftPanel, { width: isWebOrTablet ? '50%' : '100%' }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formWrapper}>
                
                {/* Header */}
                <Animated.View entering={FadeInUp.delay(100).duration(700).springify().damping(30).mass(1).stiffness(200)}>
                  <View style={styles.logoRow}>
                    <View style={styles.logoIcon}>
                      <View style={styles.logoInner} />
                    </View>
                    <Text style={styles.brandName}>Recon</Text>
                  </View>
                  <Text style={styles.title}>Create your account</Text>
                  <Text style={styles.subtitle}>Sign up to get started as a Reporter.</Text>
                </Animated.View>

                {/* Form */}
                <Animated.View entering={FadeInUp.delay(200).duration(700).springify().damping(30).mass(1).stiffness(200)} style={styles.formContainer}>
                  
                  {/* Name */}
                   <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor="#9CA3AF"
                      value={name}
                      onChangeText={handleNameChange} // Use custom handler
                    />
                  </View>

                  {/* Username (Auto-filled but editable) */}
                   <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="john_doe"
                      placeholderTextColor="#9CA3AF"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email address</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  {/* Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput 
                        style={styles.inputPassword}
                        placeholder="Create a password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>

                   {/* Confirm Password */}
                   <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput 
                        style={styles.inputPassword}
                        placeholder="Confirm your password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                    </View>
                  </View>
                  
                  {/* KYC Option */}
                  <TouchableOpacity style={styles.kycOption} onPress={() => setIsKycRequired(!isKycRequired)}>
                    <View style={[styles.checkbox, isKycRequired && styles.checkboxChecked]}>
                        {isKycRequired && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.kycTitle}>Complete Identity Verification (KYC)</Text>
                        <Text style={styles.kycSubtitle}>Required to publish reports on Recon.</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Submit */}
                  <TouchableOpacity 
                    style={styles.signupButton} 
                    onPress={handleSignup}
                    disabled={loading}
                  >
                    <Text style={styles.signupButtonText}>{loading ? 'Creating account...' : 'Sign up'}</Text>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Social (Visual only) */}
                  <View style={styles.socialRow}>
                     <TouchableOpacity style={styles.socialBtn}>
                       <Ionicons name="logo-google" size={20} color="#1F2937" />
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.socialBtn}>
                       <Ionicons name="logo-apple" size={20} color="#1F2937" />
                     </TouchableOpacity>
                  </View>

                  {/* Footer */}
                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                      <Text style={styles.footerLink}>Log in</Text>
                    </TouchableOpacity>
                  </View>

                </Animated.View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
             <View style={[styles.circle, { width: 400, height: 400, top: -100, left: -50, opacity: 0.1 }]} />
             <View style={[styles.circle, { width: 200, height: 200, bottom: 100, right: -50, opacity: 0.1 }]} />

             <View style={styles.brandingContent}>
               <View style={styles.logoIconLarge}>
                 <View style={styles.logoInner} />
               </View>
               <Text style={styles.brandingTitle}>Join the journey</Text>
               <Text style={styles.brandingText}>
                 Create an account and start sharing news across multiple domains with the world.
               </Text>
               
               <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>50K+</Text>
                  <Text style={styles.statLabel}>Users</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>99.9%</Text>
                  <Text style={styles.statLabel}>Uptime</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>24/7</Text>
                  <Text style={styles.statLabel}>Support</Text>
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
    justifyContent: 'center',
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
  logoIconLarge: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoInner: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    ...(Platform.OS === 'web' ? { backgroundColor: 'currentColor' } : {}), 
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
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  inputPassword: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  kycOption: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#F0F9FF',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#BAE6FD',
      marginBottom: 24,
  },
  checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: '#0284C7',
      marginRight: 12,
      marginTop: 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFF'
  },
  checkboxChecked: {
      backgroundColor: '#0284C7',
      borderColor: '#0284C7',
  },
  kycTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#0369A1',
      marginBottom: 2,
  },
  kycSubtitle: {
      fontSize: 12,
      color: '#0EA5E9',
  },
  signupButton: {
    backgroundColor: '#0F172A',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
  },
  dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#E5E7EB',
  },
  dividerText: {
      marginHorizontal: 12,
      color: '#6B7280',
      fontSize: 13,
  },
  socialRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
      gap: 12,
  },
  socialBtn: {
      flex: 1,
      height: 42,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  footerLink: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
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
    marginBottom: 48,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
