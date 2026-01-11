import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function ChatListScreen() {
  const { profile, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      fetchRooms();
    }
  }, [profile]);

  async function fetchRooms() {
    setLoading(true);
    let query = supabase
      .from('chat_rooms')
      .select(`
        *,
        male:profiles!male_id(first_name, last_name),
        wali:profiles!wali_id(first_name, last_name)
      `);

    if (profile?.role === 'wali') {
      query = query.eq('wali_id', profile.id);
    } else if (profile?.role === 'male') {
      query = query.eq('wali_id', profile.id);
    }

    const { data, error } = await query;

    if (!error) {
      setRooms(data || []);
    }
    setLoading(false);
  }

  if (authLoading || (loading && rooms.length === 0)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#064E3B" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const otherParty = profile?.role === 'male' ? item.wali : item.male;
    const roleLabel = profile?.role === 'male' ? 'Wali' : 'Suitor';

    return (
      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/chat/[chatId]', params: { chatId: item.id } })}
        className="bg-white p-5 mb-4 rounded-2xl flex-row items-center border border-gray-100 shadow-sm"
      >
        <View className="bg-emerald-50 p-4 rounded-full mr-4">
          <MessageSquare size={24} color="#064E3B" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-emerald-900">
            {otherParty.first_name} {otherParty.last_name}
          </Text>
          <Text className="text-gray-500 text-sm">{roleLabel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <FlatList
        data={rooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-400">No active chats yet.</Text>
          </View>
        }
      />
    </View>
  );
}
