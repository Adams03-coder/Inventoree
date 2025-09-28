import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, ChatConversation } from '../types/inventory';
import { useAuth } from './auth-context';

const STORAGE_KEYS = {
  MESSAGES: 'inventoree_chat_messages',
  CONVERSATIONS: 'inventoree_chat_conversations',
};

interface ChatContextType {
  messages: ChatMessage[];
  conversations: ChatConversation[];
  isLoading: boolean;
  sendMessage: (receiverId: string, messageText: string) => Promise<void>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  getConversationMessages: (conversationId: string) => ChatMessage[];
  getUserConversations: () => ChatConversation[];
  getUnreadCount: (conversationId?: string) => number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadChatData();
  }, []);

  const loadChatData = async () => {
    try {
      const [storedMessages, storedConversations] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS),
      ]);
      setMessages(storedMessages ? JSON.parse(storedMessages) : []);
      setConversations(storedConversations ? JSON.parse(storedConversations) : []);
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessages = useCallback(async (newMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, []);

  const saveConversations = useCallback(async (newConversations: ChatConversation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(newConversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }, []);

  const sendMessage = useCallback(async (receiverId: string, messageText: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId,
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    await saveMessages(updatedMessages);

    // Update or create conversation
    const conversationId = [user.id, receiverId].sort().join('-');
    let updatedConversations = [...conversations];

    const existingIndex = updatedConversations.findIndex(c => c.id === conversationId);

    if (existingIndex >= 0) {
      updatedConversations[existingIndex] = {
        ...updatedConversations[existingIndex],
        lastMessage: newMessage,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedConversations.push({
        id: conversationId,
        participants: [user.id, receiverId],
        lastMessage: newMessage,
        updatedAt: new Date().toISOString(),
      });
    }

    setConversations(updatedConversations);
    await saveConversations(updatedConversations);
  }, [user, messages, conversations, saveMessages, saveConversations]);

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    const updatedMessages = messages.map(msg => {
      const inConversation =
        (msg.senderId === user.id || msg.receiverId === user.id) &&
        conversationId.includes(msg.senderId) &&
        conversationId.includes(msg.receiverId);

      if (inConversation && msg.receiverId === user.id && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });

    setMessages(updatedMessages);
    await saveMessages(updatedMessages);
  }, [user, messages, saveMessages]);

  const getConversationMessages = useCallback((conversationId: string) => {
    if (!user) return [];
    const participants = conversationId.split('-');
    return messages
      .filter(msg => participants.includes(msg.senderId) && participants.includes(msg.receiverId))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [user, messages]);

  const getUserConversations = useCallback(() => {
    if (!user) return [];
    return conversations
      .filter(c => c.participants.includes(user.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [user, conversations]);

  const getUnreadCount = useCallback((conversationId?: string) => {
    if (!user) return 0;
    if (conversationId) {
      const participants = conversationId.split('-');
      return messages.filter(msg =>
        participants.includes(msg.senderId) &&
        participants.includes(msg.receiverId) &&
        msg.receiverId === user.id &&
        !msg.read
      ).length;
    }
    return messages.filter(msg => msg.receiverId === user.id && !msg.read).length;
  }, [user, messages]);

  const value = useMemo(() => ({
    messages,
    conversations,
    isLoading,
    sendMessage,
    markMessagesAsRead,
    getConversationMessages,
    getUserConversations,
    getUnreadCount,
  }), [
    messages,
    conversations,
    isLoading,
    sendMessage,
    markMessagesAsRead,
    getConversationMessages,
    getUserConversations,
    getUnreadCount,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
