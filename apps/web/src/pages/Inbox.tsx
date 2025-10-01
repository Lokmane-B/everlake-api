import React, { useMemo, useRef, useState } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Inbox as InboxIcon, Paperclip, Send, FileText, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import logoHexaTech from "@/assets/logos/hexatech-logo.png";
import logoBatiHexa from "@/assets/logos/batihexa-logo.png";
import logoEnergaia from "@/assets/logos/energaia-logo.png";
import logoMediSante from "@/assets/logos/medisante-logo.png";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AppShellWithVar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useSidebar();
  const headerHeight = state === "collapsed" ? "48px" : "60px";
  return (
    <div className="min-h-screen flex w-full bg-main-background relative" style={{ ["--app-header-height" as any]: headerHeight, ["--inbox-list-width" as any]: state === "collapsed" ? "24rem" : "20rem" }}>
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[var(--app-header-height)] h-px bg-sidebar-border z-50" />
    </div>
  );
};

// Types
interface Message {
  id: string;
  sender: "me" | "them";
  content: string;
  timestamp: string; // "DD/MM/YYYY HH:mm"
  files?: { name: string }[];
}

interface Conversation {
  id: string;
  companyName: string;
  companyLogo?: string;
  lastMessage: string;
  lastMessageAt: string; // "DD/MM/YYYY HH:mm"
  unread: boolean;
  category: "general" | "ao" | "devis";
  messages: Message[];
}

