import React, { useState } from 'react';
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Bell, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CompactFilterBar } from "@/components/CompactFilterBar";
import { ViewToggle } from "@/components/ViewToggle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { ContactWidgetCard } from "@/components/ContactWidgetCard";
import { AddContactForm } from "@/components/AddContactForm";
import { getSectorMeta } from "@/data/secteurs-meta";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AppShellWithVar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useSidebar();
  const headerHeight = state === "collapsed" ? "48px" : "60px";
  return (
    <div className="min-h-screen flex w-full bg-main-background relative" style={{ ["--app-header-height" as any]: headerHeight }}>
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[var(--app-header-height)] h-px bg-sidebar-border z-20" />
    </div>
  );
};

export default function CarnetContacts() {
  const { user, loading } = useAuth();
  const { contacts, loading: contactsLoading, refetch, deleteContact } = useContacts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [view, setView] = useState<"widget" | "list">("widget");
  const navigate = useNavigate();

  if (loading || contactsLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Filter contacts based on search term and sector
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === "all" || contact.sector === selectedSector;
    
    return matchesSearch && matchesSector;
  });

  // Get unique sectors for filter
  const sectors = [...new Set(contacts.map(contact => contact.sector).filter(Boolean))];

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return "—";
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContact(contactId);
      toast.success("Contact supprimé avec succès");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la suppression du contact");
    }
  };

  const handleEditContact = (contactId: string) => {
    // Navigate to edit contact page
    navigate(`/carnet-contacts/${contactId}/edit`);
  };

  const handleCreateConversation = (contactId: string) => {
    // Navigate to messages or inbox with preselected contact
    navigate(`/inbox?contactId=${contactId}`);
  };

  return (
    <>
      <Helmet>
        <title>Mes fournisseurs - Everlake Platform</title>
        <meta name="description" content="Gérez vos fournisseurs, organisez vos relations d'affaires et développez votre réseau." />
      </Helmet>
      
      <AppShellWithVar>
        <EverlakeSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Mes fournisseurs</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Gérez vos fournisseurs</p>
              </div>
            </div>
            
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CompactFilterBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filters={[
                    {
                      label: "Secteur",
                      value: selectedSector,
                      options: sectors.map(sector => ({
                        value: sector!,
                        label: sector!
                      })),
                      onChange: setSelectedSector
                    }
                  ]}
                />
                <AddContactForm onContactAdded={refetch} />
              </div>
              <ViewToggle view={view} onViewChange={setView} />
            </div>

            {filteredContacts.length === 0 ? (
              <EmptyState
                icon={Users}
                title={contacts.length === 0 ? "Aucun contact ajouté" : "Aucun contact trouvé"}
                description={contacts.length === 0 
                  ? "Créez votre premier contact pour commencer à organiser votre réseau professionnel. Les contacts vous permettent de gérer efficacement vos relations d'affaires."
                  : "Aucun contact ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                }
                actionLabel="Ajouter un contact"
                variant="minimal"
              />
            ) : view === "widget" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredContacts.map((contact) => (
                  <ContactWidgetCard 
                    key={contact.id} 
                    contact={contact}
                    onDelete={handleDeleteContact}
                    onEdit={handleEditContact}
                    onCreateConversation={handleCreateConversation}
                  />
                ))}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Secteur</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Date d'ajout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow 
                        key={contact.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => window.location.href = `/carnet-contacts/${contact.id}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{contact.company_name || "—"}</span>
                            {contact.tags && contact.tags.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {contact.tags[0]}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{contact.contact_person || "—"}</TableCell>
                        <TableCell className="text-sm">{contact.email || "—"}</TableCell>
                        <TableCell>{contact.phone || "—"}</TableCell>
                        <TableCell>
                          {contact.sector ? (
                            <div className="flex items-center gap-2">
                              {(() => {
                                const sectorMeta = getSectorMeta(contact.sector);
                                const IconComponent = sectorMeta.icon;
                                return (
                                  <>
                                    <IconComponent className={`h-3 w-3 ${sectorMeta.color}`} />
                                    <span className={sectorMeta.color}>{sectorMeta.label}</span>
                                  </>
                                );
                              })()}
                            </div>
                          ) : "—"}
                        </TableCell>
                        <TableCell>{contact.location || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(contact.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
}