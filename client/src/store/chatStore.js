import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatStore = create(
  persist(
    (set) => ({
      messages: [],
      isOpen: false,
      lastInteraction: null,
      
      setIsOpen: (open) => set({ isOpen: open }),
      
      addMessage: (msg) => set((state) => ({ 
        messages: [...state.messages, { ...msg, timestamp: new Date() }],
        lastInteraction: new Date()
      })),
      
      clearChat: () => set({ messages: [] }),
      
      setMessages: (msgs) => set({ messages: msgs })
    }),
    {
      name: 'hms-chat-storage', // unique name
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
    }
  )
);
