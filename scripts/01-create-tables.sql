-- Create tables for the Network Security Suite

-- Table for storing encrypted chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL,
  iv TEXT NOT NULL, -- Initialization vector for AES encryption
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing user public keys for RSA encryption
CREATE TABLE IF NOT EXISTS user_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  public_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages" ON chat_messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for user_keys
CREATE POLICY "Users can view all public keys" ON user_keys
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own key" ON user_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own key" ON user_keys
  FOR UPDATE USING (user_id = auth.uid());
