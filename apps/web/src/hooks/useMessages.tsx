import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  from_user: string | null;
  to_user: string | null;
  subject: string;
  content: string | null;
  read: boolean | null;
  marche_id: string | null;
  created_at: string | null;
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(from_user.eq.${user.id},to_user.eq.${user.id})`
        },
        (payload) => {
          console.log('Messages realtime update:', payload);
          fetchMessages(); // Refetch to ensure consistency
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('to_user', user?.id);

      if (error) throw error;
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async (toUser: string, subject: string, content: string, marcheId?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          from_user: user.id,
          to_user: toUser,
          subject,
          content,
          marche_id: marcheId || null
        });

      if (error) throw error;
      
      // Refetch messages to get the new one
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    refetch: fetchMessages,
    markAsRead,
    sendMessage
  };
}