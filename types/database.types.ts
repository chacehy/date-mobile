export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    first_name: string
                    last_name: string
                    role: 'male' | 'female' | 'wali'
                    gender: string | null
                    phone_number: string | null
                    avatar_url: string | null
                    bio: string | null
                    is_subscribed: boolean | null
                    subscription_tier: string | null
                    subscription_expires_at: string | null
                    wali_id: string | null
                    is_verified: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    first_name: string
                    last_name: string
                    role: 'male' | 'female' | 'wali'
                    gender?: string | null
                    phone_number?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    is_subscribed?: boolean | null
                    subscription_tier?: string | null
                    subscription_expires_at?: string | null
                    wali_id?: string | null
                    is_verified?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    first_name?: string
                    last_name?: string
                    role?: 'male' | 'female' | 'wali'
                    gender?: string | null
                    phone_number?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    is_subscribed?: boolean | null
                    subscription_tier?: string | null
                    subscription_expires_at?: string | null
                    wali_id?: string | null
                    is_verified?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            connection_requests: {
                Row: {
                    id: string
                    sender_id: string
                    receiver_id: string
                    wali_id: string
                    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | null
                    message_to_wali: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    sender_id: string
                    receiver_id: string
                    wali_id: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | null
                    message_to_wali?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    sender_id?: string
                    receiver_id?: string
                    wali_id?: string
                    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | null
                    message_to_wali?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            chat_rooms: {
                Row: {
                    id: string
                    request_id: string | null
                    male_id: string | null
                    wali_id: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    request_id?: string | null
                    male_id?: string | null
                    wali_id?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    request_id?: string | null
                    male_id?: string | null
                    wali_id?: string | null
                    created_at?: string | null
                }
            }
            messages: {
                Row: {
                    id: string
                    chat_id: string | null
                    sender_id: string | null
                    content: string
                    is_read: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    chat_id?: string | null
                    sender_id?: string | null
                    content: string
                    is_read?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    chat_id?: string | null
                    sender_id?: string | null
                    content?: string
                    is_read?: boolean | null
                    created_at?: string | null
                }
            }
            meetings: {
                Row: {
                    id: string
                    chat_id: string | null
                    scheduled_at: string
                    location_text: string | null
                    meeting_link: string | null
                    status: 'proposed' | 'confirmed' | 'completed' | 'cancelled' | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    chat_id?: string | null
                    scheduled_at: string
                    location_text?: string | null
                    meeting_link?: string | null
                    status?: 'proposed' | 'confirmed' | 'completed' | 'cancelled' | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    chat_id?: string | null
                    scheduled_at?: string
                    location_text?: string | null
                    meeting_link?: string | null
                    status?: 'proposed' | 'confirmed' | 'completed' | 'cancelled' | null
                    created_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'male' | 'female' | 'wali'
            request_status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
            meeting_status: 'proposed' | 'confirmed' | 'completed' | 'cancelled'
        }
    }
}
