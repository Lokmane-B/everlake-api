import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface InternalChannel {
  id: string;
  company_name: string;
  name: string;
  is_group: boolean;
  is_all_employees: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface InternalMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function useInternalChannels() {
  const [channels, setChannels] = useState<InternalChannel[]>([]);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setChannels([]);
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchChannels();
    
    // Set up realtime subscription for channels
    const channelSubscription = supabase
      .channel('internal-channels-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internal_channels'
        },
        () => {
          fetchChannels();
        }
      )
      .subscribe();

    // Set up realtime subscription for messages
    const messageSubscription = supabase
      .channel('internal-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internal_messages'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
      supabase.removeChannel(messageSubscription);
    };
  }, [user]);

  const fetchChannels = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('internal_channels')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching internal channels:', error);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId?: string) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('internal_messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching internal messages:', error);
      setMessages([]);
    }
  };

  const createChannel = async (name: string, isGroup: boolean, companyName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('internal_channels')
        .insert({
          name,
          is_group: isGroup,
          is_all_employees: !isGroup,
          company_name: companyName,
          created_by: user.id
        });

      if (error) throw error;
      fetchChannels();
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  };

  const sendMessage = async (channelId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('internal_messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content
        });

      if (error) throw error;
      fetchMessages(channelId);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    channels,
    messages,
    loading,
    fetchChannels,
    fetchMessages,
    createChannel,
    sendMessage
  };
}