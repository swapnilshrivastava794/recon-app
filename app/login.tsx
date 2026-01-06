import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, useColorScheme, Platform, ScrollView, Alert, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();
  const isWebOrTablet = width > 768; // Breakpoint for split layout
  
  const [username, setUsername] = useState('reporter_3');
  const [password, setPassword] = useState('asdf@123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (username === '' || password === '') {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setIsLoggingIn(true);
    const success = await login(username, password);
    setIsLoggingIn(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style={isWebOrTablet ? 'dark' : 'light'} />
      <View style={[styles.contentContainer, isWebOrTablet ? styles.contentContainerRow : styles.contentContainerCol]}>
        
        {/* Left Panel - Form */}
        <SafeAreaView style={[styles.leftPanel, { width: isWebOrTablet ? '50%' : '100%', height: isWebOrTablet ? '100%' : 'auto' }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formWrapper}>
                
                {/* Logo & Header */}
                <Animated.View entering={FadeInUp.delay(100).duration(700).springify().damping(30).mass(1).stiffness(200)}>
                  <View style={styles.logoRow}>
                    <View style={styles.logoIcon}>
                      <View style={styles.logoInner} />
                    </View>
                    <Text style={styles.brandName}>Recon</Text>
                  </View>
                  <Text style={styles.title}>Welcome back</Text>
                  <Text style={styles.subtitle}>Please sign in to your account</Text>
                </Animated.View>

                {/* Form Fields */}
                <Animated.View entering={FadeInUp.delay(200).duration(700).springify().damping(30).mass(1).stiffness(200)} style={styles.formContainer}>
                  
                  {/* Username */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="Enter your username"
                      placeholderTextColor="#9CA3AF"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput 
                        style={styles.inputPassword}
                        placeholder="Enter your password"
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

                  {/* Options */}
                  <View style={styles.optionsRow}>
                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
                      <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                        {rememberMe && <Ionicons name="checkmark" size={12} color="#FFF" />}
                      </View>
                      <Text style={styles.checkboxLabel}>Remember me</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.forgotPass}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity 
                    style={styles.loginButton} 
                    onPress={handleLogin}
                    disabled={isLoggingIn}
                  >
                    <Text style={styles.loginButtonText}>{isLoggingIn ? 'Signing in...' : 'Sign in'}</Text>
                  </TouchableOpacity>

                  {/* Footer */}
                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                      <Text style={styles.footerLink}>Sign up</Text>
                    </TouchableOpacity>
                  </View>

                </Animated.View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Right Panel - Branding (Visible on Web/Tablet or as Header on Mobile) */}
        <View style={[
            styles.rightPanel, 
            { width: isWebOrTablet ? '50%' : '100%', display: isWebOrTablet ? 'flex' : 'none' } 
          ]}>
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={styles.gradientBg}
          >
            {/* Decorative Circles */}
            <View style={[styles.circle, { top: '10%', right: '10%', width: 200, height: 200 }]} />
            <View style={[styles.circle, { bottom: '20%', left: '5%', width: 300, height: 300 }]} />
            
            <View style={styles.brandingContent}>
              <View style={[styles.logoIcon, styles.logoIconLarge]}>
                <View style={styles.logoInner} />
              </View>

              <Text style={styles.brandingTitle}>Start your journey</Text>
              <Text style={styles.brandingText}>
                Join thousands of users who trust Recon for the latest news across multiple domains.
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

        {/* Mobile Header Branding (Only visible on small screens) */}
        {!isWebOrTablet && null}

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
    paddingHorizontal: 20,
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
    marginBottom: 32,
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
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  logoInner: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF', // Inverted for large icon logic below
    borderRadius: 3,
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
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  forgotPass: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  loginButton: {
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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
