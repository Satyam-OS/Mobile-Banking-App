import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, CreditCard, TrendingUp } from 'lucide-react-native';

interface Account {
  id: string;
  type: 'savings' | 'current' | 'fd' | 'rd';
  name: string;
  accountNumber: string;
  balance: number;
  isPrimary: boolean;
}

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getAccountIcon = () => {
    switch (account.type) {
      case 'savings': return '💰';
      case 'current': return '🏢';
      case 'fd': return '📊';
      case 'rd': return '📈';
      default: return '💳';
    }
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.card}>
      {/* Abstract Background Shapes */}
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <View style={styles.iconBg}>
              <Text style={styles.emojiIcon}>{getAccountIcon()}</Text>
            </View>
            <View>
              <Text style={styles.typeLabel}>{account.type.toUpperCase()} ACCOUNT</Text>
              <Text style={styles.accountName}>{account.name}</Text>
            </View>
          </View>
          {account.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>PRIMARY</Text>
            </View>
          )}
        </View>

        {/* Account Number */}
        <Text style={styles.accountNumber}>
          {account.accountNumber.replace(/.(?=.{4})/g, '•')}
        </Text>

        {/* Balance Row */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceValue}>
                {isVisible ? formatBalance(account.balance) : '₹ ••••••'}
              </Text>
              <TouchableOpacity 
                onPress={() => setIsVisible(!isVisible)} 
                style={styles.toggleBtn}
              >
                {isVisible ? (
                  <EyeOff size={18} color="#002D72" />
                ) : (
                  <Eye size={18} color="#002D72" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.actionBtn}>
              <CreditCard size={18} color="#002D72" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <TrendingUp size={18} color="#002D72" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E0F2FE', // Lighter Sky Blue
    borderRadius: 24,
    padding: 20,
    minWidth: 300,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  circleTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  circleBottom: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: { zIndex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  typeContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: {
    width: 44,
    height: 44,
    backgroundColor: '#FFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiIcon: { fontSize: 20 },
  typeLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  accountName: { fontSize: 15, fontWeight: '700', color: '#002D72' },
  primaryBadge: {
    backgroundColor: '#002D72',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  accountNumber: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'monospace',
    marginBottom: 20,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  balanceLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceValue: { fontSize: 22, fontWeight: '900', color: '#002D72' },
  toggleBtn: { padding: 4 },
  actionGroup: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
});