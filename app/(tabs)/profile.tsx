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
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState(user?.name || 'Reporter One');
  const [role, setRole] = useState('Senior Reporter');
  const [portal, setPortal] = useState('JANPUNJAB');
  const [location, setLocation] = useState('New York, USA');
  const [department, setDepartment] = useState('Politics & Crime');
  const [bio, setBio] = useState('Investigative journalist with 5+ years of experience covering local politics and urban development.');
  const [email, setEmail] = useState('reporter@recon.app');

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* 1. Sharp Header (Reverted) */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>MY PROFILE</Text>
        <Bounceable onPress={handleLogout} style={styles.logoutBtn}>
           <Ionicons name="log-out-outline" size={24} color={colors.text} />
        </Bounceable>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40, padding: 20 }} showsVerticalScrollIndicator={false}>
        
        {/* ID Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={[styles.idCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <View style={[styles.idHeaderRow, { borderBottomColor: colors.border }]}>
                
                {/* Avatar with Upload */}
                <View style={styles.avatarContainer}>
                   <Bounceable onPress={handleImagePick}>
                     <Image 
                        source={{ uri: profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }} 
                        style={[styles.avatar, {  borderColor: colors.border, backgroundColor: colors.surface }]} 
                     />
                     {/* Edit Overlay */}
                     <View style={[styles.editOverlay, { backgroundColor: colors.text }]}>
                        <Ionicons name="camera" size={12} color={colors.background} />
                     </View>
                   </Bounceable>
                   
                   {/* Verification Badge */}
                   <View style={[styles.verifiedBadge, { backgroundColor: colors.text, borderColor: colors.background }]}>
                      <Ionicons name="checkmark" size={10} color={colors.background} />
                   </View>
                </View>

                <View style={styles.profileText}>
                   <Text style={[styles.roleLabel, { color: colors.icon }]}>SENIOR REPORTER</Text>
                   <Text style={[styles.nameText, { color: colors.text }]}>{name.toUpperCase()}</Text>
                   <Text style={[styles.idNumber, { color: colors.icon }]}>ID: RPT-2024-889</Text>
                </View>
             </View>

             <View style={styles.statsRow}>
                <View style={styles.statItem}>
                   <Text style={[styles.statValue, { color: colors.text }]}>124</Text>
                   <Text style={[styles.statLabel, { color: colors.icon }]}>STORIES</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                   <Text style={[styles.statValue, { color: colors.text }]}>45.2k</Text>
                   <Text style={[styles.statLabel, { color: colors.icon }]}>VIEWS</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                   <Text style={[styles.statValue, { color: colors.text }]}>4.9</Text>
                   <Text style={[styles.statLabel, { color: colors.icon }]}>RATING</Text>
                </View>
             </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Professional Info</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Primary Portal</Text>
               <Bounceable 
                 style={styles.dropdownInput}
                 onPress={() => setPortal(p => p === 'JANPUNJAB' ? 'JANHIMACHAL' : 'JANPUNJAB')}
               >
                 <Text style={[styles.inputText, { color: colors.text }]}>{portal}</Text>
                 <Ionicons name="chevron-down" size={20} color={colors.text} />
               </Bounceable>
             </View>

             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Department / Beat</Text>
               <TextInput 
                 style={[styles.input, { color: colors.text }]} 
                 value={department} 
                 onChangeText={setDepartment} 
               />
             </View>
             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Location</Text>
               <TextInput 
                 style={[styles.input, { color: colors.text }]} 
                 value={location} 
                 onChangeText={setLocation} 
               />
             </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Full Name</Text>
               <TextInput 
                 style={[styles.input, { color: colors.text }]} 
                 value={name} 
                 onChangeText={setName} 
               />
             </View>
             <View style={[styles.inputGroup, { borderBottomColor: colors.border }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Bio</Text>
               <TextInput 
                 style={[styles.input, styles.textArea, { color: colors.text }]} 
                 value={bio} 
                 onChangeText={setBio} 
                 multiline
                 numberOfLines={3}
               />
             </View>
             <View style={[styles.inputGroup, { borderBottomColor: 'transparent' }]}>
               <Text style={[styles.label, { color: colors.icon }]}>Email Address</Text>
               <TextInput 
                 style={[styles.input, { backgroundColor: colors.surface, color: colors.icon, borderRadius: 4, padding: 8 }]} 
                 value={email} 
                 editable={false}
               />
             </View>
          </View>
        </View>

        <Bounceable style={[styles.saveBtn, { backgroundColor: colors.text }]} onPress={handleSave}>
          <Text style={[styles.saveBtnText, { color: colors.background }]}>SAVE CHANGES</Text>
        </Bounceable>

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
