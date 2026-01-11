import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Heart, Lock, Mail, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Step = 'auth' | 'role' | 'details';

export default function RegisterScreen() {
  const [step, setStep] = useState<Step>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'male' | 'female' | 'wali' | null>(null);
  const [waliId, setWaliId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignUp() {
    if (!role) return;
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert('Error', authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        role: role,
        wali_id: role === 'female' ? (waliId || null) : null,
        is_subscribed: false, // Male starts as deactivated
      });

      if (profileError) {
        Alert.alert('Error creating profile', profileError.message);
      } else {
        Alert.alert('Success', 'Please check your email for verification.');
        router.replace('/(auth)/login');
      }
    }
    setLoading(false);
  }

  const renderStep = () => {
    switch (step) {
      case 'auth':
        return (
          <View className="space-y-4">
            <Text className="text-2xl font-bold text-emerald-900 mb-6">Create Account</Text>
            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Mail size={20} color="#064E3B" />
              </View>
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-emerald-900"
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Lock size={20} color="#064E3B" />
              </View>
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-emerald-900"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity
              onPress={() => setStep('role')}
              className="bg-emerald-900 rounded-2xl py-4 flex-row justify-center items-center mt-4"
            >
              <Text className="text-white font-bold text-lg mr-2">Next</Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </View>
        );

      case 'role':
        return (
          <View className="space-y-4">
            <TouchableOpacity onPress={() => setStep('auth')} className="mb-4">
              <ArrowLeft size={24} color="#064E3B" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-emerald-900 mb-6">I am a...</Text>
            
            <TouchableOpacity 
              onPress={() => setRole('male')}
              className={`p-6 rounded-2xl border-2 ${role === 'male' ? 'border-emerald-900 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}
            >
              <Text className="text-lg font-bold text-emerald-900">Male</Text>
              <Text className="text-gray-500">I am looking for a wife.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setRole('female')}
              className={`p-6 rounded-2xl border-2 ${role === 'female' ? 'border-emerald-900 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}
            >
              <Text className="text-lg font-bold text-emerald-900">Female</Text>
              <Text className="text-gray-500">I am looking for a husband.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setRole('wali')}
              className={`p-6 rounded-2xl border-2 ${role === 'wali' ? 'border-emerald-900 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}
            >
              <Text className="text-lg font-bold text-emerald-900">Wali (Guardian)</Text>
              <Text className="text-gray-500">I am representing a family member.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStep('details')}
              disabled={!role}
              className={`rounded-2xl py-4 flex-row justify-center items-center mt-6 ${role ? 'bg-emerald-900' : 'bg-gray-300'}`}
            >
              <Text className="text-white font-bold text-lg mr-2">Next</Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </View>
        );

      case 'details':
        return (
          <View className="space-y-4">
            <TouchableOpacity onPress={() => setStep('role')} className="mb-4">
              <ArrowLeft size={24} color="#064E3B" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-emerald-900 mb-6">Almost there</Text>
            
            <View className="flex-row space-x-4">
              <TextInput
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 text-emerald-900"
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 text-emerald-900"
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {role === 'female' && (
              <View className="mt-4">
                <Text className="text-emerald-900 font-bold mb-2">Link your Wali</Text>
                <View className="relative">
                  <View className="absolute left-4 top-4 z-10">
                    <ShieldCheck size={20} color="#064E3B" />
                  </View>
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-emerald-900"
                    placeholder="Wali ID or Phone"
                    value={waliId}
                    onChangeText={setWaliId}
                  />
                </View>
                <Text className="text-gray-400 text-xs mt-2">
                  * Mandatory for female profiles to ensure a chaperoned experience.
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className="bg-gold-500 rounded-2xl py-4 flex-row justify-center items-center mt-8 shadow-lg shadow-gold-500/20"
            >
              <Text className="text-white font-bold text-lg mr-2">
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Text>
              <Heart size={20} color="white" fill="white" />
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 py-12">
        {renderStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
