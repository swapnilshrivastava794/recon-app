import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, StatusBar as RNStatusBar, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FEATURE_FLAGS } from '@/constants/flags';
import GlassHeader from '@/components/GlassHeader';
import Bounceable from '@/components/BouncyButton';
import { Colors } from '@/constants/theme';

import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const { userProfile } = useAuth(); // Get userProfile
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedPortal, setSelectedPortal] = useState('JANPUNJAB');

  const togglePortal = () => {
    setSelectedPortal(prev => prev === 'JANPUNJAB' ? 'JANHIMACHAL' : 'JANPUNJAB');
  };

  // Mock Data - Dynamic Colors
  const WORKFLOW_STATS = [
    { label: 'Under Review', value: '4', icon: 'time-outline', color: colors.text, bg: colors.card },
    { label: 'Needs Fix', value: '2', icon: 'alert-circle-outline', color: colors.text, bg: colors.card },
    { label: 'Published', value: '18', icon: 'checkmark-circle-outline', color: colors.text, bg: colors.card },
    { label: 'Rejected', value: '3', icon: 'close-circle-outline', color: colors.text, bg: colors.card },
  ];

  const PERFORMANCE_STATS = [
    { label: 'Total Views', value: '45.2K', icon: 'bar-chart-outline', color: '#FFF' },
    { label: 'Earnings', value: '$850', icon: 'wallet-outline', color: '#FFF' },
  ];

  const RECENT_ACTIVITY = [
    { id: 1, title: 'City Council Update', status: 'Needs Correction', time: '10 min ago', description: 'Editor note: Please verify the source for quote in 2nd para.' },
    { id: 2, title: 'Downtown Traffic Report', status: 'Under Review', time: '2 hours ago', description: 'Currently with the Checker team.' },
    { id: 3, title: 'Local School Science Fair', status: 'Published', time: '5 hours ago', description: 'Live on the platform. 1.2k views.' },
    { id: 4, title: 'Opinion: New Tax Policy', status: 'Rejected', time: '1 day ago', description: 'Reason: Does not meet community guidelines.' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Standard Header */}
        <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <View style={styles.headerTop}>
               <View>
                 {/* Portal Dropdown */}
                 <Bounceable style={[styles.portalSelector, { backgroundColor: colors.surface }]} onPress={togglePortal}>
                   <Text style={[styles.portalText, { color: colors.text }]}>{selectedPortal}</Text>
                   <Ionicons name="chevron-down" size={14} color={colors.text} />
                 </Bounceable>

                 {/* PENDING STATUS ALERT */}
                 {userProfile?.reporter_status === 'PENDING' && (
                     <View style={{ backgroundColor: '#FFFBEB', padding: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#FEF3C7', alignSelf: 'flex-start' }}>
                        <Text style={{ color: '#D97706', fontSize: 12, fontWeight: '700' }}>
                            <Ionicons name="time" size={12} /> Account Under Review
                        </Text>
                     </View>
                 )}

                 <View style={styles.greetingSection}>
                    <Text style={[styles.greetingText, { color: colors.icon }]}>Good Morning,</Text>
                    <Text style={[styles.userName, { color: colors.text }]}>Reporter</Text>
                 </View>
               </View>

               <Bounceable style={[styles.profileBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/profile')}>
                 <Image 
                   source={{ uri: 'https://ui-avatars.com/api/?name=Reporter&background=000&color=fff&size=128' }} 
                   style={styles.profileImg} 
                 />
               </Bounceable>
            </View>

            {/* Performance Row */}
            <View style={styles.performanceRow}>
               {PERFORMANCE_STATS.map((stat, index) => (
                  <Bounceable key={index} style={[styles.perfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.perfIcon, { backgroundColor: colors.surface }]}>
                      <Ionicons name={stat.icon as any} size={18} color={colors.text} />
                    </View>
                    <View>
                      <Text style={[styles.perfValue, { color: colors.text }]}>{stat.value}</Text>
                      <Text style={[styles.perfLabel, { color: colors.icon }]}>{stat.label}</Text>
                    </View>
                  </Bounceable>
               ))}
            </View>
        </SafeAreaView>

        <View style={styles.contentContainer}>
          
          {/* Workflow Stats Grid */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
            <View style={styles.gridContainer}>
              {WORKFLOW_STATS.map((stat, index) => (
                <Bounceable 
                  key={index} 
                  style={[styles.gridCard, { backgroundColor: stat.bg, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: '/(tabs)/news', params: { filter: stat.label } })}
                >
                   <View style={styles.gridHeader}>
                     <Text style={[styles.gridValue, { color: stat.color }]}>{stat.value}</Text>
                     <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                   </View>
                   <Text style={[styles.gridLabel, { color: colors.icon }]}>{stat.label}</Text>
                </Bounceable>
              ))}
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <Bounceable style={[styles.actionBtn, { backgroundColor: colors.text === '#ECEDEE' ? '#FFF' : '#000' }]} onPress={() => router.push('/new-story')}>
                <Ionicons name="add-circle" size={24} color={colors.background} />
                <Text style={[styles.actionBtnText, { color: colors.background }]}>New Story</Text>
              </Bounceable>

              <Bounceable 
                 style={[styles.actionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} 
                 onPress={() => {}}
              >
                <Ionicons name="radio" size={24} color={colors.text} />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Go Live</Text>
              </Bounceable>
            </View>
          </Animated.View>

          {/* Monetization Module */}
          {FEATURE_FLAGS.ENABLE_ADS_MODULE && (
            <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
               <View style={styles.sectionHeaderRow}>
                 <Text style={[styles.sectionTitle, { color: colors.text }]}>Monetization</Text>
               </View>
               <Bounceable 
                  style={[styles.actionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border  }]} 
                  onPress={() => router.push('/ads-dashboard')}
                >
                  <Ionicons name="cash-outline" size={24} color={colors.text} />
                  <Text style={[styles.actionBtnText, {color: colors.text}]}>Manage Ads & Revenue</Text>
               </Bounceable>
            </Animated.View>
          )}

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Updates</Text>
              <TouchableOpacity>
                <Text style={[styles.viewAllText, { color: colors.text }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {RECENT_ACTIVITY.map((item, index) => (
              <Animated.View 
                key={item.id} 
                entering={FadeInDown.delay(600 + (index * 100)).duration(500)} 
              >
                <Bounceable style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
                    <View style={styles.activityMeta}>
                      <Text style={[styles.activityTime, { color: colors.icon }]}>{item.time}</Text>
                    </View>
                    <Text style={[styles.activityDesc, { color: colors.icon }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                     <View style={[styles.statusDot, { 
                      backgroundColor: 
                        item.status === 'Published' ? (colorScheme === 'dark' ? '#FFF' : '#000') : 
                        item.status === 'Needs Correction' ? (colorScheme === 'dark' ? '#AAA' : '#000') :
                        item.status === 'Rejected' ? '#666' :
                        colors.icon
                    }]} />
                    <Text style={[styles.statusText, {
                       color: 
                        item.status === 'Published' ? colors.text : 
                        colors.icon
                    }]}>{item.status}</Text>
                  </View>
                </Bounceable>
              </Animated.View>
            ))}
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  portalSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  portalText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  greetingSection: {
    marginBottom: 0,
  },
  greetingText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  userName: {
    color: '#000',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  performanceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  perfCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  perfIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  perfValue: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
  },
  perfLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '47%', 
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align top because of description
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityInfo: {
    flex: 1,
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start', // Prevent expanding
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
