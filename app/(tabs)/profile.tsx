import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Camera, Save, Moon, Sun, Bell, Shield, Globe, Smartphone, Mail, MapPin, Edit3, Check } from 'lucide-react-native';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { theme, colors, toggleTheme, setThemeMode } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [salesAlerts, setSalesAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  
  // App preferences
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const preferences = await AsyncStorage.getItem('user_preferences');
      if (preferences) {
        const parsed = JSON.parse(preferences);
        setEmailNotifications(parsed.emailNotifications ?? true);
        setPushNotifications(parsed.pushNotifications ?? true);
        setSalesAlerts(parsed.salesAlerts ?? true);
        setLowStockAlerts(parsed.lowStockAlerts ?? true);
        setAutoSync(parsed.autoSync ?? true);
        setOfflineMode(parsed.offlineMode ?? false);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (newPrefs: any) => {
    try {
      const preferences = {
        emailNotifications,
        pushNotifications,
        salesAlerts,
        lowStockAlerts,
        autoSync,
        offlineMode,
        ...newPrefs,
      };
      await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const updates = { [key]: value };
    savePreferences(updates);
    
    switch (key) {
      case 'emailNotifications':
        setEmailNotifications(value);
        break;
      case 'pushNotifications':
        setPushNotifications(value);
        break;
      case 'salesAlerts':
        setSalesAlerts(value);
        break;
      case 'lowStockAlerts':
        setLowStockAlerts(value);
        break;
      case 'autoSync':
        setAutoSync(value);
        break;
      case 'offlineMode':
        setOfflineMode(value);
        break;
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    const result = await updateProfile({
      name: name.trim(),
      profilePhoto: profilePhoto || undefined,
      bio: bio.trim() || undefined,
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully');
      setEditingField(null);
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile');
    }
  };

  const handleFieldEdit = (field: string) => {
    setEditingField(editingField === field ? null : field);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature would typically redirect to a secure password change form.',
      [{ text: 'OK' }]
    );
  };

  const handlePhotoSelect = () => {
    const options = [
      { text: 'Cancel', style: 'cancel' as const },
      {
        text: 'Professional Photo',
        onPress: () => setProfilePhoto('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
      },
      {
        text: 'Business Avatar',
        onPress: () => setProfilePhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
      },
      {
        text: 'Team Member',
        onPress: () => setProfilePhoto('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
      },
      {
        text: 'Remove Photo',
        style: 'destructive' as const,
        onPress: () => setProfilePhoto(''),
      },
    ];

    if (Platform.OS === 'web') {
      Alert.alert('Profile Photo', 'Choose an option', options);
    } else {
      Alert.alert(
        'Profile Photo',
        'Choose an option',
        [
          ...options.slice(0, -2),
          {
            text: 'Take Photo',
            onPress: () => Alert.alert('Camera', 'Camera functionality would be implemented here'),
          },
          {
            text: 'Choose from Gallery',
            onPress: () => Alert.alert('Gallery', 'Gallery selection would be implemented here'),
          },
          options[options.length - 1],
        ]
      );
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    roleText: {
      fontSize: 16,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    themeText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginLeft: 12,
    },
    themeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      marginRight: 12,
    },
    settingText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    editableField: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    fieldContent: {
      flex: 1,
      marginRight: 12,
    },
    fieldLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    fieldValue: {
      fontSize: 16,
      color: colors.text,
    },
    themeSelector: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    themeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 2,
      marginHorizontal: 4,
    },
    themeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    themeButtonInactive: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    themeButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <Text style={dynamicStyles.title}>Profile Settings</Text>
        <Text style={dynamicStyles.subtitle}>Manage your account preferences</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={[styles.profileCard, dynamicStyles.card]}>
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoSelect}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <User size={40} color={colors.textSecondary} />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Camera size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
              <Text style={dynamicStyles.roleText}>{user?.role}</Text>
            </View>
          </View>
        </Card>

        <Text style={dynamicStyles.sectionTitle}>Personal Information</Text>
        <Card style={[styles.section, dynamicStyles.card]}>
          <TouchableOpacity 
            style={dynamicStyles.editableField} 
            onPress={() => handleFieldEdit('name')}
          >
            <View style={dynamicStyles.fieldContent}>
              <Text style={dynamicStyles.fieldLabel}>Full Name</Text>
              {editingField === 'name' ? (
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  autoFocus
                />
              ) : (
                <Text style={dynamicStyles.fieldValue}>{name || 'Not set'}</Text>
              )}
            </View>
            {editingField === 'name' ? (
              <TouchableOpacity onPress={handleSaveProfile}>
                <Check size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <Edit3 size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.editableField} 
            onPress={() => handleFieldEdit('bio')}
          >
            <View style={dynamicStyles.fieldContent}>
              <Text style={dynamicStyles.fieldLabel}>Bio</Text>
              {editingField === 'bio' ? (
                <Input
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself"
                  multiline
                  autoFocus
                />
              ) : (
                <Text style={dynamicStyles.fieldValue}>{bio || 'Add a bio'}</Text>
              )}
            </View>
            {editingField === 'bio' ? (
              <TouchableOpacity onPress={handleSaveProfile}>
                <Check size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <Edit3 size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.editableField} 
            onPress={() => handleFieldEdit('phone')}
          >
            <View style={dynamicStyles.fieldContent}>
              <Text style={dynamicStyles.fieldLabel}>Phone Number</Text>
              {editingField === 'phone' ? (
                <Input
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  autoFocus
                />
              ) : (
                <Text style={dynamicStyles.fieldValue}>{phone || 'Add phone number'}</Text>
              )}
            </View>
            {editingField === 'phone' ? (
              <TouchableOpacity onPress={handleSaveProfile}>
                <Check size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <Edit3 size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.editableField} 
            onPress={() => handleFieldEdit('location')}
          >
            <View style={dynamicStyles.fieldContent}>
              <Text style={dynamicStyles.fieldLabel}>Location</Text>
              {editingField === 'location' ? (
                <Input
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Enter your location"
                  autoFocus
                />
              ) : (
                <Text style={dynamicStyles.fieldValue}>{location || 'Add location'}</Text>
              )}
            </View>
            {editingField === 'location' ? (
              <TouchableOpacity onPress={handleSaveProfile}>
                <Check size={20} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <Edit3 size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </Card>

        <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
        <Card style={[styles.section, dynamicStyles.card]}>
          <View style={dynamicStyles.themeSelector}>
            <TouchableOpacity 
              style={[
                dynamicStyles.themeButton,
                theme === 'light' ? dynamicStyles.themeButtonActive : dynamicStyles.themeButtonInactive
              ]}
              onPress={() => setThemeMode('light')}
            >
              <Sun size={18} color={theme === 'light' ? colors.primary : colors.textSecondary} />
              <Text style={[
                dynamicStyles.themeButtonText,
                { color: theme === 'light' ? colors.primary : colors.textSecondary }
              ]}>
                Light
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                dynamicStyles.themeButton,
                theme === 'dark' ? dynamicStyles.themeButtonActive : dynamicStyles.themeButtonInactive
              ]}
              onPress={() => setThemeMode('dark')}
            >
              <Moon size={18} color={theme === 'dark' ? colors.primary : colors.textSecondary} />
              <Text style={[
                dynamicStyles.themeButtonText,
                { color: theme === 'dark' ? colors.primary : colors.textSecondary }
              ]}>
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Text style={dynamicStyles.sectionTitle}>Notifications</Text>
        <Card style={[styles.section, dynamicStyles.card]}>
          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingLeft}>
              <Bell size={20} color={colors.primary} style={dynamicStyles.settingIcon} />
              <View>
                <Text style={dynamicStyles.settingText}>Push Notifications</Text>
                <Text style={dynamicStyles.settingDescription}>Receive alerts on your device</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(value) => handleNotificationChange('pushNotifications', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={pushNotifications ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingLeft}>
              <Mail size={20} color={colors.primary} style={dynamicStyles.settingIcon} />
              <View>
                <Text style={dynamicStyles.settingText}>Email Notifications</Text>
                <Text style={dynamicStyles.settingDescription}>Get updates via email</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={(value) => handleNotificationChange('emailNotifications', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={emailNotifications ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingLeft}>
              <Smartphone size={20} color={colors.primary} style={dynamicStyles.settingIcon} />
              <View>
                <Text style={dynamicStyles.settingText}>Sales Alerts</Text>
                <Text style={dynamicStyles.settingDescription}>Notify when sales are recorded</Text>
              </View>
            </View>
            <Switch
              value={salesAlerts}
              onValueChange={(value) => handleNotificationChange('salesAlerts', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={salesAlerts ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={[dynamicStyles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={dynamicStyles.settingLeft}>
              <Globe size={20} color={colors.primary} style={dynamicStyles.settingIcon} />
              <View>
                <Text style={dynamicStyles.settingText}>Low Stock Alerts</Text>
                <Text style={dynamicStyles.settingDescription}>Alert when inventory is low</Text>
              </View>
            </View>
            <Switch
              value={lowStockAlerts}
              onValueChange={(value) => handleNotificationChange('lowStockAlerts', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={lowStockAlerts ? colors.primary : colors.textSecondary}
            />
          </View>
        </Card>

        <Text style={dynamicStyles.sectionTitle}>App Preferences</Text>
        <Card style={[styles.section, dynamicStyles.card]}>
          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingLeft}>
              <Globe size={20} color={colors.primary} style={dynamicStyles.settingIcon} />
              <View>
                <Text style={dynamicStyles.settingText}>Auto Sync</Text>
                <Text style={dynamicStyles.settingDescription}>Automatically sync data</Text>
              </View>
            </View>
            <Switch
              value={autoSync}
              onValueChange={(value) => handleNotificationChange('autoSync', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={autoSync ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={[dynamicStyles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={dynamicStyles.settingLeft}>
              <Smartphone size={20} color={colors.primary} style={dynamicStyles.settingIcon} />
              <View>
                <Text style={dynamicStyles.settingText}>Offline Mode</Text>
                <Text style={dynamicStyles.settingDescription}>Work without internet connection</Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={(value) => handleNotificationChange('offlineMode', value)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={offlineMode ? colors.primary : colors.textSecondary}
            />
          </View>
        </Card>

        <Text style={dynamicStyles.sectionTitle}>Security</Text>
        <Card style={[styles.section, dynamicStyles.card]}>
          <TouchableOpacity style={dynamicStyles.settingRow} onPress={handleChangePassword}>
            <View style={dynamicStyles.settingLeft}>
              <Shield size={20} color={colors.primary} style={dynamicStyles.settingIcon} />
              <View>
                <Text style={dynamicStyles.settingText}>Change Password</Text>
                <Text style={dynamicStyles.settingDescription}>Update your account password</Text>
              </View>
            </View>
            <Text style={[styles.themeStatus, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </Card>

        <Text style={dynamicStyles.sectionTitle}>Account Information</Text>
        <Card style={[styles.section, dynamicStyles.card]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Role:</Text>
            <Text style={[styles.infoValue, { color: colors.text, textTransform: 'capitalize' }]}>
              {user?.role}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member Since:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeStatus: {
    fontSize: 12,
  },
});