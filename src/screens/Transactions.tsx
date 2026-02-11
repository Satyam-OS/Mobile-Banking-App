import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Mock Data
const mockTransactions = [
  { id: '1', description: 'Amazon Prime', merchant: 'Amazon', amount: 499, type: 'debit', date: '2025-12-30' },
  { id: '2', description: 'Salary Credit', merchant: 'Tech Corp', amount: 75000, type: 'credit', date: '2025-12-28' },
  { id: '3', description: 'Starbucks Coffee', merchant: 'Starbucks', amount: 350, type: 'debit', date: '2025-12-28' },
  { id: '4', description: 'Rent Payment', merchant: 'Property Mgmt', amount: 15000, type: 'debit', date: '2025-12-26' },
];

export default function Transactions({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const filteredTransactions = mockTransactions.filter(txn => {
    const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.merchant?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || txn.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalCredit = mockTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = mockTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      {/* Navy Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TRANSACTIONS</Text>
          <TouchableOpacity style={styles.backBtn}>
            <Download size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        stickyHeaderIndices={[2]} 
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        {/* Money In/Out Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.card, styles.creditCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                <TrendingUp size={16} color="#16A34A" />
              </View>
              <Text style={styles.cardLabel}>MONEY IN</Text>
            </View>
            <Text style={styles.creditAmount}>₹{totalCredit.toLocaleString('en-IN')}</Text>
          </View>

          <View style={[styles.card, styles.debitCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                <TrendingDown size={16} color="#DC2626" />
              </View>
              <Text style={styles.cardLabel}>MONEY OUT</Text>
            </View>
            <Text style={styles.debitAmount}>₹{totalDebit.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Quick Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.filterBar}>
            <Filter size={16} color="#64748B" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {[
                { key: 'all', label: 'All' },
                { key: 'credit', label: 'Money In' },
                { key: 'debit', label: 'Money Out' }
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setActiveFilter(f.key as any)}
                  style={[
                    styles.filterPill,
                    activeFilter === f.key && styles.filterPillActive
                  ]}
                >
                  <Text style={[
                    styles.filterText,
                    activeFilter === f.key && styles.filterTextActive
                  ]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <Text style={styles.resultCount}>{filteredTransactions.length} Transactions</Text>
        </View>

        {/* Transaction List */}
        <View style={styles.listContainer}>
          {filteredTransactions.map((txn) => (
            <TouchableOpacity key={txn.id} style={styles.txnItem}>
              <View style={styles.txnLeft}>
                <View style={[styles.avatarBox, { backgroundColor: txn.type === 'credit' ? '#F0FDF4' : '#F8FAFC' }]}>
                  <Text style={styles.avatarText}>{txn.merchant[0]}</Text>
                </View>
                <View>
                  <Text style={styles.txnName}>{txn.description}</Text>
                  <Text style={styles.txnDate}>{txn.date}</Text>
                </View>
              </View>
              <View style={styles.txnRight}>
                <Text style={[
                  styles.txnAmount,
                  txn.type === 'credit' ? styles.positive : styles.negative
                ]}>
                  {txn.type === 'credit' ? '+' : '-'} ₹{txn.amount.toLocaleString('en-IN')}
                </Text>
                <ChevronRight size={14} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#002D72' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#002D72',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  headerTitle: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  backBtn: { padding: 8 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#FFF', fontWeight: '600' },

  summaryGrid: { flexDirection: 'row', paddingHorizontal: 20, marginTop: -25, gap: 12 },
  card: { flex: 1, padding: 18, borderRadius: 24, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  creditCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7' },
  debitCard: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  iconBox: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { fontSize: 9, fontWeight: '900', color: '#64748B', letterSpacing: 0.5 },
  creditAmount: { fontSize: 18, fontWeight: '900', color: '#16A34A' },
  debitAmount: { fontSize: 18, fontWeight: '900', color: '#DC2626' },

  filterSection: { padding: 20, backgroundColor: '#F8FAFC' },
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterScroll: { gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  filterPillActive: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' },
  filterText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  filterTextActive: { color: '#FFF' },
  resultCount: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginTop: 15, textTransform: 'uppercase' },

  listContainer: { paddingHorizontal: 20 },
  txnItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 12,
    shadowColor: '#002D72',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  txnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBox: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '900', color: '#002D72' },
  txnName: { fontSize: 14, fontWeight: '800', color: '#334155' },
  txnDate: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 2 },
  txnRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txnAmount: { fontSize: 15, fontWeight: '900' },
  positive: { color: '#16A34A' },
  negative: { color: '#1E293B' },
});