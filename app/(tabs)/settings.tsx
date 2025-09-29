import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, Bell, Database, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../contexts/auth-context';
import Card from '../../components/ui/Card';

export default function SettingsScreen() {
  const { user, logout, hasPermission } = useAuth();

  // Dynamic app info
  const appVersion = '1.0.0';
  const appBuild = '2025.09.001';
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const settingsItems = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Update your personal information',
      icon: User,
      onPress: () => Alert.alert('Coming Soon', 'Profile settings will be available soon'),
    },
    {
      id: 'permissions',
      title: 'User Permissions',
      description: 'Manage user roles and access',
      icon: Shield,
      onPress: () => Alert.alert('Coming Soon', 'User management will be available soon'),
      adminOnly: true,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure alerts and notifications',
      icon: Bell,
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
    },
    {
      id: 'backup',
      title: 'Data Management',
      description: 'Backup and restore your data',
      icon: Database,
      onPress: () => Alert.alert('Coming Soon', 'Data management will be available soon'),
      adminOnly: true,
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: HelpCircle,
      onPress: () => Alert.alert('Help & Support', 'For support, please contact: support@inventoree.com'),
    },
  ];

  const filteredSettings = settingsItems.filter(item =>
    !item.adminOnly || hasPermission('admin')
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          {filteredSettings.map(item => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.settingIcon}>
                  <Icon size={20} color="#64748b" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <ChevronRight size={20} color="#94a3b8" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dynamic App Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build:</Text>
            <Text style={styles.infoValue}>{appBuild}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>{lastUpdated}</Text>
          </View>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  userCard: { marginBottom: 24 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  userDetails: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  roleBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  roleText: { fontSize: 12, color: '#2563eb', fontWeight: '600' },
  settingsSection: { backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 24, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  settingIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  settingDescription: { fontSize: 14, color: '#64748b' },
  infoCard: { marginBottom: 24 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#64748b' },
  infoValue: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 40, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: 16, color: '#ef4444', fontWeight: '600', marginLeft: 8 },
});
