import { Tabs } from 'expo-router';
import { Heart, MessageSquare, Search, User } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { bottom: insets.bottom + 10 }]}>
      <View className="bg-emerald-950/90 border border-emerald-800/50 flex-row items-center justify-around py-3 px-2 rounded-[32px] shadow-2xl overflow-hidden">
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              activeOpacity={0.7}
              className="items-center justify-center px-4"
            >
              <MotiView
                animate={{
                  scale: isFocused ? 1.2 : 1,
                  translateY: isFocused ? -2 : 0,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                }}
              >
                <View className={`p-2 rounded-2xl ${isFocused ? 'bg-gold-500/10' : ''}`}>
                  {Icon && Icon({ color: isFocused ? '#FBBF24' : '#94A3B8', focused: isFocused, size: 24 })}
                </View>
              </MotiView>
              {isFocused && (
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-gold-500"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#fff', borderBottomWidth: 0, elevation: 0 },
        tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
        headerTitleStyle: { 
          color: '#064E3B', 
          fontFamily: 'ArchivoBlack',
          fontSize: 18,
          textTransform: 'uppercase'
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discovery',
          tabBarIcon: ({ color }: { color: string }) => <Search size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }: { color: string }) => <Heart size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }: { color: string }) => <MessageSquare size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
