import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Plus,
  CreditCard,
  Lock,
  Settings,
  Eye,
  EyeOff,
  ShieldCheck,
  Globe,
  Smartphone,
  ChevronRight,
  Copy,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function Cards({ navigation }: any) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  // State to track which card's full number is visible
  const [visibleCardId, setVisibleCardId] = useState<string | null>(null);

  const mockCards = [
    { 
      id: '1', 
      fullNumber: '4532 8291 0293 9012', 
      hiddenNumber: '•••• •••• •••• 9012', 
      cardHolder: 'HRITIK PANDIT', 
      expiryDate: '12/27', 
      cvv: '123', 
      color: '#002D72',
      brand: 'VISA' 
    },
    { 
      id: '2', 
      fullNumber: '6070 1234 5678 5678', 
      hiddenNumber: '•••• •••• •••• 5678', 
      cardHolder: 'HRITIK PANDIT', 
      expiryDate: '08/25', 
      cvv: '456', 
      color: '#1E293B',
      brand: 'RuPay' 
    },
  ];

  const activeCard = mockCards[activeCardIndex];

  const toggleNumberVisibility = (id: string) => {
    setVisibleCardId(visibleCardId === id ? null : id);
  };

  const cardControls = [
    { icon: Lock, label: 'Lock Card', active: false },
    { icon: Globe, label: 'International', active: true },
    { icon: Smartphone, label: 'Contactless', active: true },
    { icon: Eye, label: 'Show PIN', active: false },
  ];

  const cardActions = [
    { icon: Settings, label: 'Card Settings', route: 'CardSettings' },
    { icon: ShieldCheck, label: 'Card Limits', route: 'CardLimits' },
    { icon: CreditCard, label: 'Virtual Card', route: 'VirtualCard' },
  ];

  const recentActivity = [
    { name: 'Amazon Shopping', amount: -2499, date: 'Today' },
    { name: 'Swiggy', amount: -349, date: 'Yesterday' },
    { name: 'Netflix', amount: -649, date: '2 days ago' },
  ];

  const renderPremiumCard = ({ item, index }: any) => {
    const isVisible = visibleCardId === item.id;

    return (
      <View style={[
        styles.cardWrapper, 
        { opacity: index === activeCardIndex ? 1 : 0.6, transform: [{ scale: index === activeCardIndex ? 1 : 0.9 }] }
      ]}>
        <View style={[styles.bankCard, { backgroundColor: item.color }]}>
          <View style={styles.cardCircleOverlay} />
          
          <View style={styles.cardTopRow}>
            <View style={styles.yellowChip} />
            <Text style={item.brand === 'RuPay' ? styles.rupayText : styles.visaText}>{item.brand}</Text>
          </View>

          <View style={styles.cardNumberContainer}>
            <Text style={styles.cardNumberText}>
              {isVisible ? item.fullNumber : item.hiddenNumber}
            </Text>
            <View style={styles.cardActionIcons}>
              <TouchableOpacity onPress={() => toggleNumberVisibility(item.id)}>
                {isVisible ? <EyeOff size={18} color="#FFF" /> : <Eye size={18} color="rgba(255,255,255,0.6)" />}
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 15 }}>
                <Copy size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardDetailsRow}>
            <View>
              <Text style={styles.detailLabel}>CARD HOLDER</Text>
              <Text style={styles.detailValue}>{item.cardHolder}</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>EXPIRES</Text>
              <Text style={styles.detailValue}>{item.expiryDate}</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>CVV</Text>
              <Text style={styles.detailValue}>{isVisible ? item.cvv : '•••'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerBackground}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cards</Text>
            <TouchableOpacity style={styles.iconBtn}>
              <Plus size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={mockCards}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContainer}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
              setActiveCardIndex(index);
            }}
            renderItem={renderPremiumCard}
            keyExtractor={(item) => item.id}
          />

          <View style={styles.indicatorRow}>
            {mockCards.map((_, index) => (
              <View 
                key={index} 
                style={[styles.indicator, index === activeCardIndex ? styles.indicatorActive : styles.indicatorInactive]} 
              />
            ))}
          </View>
        </View>

        <View style={styles.controlsSection}>
          <View style={styles.controlsCard}>
            <View style={styles.controlsHeader}>
              <Text style={styles.controlsTitle}>Quick Controls</Text>
              <TouchableOpacity onPress={() => setShowControls(!showControls)}>
                {showControls ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </TouchableOpacity>
            </View>

            {showControls && (
              <View style={styles.controlsGrid}>
                {cardControls.map((control, idx) => (
                  <TouchableOpacity key={idx} style={styles.controlItem}>
                    <View style={[styles.controlIconBox, control.active ? styles.controlIconActive : styles.controlIconInactive]}>
                      <control.icon size={20} color={control.active ? "#FFF" : "#94A3B8"} />
                    </View>
                    <Text style={styles.controlLabel}>{control.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Card Services</Text>
          {cardActions.map((action, idx) => (
            <TouchableOpacity key={idx} style={styles.actionCard} onPress={() => navigation.navigate(action.route)}>
              <View style={styles.actionIconBg}>
                <action.icon size={22} color="#0EA5E9" />
              </View>
              <Text style={styles.actionText}>{action.label}</Text>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.activityHeaderRow}>
            <Text style={styles.sectionHeader}>Recent Activity</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          {recentActivity.map((txn, idx) => (
            <View key={idx} style={styles.activityCard}>
              <View style={styles.activityIconBg}>
                <CreditCard size={18} color="#0EA5E9" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{txn.name}</Text>
                <Text style={styles.activityDate}>{txn.date}</Text>
              </View>
              <Text style={styles.activityAmount}>-₹{Math.abs(txn.amount).toLocaleString('en-IN')}</Text>
            </View>
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
  headerBackground: {
    backgroundColor: '#002D72',
    paddingTop: 10,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  iconBtn: { padding: 8 },
  carouselContainer: { paddingLeft: 20 },
  cardWrapper: { width: CARD_WIDTH, marginRight: 15 },
  bankCard: {
    width: '100%',
    height: 210,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    justifyContent: 'space-between',
    elevation: 12,
  },
  cardCircleOverlay: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yellowChip: { width: 45, height: 35, backgroundColor: '#FFD700', borderRadius: 8, opacity: 0.9 },
  visaText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', fontStyle: 'italic' },
  rupayText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: -1 },
  cardNumberContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  cardNumberText: { color: '#FFF', fontSize: 19, fontWeight: '600', letterSpacing: 1.2 },
  cardActionIcons: { flexDirection: 'row', alignItems: 'center' },
  cardDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  detailLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginBottom: 4 },
  detailValue: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  indicatorRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 8 },
  indicator: { height: 6, borderRadius: 3 },
  indicatorActive: { width: 32, backgroundColor: '#38BDF8' },
  indicatorInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
  controlsSection: { paddingHorizontal: 20, marginTop: -25 },
  controlsCard: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  controlsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  controlsTitle: { fontSize: 12, fontWeight: '900', color: '#002D72', letterSpacing: 1.2, textTransform: 'uppercase' },
  controlsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  controlItem: { alignItems: 'center', width: (width - 100) / 4 },
  controlIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  controlIconActive: { backgroundColor: '#0EA5E9' },
  controlIconInactive: { backgroundColor: '#F8FAFC' },
  controlLabel: { fontSize: 9, fontWeight: '700', color: '#64748B', textAlign: 'center', textTransform: 'uppercase' },
  sectionContainer: { paddingHorizontal: 20, marginTop: 32 },
  sectionHeader: { fontSize: 12, fontWeight: '900', color: '#002D72', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  actionIconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#002D72' },
  activityHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAllText: { fontSize: 12, color: '#0EA5E9', fontWeight: 'bold' },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  activityIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 14, fontWeight: '700', color: '#002D72' },
  activityDate: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  activityAmount: { fontSize: 14, fontWeight: '900', color: '#EF4444' },
});