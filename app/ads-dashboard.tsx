import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Requirement 10.3: Revenue Share + Reporter Wallet Data
const WALLET_STATS = {
  totalBookings: 24,
  paidInvoices: 18,
  pendingPayments: '₹12,400',
  commissionEarned: '₹45,200',
  payoutEligible: '₹8,500', // Threshold logic applied
};

// Requirement 10.1 & 10.2: Detailed Booking Data
const RECENT_BOOKINGS = [
  {
    id: '1',
    type: 'Banner Ad (Top)',
    client: 'City Hospital',
    portal: 'Health Section - Delhi',
    duration: '02 Jan - 10 Jan',
    amount: '₹5,000',
    status: 'Paid', 
    statusStage: 3, // Created -> Sent -> Paid
    commission: '₹500 (10%)',
    invoiceId: 'INV-2024-001',
    image: 'https://placehold.co/100x100/000000/FFFFFF/png?text=Ad',
  },
  {
    id: '2',
    type: 'Sponsored Article',
    client: 'Green Valley School',
    portal: 'Education - Main',
    duration: 'Lifetime',
    amount: '₹3,500',
    status: 'Sent', // Invoice Sent, Pending Payment
    statusStage: 2,
    commission: '₹350 (10%)',
    invoiceId: 'INV-2024-002',
    image: 'https://placehold.co/100x100/000000/FFFFFF/png?text=Article',
  },
  {
    id: '3',
    type: 'Event Promotion',
    client: 'Tech Expo 2024',
    portal: 'Events - Mumbai',
    duration: '28 Dec - 30 Dec',
    amount: '₹8,000',
    status: 'Created', // Draft
    statusStage: 1,
    commission: '₹800 (10%)',
    invoiceId: 'DRAFT',
    image: 'https://placehold.co/100x100/000000/FFFFFF/png?text=Event',
  },
];

export default function AdsDashboardScreen() {
  const router = useRouter();

  // Navigation Handlers
  const handleBookAd = () => router.push('/ads/book');
  const handlePayouts = () => router.push('/ads/payouts');

  const renderBookingItem = ({ item }: { item: typeof RECENT_BOOKINGS[0] }) => (
    <View style={styles.card}>
      {/* Header: ID and Status */}
      <View style={styles.cardHeader}>
        <Text style={styles.invoiceId}>{item.invoiceId}</Text>
        <StatusBadge status={item.status} />
      </View>
      
      {/* Body: Image and Core Details */}
      <View style={styles.cardBody}>
        <Image source={{ uri: item.image }} style={styles.adImage} />
        <View style={styles.adDetails}>
          <Text style={styles.clientName}>{item.client}</Text>
          <Text style={styles.adType}>{item.type}</Text>
          <Text style={styles.metaText}>{item.portal}</Text>
          <Text style={styles.metaText}>{item.duration}</Text>
        </View>
      </View>
      
      {/* Footer: Financials and Actions */}
      <View style={styles.cardFooter}>
         <View>
            <Text style={styles.financeLabel}>Total Value</Text>
            <Text style={styles.financeValue}>{item.amount}</Text>
         </View>
         <View style={styles.verticalDivider} />
         <View>
            <Text style={styles.financeLabel}>Your Cut</Text>
            <Text style={styles.financeValue}>{item.commission}</Text>
         </View>
         
         {/* Actions based on Status */}
         <View style={styles.actionButtons}>
            {item.status === 'Sent' && (
               <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Share', 'Sharing Payment Link...')}>
                  <Ionicons name="share-social-outline" size={20} color="#000" />
               </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Invoice', 'Downloading PDF...')}>
                <Ionicons name="download-outline" size={20} color="#000" />
            </TouchableOpacity>
         </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* B&W Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ads & Revenue</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 10.3 Wallet Section - Black Card */}
          <View style={styles.walletCard}>
             <View style={styles.walletHeader}>
               <Text style={styles.walletTitle}>Reporter Wallet</Text>
               <TouchableOpacity onPress={handlePayouts}>
                 <Text style={styles.historyLink}>View Ledger &rarr;</Text>
               </TouchableOpacity>
             </View>
             
             <View style={styles.mainBalance}>
                <Text style={styles.balanceLabel}>Commission Earned</Text>
                <Text style={styles.balanceValue}>{WALLET_STATS.commissionEarned}</Text>
             </View>

             <View style={styles.divider} />

             <View style={styles.statsRow}>
                <View style={styles.statItem}>
                   <Text style={styles.statVal}>{WALLET_STATS.payoutEligible}</Text>
                   <Text style={styles.statLbl}>Eligible for Payout</Text>
                </View>
                <View style={styles.statItem}>
                   <Text style={styles.statVal}>{WALLET_STATS.pendingPayments}</Text>
                   <Text style={styles.statLbl}>Pending Payments</Text>
                </View>
             </View>
          </View>

          {/* Action Grid */}
          <View style={styles.actionGrid}>
             <TouchableOpacity style={styles.primaryBtn} onPress={handleBookAd}>
                <Ionicons name="add" size={24} color="#FFF" />
                <Text style={styles.primaryBtnText}>Book New Ad</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.secondaryBtn} onPress={handlePayouts}>
                <Text style={styles.secondaryBtnText}>Payouts</Text>
             </TouchableOpacity>
          </View>

          {/* Recent Bookings List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
          </View>

          <FlatList
            data={RECENT_BOOKINGS}
            renderItem={renderBookingItem}
            keyExtractor={item => item.id}
            scrollEnabled={false} // Nested in ScrollView
          />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// B&W Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  let containerStyle = styles.badgeDraft;
  let textStyle = styles.badgeDraftText;

  if (status === 'Paid') {
    containerStyle = styles.badgePaid;
    textStyle = styles.badgePaidText;
  } else if (status === 'Sent') {
    containerStyle = styles.badgeSent;
    textStyle = styles.badgeSentText;
  }

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{status.toUpperCase()}</Text>
    </View>
  );
};

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
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
  },
  // Wallet Card (White)
  walletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0, // Sharp aesthetic
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#000',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  historyLink: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  mainBalance: {
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#000',
    fontSize: 36,
    fontWeight: '800', // Bold for emphasis on white
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 30,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statVal: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700', // Bolder
    marginBottom: 2,
  },
  statLbl: {
    color: '#666',
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  // Actions
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: '#000',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Bookings
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 16, // Spacing between cards
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceId: {
    fontFamily: 'Courier', // Monospace for IDs if available, else standard
    fontSize: 12,
    color: '#666',
  },
  // Badge Styles
  badgePaid: {
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgePaidText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  badgeSent: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 5, // Adjust for border
    paddingVertical: 2,
  },
  badgeSentText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '700',
  },
  badgeDraft: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeDraftText: {
    color: '#666',
    fontSize: 9,
    fontWeight: '700',
  },
  // Card Body
  cardBody: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  adImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F5F5F5',
  },
  adDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  adType: {
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 1,
  },
  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  financeLabel: {
    fontSize: 9,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  financeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },
  actionButtons: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
  },
});
