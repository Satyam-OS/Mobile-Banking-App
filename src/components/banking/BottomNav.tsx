import React from 'react';
// We use 'react-native-web' directly to stop the Vite resolution error
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native-web';
import { 
  Home, 
  ArrowLeftRight, 
  CreditCard, 
  TrendingUp, 
  MoreHorizontal 
} from 'lucide-react'; // Using standard lucide for web-compat

const { width } = Dimensions.get('window');

interface NavItem {
  id: string;
  label: string;
  icon: any;
  route: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, route: '/dashboard' },
  { id: 'payments', label: 'Payments', icon: ArrowLeftRight, route: '/payments' },
  { id: 'cards', label: 'Cards', icon: CreditCard, route: '/cards' },
  { id: 'invest', label: 'Invest', icon: TrendingUp, route: '/transfer' },
  { id: 'more', label: 'More', icon: MoreHorizontal, route: '/profile' },
];

interface BottomNavProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.navBar}>
      <View style={styles.container}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.route || 
            (item.route !== '/dashboard' && activeRoute.startsWith(item.route));
          
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => onNavigate(item.route)}
              style={styles.navItem}
            >
              <View style={[
                styles.iconWrapper,
                isActive && styles.iconWrapperActive
              ]}>
                <Icon 
                  size={20} 
                  strokeWidth={2.5}
                  color={isActive ? "#0ea5e9" : "#94a3b8"} 
                />
              </View>
              <Text style={[
                styles.label,
                isActive ? styles.labelActive : styles.labelInactive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: 'fixed' as any, // Use fixed for web preview
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    zIndex: 1000,
    paddingBottom: 20,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    maxWidth: 430,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 16,
    marginBottom: 4,
  },
  iconWrapperActive: {
    backgroundColor: '#e0f2fe',
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelActive: {
    color: '#002D72',
  },
  labelInactive: {
    color: '#94a3b8',
  },
});