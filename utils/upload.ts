import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

export async function uploadImage(
    pickerResult: ImagePicker.ImagePickerAsset,
    bucket: 'avatars' | 'id-cards',
    path: string
) {
    try {
        const base64 = pickerResult.base64;
        if (!base64) {
            throw new Error('No base64 data found');
        }

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, decode(base64), {
                contentType: pickerResult.mimeType || 'image/jpeg',
                upsert: true,
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return publicUrl;
    } catch (err) {
        console.error('Error uploading image:', err);
        throw err;
    }
}

export async function deleteFile(bucket: 'avatars' | 'id-cards', path: string) {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw error;
    } catch (err) {
        console.error('Error deleting file:', err);
    }
}
