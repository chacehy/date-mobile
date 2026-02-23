import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/types/database.types';
import { supabase } from '@/utils/supabase';
import { Image } from 'expo-image';
import { Heart, ShieldCheck } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function DiscoveryScreen() {
  const { profile, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'male' && profile.is_subscribed) {
      fetchProfiles();
    } else {
      setLoading(false);
    }
  }, [profile]);

  async function fetchProfiles() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'female')
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  }

  async function handleActivate() {
    setLoading(true);
    // Simulate payment/activation
    const { error } = await supabase
      .from('profiles')
      .update({ is_subscribed: true })
      .eq('id', profile?.id || '');

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Account Activated', 'Your profile is now visible and you can contact Walis!');
      // fetchProfile in hook should trigger re-render
    }
    setLoading(false);
  }

  if (authLoading || (loading && profiles.length === 0)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#064E3B" />
      </View>
    );
  }

  if (profile?.role === 'male' && !profile.is_subscribed) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-8">
        <View className="bg-gold-50 p-6 rounded-full mb-6">
          <ShieldCheck size={64} color="#D97706" />
        </View>
        <Text className="text-2xl font-bold text-emerald-900 text-center mb-4">
          Activate Your Profile
        </Text>
        <Text className="text-gray-600 text-center mb-10 leading-6">
          Your profile is currently deactivated. To start searching for your companion and contacting Walis, a one-time activation is required.
        </Text>
        <TouchableOpacity 
          onPress={handleActivate}
          className="bg-emerald-900 w-full py-4 rounded-2xl shadow-lg items-center"
        >
          <Text className="text-white font-bold text-lg">Activate Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (profile?.role !== 'male') {
    return (
      <View className="flex-1 justify-center items-center bg-white px-8">
        <Text className="text-xl font-bold text-emerald-900 text-center mb-2">
          Welcome to Halal Match
        </Text>
        <Text className="text-gray-500 text-center">
          Navigate to 'Requests' to see incoming proposals.
        </Text>
      </View>
    );
  }

  async function handleRequest(female: Profile) {
    if (!profile) return;
    if (!female.wali_id) {
      Alert.alert('Incomplete Profile', 'This profile does not have a linked Wali yet.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('connection_requests').insert({
      sender_id: profile.id,
      receiver_id: female.id,
      wali_id: female.wali_id,
      status: 'pending',
      message_to_wali: `Salam, I am interested in connecting with your ward ${female.first_name}.`,
    });

    if (error) {
      if (error.code === '23505') {
        Alert.alert('Already Sent', 'You have already sent a request to this person.');
      } else {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Success', 'Request sent to Wali! You will be notified when they approve.');
    }
    setLoading(false);
  }

  const renderItem = ({ item }: { item: Profile }) => (
    <View className="bg-white rounded-[40px] mb-8 overflow-hidden shadow-2xl border border-gray-100 pb-6">
      <View className="bg-emerald-950 p-6 flex-row justify-between items-center">
        <View>
          <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-white text-xl uppercase tracking-tighter">HDA Profile</Text>
          <Text className="text-emerald-400 text-[10px] tracking-[2px]">ID: {item.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <Image
          source={item.avatar_url || 'https://images.unsplash.com/photo-1594241081155-27a3a6944e05?q=80&w=3270&auto=format&fit=crop'}
          className="w-16 h-16 rounded-full border-2 border-gold-500"
          contentFit="cover"
        />
      </View>

      <View className="p-6 space-y-4">
        {/* Quadrant Grid */}
        <View className="flex-row gap-4">
          {/* PROFIL */}
          <View className="flex-1 bg-gray-50 p-4 rounded-3xl border-l-4 border-red-500">
            <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-2 uppercase text-xs tracking-widest">Profil</Text>
            <View className="space-y-1">
              <Text className="text-[11px] text-gray-500">Origin: <Text className="text-emerald-900 font-bold">{item.ethnicity || 'N/A'}</Text></Text>
              <Text className="text-[11px] text-gray-500">Age: <Text className="text-emerald-900 font-bold">{item.age || 'N/A'} years</Text></Text>
              <Text className="text-[11px] text-gray-500">Gender: <Text className="text-emerald-900 font-bold">Female</Text></Text>
            </View>
          </View>
          
          {/* DINE */}
          <View className="flex-1 bg-gray-50 p-4 rounded-3xl border-l-4 border-purple-600">
            <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-2 uppercase text-xs tracking-widest">Dine</Text>
            <View className="space-y-1">
              <Text className="text-[11px] text-gray-500">Prayer: <Text className="text-emerald-900 font-bold">{item.prayer_frequency || 'N/A'}</Text></Text>
              <Text className="text-[11px] text-gray-500">Practice: <Text className="text-emerald-900 font-bold">{item.practice_level?.includes('Sunnah') ? 'Advanced' : 'Standard'}</Text></Text>
              <Text className="text-[11px] text-gray-500">Arabic: <Text className="text-emerald-900 font-bold">{item.reads_arabic ? 'Yes' : 'No'}</Text></Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-4">
          {/* PREFERENCES */}
          <View className="flex-1 bg-gray-50 p-4 rounded-3xl border-l-4 border-green-500">
            <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-2 uppercase text-xs tracking-widest">Preferences</Text>
            <View className="space-y-1">
              <Text className="text-[11px] text-gray-500">Age Gap: <Text className="text-emerald-900 font-bold">{item.age_gap_pref || 'Open'}</Text></Text>
              <Text className="text-[11px] text-gray-500">Divorced: <Text className="text-emerald-900 font-bold">{item.accepts_divorced ? 'Yes' : 'No'}</Text></Text>
              <Text className="text-[11px] text-gray-500">Origin: <Text className="text-emerald-900 font-bold">{item.ethnicity_pref || 'Open'}</Text></Text>
            </View>
          </View>

          {/* SITUATION */}
          <View className="flex-1 bg-gray-50 p-4 rounded-3xl border-l-4 border-blue-400">
            <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-2 uppercase text-xs tracking-widest">Situation</Text>
            <View className="space-y-1">
              <Text className="text-[11px] text-gray-500">Job: <Text className="text-emerald-900 font-bold" numberOfLines={1}>{item.job || 'N/A'}</Text></Text>
              <Text className="text-[11px] text-gray-500">Kids: <Text className="text-emerald-900 font-bold">{item.has_children ? 'Yes' : 'No'}</Text></Text>
              <Text className="text-[11px] text-gray-500">Status: <Text className="text-emerald-900 font-bold">{item.was_married ? 'Previously Married' : 'Single'}</Text></Text>
            </View>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-900/5">
          <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-2 uppercase text-[10px] tracking-widest">Description</Text>
          <Text className="text-gray-600 text-xs leading-5">
            {item.bio || "Seeking for a meaningful connection based on Islamic values and mutual respect. May Allah grant us success."}
          </Text>
        </View>

        <TouchableOpacity 
          className="bg-emerald-900 flex-row justify-center items-center py-5 rounded-[24px] mt-2 shadow-xl shadow-emerald-900/40"
          onPress={() => handleRequest(item)}
        >
          <Heart size={20} color="white" fill="white" className="mr-2" />
          <Text style={{ fontFamily: 'FjallaOne' }} className="text-white font-bold ml-2 uppercase tracking-widest">Contact Wali</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={profiles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-400">No profiles found yet.</Text>
          </View>
        }
      />
    </View>
  );
}
