import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, BackHandler, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// ... imports
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Video, ResizeMode } from 'expo-av';
import Bounceable from '@/components/BouncyButton';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

// MOCK CONSTANTS
const CATEGORIES = ['Politics', 'Crime', 'Education', 'Sports', 'Entertainment', 'Health'];

export default function NewStoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  interface MediaItem {
    type: 'image' | 'video';
    uri: string;
  }

  // Form State
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('Detecting Location...');
  const [isBreaking, setIsBreaking] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]); 

  // State for Review Mode
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  // State for Preview
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // State for Processing (Loader)
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle Native Back Button
  React.useEffect(() => {
    const backAction = () => {
      if (previewItem) {
        setPreviewItem(null); // Close Preview
        return true; 
      }
      if (isReviewMode) {
        setIsReviewMode(false); // Go back to Editor from Review
        return true;
      }
      return false; // Default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [previewItem, isReviewMode]);

  const renderMediaList = (type: 'image' | 'video', title: string) => {
    const list = media.filter(m => m.type === type);
    if (list.length === 0) return null;

    return (
      <View style={styles.mediaGroup}>
        <Text style={[styles.mediaGroupTitle, { color: colors.text }]}>{title} ({list.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaList}>
          {list.map((item, index) => (
            <Bounceable 
              key={index} 
              style={[styles.mediaItem, { backgroundColor: colors.surface }]} 
              onPress={() => setPreviewItem(item)}
            >
              <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              {type === 'video' && (
                <View style={styles.videoOverlay}>
                   <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.8)" />
                </View>
              )}
              <Bounceable 
                style={[styles.removeMedia, { backgroundColor: colors.card }]} 
                onPress={() => setMedia(m => m.filter(x => x.uri !== item.uri))}
              >
                 <Ionicons name="close-circle" size={20} color="#EF4444" />
              </Bounceable>
            </Bounceable>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Mock Actions
  const handleLocationDetect = () => {
    setLocation('Connaught Place, New Delhi'); 
  };

  // Real Image Picker Actions
  const handleImagePick = async () => {
    // Request permission (optional, usually handled by OS)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Allow selecting multiple photos
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMedia: MediaItem[] = result.assets.map(asset => ({ type: 'image', uri: asset.uri }));
      setMedia([...media, ...newMedia]);
    }
  };

  const handleVideoPick = async () => {
    try {
      // 1. Explicitly check permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload videos.');
        return;
      }

      // 2. Launch Picker with safe options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: true,
        allowsEditing: false, // Important: Editing often causes crashes on Android with large/unsupported videos
        quality: 1,
      });

      if (!result.canceled) {
        // Simulate "Modern Processing/Upload" feel
        setIsProcessing(true);
        
        // Mock delay for "Compression/Optimization"
        setTimeout(() => {
           const newMedia: MediaItem[] = result.assets.map(asset => ({ type: 'video', uri: asset.uri }));
           setMedia([...media, ...newMedia]);
           setIsProcessing(false);
        }, 2000);
      }
    } catch (e) {
      console.error("Video Picker Error:", e);
      setIsProcessing(false);
      Alert.alert('Selection Failed', 'Could not select this video. It might be corrupted or an unsupported format. Please try another.');
    }
  };

  const handleSubmit = () => {
    if (!headline && !body && media.length === 0) {
      Alert.alert('Empty Story', 'Please provide some content.');
      return;
    }
    
    // Navigate to AI Editor Page with data
    router.push({
      pathname: '/ai-editor',
      params: {
        headline,
        body,
        mediaCount: media.length,
        isBreaking: isBreaking ? 'true' : 'false',
        // Note: passing complex media array directly via URL is limited. 
        // For real app often we use a global store or pass ID.
        // For now, we simulate by just passing counts or relying on mocked context.
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView 
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           style={{ flex: 1 }}
        >

            {/* Processing/Upload Loader */}
            {isProcessing && (
              <View style={styles.loadingOverlay}>
                 <View style={[styles.loadingBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <ActivityIndicator size="large" color={colors.text} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>Optimizing Video...</Text>
                    <Text style={styles.loadingSubText}>Resizing & Generating Thumbnails</Text>
                 </View>
              </View>
            )}

            {/* Preview Modal */}
            {previewItem && (
              <View style={styles.fullScreenPreview}>
                 <View style={styles.previewHeader}>
                   <Bounceable onPress={() => setPreviewItem(null)} style={styles.closePreviewBtn}>
                     <Ionicons name="close" size={30} color="#000" />
                   </Bounceable>
                 </View>
                 
                 {previewItem.type === 'video' ? (
                    <Video
                      source={{ uri: previewItem.uri }}
                      style={styles.previewImageFull}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping
                      shouldPlay
                    />
                 ) : (
                    <Image 
                      source={{ uri: previewItem.uri }} 
                      style={styles.previewImageFull} 
                      contentFit="contain" 
                    />
                 )}
              </View>
            )}

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
              <Bounceable onPress={() => router.back()} style={styles.closeBtn}>
                 <Ionicons name="close" size={28} color={colors.text} />
              </Bounceable>
              
              <Text style={[styles.headerTitle, { color: colors.text }]}>New Story</Text>
              
              <Bounceable style={[styles.draftBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                 <Text style={[styles.draftText, { color: colors.text }]}>Save Draft</Text>
              </Bounceable>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
              
              {/* 1. Headline */}
              <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.headlineSection, { borderLeftColor: colors.text }]}>
                  <Text style={styles.inputLabel}>HEADLINE</Text>
                  <TextInput 
                    style={[styles.headlineInput, { color: colors.text }]}
                    placeholder="Write a clear, catchy title..."
                    placeholderTextColor={colors.icon}
                    multiline
                    value={headline}
                    onChangeText={setHeadline}
                    maxLength={100}
                  />
                  <Text style={styles.charCount}>{headline.length}/100</Text>
              </Animated.View>
              
              {/* 2. Media Section */}
              <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.mediaSection}>
                 <View style={styles.mediaButtonsRow}>
                     <Bounceable style={[styles.addMediaBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleImagePick}>
                        <Ionicons name="images" size={24} color={colors.tint} />
                        <Text style={[styles.addMediaText, { color: colors.text }]}>Photos</Text>
                     </Bounceable>

                     <Bounceable style={[styles.addMediaBtn, { backgroundColor: colors.card, borderColor: '#EF4444' }]} onPress={handleVideoPick}>
                        <Ionicons name="videocam" size={24} color="#EF4444" />
                        <Text style={[styles.addMediaText, { color: '#EF4444' }]}>Video</Text>
                     </Bounceable>
                 </View>

                 {renderMediaList('image', 'Attached Photos')}
                 {renderMediaList('video', 'Attached Videos')}
                 
                 <Text style={styles.mediaHint}>
                   Auto-processed: Watermark, Resize & SEO Tags upon submit.
                 </Text>
              </Animated.View>

              {/* 3. Editor */}
              <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.bodyContainer}>
                 <View style={styles.editorHeader}>
                   <Text style={[styles.editorLabel, { color: colors.text }]}>Story Details</Text>
                   <View style={[styles.aiBadge, { backgroundColor: colors.text }]}>
                      <Ionicons name="sparkles" size={12} color={colors.background} />
                      <Text style={[styles.aiText, { color: colors.background }]}>AI Auto-Format On</Text>
                   </View>
                 </View>
                 
                 <View style={[styles.editorBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                   <TextInput 
                     style={[styles.bodyInput, { color: colors.text }]}
                     placeholder="Type key facts or narrate. AI handles the rest."
                     placeholderTextColor={colors.icon}
                     multiline
                     textAlignVertical="top"
                     value={body}
                     onChangeText={setBody}
                   />
                   
                   <View style={[styles.toolbar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                      <Bounceable style={[styles.toolBtn, { backgroundColor: colors.text }]}>
                         <Ionicons name="mic" size={20} color={colors.background} />
                      </Bounceable>
                      <View style={styles.verticalLine} />
                      <Bounceable style={[styles.toolBtnSec, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <Ionicons name="color-wand" size={18} color={colors.text} />
                         <Text style={[styles.toolText, { color: colors.text }]}>Polish</Text>
                      </Bounceable>
                      <Bounceable style={[styles.toolBtnSec, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <Ionicons name="list" size={18} color={colors.text} />
                      </Bounceable>
                   </View>
                 </View>
              </Animated.View>

              {/* 4. Metadata */}
              <Animated.View entering={FadeInDown.delay(400).duration(500)} style={[styles.metaSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                 
                 <View style={styles.metaRow}>
                    <Ionicons name="grid-outline" size={20} color={colors.icon} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                        {CATEGORIES.map(cat => (
                          <Bounceable 
                            key={cat} 
                            style={[
                                styles.catChip, 
                                { backgroundColor: colors.background, borderColor: colors.border },
                                category === cat && { backgroundColor: colors.text, borderColor: colors.text }
                            ]}
                            onPress={() => setCategory(cat)}
                          >
                             <Text style={[
                                 styles.catText, 
                                 { color: colors.text },
                                 category === cat && { color: colors.background }
                             ]}>{cat}</Text>
                          </Bounceable>
                        ))}
                    </ScrollView>
                 </View>

                 <View style={[styles.divider, { backgroundColor: colors.border }]} />

                 <Bounceable style={styles.metaRow} onPress={handleLocationDetect}>
                    <Ionicons name="location-outline" size={20} color={colors.icon} />
                    <Text style={[styles.locationText, { color: colors.text }]}>{location}</Text>
                    <Text style={[styles.detectText, { color: colors.text }]}>REFRESH</Text>
                 </Bounceable>

                 <View style={[styles.divider, { backgroundColor: colors.border }]} />

                 <View style={styles.metaRow}>
                    <View style={styles.breakingLabel}>
                       <Ionicons name="flash" size={20} color={isBreaking ? "#EF4444" : colors.icon} />
                       <Text style={[styles.metaLabel, { color: colors.text }, isBreaking && { color: '#EF4444' }]}>
                         Breaking News
                       </Text>
                    </View>
                    <Switch 
                      value={isBreaking} 
                      onValueChange={setIsBreaking} 
                      trackColor={{ false: colors.border, true: '#FECACA' }}
                      thumbColor={isBreaking ? '#EF4444' : '#F1F5F9'}
                    />
                 </View>

              </Animated.View>

            </ScrollView>

            {/* Footer Submit */}
            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
               <Bounceable style={[styles.submitBtn, { backgroundColor: colors.text }]} onPress={handleSubmit}>
                  <Text style={[styles.submitText, { color: colors.background }]}>SUBMIT STORY</Text>
                  <Ionicons name="send" size={20} color={colors.background} />
               </Bounceable>
            </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontWeight: '800',
    color: '#000',
    textTransform: 'uppercase',
  },
  draftBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 0, // SHARP
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  draftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  headlineSection: {
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
    paddingLeft: 16,
    paddingVertical: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headlineInput: {
    fontSize: 26,
    fontWeight: '800', // Extra Bold
    color: '#000',
    marginBottom: 4,
    lineHeight: 34,
  },
  charCount: {
    fontSize: 11,
    color: '#94A3B8',
    alignSelf: 'flex-start', // Align left with the text now
    fontWeight: '600',
  },
  mediaSection: {
    marginBottom: 32,
  },
  mediaList: {
    gap: 12,
    paddingBottom: 8,
  },
  addMediaBtn: {
    width: 80,
    height: 80,
    borderRadius: 0, // SHARP
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#000', // Black Border
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addMediaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
  },
  mediaItem: {
    width: 80,
    height: 80,
    borderRadius: 0, // SHARP
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EEE',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  removeMedia: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFF',
    borderRadius: 0, // SHARP
    padding: 2,
  },
  mediaHint: {
    fontSize: 11,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  bodyContainer: {
    marginBottom: 32,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editorLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    textTransform: 'uppercase',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000', // Black Badge
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0, // SHARP
    gap: 6,
  },
  aiText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  editorBox: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 0, // SHARP
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  bodyInput: {
    fontSize: 16,
    color: '#000',
    lineHeight: 26,
    minHeight: 200,
    textAlignVertical: 'top',
    padding: 20,
    paddingBottom: 60, 
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 16,
  },
  toolBtn: {
    width: 36,
    height: 36,
    borderRadius: 0, // SHARP
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLine: {
    width: 1,
    height: 24,
    backgroundColor: '#CCC',
  },
  toolBtnSec: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 6,
    borderRadius: 0, // SHARP
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  toolText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
  },
  metaSection: {
    backgroundColor: '#FFF',
    borderRadius: 0, // SHARP
    padding: 0, // No padding, listing style
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  catScroll: {
    flex: 1,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 0, // SHARP
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  catText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  catTextActive: {
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginLeft: 52, // Indent for icon
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  detectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
  breakingLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  submitBtn: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 0, // SHARP
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  submitText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  mediaGroup: {
    marginBottom: 24,
  },
  mediaGroupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fullScreenPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewHeader: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
  },
  closePreviewBtn: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 0, // SHARP
  },
  previewImageFull: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, 
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Solid Black Opacity
    zIndex: 2000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 0, // SHARP
    alignItems: 'center',
    width: '85%',
    borderWidth: 1,
    borderColor: '#333',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