const formatPreview = (text: string) => (text.length > 54 ? text.slice(0, 54) + "…" : text);

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const { messages, loading: messagesLoading, sendMessage: sendDbMessage, markAsRead } = useMessages();
  const [tab, setTab] = useState<"general" | "ao" | "devis">("general");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Convert database messages to conversations
  const conversations = useMemo(() => {
    if (!messages.length) return [];

    const conversationMap = new Map<string, Conversation>();

    messages.forEach(msg => {
      // Determine the other user in the conversation
      const isFromMe = msg.from_user === user?.id;
      const otherUserId = isFromMe ? msg.to_user : msg.from_user;
      
      if (!otherUserId) return;

      // Use other user ID as conversation ID
      const conversationId = otherUserId;
      
      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, {
          id: conversationId,
          companyName: `Utilisateur ${otherUserId.slice(0, 8)}`, // TODO: Get actual company name from profiles
          companyLogo: logoHexaTech, // TODO: Get actual logo
          lastMessage: msg.content || msg.subject,
          lastMessageAt: new Date(msg.created_at || '').toLocaleDateString('fr-FR'),
          unread: !msg.read && !isFromMe,
          category: msg.marche_id ? "ao" : "general",
          messages: []
        });
      }

      const conversation = conversationMap.get(conversationId)!;
      
      // Add message to conversation
      conversation.messages.push({
        id: msg.id,
        sender: isFromMe ? "me" : "them",
        content: msg.content || msg.subject,
        timestamp: new Date(msg.created_at || '').toLocaleString('fr-FR'),
      });

      // Update conversation metadata with latest message
      if (new Date(msg.created_at || '') > new Date(conversation.lastMessageAt)) {
        conversation.lastMessage = msg.content || msg.subject;
        conversation.lastMessageAt = new Date(msg.created_at || '').toLocaleDateString('fr-FR');
        if (!msg.read && !isFromMe) {
          conversation.unread = true;
        }
      }
    });

    // Sort messages within each conversation by timestamp
    Array.from(conversationMap.values()).forEach(conversation => {
      conversation.messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });

    // Return conversations sorted by last message date (newest first)
    return Array.from(conversationMap.values()).sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [messages, user]);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchTab = tab === "general" ? true : c.category === tab;
      return matchTab;
    });
  }, [conversations, tab]);

  const selected = useMemo(() => conversations.find((c) => c.id === selectedId) || null, [conversations, selectedId]);

  const sendMessage = async () => {
    if (!selected || !draft.trim() || sending) return;

    try {
      setSending(true);
      await sendDbMessage(
        selected.id, // to_user
        "Message", // subject
        draft.trim() // content
      );
      setDraft("");
      toast.success("Message envoyé");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    
    // Mark unread messages as read
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && conversation.unread) {
      conversation.messages
        .filter(msg => msg.sender === "them")
        .forEach(msg => {
          const dbMessage = messages.find(m => m.id === msg.id);
          if (dbMessage && !dbMessage.read) {
            markAsRead(dbMessage.id);
          }
        });
    }
  };

  const onAttachFiles = (files: FileList | null) => {
    if (!selected || !files || files.length === 0) return;
    // TODO: Implement file attachment with database
    toast.info("Fonctionnalité d'attachement de fichiers à venir");
  };

  return (
    <AppShellWithVar>
      <EverlakeSidebar />
      <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="w-full flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Boîte de réception</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Gérez vos conversations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-0 min-h-0">
            <section className="w-full flex-1 flex min-h-0">
              <div className="flex flex-1 min-h-0">
                {/* Left list - collée au menu de gauche */}
                <aside className="border-r border-border flex flex-col flex-shrink-0" style={{ width: "var(--inbox-list-width)", height: "calc(100vh - var(--app-header-height))" }}>
                  {/* Tabs + filter */}
                  <div className="relative px-3 py-3 flex items-center justify-between gap-2 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border">
                    <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
                      <TabsList className="grid grid-cols-3 w-full bg-transparent p-0">
                        <TabsTrigger value="general" className="px-0 py-0 h-6 text-xs font-normal text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent shadow-none">Général</TabsTrigger>
                        <TabsTrigger value="ao" className="px-0 py-0 h-6 text-xs font-normal text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent shadow-none">Appels d'offres</TabsTrigger>
                        <TabsTrigger value="devis" className="px-0 py-0 h-6 text-xs font-normal text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent shadow-none">Devis</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Conversations */}
                  <ScrollArea className="flex-1">
                    <ul className="py-1 list-none">
                      {filtered.map((c) => (
                        <li key={c.id} className="relative after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border last:after:hidden">
                          <button
                            className="w-full px-3 py-2 flex items-center gap-3 text-left"
                            onClick={() => handleSelectConversation(c.id)}
                          >
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={c.companyLogo} alt={`Logo ${c.companyName}`} loading="lazy" />
                              <AvatarFallback>{c.companyName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-normal truncate text-foreground">{c.companyName}</p>
                                <span className="text-[10px] text-muted-foreground flex-shrink-0">{c.lastMessageAt}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className={`text-xs truncate ${c.unread ? "font-medium" : "font-normal text-muted-foreground"}`}>
                                  {formatPreview(c.lastMessage)}
                                </p>
                                {c.unread && <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />}
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {filtered.length === 0 && !messagesLoading && (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        {tab === "general" ? "Aucune conversation" : `Aucune conversation pour ${tab}`}
                      </div>
                    )}
                    {messagesLoading && (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        Chargement des conversations...
                      </div>
                    )}
                  </ScrollArea>
                </aside>

                {/* Right conversation panel */}
                <section className="flex-1 flex flex-col">
                  {!selected ? (
                    <div className="h-full flex items-center justify-center text-center p-10">
                      <div className="max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center mx-auto mb-3">
                          <InboxIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <h2 className="text-sm font-normal text-foreground">Sélectionnez une conversation pour commencer</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                          Choisissez un échange dans la liste pour voir l’historique et répondre.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      {/* Conversation header actions */}
                      <div className="flex items-center justify-between p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={selected.companyLogo} alt={`Logo ${selected.companyName}`} loading="lazy" />
                            <AvatarFallback>{selected.companyName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-sm font-normal text-foreground">{selected.companyName}</h3>
                            <p className="text-xs text-muted-foreground">Conversation</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => onAttachFiles(e.target.files)}
                          />
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="h-3.5 w-3.5 mr-1" /> Fichiers
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                <FileText className="h-3.5 w-3.5 mr-1" /> Joindre AO/Devis
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border border-border">
                              <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground text-xs">
                                <Link2 className="h-3.5 w-3.5 mr-1" /> Associer à un appel d'offres existant
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground text-xs">
                                <Link2 className="h-3.5 w-3.5 mr-1" /> Associer à un devis existant
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Messages */}
                      <ScrollArea className="flex-1">
                        <div className="p-4 space-y-3">
                          {selected.messages.map((m) => (
                            <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[70%] rounded-md border p-2 text-xs leading-relaxed ${
                                  m.sender === "me" ? "bg-accent/10 border-accent/30" : "bg-secondary border-border"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{m.content}</p>
                                {m.files && m.files.length > 0 && (
                                  <ul className="mt-2 list-disc list-inside text-[10px] text-muted-foreground">
                                    {m.files.map((f, idx) => (
                                      <li key={idx}>{f.name}</li>
                                    ))}
                                  </ul>
                                )}
                                <div className="text-[10px] text-muted-foreground mt-1 text-right">{m.timestamp}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Composer */}
                      <div className="p-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => onAttachFiles(e.target.files)}
                          />
                          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Joindre un fichier">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Écrire un message..."
                            className="text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none" 
                            onClick={sendMessage} 
                            disabled={sending}
                            aria-label="Envoyer un message"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </section>
          </main>
        </div>
      </AppShellWithVar>
  );
};

export default Inbox;
