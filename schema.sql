-- 1. EXTENSIONS (Run this first)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TYPES & ENUMS
CREATE TYPE user_role AS ENUM ('male', 'female', 'wali');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
CREATE TYPE meeting_status AS ENUM ('proposed', 'confirmed', 'completed', 'cancelled');

-- 3. PROFILES TABLE
-- Extends the default auth.users table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL,
  gender TEXT, -- Can be derived from role
  phone_number TEXT UNIQUE,
  avatar_url TEXT, -- URL from Supabase Storage
  bio TEXT,
  
  -- Subscription Logic
  is_subscribed BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  
  -- The Wali Linkage
  -- Females will have a wali_id pointing to a profile with role 'wali'
  wali_id UUID REFERENCES profiles(id),
  
  -- Identity Verification (For your future MVP+ feature)
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONNECTION REQUESTS (The "Proposal")
-- This is created when a Male clicks "Contact Wali" on a Female's profile
CREATE TABLE connection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) NOT NULL, -- Always the Male
  receiver_id UUID REFERENCES profiles(id) NOT NULL, -- Always the Female
  wali_id UUID REFERENCES profiles(id) NOT NULL, -- The Chaperone who must approve
  status request_status DEFAULT 'pending',
  message_to_wali TEXT, -- Optional intro message from the male
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: A male can't request the same female twice if pending/accepted
  UNIQUE(sender_id, receiver_id)
);

-- 5. CHAT ROOMS
-- Only created after a Wali accepts a connection request
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES connection_requests(id) ON DELETE CASCADE,
  male_id UUID REFERENCES profiles(id),
  wali_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MESSAGES
-- Strictly between Male and Wali
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NADRA SHAR3IYA (Meetings)
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location_text TEXT, -- Address or "Home of the Bride"
  meeting_link TEXT, -- For virtual Nadras
  status meeting_status DEFAULT 'proposed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_connection_wali ON connection_requests(wali_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);