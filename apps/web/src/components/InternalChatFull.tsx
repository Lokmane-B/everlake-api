import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hash, Users, Send, Plus, Check, X } from "lucide-react";
import { useInternalChannels } from "@/hooks/useInternalChannels";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function InternalChatFull() {
  const { channels, messages, loading, fetchMessages, createChannel, sendMessage } = useInternalChannels();
  const { user } = useAuth();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [employeeCount, setEmployeeCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch employee count and create "Tous les employés" channel if needed
  useEffect(() => {
    if (!user) return;

    const setupChannelsAndCount = async () => {
      try {
        // Get user's company
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', user.id)
          .single();

        if (profile?.company_name) {
          // Count employees in the same company
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_name', profile.company_name);

          setEmployeeCount(count || 0);

          // Check if "Tous les employés" channel exists
          const existingChannel = channels.find(c => 
            c.is_all_employees && c.company_name === profile.company_name
          );

          if (!existingChannel) {
            // Create the "Tous les employés" channel
            await createChannel("Tous les employés", false, profile.company_name);
          }
        }
      } catch (error) {
        console.error('Error setting up channels:', error);
      }
    };

    setupChannelsAndCount();

    // Set up realtime subscription for team_members
    const channel = supabase
      .channel('team-members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        },
        () => {
          setupChannelsAndCount(); // Refresh count when team changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, channels, createChannel]);

  // Auto-select first channel
  useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  // Fetch messages when channel changes
  useEffect(() => {
    if (selectedChannelId) {
      fetchMessages(selectedChannelId);
    }
  }, [selectedChannelId, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('id', user.id)
        .single();

      if (profile?.company_name) {
        await createChannel(newChannelName, true, profile.company_name);
        setNewChannelName("");
        setShowNewChannelForm(false);
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannelId) return;

    try {
      await sendMessage(selectedChannelId, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectedChannel = channels.find(c => c.id === selectedChannelId);
  const channelMessages = messages.filter(m => m.channel_id === selectedChannelId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xs text-muted-foreground tracking-tight">Chargement des canaux...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Sidebar - Channels */}
      <div className="w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-normal tracking-tight">Canaux internes</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewChannelForm(!showNewChannelForm)}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          {showNewChannelForm && (
            <div className="space-y-2 mb-3">
              <Input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Nom du canal"
                className="h-7 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateChannel()}
              />
              <div className="flex gap-1">
                <Button size="sm" onClick={handleCreateChannel} className="h-6 text-xs flex-1">
                  <Check className="h-3 w-3 mr-1" />
                  Créer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewChannelForm(false)}
                  className="h-6 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={selectedChannelId === channel.id ? "secondary" : "ghost"}
                className="w-full justify-start h-8 text-xs"
                onClick={() => setSelectedChannelId(channel.id)}
              >
                {channel.is_all_employees ? (
                  <>
                    <Users className="h-3 w-3 mr-2" />
                    {channel.name} ({employeeCount})
                  </>
                ) : (
                  <>
                    <Hash className="h-3 w-3 mr-2" />
                    {channel.name}
                  </>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                {selectedChannel.is_all_employees ? (
                  <>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-normal text-xs tracking-tight">{selectedChannel.name}</span>
                    <span className="text-xs text-muted-foreground">• {employeeCount} employés</span>
                  </>
                ) : (
                  <>
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="font-normal text-xs tracking-tight">{selectedChannel.name}</span>
                    <span className="text-xs text-muted-foreground">• Canal de groupe</span>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {channelMessages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {message.user_id?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-normal tracking-tight">Utilisateur</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-xs text-foreground tracking-tight">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Envoyer un message dans ${selectedChannel.name}`}
                  className="flex-1 text-xs tracking-tight"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-3"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground tracking-tight">Sélectionnez un canal pour commencer à discuter</p>
          </div>
        )}
      </div>
    </div>
  );
}