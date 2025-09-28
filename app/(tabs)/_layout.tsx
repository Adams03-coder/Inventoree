import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';
import { useAuth } from '../../contexts/auth-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import Sidebar from '../../components/Sidebar';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return null;
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.sidebar}>
          <Sidebar />
        </View>
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mobileContainer}>
      <View style={styles.mobileHeader}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Menu size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <Stack screenOptions={{ headerShown: false }} />

      <Modal
        visible={sidebarVisible}
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setSidebarVisible(false)}
          />
          <View style={styles.modalSidebar}>
            <Sidebar onClose={() => setSidebarVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  content: {
    flex: 1,
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#ffffff',
  },
});