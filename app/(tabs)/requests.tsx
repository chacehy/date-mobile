import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/types/database.types';
import { supabase } from '@/utils/supabase';
import { Check, User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

type ConnectionRequest = Database['public']['Tables']['connection_requests']['Row'] & {
  sender: { first_name: string, last_name: string };
  receiver: { first_name: string, last_name: string };
};

export default function RequestsScreen() {
  const { profile, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchRequests();
    }
  }, [profile]);

  async function fetchRequests() {
    setLoading(true);
    let query = supabase
      .from('connection_requests')
      .select(`
        *,
        sender:profiles!sender_id(first_name, last_name),
        receiver:profiles!receiver_id(first_name, last_name)
      `);

    if (profile?.role === 'wali') {
      query = query.eq('wali_id', profile.id);
    } else if (profile?.role === 'male') {
      query = query.eq('sender_id', profile.id);
    } else {
      query = query.eq('receiver_id', profile.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setRequests(data as any || []);
    }
    setLoading(false);
  }

  async function handleAction(requestId: string, status: 'accepted' | 'rejected') {
    setLoading(true);
    const { error } = await supabase
      .from('connection_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      if (status === 'accepted') {
        // Automatically create a chat room
        const request = requests.find(r => r.id === requestId);
        if (request) {
          await supabase.from('chat_rooms').insert({
            request_id: requestId,
            male_id: request.sender_id,
            wali_id: profile?.id,
          });
        }
        Alert.alert('Accepted', 'Connection accepted. A chat room has been created with the suitor.');
      } else {
        Alert.alert('Rejected', 'The request has been rejected.');
      }
      fetchRequests();
    }
    setLoading(false);
  }

  if (authLoading || (loading && requests.length === 0)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#064E3B" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: ConnectionRequest }) => (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-4">
        <View className="bg-emerald-50 p-3 rounded-full mr-4">
          <User size={24} color="#064E3B" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-emerald-900">
            {profile?.role === 'wali' ? `${item.sender.first_name} ${item.sender.last_name}` : 
             profile?.role === 'male' ? `To: ${item.receiver.first_name}'s Wali` : 
             `From: ${item.sender.first_name}`}
          </Text>
          <Text className="text-gray-500 text-sm">
            {profile?.role === 'wali' ? `Suitor for ${item.receiver.first_name}` : 
             `Status: ${item.status?.toUpperCase()}`}
          </Text>
        </View>
      </View>
      
      {item.message_to_wali && profile?.role === 'wali' && (
        <View className="bg-gray-50 p-4 rounded-xl mb-4">
          <Text className="text-gray-600 italic">"{item.message_to_wali}"</Text>
        </View>
      )}

      {profile?.role === 'wali' && item.status === 'pending' && (
        <View className="flex-row space-x-3">
          <TouchableOpacity 
            onPress={() => handleAction(item.id, 'accepted')}
            className="flex-1 bg-emerald-900 flex-row justify-center items-center py-3 rounded-xl"
          >
            <Check size={18} color="white" className="mr-2" />
            <Text className="text-white font-bold ml-2">Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleAction(item.id, 'rejected')}
            className="flex-1 bg-gray-100 flex-row justify-center items-center py-3 rounded-xl"
          >
            <X size={18} color="#6B7280" className="mr-2" />
            <Text className="text-gray-600 font-bold ml-2">Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'accepted' && (
        <View className="bg-emerald-50 py-3 rounded-xl items-center">
          <Text className="text-emerald-700 font-bold">Approved & Chat Active</Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-400">No requests to show.</Text>
          </View>
        }
      />
    </View>
  );
}
