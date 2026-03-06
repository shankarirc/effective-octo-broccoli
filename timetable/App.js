import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import TodayScreen from './src/screens/TodayScreen';
import WeekScreen from './src/screens/WeekScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, focused }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#6A0DAD',
            borderTopColor: '#9C27B0',
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#FF4081',
          tabBarInactiveTintColor: '#CE93D8',
          tabBarLabelStyle: { fontWeight: '700', fontSize: 12 },
        }}
      >
        <Tab.Screen
          name="Today"
          component={TodayScreen}
          options={{
            tabBarLabel: "Today",
            tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Weekly"
          component={WeekScreen}
          options={{
            tabBarLabel: "Weekly",
            tabBarIcon: ({ focused }) => <TabIcon icon="🗓" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
