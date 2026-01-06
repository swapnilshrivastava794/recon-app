import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, Platform, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function AIEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Received Data
  const initialHeadline = typeof params.headline === 'string' ? params.headline : '';
  const initialBody = typeof params.body === 'string' ? params.body : '';
  const mediaCount = params.mediaCount ? Number(params.mediaCount) : 0;

  // AI Generated Fields (State)
  const [headline, setHeadline] = useState(initialHeadline);
  const [body, setBody] = useState(initialBody);
  const [metaTitle, setMetaTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [publishOptions, setPublishOptions] = useState({
    latest: true,
    breaking: false,
    trending: false,
    push: false,
  });

  // Tab State
  const [activeTab, setActiveTab] = useState<'story' | 'settings'>('story');

  // Success State
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (params.isBreaking === 'true') {
        setPublishOptions(prev => ({ ...prev, breaking: true }));
    }
  }, [params.isBreaking]);

  const handleFinalPublish = () => {
     setShowSuccess(true);
  };

  if (showSuccess) {
     return (
       <View style={styles.successContainer}>
          <StatusBar style="light" />
          <View style={styles.successContent}>
             <View style={styles.successIconBox}>
                <Ionicons name="checkmark" size={50} color="#FFF" />
             </View>
             <Text style={styles.successTitle}>Story Published!</Text>
             <Text style={styles.successSub}>Your coverage is now live on the portal.</Text>
             
             <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
                <Text style={styles.homeBtnText}>Back to Dashboard</Text>
             </TouchableOpacity>
          </View>
       </View>
     );
  }

  return (
    <View style={styles.container}>
       <StatusBar style="dark" />
       <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
             <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                <Ionicons name="arrow-back" size={24} color="#000" />
             </TouchableOpacity>
             <Text style={styles.headerTitle}>AI Editor</Text>
             <View style={{width: 24}} /> 
          </View>

          {/* Tab Bar */}
          <View style={styles.tabBar}>
             <TouchableOpacity 
               style={[styles.tabBtn, activeTab === 'story' && styles.tabBtnActive]}
               onPress={() => setActiveTab('story')}
             >
                <Text style={[styles.tabText, activeTab === 'story' && styles.tabTextActive]}>STORY CONTENT</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               style={[styles.tabBtn, activeTab === 'settings' && styles.tabBtnActive]} 
               onPress={() => setActiveTab('settings')}
             >
                <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>SETTINGS & SEO</Text>
             </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
             
             {/* AI Notification - Visible on both or just Story? Keeping on both for context */}
             <View style={styles.aiBanner}>
                <View style={styles.aiBannerIcon}>
                   <Ionicons name="sparkles" size={18} color="#FFF" />
                </View>
                <View style={{flex: 1}}>
                   <Text style={styles.aiBannerTitle}>AI Draft Ready</Text>
                   <Text style={styles.aiBannerText}>Review the auto-generated content below.</Text>
                </View>
             </View>

             {/* STORY TAB CONTENT */}
             {activeTab === 'story' && (
               <>
                 {/* Card 1: Core Details */}
                 <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                       <Ionicons name="document-text" size={18} color="#000" />
                       <Text style={styles.cardTitle}>STORY DETAILS</Text>
                    </View>

                    <Text style={styles.label}>HEADLINE</Text>
                    <TextInput 
                       style={styles.premiumInput} 
                       value={headline} 
                       onChangeText={setHeadline}
                       placeholder="ENTER HEADLINE..."
                       placeholderTextColor="#888"
                    />

                    <Text style={styles.label}>SHORT DESCRIPTION</Text>
                    <TextInput 
                       style={[styles.premiumInput, { height: 100 }]} 
                       value={summary} 
                       onChangeText={setSummary}
                       multiline
                       textAlignVertical="top"
                    />
                 </View>

                 {/* Card 3: Content */}
                 <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                       <Ionicons name="reader" size={18} color="#000" />
                       <Text style={styles.cardTitle}>FULL CONTENT</Text>
                    </View>
                    
                    <View style={styles.richEditorPremium}>
                       <View style={styles.richToolbarPremium}>
                          <Ionicons name="text" size={18} color="#000" />
                          <Ionicons name="code-slash" size={18} color="#000" />
                          <Ionicons name="link" size={18} color="#000" />
                          <Ionicons name="list" size={18} color="#000" />
                          <Ionicons name="image" size={18} color="#000" />
                       </View>
                       <TextInput 
                         style={styles.richInput}
                         value={body || "AI Generated content..."}
                         multiline
                         textAlignVertical="top"
                       />
                    </View>
                 </View>
               </>
             )}

             {/* SETTINGS TAB CONTENT */}
             {activeTab === 'settings' && (
               <>
                 {/* Card 2: SEO & Metadata */}
                 <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                       <Ionicons name="globe" size={18} color="#000" />
                       <Text style={styles.cardTitle}>SEO & METADATA</Text>
                    </View>

                    <Text style={styles.label}>META TITLE</Text>
                    <TextInput 
                         style={styles.premiumInput} 
                         value={metaTitle} 
                         onChangeText={setMetaTitle} 
                    />

                    <Text style={styles.label}>URL SLUG</Text>
                    <TextInput 
                         style={[styles.premiumInput, { backgroundColor: '#F5F5F5', color: '#888' }]} 
                         value={slug} 
                         editable={false}
                    />
                    
                    <Text style={styles.label}>TAGS</Text>
                    <View style={styles.tagInputRow}>
                       {aiTags.map((tag, i) => (
                          <View key={i} style={styles.chipPremium}>
                             <Text style={styles.chipTextPremium}>#{tag}</Text>
                             <TouchableOpacity onPress={() => setAiTags(t => t.filter((_, idx) => idx !== i))}>
                                <Ionicons name="close" size={12} color="#000" />
                             </TouchableOpacity>
                          </View>
                       ))}
                       <TouchableOpacity style={styles.addTagBtnPremium}>
                          <Ionicons name="add" size={16} color="#000" />
                       </TouchableOpacity>
                    </View>
                 </View>

                 {/* Card 4: Publishing Options */}
                 <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                       <Ionicons name="paper-plane" size={18} color="#000" />
                       <Text style={styles.cardTitle}>PUBLISHING</Text>
                    </View>

                    <View style={styles.optionList}>
                       {[
                         { key: 'latest', label: 'Latest News', icon: 'time' },
                         { key: 'breaking', label: 'Breaking News', icon: 'flash' },
                         { key: 'trending', label: 'Trending', icon: 'trending-up' },
                         { key: 'push', label: 'Push Notification', icon: 'notifications' },
                       ].map((opt: any) => {
                          const isActive = publishOptions[opt.key as keyof typeof publishOptions];
                          return (
                             <TouchableOpacity 
                               key={opt.key}
                               style={[styles.optionRowPremium, isActive && styles.optionRowActivePremium]}
                               onPress={() => setPublishOptions({...publishOptions, [opt.key]: !isActive})}
                             >
                                <View style={{flexDirection:'row', alignItems:'center', gap: 12}}>
                                   <View style={[styles.iconBoxPremium, isActive && {backgroundColor:'#000'}]}>
                                      <Ionicons name={opt.icon} size={16} color={isActive ? '#FFF' : '#000'} />
                                   </View>
                                   <Text style={[styles.optionLabelPremium, isActive && styles.optionLabelActive]}>{opt.label}</Text>
                                </View>
                                <Switch 
                                   value={isActive}
                                   onValueChange={() => setPublishOptions({...publishOptions, [opt.key]: !isActive})}
                                   trackColor={{ false: '#E2E8F0', true: '#000' }}
                                   thumbColor={'#FFF'}
                                />
                             </TouchableOpacity>
                          );
                       })}
                    </View>
                 </View>
               </>
             )}

             <View style={{height: 100}} />
          </ScrollView>
          
          {/* Styled Footer */}
          <View style={styles.footerPremium}>
             <TouchableOpacity style={styles.submitBtnPremium} onPress={handleFinalPublish}>
                <Text style={styles.submitTextPremium}>PUBLISH STORY</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
             </TouchableOpacity>
          </View>
       </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Crisp White
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: Platform.OS === 'android' ? 40 : 16, 
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800', // Extra Bold
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  
  // SHARP THEME STYLES
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5', // Distinct border
    borderRadius: 0, // SHARP
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900', // Black weight
    color: '#000',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 11,
    color: '#666',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  premiumInput: {
    backgroundColor: '#FFF',
    borderRadius: 0, // SHARP
    paddingHorizontal: 16,
    paddingVertical: 16, // CHUNKY
    fontSize: 16,
    color: '#000',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  richEditorPremium: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 0, // SHARP
    backgroundColor: '#FFF',
    height: 220, // TALLER
  },
  richToolbarPremium: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  richInput: {
    padding: 20,
    fontSize: 16,
    color: '#000',
    lineHeight: 26,
    flex: 1,
  },
  aiBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#000', // Solid Black
    borderRadius: 0, // SHARP
    padding: 24, // CHUNKY
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 0, // SHARP SQUARE
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBannerTitle: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  aiBannerText: {
    color: '#BBB',
    fontSize: 12,
  },
  chipPremium: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 0, // SHARP
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chipTextPremium: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addTagBtnPremium: {
    width: 38,
    height: 38,
    borderRadius: 0, // SHARP
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  tagInputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  optionList: {
    gap: 0, // Connected list
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  optionRowPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16, // CHUNKY
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  optionRowActivePremium: {
    backgroundColor: '#FAFAFA',
  },
  iconBoxPremium: {
    width: 36,
    height: 36,
    borderRadius: 0, // SHARP
    backgroundColor: '#000', // Black Icon Box
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabelPremium: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
  },
  optionLabelActive: {
    // color handled directly
  },
  footerPremium: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  submitBtnPremium: {
    backgroundColor: '#000',
    borderRadius: 0, // SHARP
    paddingVertical: 20, // EXTRA CHUNKY
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  submitTextPremium: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2, // WIDE TRACKING
    textTransform: 'uppercase',
  },
  // Success Screen Styles (Dark Mode)
  successContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    padding: 40,
    width: '100%',
  },
  successIconBox: {
    width: 100,
    height: 100,
    borderRadius: 0, // SHARP
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  successSub: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 60,
  },
  homeBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 0, // SHARP
    width: '100%',
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // TAB STYLES
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    // paddingTop: 0, // No extra padding needed
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#FFF',
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#000',
  },
});

