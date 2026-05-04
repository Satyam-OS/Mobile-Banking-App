import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

const { width: windowWidth } = Dimensions.get('window');

// Detects if the app is running on a desktop browser
const IS_DESKTOP = Platform.OS === 'web' && windowWidth > 500;

export const MobileWrapper = ({ children }: { children: React.ReactNode }) => {
  if (!IS_DESKTOP) {
    // Standard full-screen view for actual mobile devices
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <View style={styles.webCanvas}>
      <View style={styles.phoneContainer}>
        {/* Top Bezel */}
        <View style={styles.bezelTop}>
           <View style={styles.speaker} />
        </View>

        {/* Screen Content - Home, KYC, Dashboard will appear here */}
        <View style={styles.appContent}>
          {children}
        </View>

        {/* Bottom Home Indicator */}
        <View style={styles.bezelBottom}>
          <View style={styles.homeBar} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  webCanvas: {
    flex: 1,
    backgroundColor: '#E8F4FD', // Lighter sky blue background
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', 
    height: Platform.OS === 'web' ? '100vh' as any : '100%',
  },
  phoneContainer: {
    width: 400, 
    height: 850, 
    backgroundColor: '#1E293B', // Professional dark frame
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 25,
  },
  appContent: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
    overflow: 'hidden',
  },
  bezelTop: {
    height: 35,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speaker: {
    width: 50,
    height: 5,
    backgroundColor: '#334155',
    borderRadius: 10,
  },
  bezelBottom: {
    height: 25,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeBar: {
    width: 100,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 10,
  }
});