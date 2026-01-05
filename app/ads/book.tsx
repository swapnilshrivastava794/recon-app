import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function BookAdScreen() {
  const router = useRouter();

  const [adType, setAdType] = useState('Banner Ad');
  const [client, setClient] = useState('');
  const [portal, setPortal] = useState('News Feed');
  const [duration, setDuration] = useState('7 Days');
  const [price, setPrice] = useState('₹5000'); // Mock calc

  const handleBook = () => {
    Alert.alert('Booking Submitted', 'The ad request has been submitted for approval.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BOOK NEW AD</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          <Text style={styles.sectionLabel}>AD DETAILS</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ad Type</Text>
            <TouchableOpacity style={styles.selector}>
               <Text style={styles.selectorText}>{adType}</Text>
               <Ionicons name="chevron-down" size={16} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Target Portal / Section</Text>
            <TouchableOpacity style={styles.selector}>
               <Text style={styles.selectorText}>{portal}</Text>
               <Ionicons name="chevron-down" size={16} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Client Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter Client Name" 
              placeholderTextColor="#999"
              value={client}
              onChangeText={setClient}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.row}>
               {['3 Days', '7 Days', '1 Month'].map((d) => (
                 <TouchableOpacity 
                    key={d} 
                    style={[styles.chip, duration === d && styles.chipActive]}
                    onPress={() => setDuration(d)}
                 >
                    <Text style={[styles.chipText, duration === d && styles.chipTextActive]}>{d}</Text>
                 </TouchableOpacity>
               ))}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryBox}>
             <View style={styles.summaryRow}>
               <Text style={styles.sumLabel}>Base Price</Text>
               <Text style={styles.sumValue}>{price}</Text>
             </View>
             <View style={styles.summaryRow}>
               <Text style={styles.sumLabel}>GST (18%)</Text>
               <Text style={styles.sumValue}>₹900</Text>
             </View>
             <View style={[styles.summaryRow, { marginTop: 8 }]}>
               <Text style={styles.totalLabel}>TOTAL</Text>
               <Text style={styles.totalValue}>₹5,900</Text>
             </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleBook}>
             <Text style={styles.submitBtnText}>CONFIRM BOOKING</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  content: {
    padding: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    marginBottom: 24,
    letterSpacing: 1,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    borderRadius: 0, // Sharp
  },
  selectorText: {
    fontSize: 14,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    fontSize: 14,
    color: '#000',
    borderRadius: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  chipText: {
    fontSize: 12,
    color: '#666',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginTop: 10,
    marginBottom: 24,
  },
  summaryBox: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sumLabel: {
    fontSize: 13,
    color: '#666',
  },
  sumValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  submitBtn: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
  },
});
