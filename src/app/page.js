'use client';
import { useEffect } from 'react';
import { useLuciferStore } from '@/lib/store';
import AuthScreen from '@/components/AuthScreen';
import ChatApp from '@/components/ChatApp';

export default function Home() {
  const { token, fetchConversations } = useLuciferStore();
  useEffect(() => { if (token) fetchConversations(); }, [token]);
  if (!token) return <AuthScreen />;
  return <ChatApp />;
}
