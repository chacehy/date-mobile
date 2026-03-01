import { compareNames, scanIDCard } from '@/utils/ocr';
import { supabase } from '@/utils/supabase';
import { deleteFile, uploadImage } from '@/utils/upload';
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Camera, Heart, Image as ImageIcon, Lock, Mail, ShieldCheck, User } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Step = 'auth' | 'role' | 'instructions' | 'details' | 'highlights' | 'success' | 'failure';

export default function RegisterScreen() {
  const [step, setStep] = useState<Step>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'male' | 'female' | 'wali' | null>(null);
  const [waliId, setWaliId] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  // Detailed Profile Highlights
  const [ethnicity, setEthnicity] = useState('');
  const [age, setAge] = useState('');
  const [prayerFrequency, setPrayerFrequency] = useState('');
  const [practiceLevel, setPracticeLevel] = useState('');
  const [quranKnowledge, setQuranKnowledge] = useState('');
  const [readsArabic, setReadsArabic] = useState<boolean | null>(null);
  const [veilType, setVeilType] = useState('');
  const [job, setJob] = useState('');
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [wasMarried, setWasMarried] = useState<boolean | null>(null);
  const [ageGapPref, setAgeGapPref] = useState('');
  const [acceptsDivorced, setAcceptsDivorced] = useState<boolean | null>(null);
  const [acceptsChildren, setAcceptsChildren] = useState<boolean | null>(null);
  const [ethnicityPref, setEthnicityPref] = useState('');
  const [highlightsSubStep, setHighlightsSubStep] = useState(1);
  const router = useRouter();

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: role === 'male' ? [1, 1] : [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  }

  async function handleSignUp() {
    if (role === 'wali' && !image) {
      Alert.alert('ID Required', 'Please upload your ID card for verification.');
      return;
    }
    if (role === 'female' && !waliId) {
      Alert.alert('Wali Required', 'Please provide your Wali\'s ID or phone number.');
      return;
    }

    setLoading(true);

    // 1. OCR Verification for Wali (Step 1: Scan LOCALLY before Auth)
    let isVerified = false;
    let ocrResult = null;
    
    if (role === 'wali' && image?.uri) {
      ocrResult = await scanIDCard(image.uri, firstName, lastName);
      if (compareNames(ocrResult.firstName, firstName) && compareNames(ocrResult.lastName, lastName)) {
        isVerified = true;
      } else {
        setStep('failure');
        setLoading(false);
        return;
      }
    }

    // 2. Auth Sign Up (Pass metadata so the trigger can create the profile)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
          ethnicity,
          age: parseInt(age),
          prayer_frequency: prayerFrequency,
          practice_level: practiceLevel,
          quran_knowledge: parseInt(quranKnowledge),
          reads_arabic: readsArabic,
          job,
          has_children: hasChildren,
          was_married: wasMarried,
        }
      }
    });

    if (authError) {
      Alert.alert('Error', authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      let avatarUrl = null;
      let idCardUrl = null;
      const idPath = `${authData.user.id}/id_card.jpg`;

      // 3. Upload Images if present
      try {
        if (image && role === 'wali') {
          idCardUrl = await uploadImage(image, 'id-cards', idPath);
        }
      } catch (uploadError: any) {
        Alert.alert('Upload Failed', uploadError.message);
        setLoading(false);
        return;
      }

      // 4. Update Profile (The trigger already created it, we just add the rest)
      const { error: profileError } = await supabase.from('profiles').update({
        avatar_url: avatarUrl,
        wali_id: role === 'female' ? (waliId || null) : null,
        is_verified: isVerified,
        ethnicity,
        age: parseInt(age),
        prayer_frequency: prayerFrequency,
        practice_level: practiceLevel,
        quran_knowledge: parseInt(quranKnowledge),
        reads_arabic: readsArabic,
        veil_type: role === 'female' ? veilType : null,
        job,
        has_children: hasChildren,
        was_married: wasMarried,
        age_gap_pref: ageGapPref,
        accepts_divorced: acceptsDivorced,
        accepts_children: acceptsChildren,
        ethnicity_pref: ethnicityPref,
      }).eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile Update Error:', profileError);
      }

      // 5. Record Verification
      if (role === 'wali' && ocrResult) {
          await supabase.from('wali_verifications').insert({
            wali_id: authData.user.id,
            id_card_url: null, 
            extracted_first_name: ocrResult.firstName,
            extracted_last_name: ocrResult.lastName,
            confidence_score: ocrResult.confidence,
            match_status: isVerified ? 'matched' : 'manual_review',
            verified_at: isVerified ? new Date().toISOString() : null,
          });
          await deleteFile('id-cards', idPath);
      }

      setStep('success');
    }
    setLoading(false);
  }

  const renderStep = () => {
    switch (step) {
      case 'auth':
        return (
          <MotiView
            key="auth"
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: 20 }}
            className="space-y-6"
          >
            <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-3xl text-emerald-900 mb-2">Create Account</Text>
            <Text className="text-gray-500 mb-6 font-medium">Join our community for a blessed journey.</Text>
            
            <View className="space-y-4">
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
            </View>

            <TouchableOpacity
              onPress={() => setStep('role')}
              className="bg-emerald-900 rounded-2xl py-5 flex-row justify-center items-center mt-6 shadow-xl shadow-emerald-900/20"
            >
              <Text style={{ fontFamily: 'FjallaOne' }} className="text-white font-bold text-lg mr-2 uppercase tracking-wider">Next</Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400 font-medium">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-gold-600 font-bold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </MotiView>
        );

      case 'role':
        return (
          <MotiView
            key="role"
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <TouchableOpacity onPress={() => setStep('auth')} className="mb-2 self-start bg-emerald-50 p-2 rounded-full">
              <ArrowLeft size={20} color="#064E3B" />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-3xl text-emerald-900 mb-2">I am a...</Text>
            
            <View className="space-y-4">
              {[
                { id: 'male', title: 'Male', desc: 'Looking for a wife', icon: User },
                { id: 'female', title: 'Female', desc: 'Looking for a husband', icon: Heart },
                { id: 'wali', title: 'Wali (Guardian)', desc: 'Representing a family member', icon: ShieldCheck },
              ].map((item, index) => (
                <MotiView
                  key={item.id}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 100 }}
                >
                  <TouchableOpacity 
                    onPress={() => setRole(item.id as any)}
                    className={`p-5 rounded-3xl border-2 flex-row items-center ${role === item.id ? 'border-emerald-900 bg-emerald-50' : 'border-gray-50 bg-gray-50'}`}
                  >
                    <View className={`p-4 rounded-2xl mr-4 ${role === item.id ? 'bg-emerald-900 shadow-emerald-900/30' : 'bg-white'}`}>
                      <item.icon size={24} color={role === item.id ? 'white' : '#064E3B'} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'FjallaOne' }} className="text-lg text-emerald-900 uppercase tracking-tight">{item.title}</Text>
                      <Text className="text-gray-500 text-sm">{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                if (role === 'wali') setStep('instructions');
                else setStep('details');
              }}
              disabled={!role}
              className={`rounded-2xl py-5 flex-row justify-center items-center mt-6 shadow-xl ${role ? 'bg-emerald-900 shadow-emerald-900/30' : 'bg-gray-200'}`}
            >
              <Text style={{ fontFamily: 'FjallaOne' }} className="text-white font-bold text-lg mr-2 uppercase tracking-wider">Next</Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </MotiView>
        );

      case 'instructions':
        return (
          <MotiView
            key="instructions"
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="space-y-6"
          >
            <TouchableOpacity onPress={() => setStep('role')} className="self-start bg-emerald-50 p-2 rounded-full">
              <ArrowLeft size={20} color="#064E3B" />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-3xl text-emerald-900">ID Verification</Text>
            <Text className="text-gray-600 leading-6 font-medium">
              To verify your identity as a Wali, we need a clear photo of the <Text className="font-bold text-emerald-900">back of your ID card</Text>. 
            </Text>
            
            <View className="bg-emerald-900/5 p-6 rounded-3xl border border-emerald-900/10">
              <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-3 uppercase tracking-wider text-sm">Please ensure:</Text>
              <View className="space-y-3">
                {[
                  'The MRZ zone is visible at the bottom.',
                  'Clear lighting with no lens glare.',
                  'All four corners are in the frame.'
                ].map((txt, i) => (
                  <View key={i} className="flex-row items-center">
                    <View className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-3" />
                    <Text className="text-emerald-800 text-sm font-medium">{txt}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="items-center py-4">
              <MotiView
                 from={{ rotate: '-2deg' }}
                 animate={{ rotate: '0deg' }}
                 className="bg-white p-3 rounded-3xl shadow-xl border border-gray-100"
              >
                 <Image 
                   source={{ uri: 'https://placehold.co/600x400/064e3b/ffffff?text=ID+CARD+BACK+WITH+MRZ' }} 
                   className="w-72 h-44 rounded-2xl"
                   resizeMode="cover"
                 />
              </MotiView>
              <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-700/40 text-[10px] mt-4 uppercase tracking-[4px]">Example View</Text>
            </View>

            <TouchableOpacity
              onPress={() => setStep('details')}
              className="bg-gold-600 rounded-2xl py-5 flex-row justify-center items-center mt-4 shadow-xl shadow-gold-600/30"
            >
              <Text style={{ fontFamily: 'FjallaOne' }} className="text-white font-bold text-lg mr-2 uppercase tracking-widest">Start Scanning</Text>
              <Camera size={20} color="white" />
            </TouchableOpacity>
          </MotiView>
        );

      case 'details':
        return (
          <MotiView
            key="details"
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            className="space-y-6"
          >
            <TouchableOpacity onPress={() => setStep('role')} className="self-start bg-emerald-50 p-2 rounded-full">
              <ArrowLeft size={20} color="#064E3B" />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-3xl text-emerald-900">Almost there</Text>
            
            <View className="flex-row gap-4">
              <TextInput
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {role === 'wali' && (
              <View className="mt-4">
                <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-3 uppercase tracking-wider text-xs">
                  ID Card Photo
                </Text>
                <TouchableOpacity 
                  onPress={pickImage}
                  className="bg-emerald-50/50 border-2 border-dashed border-emerald-900/10 rounded-[32px] p-10 items-center justify-center overflow-hidden"
                >
                  {image ? (
                    <MotiView from={{ scale: 0.5 }} animate={{ scale: 1 }}>
                      <Image 
                        source={{ uri: image.uri }} 
                        className="w-40 h-40 rounded-3xl border-4 border-white shadow-lg" 
                        resizeMode="cover"
                      />
                      <TouchableOpacity onPress={pickImage} className="absolute bottom-0 right-0 bg-gold-600 p-3 rounded-full shadow-lg">
                        <Camera size={20} color="white" />
                      </TouchableOpacity>
                    </MotiView>
                  ) : (
                    <View className="items-center">
                      <MotiView
                        animate={{ translateY: [0, -5, 0] }}
                        transition={{ loop: true, duration: 2000 }}
                        className="bg-emerald-900/10 p-5 rounded-full mb-3"
                      >
                        <ImageIcon size={32} color="#064E3B" />
                      </MotiView>
                      <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 uppercase">Tap to Upload</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {role === 'female' && (
              <View className="mt-4">
                <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-3 uppercase tracking-wider text-xs">Link your Wali</Text>
                <View className="relative">
                  <View className="absolute left-4 top-4 z-10">
                    <ShieldCheck size={20} color="#064E3B" />
                  </View>
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-emerald-900 font-medium"
                    placeholder="Wali ID or Phone"
                    value={waliId}
                    onChangeText={setWaliId}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                if (role === 'wali') handleSignUp();
                else setStep('highlights');
              }}
              disabled={loading}
              className="bg-emerald-900 rounded-2xl py-5 flex-row justify-center items-center mt-6 shadow-xl shadow-emerald-900/30"
            >
              <Text style={{ fontFamily: 'FjallaOne' }} className="text-white font-bold text-lg mr-2 uppercase tracking-widest">
                {role === 'wali' ? (loading ? 'Processing...' : 'Finish Registration') : 'Next: Highlights'}
              </Text>
              {!loading && <ArrowRight size={20} color="white" />}
            </TouchableOpacity>
          </MotiView>
        );

      case 'highlights': {
        const renderSubStep = () => {
          switch (highlightsSubStep) {
            case 1: // Profil
              return (
                <MotiView key="sub1" from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }} className="space-y-4">
                  <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-2 uppercase tracking-widest text-xs">Category: Profil</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                    placeholder="Ethnicity / Origin"
                    value={ethnicity}
                    onChangeText={setEthnicity}
                  />
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                    placeholder="Age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </MotiView>
              );
            case 2: // Dine
              return (
                <MotiView key="sub2" from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }} className="space-y-4">
                  <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-2 uppercase tracking-widest text-xs">Category: Dine</Text>
                  
                  <View>
                    <Text className="text-emerald-900 font-bold ml-1 mb-2">Prayer Frequency</Text>
                    <View className="flex-row gap-2 flex-wrap">
                      {['5 Prayers', 'Not as much'].map(opt => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => setPrayerFrequency(opt)}
                          className={`px-4 py-3 rounded-xl border ${prayerFrequency === opt ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-gray-200'}`}
                        >
                          <Text className={`${prayerFrequency === opt ? 'text-white' : 'text-emerald-900'} font-medium`}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-emerald-900 font-bold ml-1 mb-2">Practice</Text>
                    <View className="flex-row gap-2 flex-wrap">
                      {['Obligatory only', 'Obligatory + Sunnah'].map(opt => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => setPracticeLevel(opt)}
                          className={`px-4 py-3 rounded-xl border ${practiceLevel === opt ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-gray-200'}`}
                        >
                          <Text className={`${practiceLevel === opt ? 'text-white' : 'text-emerald-900'} font-medium`}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                    placeholder="Surahs memorized (number)"
                    value={quranKnowledge}
                    onChangeText={setQuranKnowledge}
                    keyboardType="numeric"
                  />

                  <View>
                    <Text className="text-emerald-900 font-bold ml-1 mb-2">Reads Arabic?</Text>
                    <View className="flex-row gap-2">
                      {[true, false].map(opt => (
                        <TouchableOpacity
                          key={opt.toString()}
                          onPress={() => setReadsArabic(opt)}
                          className={`flex-1 px-4 py-3 rounded-xl border items-center ${readsArabic === opt ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-gray-200'}`}
                        >
                          <Text className={`${readsArabic === opt ? 'text-white' : 'text-emerald-900'} font-medium`}>{opt ? 'Yes' : 'No'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {role === 'female' && (
                    <TextInput
                      className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                      placeholder="Type of Veil (Jilbab, Niqab, etc.)"
                      value={veilType}
                      onChangeText={setVeilType}
                    />
                  )}
                </MotiView>
              );
            case 3: // Situation
              return (
                <MotiView key="sub3" from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }} className="space-y-4">
                  <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-2 uppercase tracking-widest text-xs">Category: Situation</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                    placeholder="Profession / Job"
                    value={job}
                    onChangeText={setJob}
                  />

                  <View>
                    <Text className="text-emerald-900 font-bold ml-1 mb-2">Has children?</Text>
                    <View className="flex-row gap-2">
                      {[true, false].map(opt => (
                        <TouchableOpacity
                          key={opt.toString()}
                          onPress={() => setHasChildren(opt)}
                          className={`flex-1 px-4 py-3 rounded-xl border items-center ${hasChildren === opt ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-gray-200'}`}
                        >
                          <Text className={`${hasChildren === opt ? 'text-white' : 'text-emerald-900'} font-medium`}>{opt ? 'Yes' : 'No'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text className="text-emerald-900 font-bold ml-1 mb-2">Previously married?</Text>
                    <View className="flex-row gap-2">
                      {[true, false].map(opt => (
                        <TouchableOpacity
                          key={opt.toString()}
                          onPress={() => setWasMarried(opt)}
                          className={`flex-1 px-4 py-3 rounded-xl border items-center ${wasMarried === opt ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-gray-200'}`}
                        >
                          <Text className={`${wasMarried === opt ? 'text-white' : 'text-emerald-900'} font-medium`}>{opt ? 'Yes' : 'No'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </MotiView>
              );
            case 4: // Preferences
              return (
                <MotiView key="sub4" from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }} className="space-y-4">
                  <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-2 uppercase tracking-widest text-xs">Category: Preferences</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                    placeholder="Age gap preference (e.g. 5 years max)"
                    value={ageGapPref}
                    onChangeText={setAgeGapPref}
                  />
                  
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                    placeholder="Preferred ethnicity (or 'Open')"
                    value={ethnicityPref}
                    onChangeText={setEthnicityPref}
                  />

                  <View className="flex-row items-center justify-between p-1">
                    <Text className="text-emerald-900 font-bold">Accepts divorced?</Text>
                    <View className="flex-row gap-2 w-32">
                      {[true, false].map(opt => (
                        <TouchableOpacity
                          key={opt.toString()}
                          onPress={() => setAcceptsDivorced(opt)}
                          className={`flex-1 py-1.5 rounded-xl border items-center ${acceptsDivorced === opt ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-gray-200'}`}
                        >
                          <Text className={`${acceptsDivorced === opt ? 'text-white' : 'text-emerald-900'} font-medium text-xs`}>{opt ? 'Yes' : 'No'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between p-1">
                    <Text className="text-emerald-900 font-bold">Accepts children?</Text>
                    <View className="flex-row gap-2 w-32">
                      {[true, false].map(opt => (
                        <TouchableOpacity
                          key={opt.toString()}
                          onPress={() => setAcceptsChildren(opt)}
                          className={`flex-1 py-1.5 rounded-xl border items-center ${acceptsChildren === opt ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-gray-200'}`}
                        >
                          <Text className={`${acceptsChildren === opt ? 'text-white' : 'text-emerald-900'} font-medium text-xs`}>{opt ? 'Yes' : 'No'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </MotiView>
              );
          }
        };

        return (
          <MotiView key="highlights" className="space-y-6">
            <View className="flex-row justify-between items-center mb-2">
              <TouchableOpacity 
                onPress={() => {
                  if (highlightsSubStep > 1) setHighlightsSubStep(s => s - 1);
                  else setStep('details');
                }} 
                className="bg-emerald-50 p-2 rounded-full"
              >
                <ArrowLeft size={20} color="#064E3B" />
              </TouchableOpacity>
              <View className="flex-row gap-1">
                {[1, 2, 3, 4].map(s => (
                  <View key={s} className={`h-1 rounded-full ${highlightsSubStep === s ? 'w-6 bg-gold-600' : 'w-2 bg-emerald-100'}`} />
                ))}
              </View>
            </View>
            
            <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-2xl text-emerald-900">Your Highlights</Text>
            
            <View className="min-h-[300px]">
              <AnimatePresence exitBeforeEnter>
                {renderSubStep()}
              </AnimatePresence>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (highlightsSubStep < 4) setHighlightsSubStep(s => s + 1);
                else handleSignUp();
              }}
              disabled={loading}
              className="bg-emerald-900 rounded-2xl py-5 flex-row justify-center items-center mt-6 shadow-xl shadow-emerald-900/30"
            >
              <Text style={{ fontFamily: 'FjallaOne' }} className="text-white font-bold text-lg mr-2 uppercase tracking-widest">
                {highlightsSubStep < 4 ? 'Continue' : (loading ? 'Processing...' : 'Finish Registration')}
              </Text>
              {!loading && <ArrowRight size={20} color="white" />}
            </TouchableOpacity>
          </MotiView>
        );
      }

      case 'success':
        return (
          <MotiView
            key="success"
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="items-center justify-center space-y-8"
          >
            <MotiView
              animate={{ rotate: '360deg' }}
              transition={{ loop: true, duration: 4000, type: 'timing' }}
              className="bg-emerald-50 p-1 bg-gradient-to-tr from-emerald-500 to-gold-500 rounded-full"
            >
               <View className="bg-white p-8 rounded-full">
                  <ShieldCheck size={80} color="#064E3B" strokeWidth={1.5} />
               </View>
            </MotiView>
            <View className="items-center space-y-3">
              <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-4xl text-emerald-900 text-center">Verified!</Text>
              <Text className="text-gray-500 text-center px-4 font-medium leading-6">
                Your journey towards a blessed union begins here. Welcome to the community!
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              className="bg-emerald-900 w-full rounded-2xl py-5 items-center shadow-xl shadow-emerald-900/40"
            >
              <Text style={{ fontFamily: 'FjallaOne' }} className="text-white text-lg uppercase tracking-widest">Start Exploring</Text>
            </TouchableOpacity>
          </MotiView>
        );

      case 'failure':
        return (
          <MotiView
            key="failure"
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="items-center justify-center space-y-8"
          >
            <View className="bg-red-50 p-10 rounded-full">
              <Lock size={80} color="#991B1B" />
            </View>
            <View className="items-center space-y-3">
              <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-3xl text-red-900 text-center">Scan Failed</Text>
              <Text className="text-gray-500 text-center px-4 font-medium leading-6">
                The name on the ID doesn't match your profile. Make sure you use your legal name exactly as it appears on the document.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setStep('details')}
              className="bg-emerald-900 w-full rounded-2xl py-5 items-center"
            >
              <Text style={{ fontFamily: 'FjallaOne' }} className="text-white text-lg uppercase tracking-widest">Try Again</Text>
            </TouchableOpacity>
          </MotiView>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-emerald-950"
    >
      <View className="flex-1 justify-center items-center px-6">
        {/* Background Decorative Elements */}
        <View className="absolute top-0 left-0 right-0 bottom-0 opacity-20">
             <View className="absolute top-20 right-0 w-80 h-80 bg-emerald-400 rounded-full blur-3xl" />
             <View className="absolute bottom-20 left-0 w-80 h-80 bg-gold-600 rounded-full blur-3xl opacity-30" />
        </View>

        <MotiView
          animate={{ opacity: 1, scale: 1 }}
          from={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'timing', duration: 500 }}
          className="w-full max-w-lg bg-white rounded-[44px] shadow-2xl overflow-hidden"
        >
          <ScrollView 
            contentContainerStyle={{ padding: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <AnimatePresence exitBeforeEnter>
              {renderStep()}
            </AnimatePresence>
          </ScrollView>
        </MotiView>
      </View>
    </KeyboardAvoidingView>
  );
}
