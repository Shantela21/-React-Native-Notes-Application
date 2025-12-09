import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'white',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'All Notes',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="work"
          options={{
            title: 'Work',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="study"
          options={{
            title: 'Study',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="personal"
          options={{
            title: 'Personal',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
