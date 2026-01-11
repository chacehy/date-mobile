import { supabase } from '@/utils/supabase';
import { Link, useRouter } from 'expo-router';
import { ArrowRight, Heart, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/');
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8">
        <View className="flex-1 justify-center py-12">
          <View className="items-center mb-12">
            <View className="bg-emerald-900 p-4 rounded-3xl mb-4">
              <Heart color="#D97706" size={40} fill="#D97706" />
            </View>
            <Text className="text-3xl font-bold text-emerald-900 text-center">
              Halal Match
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Chaperoned matchmaking for a blessed union
            </Text>
          </View>

          <View className="space-y-4">
            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Mail size={20} color="#064E3B" />
              </View>
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-emerald-900"
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Lock size={20} color="#064E3B" />
              </View>
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-emerald-900"
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              onPress={signIn}
              disabled={loading}
              className="bg-emerald-900 rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-emerald-900/20"
            >
              <Text className="text-white font-bold text-lg mr-2">
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
              {!loading && <ArrowRight size={20} color="white" />}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-gold-600 font-bold">Register</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
