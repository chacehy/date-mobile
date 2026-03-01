import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/types/database.types';
import { supabase } from '@/utils/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, MoreVertical, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Message = Database['public']['Tables']['messages']['Row'];

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams();
  const { profile } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId]);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (!error) {
      setMessages(data || []);
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !profile) return;

    const content = newMessage;
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      chat_id: chatId as string,
      sender_id: profile.id,
      content,
    });

    if (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function proposeMeeting() {
    if (profile?.role !== 'wali') return;

    // In a real app, this would open a date picker modal
    const scheduledAt = new Date(Date.now() + 86400000 * 7).toISOString(); // 7 days from now

    const { error } = await supabase.from('meetings').insert({
      chat_id: chatId as string,
      scheduled_at: scheduledAt,
      location_text: "Home of the Bride",
      status: 'proposed'
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // Send a system message about the meeting
      await supabase.from('messages').insert({
        chat_id: chatId as string,
        sender_id: profile.id,
        content: `📅 Meeting Proposal: I have proposed a Nadra Shar3iya for ${new Date(scheduledAt).toLocaleDateString()}. Please confirm if this works for you.`,
      });
      Alert.alert('Success', 'Meeting proposed and suitor notified.');
    }
  }

  const renderItem = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === profile?.id;
    return (
      <View className={`mb-4 flex-row ${isMine ? 'justify-end' : 'justify-start'}`}>
        <View 
          className={`max-w-[80%] px-5 py-3 rounded-3xl ${
            isMine ? 'bg-emerald-900 rounded-br-sm' : 'bg-white rounded-bl-sm border border-gray-100 shadow-sm'
          }`}
        >
          <Text className={isMine ? 'text-white' : 'text-emerald-900'}>
            {item.content}
          </Text>
          <Text className={`text-[10px] mt-1 ${isMine ? 'text-emerald-200' : 'text-gray-400'}`}>
            {new Date(item.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#064E3B" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      className="flex-1 bg-gray-50"
    >
      <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-emerald-900">Chat with Wali</Text>
        <TouchableOpacity 
          onPress={() => Alert.alert('Chat Options', 'What would you like to do?', [
            { text: 'Block User', style: 'destructive', onPress: () => Alert.alert('Blocked', 'User has been blocked.') },
            { text: 'Report User', style: 'destructive', onPress: () => Alert.alert('Reported', 'Our team will review this chat.') },
            { text: 'Cancel', style: 'cancel' }
          ])}
        >
           <MoreVertical size={24} color="#064E3B" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View className="p-4 bg-white flex-row items-center space-x-3 border-t border-gray-100">
        {profile?.role === 'wali' && (
          <TouchableOpacity 
            onPress={proposeMeeting}
            className="bg-gold-50 p-3 rounded-full mr-2"
          >
            <Calendar size={24} color="#D97706" />
          </TouchableOpacity>
        )}
        <TextInput
          className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 text-emerald-900 border border-gray-100"
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity 
          onPress={sendMessage}
          disabled={!newMessage.trim()}
          className={`p-3 rounded-full ${newMessage.trim() ? 'bg-emerald-900' : 'bg-gray-200'}`}
        >
          <Send size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
