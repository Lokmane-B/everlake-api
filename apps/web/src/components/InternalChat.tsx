import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Send, Hash, Users, Plus } from 'lucide-react';
import { useInternalChannels } from '@/hooks/useInternalChannels';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function InternalChat() {
  const { channels, messages, loading, fetchMessages, sendMessage, createChannel } = useInternalChannels();
  const { user } = useAuth();
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);

  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  useEffect(() => {
    if (selectedChannelId) {
      fetchMessages(selectedChannelId);
    }
  }, [selectedChannelId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannelId) return;

    try {
      await sendMessage(selectedChannelId, newMessage);
      setNewMessage('');
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      await createChannel(newChannelName, true, 'Entreprise'); // Simplified for now
      setNewChannelName('');
      setShowNewChannel(false);
      toast.success('Canal créé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création du canal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xs text-muted-foreground tracking-tight">Chargement des canaux...</p>
      </div>
    );
  }

  return (
    <div className="flex h-96 border rounded-lg">
      {/* Channels sidebar */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-normal tracking-tight">Canaux internes</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewChannel(!showNewChannel)}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {showNewChannel && (
            <div className="mt-2 space-y-2">
              <Input
                placeholder="Nom du canal"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="h-7 text-xs"
              />
              <div className="flex gap-1">
                <Button size="sm" onClick={handleCreateChannel} className="h-6 text-xs">
                  Créer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewChannel(false)}
                  className="h-6 text-xs"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
        <ScrollArea className="h-80">
          <div className="p-2 space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannelId(channel.id)}
                className={`w-full text-left p-2 rounded text-xs hover:bg-accent ${
                  selectedChannelId === channel.id ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {channel.is_all_employees ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <Hash className="h-3 w-3" />
                  )}
                  <span className="truncate">{channel.name}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                {selectedChannel.is_all_employees ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <Hash className="h-4 w-4" />
                )}
                <h4 className="text-xs font-normal tracking-tight">{selectedChannel.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {selectedChannel.is_all_employees ? 'Tous les employés' : 'Groupe'}
                </Badge>
              </div>
            </div>

            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages
                  .filter(msg => msg.channel_id === selectedChannelId)
                  .map((message) => (
                    <div key={message.id} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {message.user_id === user?.id ? 'Moi' : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {message.user_id === user?.id ? 'Vous' : 'Utilisateur'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs">{message.content}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 h-8 text-xs"
                />
                <Button size="sm" onClick={handleSendMessage} className="h-8 w-8 p-0">
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground tracking-tight">Sélectionnez un canal pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}