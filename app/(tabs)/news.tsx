import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, Platform, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp } from 'react-native-reanimated';
import GlassHeader from '@/components/GlassHeader';
import Bounceable from '@/components/BouncyButton';
import { Colors } from '@/constants/theme';

const CATEGORIES = ['All', 'Under Review', 'Needs Correction', 'Approved', 'Published', 'Rejected'];

const NEWS_DATA = [
  {
    id: '1',
    title: 'City Council Approves New Park Construction',
    category: 'Local',
    status: 'Published',
    time: '2h ago',
    likes: 120,
    comments: 45,
    views: '1.2k',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'High School Football Championship Results',
    category: 'Sports',
    status: 'Under Review',
    time: '4h ago',
    likes: 85,
    comments: 12,
    views: '800',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Upcoming Election: What You Need to Know',
    category: 'Politics',
    status: 'Needs Correction',
    time: '6h ago',
    likes: 340,
    comments: 112,
    views: '5.6k',
    image: 'https://images.unsplash.com/photo-1529101091760-61df6be42296?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'Annual Food Festival Draws Record Crowds',
    category: 'Events',
    status: 'Rejected',
    time: '1d ago',
    likes: 210,
    comments: 34,
    views: '3.1k',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
  }
];

export default function NewsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredNews = activeCategory === 'All' 
    ? NEWS_DATA 
    : NEWS_DATA.filter(item => item.status === activeCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return '#10B981';
      case 'Approved': return '#3B82F6';
      case 'Under Review': return '#F59E0B';
      case 'Needs Correction': return '#EF4444';
      case 'Rejected': return '#64748B';
      default: return '#94A3B8';
    }
  };

  const renderNewsItem = ({ item, index }: { item: typeof NEWS_DATA[0], index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(500)} style={[styles.newsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" transition={500} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.text }]}>
            <Text style={[styles.categoryText, { color: colors.background }]}>{item.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20', borderColor: colors.border }]}>
             <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
           <View style={styles.statItem}>
             <Ionicons name="eye-outline" size={16} color={colors.icon} />
             <Text style={[styles.statText, { color: colors.icon }]}>{item.views}</Text>
           </View>
           <View style={styles.statItem}>
             <Ionicons name="heart-outline" size={16} color={colors.icon} />
             <Text style={[styles.statText, { color: colors.icon }]}>{item.likes}</Text>
           </View>
           <View style={styles.statItem}>
             <Ionicons name="chatbubble-outline" size={16} color={colors.icon} />
             <Text style={[styles.statText, { color: colors.icon }]}>{item.comments}</Text>
           </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* 1. Sharp Header (Reverted) */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
         <Text style={[styles.headerTitle, { color: colors.text }]}>LATEST NEWS</Text>
         <Bounceable style={[styles.searchBtn, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.text} />
         </Bounceable>
      </SafeAreaView>

      {/* 2. Main List with Header */}
      <FlatList
        data={filteredNews}
        renderItem={renderNewsItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
           <View style={styles.categoriesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
                {CATEGORIES.map((cat, index) => (
                  <Bounceable 
                    key={index} 
                    style={[
                      styles.categoryChip, 
                      { backgroundColor: colors.card, borderColor: colors.border },
                      activeCategory === cat && { backgroundColor: colors.text, borderColor: colors.text }
                    ]}
                    onPress={() => setActiveCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryChipText, 
                      { color: colors.text },
                      activeCategory === cat && { color: colors.background }
                    ]}>{cat.toUpperCase()}</Text>
                  </Bounceable>
                ))}
              </ScrollView>
           </View>
        }
      />
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900', // Black Weight
    color: '#000',
    letterSpacing: 1,
  },
  searchBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6', // Light gray background for contrast
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingVertical: 16,
    // backgroundColor: '#FFFFFF', // Removed to let scrollview bg show
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 0, // Connected tabs style or slight gap
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 0, // SHARP
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  newsCard: {
    backgroundColor: '#FFF',
    borderRadius: 0, // SHARP
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cardImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#EEE',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0, // SHARP
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0, // SHARP
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800', // HEAVY
    color: '#000',
    lineHeight: 28,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});
