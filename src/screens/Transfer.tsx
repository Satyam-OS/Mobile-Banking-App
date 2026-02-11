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
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Plus,
  ChevronRight,
  Building2,
  Smartphone,
  QrCode,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Step Types
type TransferStep = 'select' | 'amount' | 'confirm' | 'success';

export default function Transfer({ navigation }: any) {
  const [step, setStep] = useState<TransferStep>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Mock Data Integration
  const mockBeneficiaries = [
    { id: '1', name: 'Rahul Sharma', bank: 'HDFC Bank', acc: '•••• 4582' },
    { id: '2', name: 'Sneha Patil', bank: 'ICICI Bank', acc: '•••• 9910' },
    { id: '3', name: 'Amit Verma', bank: 'SBI Bank', acc: '•••• 2231' },
  ];

  const quickAmounts = ['500', '1000', '2000', '5000'];

  const handleNext = () => {
    if (step === 'select' && selectedUser) setStep('amount');
    else if (step === 'amount' && amount) setStep('confirm');
    else if (step === 'confirm') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStep('success');
      }, 2000);
    }
  };

  const handleBack = () => {
    if (step === 'select') navigation.goBack();
    else if (step === 'amount') setStep('select');
    else if (step === 'confirm') setStep('amount');
    else navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      {/* Dynamic Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'select' && 'SEND MONEY'}
            {step === 'amount' && 'ENTER AMOUNT'}
            {step === 'confirm' && 'CONFIRM'}
            {step === 'success' && 'SUCCESS'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {step === 'select' && (
            <>
              {/* Quick Actions Card */}
              <View style={styles.quickActionsCard}>
                <ActionBtn icon={Building2} label="Bank" color="#0EA5E9" />
                <ActionBtn icon={Smartphone} label="UPI ID" color="#8B5CF6" />
                <ActionBtn icon={QrCode} label="Scan QR" color="#10B981" />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>RECENT BENEFICIARIES</Text>
                <TouchableOpacity style={styles.addBtn}>
                  <Plus size={16} color="#0EA5E9" />
                  <Text style={styles.addBtnText}>ADD NEW</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchBox}>
                <Search size={18} color="#94A3B8" />
                <TextInput 
                  style={styles.searchInput} 
                  placeholder="Search name or account..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {mockBeneficiaries.map((user) => (
                <TouchableOpacity 
                  key={user.id} 
                  style={styles.userItem}
                  onPress={() => { setSelectedUser(user); setStep('amount'); }}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.name[0]}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userBank}>{user.bank} • {user.acc}</Text>
                  </View>
                  <ChevronRight size={18} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </>
          )}

          {step === 'amount' && (
            <View style={styles.stepContainer}>
              <UserSummary user={selectedUser} />
              
              <View style={styles.amountInputArea}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput 
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>

              <View style={styles.quickAmountRow}>
                {quickAmounts.map(amt => (
                  <TouchableOpacity key={amt} style={styles.amtPill} onPress={() => setAmount(amt)}>
                    <Text style={styles.amtPillText}>₹{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.noteBox}>
                <Text style={styles.label}>ADD A NOTE (OPTIONAL)</Text>
                <TextInput 
                  style={styles.noteInput} 
                  placeholder="What's this for?"
                  value={note}
                  onChangeText={setNote}
                />
              </View>
            </View>
          )}

          {step === 'confirm' && (
            <View style={styles.stepContainer}>
              <View style={styles.confirmCard}>
                <Text style={styles.confirmLabel}>YOU ARE SENDING</Text>
                <Text style={styles.confirmAmount}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
                
                <View style={styles.divider} />
                
                <DetailRow label="To" value={selectedUser.name} />
                <DetailRow label="Bank" value={selectedUser.bank} />
                <DetailRow label="Account" value={selectedUser.acc} />
                <DetailRow label="Note" value={note || 'N/A'} />
              </View>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <CheckCircle2 size={60} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Transfer Successful!</Text>
              <Text style={styles.successDesc}>
                ₹{amount} sent successfully to {selectedUser.name}
              </Text>
            </View>
          )}

        </ScrollView>
      </View>

      {/* Persistent Footer Button */}
      {step !== 'success' && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.mainBtn, (!amount && step === 'amount') && styles.disabledBtn]} 
            onPress={handleNext}
            disabled={isProcessing || (!amount && step === 'amount')}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.mainBtnText}>
                  {step === 'confirm' ? 'CONFIRM & SEND' : 'CONTINUE'}
                </Text>
                <ArrowRight size={18} color="#FFF" style={{ marginLeft: 10 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {step === 'success' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.mainBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.mainBtnText}>BACK TO HOME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setStep('select'); setAmount(''); }}>
            <Text style={styles.secondaryBtnText}>NEW TRANSFER</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// Sub-components
const ActionBtn = ({ icon: Icon, label, color }: any) => (
  <TouchableOpacity style={styles.actionItem}>
    <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const UserSummary = ({ user }: any) => (
  <View style={styles.summaryBox}>
    <View style={styles.avatarSm}><Text style={styles.avatarTextSm}>{user.name[0]}</Text></View>
    <View>
      <Text style={styles.summaryName}>{user.name}</Text>
      <Text style={styles.summaryAcc}>{user.bank} • {user.acc}</Text>
    </View>
  </View>
);

const DetailRow = ({ label, value }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#002D72' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#002D72', paddingBottom: 40 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  iconBtn: { padding: 5 },

  content: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -20 },
  scroll: { padding: 25, paddingBottom: 100 },

  quickActionsCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 20, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    marginTop: -40,
    marginBottom: 25,
    justifyContent: 'space-around'
  },
  actionItem: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 10, fontWeight: '800', color: '#64748B' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94A3B8', letterSpacing: 0.5 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  addBtnText: { fontSize: 11, fontWeight: '900', color: '#0EA5E9' },

  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    height: 50, 
    marginBottom: 20 
  },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '600', color: '#002D72' },

  userItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#0EA5E9', fontWeight: '800', fontSize: 16 },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  userBank: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  // Amount Step
  stepContainer: { paddingTop: 10 },
  summaryBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, marginBottom: 30 },
  avatarSm: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0EA5E9', justifyContent: 'center', alignItems: 'center' },
  avatarTextSm: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  summaryName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  summaryAcc: { fontSize: 11, color: '#64748B' },
  
  amountInputArea: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  currencySymbol: { fontSize: 32, fontWeight: '900', color: '#002D72', marginRight: 10 },
  amountInput: { fontSize: 48, fontWeight: '900', color: '#002D72', minWidth: 100, textAlign: 'center' },
  
  quickAmountRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30 },
  amtPill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  amtPillText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  
  noteBox: { gap: 10 },
  label: { fontSize: 10, fontWeight: '900', color: '#94A3B8' },
  noteInput: { height: 50, backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 15, fontWeight: '600' },

  // Confirm Step
  confirmCard: { backgroundColor: '#F8FAFC', borderRadius: 25, padding: 25 },
  confirmLabel: { textAlign: 'center', fontSize: 11, fontWeight: '900', color: '#94A3B8', marginBottom: 10 },
  confirmAmount: { textAlign: 'center', fontSize: 36, fontWeight: '900', color: '#002D72', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  detailLabel: { color: '#94A3B8', fontWeight: '700', fontSize: 13 },
  detailValue: { color: '#1E293B', fontWeight: '800', fontSize: 13 },

  // Success Step
  successContainer: { alignItems: 'center', paddingTop: 40 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 10 },
  successDesc: { fontSize: 14, color: '#64748B', textAlign: 'center' },

  footer: { padding: 25, backgroundColor: '#FFF', gap: 12 },
  mainBtn: { height: 60, backgroundColor: '#0EA5E9', borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  mainBtnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1 },
  disabledBtn: { backgroundColor: '#CBD5E1' },
  secondaryBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryBtnText: { color: '#64748B', fontWeight: '900' }
});