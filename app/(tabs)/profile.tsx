import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import * as ImagePicker from 'expo-image-picker';
import GlassHeader from '@/components/GlassHeader';
import Bounceable from '@/components/BouncyButton';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Determine display data directly from context
  const name = userProfile?.username || user?.name || 'Reporter';
  const email = userProfile?.email || 'reporter@recon.app';
  const bio = userProfile?.bio || '';
  const phone = userProfile?.phone_number || '';
  const idType = userProfile?.id_proof_type || '';
  const idNumber = userProfile?.id_proof_number || '';

  // Construct full address dynamically
  const fullAddressParts = [
      userProfile?.address_line1, 
      userProfile?.address_line2, 
      userProfile?.city, 
      userProfile?.state, 
      userProfile?.pincode
  ].filter(part => part && part.trim() !== '');
  
  const fullLocation = fullAddressParts.length > 0 
      ? fullAddressParts.join(', ') 
      : 'Location details not provided';

  // Base URL logic
  const getFullImageUrl = (path: string | null | undefined) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      return `http://192.168.29.97:8000${path}`;
  };

  const profileImage = getFullImageUrl(userProfile?.selfie_photo);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Sharp Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>MY PROFILE</Text>
        
        <View style={{ flexDirection: 'row', gap: 4 }}>
            <Bounceable onPress={() => router.push('/edit-profile')} style={styles.logoutBtn}>
               <Ionicons name="pencil" size={20} color={colors.text} />
            </Bounceable>
            <Bounceable onPress={handleLogout} style={styles.logoutBtn}>
               <Ionicons name="log-out-outline" size={24} color={colors.text} />
            </Bounceable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40, padding: 20 }} showsVerticalScrollIndicator={false}>
        
        {/* ID Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={[styles.idCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <View style={[styles.idHeaderRow, { borderBottomColor: colors.border }]}>
                
                {/* Avatar with Upload */}
                <View style={styles.avatarContainer}>
                   <View>
                     <Image 
                        source={{ uri: profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }} 
                        style={[styles.avatar, {  borderColor: colors.border, backgroundColor: colors.surface }]} 
                     />
                   </View>
                   
                   {/* Verification Badge */}
                   {userProfile?.kyc_status === 'APPROVED' && (
                       <View style={[styles.verifiedBadge, { backgroundColor: colors.text, borderColor: colors.background }]}>
                          <Ionicons name="checkmark" size={10} color={colors.background} />
                       </View>
                   )}
                </View>

                <View style={styles.profileText}>
                   <Text style={[styles.roleLabel, { color: colors.icon }]}>REPORTER</Text>
                   <Text style={[styles.nameText, { color: colors.text }]}>{userProfile?.username?.toUpperCase() || name.toUpperCase()}</Text>
                   <Text style={[styles.idNumber, { color: colors.icon }]}>ID: {userProfile?.id || '---'}</Text>
                   
                   {/* Verification Status Tag */}
                   <View style={{ marginTop: 8, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: userProfile?.kyc_status === 'APPROVED' ? '#DCFCE7' : '#FEF2F2', alignSelf: 'flex-start', borderRadius: 4 }}>
                       <Text style={{ fontSize: 10, fontWeight: '700', color: userProfile?.kyc_status === 'APPROVED' ? '#166534' : '#991B1B' }}>
                           KYC: {userProfile?.kyc_status || 'PENDING'}
                       </Text>
                   </View>
                </View>
             </View>

             <View style={styles.statsRow}>
                <View style={styles.statItem}>
                   <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
                   <Text style={[styles.statLabel, { color: colors.icon }]}>STORIES</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                   <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
                   <Text style={[styles.statLabel, { color: colors.icon }]}>VIEWS</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                   <Text style={[styles.statValue, { color: colors.text }]}>-</Text>
                   <Text style={[styles.statLabel, { color: colors.icon }]}>RATING</Text>
                </View>
             </View>
        </Animated.View>

        {/* Status & Alerts Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.section}>
             <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 20 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <View>
                        <Text style={[styles.label, { color: colors.icon }]}>ACCOUNT STATUS</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: userProfile?.reporter_status === 'APPROVED' ? '#10B981' : userProfile?.reporter_status === 'REJECTED' ? '#EF4444' : '#F59E0B', marginRight: 8 }} />
                            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
                                {userProfile?.reporter_status || 'PENDING'}
                            </Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                         <Text style={[styles.label, { color: colors.icon }]}>MEMBER SINCE</Text>
                         <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 2 }}>
                             {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '-'}
                         </Text>
                    </View>
                </View>

                {userProfile?.reporter_status !== 'APPROVED' && (
                    <View style={{ backgroundColor: userProfile?.reporter_status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB', padding: 12, borderRadius: 8, marginTop: 0 }}>
                        <Text style={{ fontSize: 13, color: userProfile?.reporter_status === 'REJECTED' ? '#991B1B' : '#92400E', lineHeight: 20 }}>
                            {userProfile?.reporter_status === 'PENDING' 
                                ? "Your account is currently under review. You cannot submit stories until an admin approves your profile. This usually takes 24-48 hours."
                                : userProfile?.reporter_status === 'SUSPENDED'
                                ? `Your account has been suspended. Reason: ${userProfile?.suspension_reason || 'Violation of terms.'}`
                                : `Your application was rejected. Reason: ${userProfile?.rejection_reason || 'Incomplete documentation.'}`
                            }
                        </Text>
                    </View>
                )}
                
                {userProfile?.reporter_status === 'APPROVED' && (
                    <View style={{  marginTop: 0 }}>
                        <Text style={{ fontSize: 13, color: '#059669', lineHeight: 20 }}>
                            You are an authorized reporter. You can submit stories via the "New Story" tab.
                        </Text>
                    </View>
                )}

                {userProfile?.admin_notes && (
                    <View style={{ marginTop: 12, backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#334155' }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 4, textTransform: 'uppercase' }}>
                            Admin Remarks
                        </Text>
                        <Text style={{ fontSize: 13, color: '#334155', fontStyle: 'italic', lineHeight: 20 }}>
                            "{userProfile.admin_notes}"
                        </Text>
                    </View>
                )}

             </View>
        </Animated.View>

        {/* Professional Info Section - Added back for Experience */}
        {userProfile?.years_of_experience !== null && userProfile?.years_of_experience !== undefined && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Professional Info</Text>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                 <View style={[styles.inputGroup, { borderBottomColor: 'transparent' }]}>
                   <Text style={[styles.label, { color: colors.icon }]}>Experience</Text>
                   <Text style={[styles.inputText, { color: colors.text }]}>{userProfile.years_of_experience} Years</Text>
                 </View>
              </View>
            </View>
        )}

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Personal Details</Text>
            <TouchableOpacity onPress={() => router.push('/edit-profile')} style={{ padding: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text }}>EDIT DETAILS</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
             
             {/* Read Only Fields for now based on API */}
             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Full Name / Username</Text>
               <Text style={[styles.inputText, { color: colors.text }]}>{name}</Text>
             </View>
             
             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Bio</Text>
               <Text style={[styles.inputText, { color: colors.text }]}>{bio || 'No bio provided'}</Text>
             </View>

             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Email Address</Text>
               <Text style={[styles.inputText, { color: colors.text }]}>{email}</Text>
             </View>

             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Phone Number</Text>
               <Text style={[styles.inputText, { color: colors.text }]}>{phone}</Text>
             </View>
             
             <View style={[styles.inputGroup, { borderBottomColor: 'transparent' }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Address</Text>
               <Text style={[styles.inputText, { color: colors.text, lineHeight: 22 }]}>{fullLocation}</Text>
             </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>KYC Details</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>ID Type</Text>
               <Text style={[styles.inputText, { color: colors.text }]}>{idType.replace('_', ' ')}</Text>
             </View>
             <View style={[styles.inputGroup, { borderBottomColor: 'transparent' }]}>
               <Text style={[styles.label, { color: colors.icon }]}>ID Number</Text>
               <Text style={[styles.inputText, { color: colors.text }]}>{idNumber}</Text>
             </View>
          </View>
        </View>



      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  // scrollContent: { padding: 20 }, // Removed
  // WHITE ID CARD (Updated)
  idCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 0, // SHARP
  },
  idHeaderRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 24,
  },

  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 0, // SHARP SQUARE
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#FFF',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileText: {
    flex: 1,
    justifyContent: 'center',
  },
  roleLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  idNumber: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'flex-start',
    flex: 1,
  },
  statValue: {
    color: '#000',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 10,
  },
  
  // SECTIONS
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 0, // List style
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0, // SHARP
  },
  inputGroup: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    padding: 0,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 0, // SHARP
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
