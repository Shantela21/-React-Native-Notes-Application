import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (email?: string, password?: string, username?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const userData = await AsyncStorage.getItem('user');
      console.log('User data from storage:', userData);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user data:', parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateUserId = () => {
    return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const hashPassword = async (password: string): Promise<string> => {
    // Simple hash for demo purposes - in production, use proper hashing
    return btoa(password + 'salt');
  };

  const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const hashed = await hashPassword(password);
    return hashed === hashedPassword;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Starting login for:', email);
      const usersData = await AsyncStorage.getItem('users');
      console.log('Users data from storage:', usersData);
      const users = usersData ? JSON.parse(usersData) : {};
      
      const userEmail = email.toLowerCase().trim();
      console.log('Looking for user:', userEmail);
      const user = users[userEmail];
      console.log('Found user:', user ? 'Yes' : 'No');
      
      if (user && await verifyPassword(password, user.password)) {
        console.log('Password verification successful');
        const userData = {
          id: user.id,
          email: user.email,
          username: user.username
        };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log('User logged in successfully');
        return true;
      }
      console.log('Login failed: invalid credentials');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      console.log('Starting registration for:', email);
      const usersData = await AsyncStorage.getItem('users');
      console.log('Existing users data:', usersData);
      const users = usersData ? JSON.parse(usersData) : {};
      
      const userEmail = email.toLowerCase().trim();
      console.log('Processed email:', userEmail);
      
      if (users[userEmail]) {
        console.log('User already exists:', userEmail);
        return false; // User already exists
      }
      
      const hashedPassword = await hashPassword(password);
      console.log('Password hashed successfully');
      const userId = generateUserId();
      console.log('Generated user ID:', userId);
      
      users[userEmail] = {
        id: userId,
        email: userEmail,
        username: username.trim(),
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      
      console.log('User object created:', users[userEmail]);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      console.log('Users saved to AsyncStorage');
      
      const userData = {
        id: userId,
        email: userEmail,
        username: username.trim()
      };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log('Current user session set');
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (email?: string, password?: string, username?: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const usersData = await AsyncStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : {};
      
      const oldEmail = user.email;
      const userRecord = users[oldEmail];
      
      if (!userRecord) return false;
      
      // Update email if provided
      if (email && email.toLowerCase().trim() !== oldEmail) {
        const newEmail = email.toLowerCase().trim();
        if (users[newEmail]) return false; // Email already exists
        
        users[newEmail] = { ...userRecord, email: newEmail };
        delete users[oldEmail];
        
        user.email = newEmail;
      }
      
      // Update password if provided
      if (password) {
        const hashedPassword = await hashPassword(password);
        const emailKey = user.email;
        users[emailKey].password = hashedPassword;
      }
      
      // Update username if provided
      if (username) {
        const emailKey = user.email;
        users[emailKey].username = username.trim();
        user.username = username.trim();
      }
      
      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
