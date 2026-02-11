import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity 
} from 'react-native';
// Explicit import from native package
import { 
  Send, 
  QrCode, 
  Receipt, 
  Smartphone, 
  Car, 
  TrendingUp, 
  Shield, 
  Landmark 
} from 'lucide-react-native';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  route: string;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
  onActionClick?: (route: string) => void;
}

// Icon Mapping
const iconMap: Record<string, any> = {
  send: Send,
  scan: QrCode,
  receipt: Receipt,
  smartphone: Smartphone,
  car: Car,
  'trending-up': TrendingUp,
  shield: Shield,
  landmark: Landmark,
};

// Professional Lighter Sky Blue Theme Mapping
const colorMap: Record<string, { bg: string; icon: string }> = {
  send: { bg: '#E0F2FE', icon: '#002D72' },        // Sky-100 & Midnight Navy
  scan: { bg: '#E0F2FE', icon: '#0EA5E9' },        // Sky-100 & Sky-500
  receipt: { bg: '#FEF3C7', icon: '#D97706' },     // Amber
  smartphone: { bg: '#DCFCE7', icon: '#16A34A' },  // Green
  car: { bg: '#F3E8FF', icon: '#9333EA' },         // Purple
  'trending-up': { bg: '#D1FAE5', icon: '#059669' }, // Emerald
  shield: { bg: '#DBEAFE', icon: '#2563EB' },      // Blue
  landmark: { bg: '#FFEDD5', icon: '#EA580C' },     // Orange
};

export function QuickActionsGrid({ actions, onActionClick }: QuickActionsGridProps) {
  return (
    <View style={styles.grid}>
      {actions.map((action) => {
        const IconComponent = iconMap[action.icon] || Send;
        const theme = colorMap[action.icon] || colorMap.send;

        return (
          <TouchableOpacity
            key={action.id}
            onPress={() => onActionClick?.(action.route)}
            activeOpacity={0.7}
            style={styles.actionItem}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
              {/* Force color and size as direct props for Native */}
              <IconComponent 
                size={24} 
                color={theme.icon} 
                strokeWidth={2} 
              />
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {action.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 10,
  },
  actionItem: {
    width: '23%', // Clean 4-column layout
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18, // Slightly more rounded for professional look
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    // Native shadow for depth
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 11,
    fontWeight: '700', // Bold for readability
    color: '#1E293B', // Dark Slate
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 2,
  },
});