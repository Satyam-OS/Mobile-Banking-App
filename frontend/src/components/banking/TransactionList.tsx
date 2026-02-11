import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
// Explicitly use the native package to resolve the 'color' property error
import { 
  ShoppingBag, 
  Utensils, 
  Car, 
  FileText, 
  Film, 
  Heart, 
  ArrowRightLeft, 
  Wallet, 
  TrendingUp, 
  Circle,
  ArrowUpRight,
  ArrowDownLeft 
} from 'lucide-react-native';

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string | Date;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending';
}

const categoryIconMap: Record<string, any> = {
  shopping: ShoppingBag,
  food: Utensils,
  transport: Car,
  bills: FileText,
  entertainment: Film,
  health: Heart,
  transfer: ArrowRightLeft,
  salary: Wallet,
  investment: TrendingUp,
  other: Circle,
};

const categoryColorMap: Record<string, { bg: string; icon: string }> = {
  shopping: { bg: 'rgba(168, 85, 247, 0.1)', icon: '#a855f7' },
  food: { bg: 'rgba(249, 115, 22, 0.1)', icon: '#f97316' },
  transport: { bg: 'rgba(59, 130, 246, 0.1)', icon: '#3b82f6' },
  bills: { bg: 'rgba(234, 179, 8, 0.1)', icon: '#eab308' },
  entertainment: { bg: 'rgba(236, 72, 153, 0.1)', icon: '#ec4899' },
  health: { bg: 'rgba(34, 197, 94, 0.1)', icon: '#22c55e' },
  transfer: { bg: 'rgba(6, 182, 212, 0.1)', icon: '#06b6d4' },
  salary: { bg: 'rgba(16, 185, 129, 0.1)', icon: '#10b981' },
  investment: { bg: 'rgba(79, 70, 229, 0.1)', icon: '#4f46e5' },
  other: { bg: 'rgba(107, 114, 128, 0.1)', icon: '#6b7280' },
};

const TransactionItem = ({ transaction, onClick }: { transaction: Transaction; onClick?: () => void }) => {
  const Icon = categoryIconMap[transaction.category] || Circle;
  const theme = categoryColorMap[transaction.category] || categoryColorMap.other;
  const isCredit = transaction.type === 'credit';

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(transaction.amount);

  const formattedDate = new Date(transaction.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <TouchableOpacity 
      onPress={onClick} 
      activeOpacity={0.6} 
      style={styles.itemContainer}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.bg }]}>
        <Icon size={20} color={theme.icon} />
      </View>

      <View style={styles.details}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {transaction.status === 'pending' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.amountContainer}>
        <View style={styles.amountRow}>
          {isCredit ? (
            <ArrowDownLeft size={14} color="#22c55e" />
          ) : (
            <ArrowUpRight size={14} color="#64748b" />
          )}
          <Text style={[styles.amountText, isCredit ? styles.creditText : styles.debitText]}>
            {isCredit ? '+' : '-'} {formattedAmount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export function TransactionList({ 
  transactions, 
  onTransactionClick 
}: { 
  transactions: Transaction[]; 
  onTransactionClick?: (t: Transaction) => void 
}) {
  return (
    <View style={styles.list}>
      {transactions.map((t) => (
        <TransactionItem 
          key={t.id} 
          transaction={t} 
          onClick={() => onTransactionClick?.(t)} 
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 4 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: { flex: 1, marginLeft: 14 },
  description: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8 },
  dateText: { fontSize: 12, color: '#64748b' },
  pendingBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  pendingText: { fontSize: 10, fontWeight: '600', color: '#f59e0b' },
  amountContainer: { alignItems: 'flex-end' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amountText: { fontSize: 15, fontWeight: '900' },
  creditText: { color: '#22c55e' },
  debitText: { color: '#0f172a' },
});