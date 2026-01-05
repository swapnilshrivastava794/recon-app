import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GlassHeaderProps {
  children?: React.ReactNode;
  height?: number;
}

export default function GlassHeader({ children }: GlassHeaderProps) {
  if (Platform.OS === 'android') {
    // Android Blur support can be tricky or performance heavy, 
    // sometimes a semi-transparent white view is cleaner/safer if BlurView isn't configured perfectly.
    // Expo Blur works on Android now, but let's stick to a premium semi-transparent look.
    return (
      <View style={styles.androidContainer}>
        <SafeAreaView edges={['top']} style={styles.content}>
           {children}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <BlurView intensity={80} tint="light" style={styles.iosContainer}>
       <SafeAreaView edges={['top']} style={styles.content}>
          {children}
       </SafeAreaView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  iosContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)', // Very subtle divider
  },
  androidContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.95)', // High opacity for Android
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 12,
  }
});
