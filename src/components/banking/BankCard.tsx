import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Share } from 'react-native';
import { Eye, EyeOff, Snowflake, Copy } from 'lucide-react-native';

interface CardType {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  isFrozen: boolean;
  color: 'navy' | 'gold' | 'coral' | 'sky';
  cardType: 'visa' | 'mastercard' | 'rupay';
}

interface BankCardProps {
  card: CardType;
  onFreeze?: (cardId: string) => void;
}

export function BankCard({ card }: BankCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  const formatNumber = (num: string) => {
    return isVisible ? num.replace(/(.{4})/g, '$1 ').trim() : `**** **** **** ${num.slice(-4)}`;
  };

  const getBgColor = () => {
    if (card.isFrozen) return '#94A3B8';
    switch (card.color) {
      case 'sky': return '#0EA5E9';
      case 'navy': return '#002D72';
      case 'gold': return '#D97706';
      case 'coral': return '#F43F5E';
      default: return '#0EA5E9';
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: getBgColor() }]}>
      {/* Design Elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Top Row: Chip & Logo */}
      <View style={styles.rowBetween}>
        <View style={styles.chip} />
        <Text style={styles.cardTypeLogo}>{card.cardType.toUpperCase()}</Text>
      </View>

      {/* Middle Row: Number & Actions */}
      <View style={styles.numberRow}>
        <Text style={styles.cardNumber}>{formatNumber(card.cardNumber)}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={styles.iconBtn}>
            {isVisible ? <EyeOff size={18} color="white" /> : <Eye size={18} color="white" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Copy size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Row: Details */}
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.label}>CARD HOLDER</Text>
          <Text style={styles.value}>{card.cardHolder}</Text>
        </View>
        <View style={styles.rightAlign}>
          <Text style={styles.label}>EXPIRES</Text>
          <Text style={styles.value}>{card.expiryDate}</Text>
        </View>
        <View style={styles.rightAlign}>
          <Text style={styles.label}>CVV</Text>
          <Text style={styles.value}>{isVisible ? card.cvv : '***'}</Text>
        </View>
      </View>

      {/* Frozen Overlay */}
      {card.isFrozen && (
        <View style={styles.frozenBadge}>
          <Snowflake size={14} color="white" />
          <Text style={styles.frozenText}>FROZEN</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    height: 190,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  circle1: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.1)' },
  circle2: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { width: 45, height: 32, backgroundColor: '#FCD34D', borderRadius: 6, borderSize: 1, borderColor: '#B45309' },
  cardTypeLogo: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  numberRow: { marginTop: 25, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardNumber: { color: 'white', fontSize: 18, fontWeight: '700', letterSpacing: 2, fontFamily: 'monospace' },
  actionRow: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '700', marginBottom: 2 },
  value: { color: 'white', fontSize: 13, fontWeight: '700' },
  rightAlign: { alignItems: 'flex-end' },
  frozenBadge: { position: 'absolute', top: '40%', alignSelf: 'center', backgroundColor: 'rgba(15, 23, 42, 0.8)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  frozenText: { color: 'white', fontWeight: '900', fontSize: 12 },
});