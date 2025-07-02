import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://thecueroom.xyz/api'; // Production API
// const API_BASE_URL = 'http://localhost:5000/api'; // Development API

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await SecureStore.getItemAsync('authToken');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(email: string, password: string) {
    return this.makeRequest<{
      token: string;
      user: any;
    }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    stageName: string;
    firstName?: string;
    lastName?: string;
    spotifyUrl?: string;
    soundcloudUrl?: string;
    instagramUrl?: string;
    securityAnswer: string;
  }) {
    return this.makeRequest<{
      token: string;
      user: any;
    }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser() {
    return this.makeRequest<any>('/user');
  }

  async logout() {
    return this.makeRequest('/logout', {
      method: 'POST',
    });
  }

  async updateProfile(profileData: any) {
    return this.makeRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.makeRequest('/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async forgotPassword(email: string) {
    return this.makeRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
}

export const authService = new AuthService();