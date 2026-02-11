import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Bell, Search } from 'lucide-react-native';

interface HeaderProps {
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
  onProfileClick?: () => void;
}

export function Header({ onNotificationClick, onSearchClick, onProfileClick }: HeaderProps) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Mock data for display
  const userName = "Alexander"; 
  const initials = "AS";

  return (
    <View style={styles.header}>
      {/* Profile Section */}
      <TouchableOpacity 
        style={styles.profileBtn} 
        onPress={onProfileClick}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.onlineStatus} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.greetingText}>{greeting()} 👋</Text>
          <Text style={styles.userNameText}>{userName}</Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.iconBtn} 
          onPress={onSearchClick}
        >
          <Search size={20} color="#002D72" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconBtn} 
          onPress={onNotificationClick}
        >
          <Bell size={20} color="#002D72" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8FAFC', // Match page background
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0EA5E9', // Sky Blue
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E', // Success Green
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  textContainer: {
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#002D72', // Midnight Navy
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE', // Lighter Sky Blue
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F43F5E', // Warning Red/Coral
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
  },
});