import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
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

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBio(profile.bio || '');
      setEthnicity(profile.ethnicity || '');
      setAge(profile.age?.toString() || '');
      setPrayerFrequency(profile.prayer_frequency || '');
      setPracticeLevel(profile.practice_level || '');
      setQuranKnowledge(profile.quran_knowledge?.toString() || '');
      setReadsArabic(profile.reads_arabic);
      setVeilType(profile.veil_type || '');
      setJob(profile.job || '');
      setHasChildren(profile.has_children);
      setWasMarried(profile.was_married);
      setAgeGapPref(profile.age_gap_pref || '');
      setAcceptsDivorced(profile.accepts_divorced);
      setAcceptsChildren(profile.accepts_children);
      setEthnicityPref(profile.ethnicity_pref || '');
    }
  }, [profile]);

  async function handleSave() {
    if (!profile) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        bio,
        ethnicity,
        age: parseInt(age) || null,
        prayer_frequency: prayerFrequency,
        practice_level: practiceLevel,
        quran_knowledge: parseInt(quranKnowledge) || null,
        reads_arabic: readsArabic,
        veil_type: profile.role === 'female' ? veilType : null,
        job,
        has_children: hasChildren,
        was_married: wasMarried,
        age_gap_pref: ageGapPref,
        accepts_divorced: acceptsDivorced,
        accepts_children: acceptsChildren,
        ethnicity_pref: ethnicityPref,
      })
      .eq('id', profile.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    }
    setLoading(false);
  }

  if (authLoading) return null;

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={{ fontFamily: 'FjallaOne' }} className="text-emerald-900 mb-4 mt-6 uppercase tracking-[4px] text-xs">
      {title}
    </Text>
  );

  const ChoiceRow = ({ label, value, onSelect }: { label: string, value: boolean | null, onSelect: (v: boolean) => void }) => (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-emerald-900 font-bold">{label}</Text>
      <View className="flex-row gap-2">
        {[true, false].map(opt => (
          <TouchableOpacity
            key={opt.toString()}
            onPress={() => onSelect(opt)}
            className={`px-6 py-2 rounded-xl border ${value === opt ? 'bg-emerald-900 border-emerald-900' : 'bg-white border-gray-200'}`}
          >
            <Text className={`${value === opt ? 'text-white' : 'text-emerald-900'} font-medium text-xs`}>
              {opt ? 'Yes' : 'No'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="bg-emerald-950 pt-16 pb-6 px-6 flex-row items-center justify-between rounded-b-[32px]">
          <TouchableOpacity onPress={() => router.back()} className="bg-white/10 p-2 rounded-full">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'ArchivoBlack' }} className="text-white text-xl uppercase tracking-tighter">Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={loading}
            className="bg-gold-500 px-4 py-2 rounded-xl"
          >
            {loading ? (
              <Text className="text-emerald-950 font-bold text-xs uppercase">...</Text>
            ) : (
              <Save size={20} color="#064E3B" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          <SectionTitle title="Identity" />
          <View className="space-y-4">
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
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
              placeholder="Origin / Ethnicity"
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
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium min-h-[100px]"
              placeholder="Tell us about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              textAlignVertical="top"
            />
          </View>

          <SectionTitle title="Dine" />
          <View className="space-y-4">
            <View>
              <Text className="text-emerald-900 font-bold ml-1 mb-2">Prayer Frequency</Text>
              <View className="flex-row gap-2 flex-wrap">
                {['5 Prayers', 'Not as much', 'Improving'].map(opt => (
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
              <Text className="text-emerald-900 font-bold ml-1 mb-2">Practice Level</Text>
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
              placeholder="Quran Surahs Memorized"
              value={quranKnowledge}
              onChangeText={setQuranKnowledge}
              keyboardType="numeric"
            />

            <ChoiceRow label="Reads Arabic?" value={readsArabic} onSelect={setReadsArabic} />

            {profile?.role === 'female' && (
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
                placeholder="Type of Veil (e.g. Jilbab)"
                value={veilType}
                onChangeText={setVeilType}
              />
            )}
          </View>

          <SectionTitle title="Situation" />
          <View className="space-y-4">
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
              placeholder="Profession / Job"
              value={job}
              onChangeText={setJob}
            />
            <ChoiceRow label="Has Children?" value={hasChildren} onSelect={setHasChildren} />
            <ChoiceRow label="Previously Married?" value={wasMarried} onSelect={setWasMarried} />
          </View>

          <SectionTitle title="Preferences" />
          <View className="space-y-4 mb-20">
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
              placeholder="Age gap preference (e.g. 10 years)"
              value={ageGapPref}
              onChangeText={setAgeGapPref}
            />
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-emerald-900 font-medium"
              placeholder="Preferred Ethnicity"
              value={ethnicityPref}
              onChangeText={setEthnicityPref}
            />
            <ChoiceRow label="Accepts Divorced?" value={acceptsDivorced} onSelect={setAcceptsDivorced} />
            <ChoiceRow label="Accepts Children?" value={acceptsChildren} onSelect={setAcceptsChildren} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
