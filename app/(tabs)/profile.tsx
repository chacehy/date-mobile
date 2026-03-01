import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, HelpCircle, LogOut, Settings, ShieldCheck, User } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { profile, user } = useAuth();
  const router = useRouter();

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
          <View className="w-32 h-32 rounded-full border-4 border-gold-500 bg-emerald-800 items-center justify-center shadow-inner">
            <User size={64} color="#FBBF24" />
          </View>
          {profile?.is_verified && (
            <View className="absolute bottom-1 right-1 bg-gold-500 p-2.5 rounded-full border-2 border-emerald-900 shadow-sm">
              <ShieldCheck size={18} color="white" />
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
          <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-4 uppercase text-xs tracking-[2px]">Account Settings</Text>
          
          <TouchableOpacity 
            onPress={() => router.push('/edit-profile')}
            className="flex-row items-center py-4 border-b border-gray-50"
          >
            <View className="bg-emerald-50 p-2 rounded-xl">
              <User size={18} color="#064E3B" />
            </View>
            <Text className="flex-1 ml-4 text-emerald-900 font-medium">Personal Information</Text>
            <ArrowLeft size={16} color="#064E3B" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          {profile?.role === 'male' && (
            <TouchableOpacity 
              onPress={() => Alert.alert('Billing & Subscription', 'You can manage your activation and billing history here. Feature coming soon in the next update!')}
              className="flex-row items-center py-4 border-b border-gray-50"
            >
              <View className="bg-emerald-50 p-2 rounded-xl">
                <CreditCard size={18} color="#064E3B" />
              </View>
              <Text className="flex-1 ml-4 text-emerald-900 font-medium">Billing & Activation</Text>
              <ArrowLeft size={16} color="#064E3B" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={() => Alert.alert('Notifications', 'Personalize how you receive updates about potential matches and messages.')}
            className="flex-row items-center py-4 border-b border-gray-50"
          >
            <View className="bg-emerald-50 p-2 rounded-xl">
              <Settings size={18} color="#064E3B" />
            </View>
            <Text className="flex-1 ml-4 text-emerald-900 font-medium">Notification Preferences</Text>
            <ArrowLeft size={16} color="#064E3B" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => Alert.alert('Help & Support', 'Our team is here to help you. Email us at support@hda-match.com for any inquiries.')}
            className="flex-row items-center py-4"
          >
            <View className="bg-emerald-50 p-2 rounded-xl">
              <HelpCircle size={18} color="#064E3B" />
            </View>
            <Text className="flex-1 ml-4 text-emerald-900 font-medium">Help & Support</Text>
            <ArrowLeft size={16} color="#064E3B" style={{ transform: [{ rotate: '180deg' }] }} />
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
