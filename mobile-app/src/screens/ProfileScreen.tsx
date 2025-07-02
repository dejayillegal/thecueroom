import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    stageName: user?.stageName || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleSaveProfile = async () => {
    try {
      // In a real app, this would call authService.updateProfile
      Alert.alert('Success', 'Profile updated successfully! (Demo mode)');
      setIsEditing(false);
      await refreshUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

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

  const ProfileSection = ({ title, children }: any) => (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const ProfileField = ({ label, value, field, editable = true }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          value={editForm[field as keyof typeof editForm]}
          onChangeText={(value) => setEditForm(prev => ({ ...prev, [field]: value }))}
          placeholder={label}
          placeholderTextColor={colors.textSecondary}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: colors.text }]}>{value || 'Not set'}</Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.stageName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.stageName, { color: colors.text }]}>
            {user?.stageName || 'Unknown Artist'}
          </Text>
          <Text style={[styles.userStatus, { color: colors.textSecondary }]}>
            {user?.isVerified ? '✓ Verified Artist' : 'Pending Verification'}
          </Text>
        </View>

        {/* Profile Information */}
        <ProfileSection title="Profile Information">
          <View style={styles.editButtonContainer}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: isEditing ? colors.success : colors.primary }]}
              onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            >
              <Ionicons 
                name={isEditing ? "checkmark" : "pencil"} 
                size={16} 
                color="#ffffff" 
              />
              <Text style={styles.editButtonText}>
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setIsEditing(false);
                  setEditForm({
                    stageName: user?.stageName || '',
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || '',
                  });
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          <ProfileField label="Stage Name" value={user?.stageName} field="stageName" />
          <ProfileField label="First Name" value={user?.firstName} field="firstName" />
          <ProfileField label="Last Name" value={user?.lastName} field="lastName" />
          <ProfileField label="Email" value={user?.email} field="email" editable={false} />
        </ProfileSection>

        {/* Account Status */}
        <ProfileSection title="Account Status">
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Ionicons 
                name={user?.isVerified ? "checkmark-circle" : "time"} 
                size={20} 
                color={user?.isVerified ? colors.success : colors.warning} 
              />
              <Text style={[styles.statusText, { color: colors.text }]}>
                Artist Verification: {user?.isVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons 
                name={user?.isAdmin ? "shield-checkmark" : "person"} 
                size={20} 
                color={user?.isAdmin ? colors.primary : colors.textSecondary} 
              />
              <Text style={[styles.statusText, { color: colors.text }]}>
                Role: {user?.isAdmin ? 'Admin' : 'Artist'}
              </Text>
            </View>
          </View>
        </ProfileSection>

        {/* Settings */}
        <ProfileSection title="Settings">
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDarkMode ? '#ffffff' : '#ffffff'}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => Alert.alert('Notifications', 'Notification settings would open here (Demo mode)')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingButtonText, { color: colors.text }]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => Alert.alert('Privacy', 'Privacy settings would open here (Demo mode)')}
          >
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingButtonText, { color: colors.text }]}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </ProfileSection>

        {/* Support */}
        <ProfileSection title="Support">
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => Alert.alert('Help', 'Help center would open here (Demo mode)')}
          >
            <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingButtonText, { color: colors.text }]}>Help Center</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => Alert.alert('Feedback', 'Feedback form would open here (Demo mode)')}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.settingButtonText, { color: colors.text }]}>Send Feedback</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </ProfileSection>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ffffff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stageName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  editButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
  },
  fieldInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  statusContainer: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});