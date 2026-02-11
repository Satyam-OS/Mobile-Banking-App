import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react-native';

export default function NotFound({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Navigation Mock (Optional) */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#002D72" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Visual Element */}
        <View style={styles.iconContainer}>
          <View style={styles.pulseCircle} />
          <View style={styles.mainCircle}>
            <FileQuestion size={64} color="#002D72" strokeWidth={1.5} />
          </View>
          <Text style={styles.errorCode}>404</Text>
        </View>

        {/* Text Content */}
        <View style={styles.textGroup}>
          <Text style={styles.title}>Lost in Space?</Text>
          <Text style={styles.subtitle}>
            The page you are looking for doesn't exist or has been moved to a new vault.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionGroup}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Home size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryBtn} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Branding Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>NEXUSBANK SECURE NODE</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Light Sky Blue background
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  mainCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#002D72',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    zIndex: 2,
  },
  pulseCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E0F2FE', // Very Light Sky Blue
    opacity: 0.5,
    zIndex: 1,
  },
  errorCode: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: '#002D72',
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 3,
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionGroup: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    height: 60,
    backgroundColor: '#002D72', // Midnight Navy
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#002D72',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 2,
  },
});