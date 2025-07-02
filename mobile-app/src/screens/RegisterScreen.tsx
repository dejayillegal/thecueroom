import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    stageName: '',
    firstName: '',
    lastName: '',
    spotifyUrl: '',
    soundcloudUrl: '',
    instagramUrl: '',
    securityAnswer: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { colors } = useTheme();

  const handleRegister = async () => {
    const { email, password, confirmPassword, stageName, securityAnswer } = formData;

    if (!email || !password || !stageName || !securityAnswer) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      Alert.alert('Success', 'Account created! Please check your email for verification.');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Join TheCueRoom
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Connect with India's underground music scene
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Details
          </Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Email *"
            placeholderTextColor={colors.textSecondary}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Password *"
            placeholderTextColor={colors.textSecondary}
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Confirm Password *"
            placeholderTextColor={colors.textSecondary}
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Artist Profile
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Stage Name / DJ Name *"
            placeholderTextColor={colors.textSecondary}
            value={formData.stageName}
            onChangeText={(value) => updateField('stageName', value)}
            autoCapitalize="words"
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="First Name"
            placeholderTextColor={colors.textSecondary}
            value={formData.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            autoCapitalize="words"
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Last Name"
            placeholderTextColor={colors.textSecondary}
            value={formData.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            autoCapitalize="words"
          />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Social Links (Optional)
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Spotify URL"
            placeholderTextColor={colors.textSecondary}
            value={formData.spotifyUrl}
            onChangeText={(value) => updateField('spotifyUrl', value)}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="SoundCloud URL"
            placeholderTextColor={colors.textSecondary}
            value={formData.soundcloudUrl}
            onChangeText={(value) => updateField('soundcloudUrl', value)}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Instagram URL"
            placeholderTextColor={colors.textSecondary}
            value={formData.instagramUrl}
            onChangeText={(value) => updateField('instagramUrl', value)}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Security
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Security Question Answer *"
            placeholderTextColor={colors.textSecondary}
            value={formData.securityAnswer}
            onChangeText={(value) => updateField('securityAnswer', value)}
            autoCapitalize="none"
          />

          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            What's your favorite techno/house label or artist? This helps with password recovery.
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating Account...' : 'Join TheCueRoom'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});