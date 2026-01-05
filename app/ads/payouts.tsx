import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const PAYOUT_HISTORY = [
  { id: '1', date: '05 Jan 2024', amount: '₹8,500', status: 'Processing', ref: 'TXN-8821' },
  { id: '2', date: '01 Dec 2023', amount: '₹12,400', status: 'Paid', ref: 'TXN-7734' },
  { id: '3', date: '01 Nov 2023', amount: '₹5,200', status: 'Paid', ref: 'TXN-6621' },
];

export default function PayoutsScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof PAYOUT_HISTORY[0] }) => (
    <View style={styles.row}>
      <View>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.ref}>{item.ref}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>{item.amount}</Text>
        <Text style={[styles.status, item.status === 'Processing' ? { color: '#666' } : { color: '#000' }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PAYOUTS & LEDGER</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
           <View style={styles.balanceCard}>
             <Text style={styles.balLabel}>CURRENT BALANCE</Text>
             <Text style={styles.balValue}>₹8,500</Text>
             <Text style={styles.balSub}>Eligible for next payout cycle (Monthly)</Text>
           </View>

           <Text style={styles.sectionLabel}>PAYOUT HISTORY</Text>
           <FlatList 
             data={PAYOUT_HISTORY}
             renderItem={renderItem}
             keyExtractor={i => i.id}
             scrollEnabled={false}
           />
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
  balanceCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#000',
  },
  balLabel: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '700',
  },
  balValue: {
    color: '#000',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  balSub: {
    color: '#4B5563',
    fontSize: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  ref: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
});
