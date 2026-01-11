import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { Image } from 'expo-image';
import { CreditCard, HelpCircle, LogOut, Settings, ShieldCheck, User } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { profile, user } = useAuth();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-emerald-900 pt-16 pb-12 px-8 items-center rounded-b-[40px] shadow-lg">
        <View className="relative">
          <Image
            source={profile?.avatar_url || 'https://images.unsplash.com/photo-1594241081155-27a3a6944e05?q=80&w=3270&auto=format&fit=crop'}
            className="w-32 h-32 rounded-full border-4 border-gold-500"
          />
          {profile?.is_verified && (
            <View className="absolute bottom-0 right-0 bg-gold-500 p-2 rounded-full border-2 border-emerald-900">
              <ShieldCheck size={16} color="white" />
            </View>
          )}
        </View>
        <Text className="text-white text-2xl font-bold mt-4">
          {profile?.first_name} {profile?.last_name}
        </Text>
        <Text className="text-emerald-100 text-sm mt-1 uppercase tracking-widest font-bold">
          {profile?.role === 'wali' ? 'Guardian (Wali)' : profile?.role === 'male' ? 'Suitor' : 'Member'}
        </Text>

        {profile?.role === 'male' && (
          <View className="bg-white/10 px-4 py-2 rounded-full mt-4 flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${profile.is_subscribed ? 'bg-green-400' : 'bg-red-400'}`} />
            <Text className="text-white text-xs font-bold">
              {profile.is_subscribed ? 'Account Activated' : 'Deactivated'}
            </Text>
          </View>
        )}
      </View>

      <View className="px-6 -mt-8">
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <Text className="text-emerald-900 font-bold mb-4 uppercase text-xs tracking-wider">Account Settings</Text>
          
          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-50">
            <User size={20} color="#064E3B" />
            <Text className="flex-1 ml-4 text-gray-700">Personal Information</Text>
          </TouchableOpacity>

          {profile?.role === 'male' && (
            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-50">
              <CreditCard size={20} color="#064E3B" />
              <Text className="flex-1 ml-4 text-gray-700">Billing & Activation</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-50">
            <Settings size={20} color="#064E3B" />
            <Text className="flex-1 ml-4 text-gray-700">Notification Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-4">
            <HelpCircle size={20} color="#064E3B" />
            <Text className="flex-1 ml-4 text-gray-700">Help & Support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleSignOut}
          className="bg-white rounded-2xl py-5 px-6 shadow-sm border border-red-50 flex-row items-center justify-center mb-10"
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-red-500 font-bold ml-3">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
