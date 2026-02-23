import { supabase } from '@/utils/supabase';
import { Link, useRouter } from 'expo-router';
import { ArrowRight, Heart, Lock, Mail } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
      className="flex-1 bg-emerald-950"
    >
      <View className="flex-1 justify-center items-center px-6">
        {/* Background Decorative Elements */}
        <View className="absolute top-0 left-0 right-0 bottom-0 opacity-20">
             <View className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500 rounded-full blur-3xl" />
             <View className="absolute top-1/2 -right-20 w-80 h-80 bg-gold-600 rounded-full blur-3xl opacity-30" />
        </View>

        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 700 }}
          className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border border-white/20"
        >
          <View className="items-center mb-10">
            <MotiView
               from={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: 'spring', delay: 300 }}
               className="bg-emerald-900 p-5 rounded-3xl mb-4 shadow-lg"
            >
              <Heart color="#D97706" size={40} fill="#D97706" />
            </MotiView>
            <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-4xl text-emerald-900 text-center tracking-tight">
              Halal Match
            </Text>
            <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-700/60 text-center mt-2 uppercase tracking-widest text-xs">
              Chaperoned matchmaking
            </Text>
          </View>

          <View className="space-y-5">
            <MotiView
               from={{ opacity: 0, translateX: -20 }}
               animate={{ opacity: 1, translateX: 0 }}
               transition={{ delay: 500 }}
            >
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Mail size={20} color="#064E3B" />
                </View>
                <TextInput
                  className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-emerald-900 font-medium"
                  placeholder="Email Address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </MotiView>

            <MotiView
               from={{ opacity: 0, translateX: 20 }}
               animate={{ opacity: 1, translateX: 0 }}
               transition={{ delay: 600 }}
            >
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Lock size={20} color="#064E3B" />
                </View>
                <TextInput
                  className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-emerald-900 font-medium"
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </MotiView>

            <MotiView
               from={{ opacity: 0, translateY: 20 }}
               animate={{ opacity: 1, translateY: 0 }}
               transition={{ delay: 700 }}
            >
              <TouchableOpacity
                onPress={signIn}
                disabled={loading}
                activeOpacity={0.8}
                className="bg-emerald-900 rounded-2xl py-5 flex-row justify-center items-center shadow-xl shadow-emerald-900/40 mt-4"
              >
                <Text style={{ fontFamily: 'FjallaOne' }} className="text-white font-bold text-lg mr-2 uppercase tracking-wider">
                  {loading ? 'Entering...' : 'Sign In'}
                </Text>
                {!loading && <ArrowRight size={20} color="white" />}
              </TouchableOpacity>
            </MotiView>
          </View>

          <MotiView
             from={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 900 }}
             className="flex-row justify-center mt-10"
          >
            <Text className="text-gray-400 font-medium">New here? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-gold-600 font-bold">Create Account</Text>
              </TouchableOpacity>
            </Link>
          </MotiView>
        </MotiView>
      </View>
    </KeyboardAvoidingView>
  );
}
