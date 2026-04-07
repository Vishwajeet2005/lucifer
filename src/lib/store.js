'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// All API calls go to Netlify Functions via /api/* redirect in netlify.toml
const F = (name) => `/api/${name}`;

export const useLuciferStore = create(
  persist(
    (set, get) => ({
      // ── Auth ───────────────────────────────────
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null, currentConversationId: null, messages: [] }),

      // ── Chat State ─────────────────────────────
      conversations: [],
      currentConversationId: null,
      messages: [],
      isLoading: false,
      isStreaming: false,
      streamingText: '',
      sidebarOpen: true,

      setConversations: (conversations) => set({ conversations }),
      setMessages:      (messages)      => set({ messages }),
      setSidebarOpen:   (open)          => set({ sidebarOpen: open }),

      authHeader() {
        return { Authorization: `Bearer ${get().token}` };
      },

      // ── Fetch Conversations ────────────────────
      async fetchConversations() {
        const { token } = get();
        if (!token) return;
        try {
          const res  = await fetch(F('conversations'), { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          if (data.conversations) set({ conversations: data.conversations });
        } catch {}
      },

      // ── Load Single Conversation ───────────────
      async loadConversation(id) {
        const { token } = get();
        set({ isLoading: true, currentConversationId: id, messages: [] });
        try {
          const res  = await fetch(F(`conversation?id=${id}`), { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          if (data.messages) set({ messages: data.messages });
        } catch {}
        set({ isLoading: false });
      },

      // ── Delete Conversation ────────────────────
      async deleteConversation(id) {
        const { token, conversations, currentConversationId } = get();
        await fetch(F(`conversations?id=${id}`), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        set({
          conversations: conversations.filter(c => c.id !== id),
          ...(currentConversationId === id ? { currentConversationId: null, messages: [] } : {})
        });
      },

      // ── Pin / Rename conversation ──────────────
      async updateConversation(id, patch) {
        const { token } = get();
        await fetch(F(`conversations?id=${id}`), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(patch)
        });
        set(s => ({
          conversations: s.conversations.map(c => c.id === id ? { ...c, ...patch } : c)
        }));
      },

      // ── Send Message (SSE stream) ──────────────
      async sendMessage(text) {
        const { token, currentConversationId, messages } = get();

        const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() };
        set({ messages: [...messages, userMsg], isStreaming: true, streamingText: '' });

        try {
          const res = await fetch(F('chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ message: text, conversationId: currentConversationId })
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const reader  = res.body.getReader();
          const decoder = new TextDecoder();
          let fullText  = '';
          let newConvId = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const lines = decoder.decode(value).split('\n');
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const ev = JSON.parse(line.slice(6));
                if (ev.type === 'start' && ev.conversationId) {
                  newConvId = ev.conversationId;
                  if (!currentConversationId) set({ currentConversationId: ev.conversationId });
                }
                if (ev.type === 'delta') {
                  fullText += ev.text;
                  set({ streamingText: fullText });
                }
                if (ev.type === 'done') {
                  const aiMsg = { id: `a-${Date.now()}`, role: 'assistant', content: fullText, created_at: new Date().toISOString() };
                  set(s => ({ messages: [...s.messages, aiMsg], streamingText: '', isStreaming: false }));
                  get().fetchConversations();
                }
                if (ev.type === 'error') throw new Error(ev.message);
              } catch {}
            }
          }
        } catch (err) {
          set({ isStreaming: false, streamingText: '' });
          const errMsg = {
            id: `e-${Date.now()}`, role: 'assistant',
            content: `*The abyss trembles...*\n\n**Error:** ${err.message}\n\nCheck your connection or try again.`,
            created_at: new Date().toISOString()
          };
          set(s => ({ messages: [...s.messages, errMsg] }));
        }
      }
    }),
    {
      name: 'lucifer-v2',
      partialize: (s) => ({ token: s.token, user: s.user })
    }
  )
);
