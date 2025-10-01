import React, { useState, useMemo, useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CompactFilterBar } from "@/components/CompactFilterBar";
import { ViewToggle } from "@/components/ViewToggle";
import { Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";
import { useContacts } from "@/hooks/useContacts";
import { ContactWidgetCard } from "@/components/ContactWidgetCard";
import { getSectorMeta } from "@/data/secteurs-meta";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

interface AppelOffre {
  id: string;
  title: string;
  sector: string;
  location: string;
  budget?: string;
  description?: string;
  cahierDesCharges?: string;
}

export default function SelectionReseau() {
  const { state } = useLocation() as { state?: { appelOffre?: AppelOffre } };
  const navigate = useNavigate();
  const { toast } = useToast();
  const { contacts, loading: contactsLoading } = useContacts();
  const { user } = useAuth();
  
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [view, setView] = useState<"widget" | "list">("widget");
  const [alreadySentTo, setAlreadySentTo] = useState<string[]>([]);

  const appelOffre = state?.appelOffre;

  // Récupérer les fournisseurs à qui l'AO a déjà été envoyé
  useEffect(() => {
    const fetchAlreadySentTo = async () => {
      if (!appelOffre?.id || !user) return;
      
      try {
        const { data: devis } = await supabase
          .from('devis')
          .select('sent_to, company_name')
          .eq('marche_id', appelOffre.id);

        if (devis) {
          const sentToIds = devis.map(d => d.sent_to).filter(Boolean);
          const sentToCompanies = devis.map(d => d.company_name).filter(Boolean);
          setAlreadySentTo([...sentToIds, ...sentToCompanies]);
        }
      } catch (error) {
        console.error('Error fetching already sent to:', error);
      }
    };

    fetchAlreadySentTo();
  }, [appelOffre?.id, user]);

  // Redirection si pas d'appel d'offre
  if (!appelOffre) {
    navigate('/appels-offres');
    return null;
  }

  // Filtrer les contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Exclure les contacts à qui l'AO a déjà été envoyé
      if (alreadySentTo.includes(contact.id) || 
          (contact.company_name && alreadySentTo.includes(contact.company_name))) {
        return false;
      }

      const matchesSearch = !searchTerm || 
        contact.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSector = selectedSector === "all" || contact.sector === selectedSector;
      
      return matchesSearch && matchesSector;
    });
  }, [contacts, searchTerm, selectedSector, alreadySentTo]);

  // Get unique sectors for filter
  const sectors = [...new Set(contacts.map(contact => contact.sector).filter(Boolean))];

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    setSelectedContacts(filteredContacts.map(c => c.id));
  };

  const deselectAllContacts = () => {
    setSelectedContacts([]);
  };

  const goToSuggestions = () => {
    // Rediriger vers les suggestions avec les critères de l'AO ET les contacts sélectionnés
    const selectedContactsData = selectedContacts.map(contactId => {
      const contact = contacts.find(c => c.id === contactId);
      return contact;
    }).filter(Boolean);

    navigate("/suggestions-fournisseurs", { 
      state: { 
        criteria: {
          titre: appelOffre.title,
          secteur: appelOffre.sector.toLowerCase().replace(/[\s,]/g, '-').replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e').replace(/à/g, 'a').replace(/ô/g, 'o').replace(/û/g, 'u').replace(/ç/g, 'c'),
          typeAchat: "service",
          localisation: appelOffre.location,
          budgetEstime: appelOffre.budget || "50 000 €",
          description: appelOffre.description || `Recherche de fournisseurs pour: ${appelOffre.title}`,
          cahierDesCharges: appelOffre.cahierDesCharges || `Secteur: ${appelOffre.sector}, Budget: ${appelOffre.budget}`
        },
        selectedNetworkContacts: selectedContactsData,
        appelOffre: appelOffre
      }
    });
  };

  if (contactsLoading) {
    return (
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1" />
      </AppShellWithVar>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sélection du réseau - {appelOffre.title}</title>
        <meta name="description" content={`Sélectionnez les contacts de votre réseau pour l'appel d'offres: ${appelOffre.title}`} />
      </Helmet>
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Sélectionner des contacts</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filteredContacts.length} contact(s) disponible(s) dans votre réseau
                </p>
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <div className="px-6 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/appels-offres">Appels d'offres</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/appels-offres/${appelOffre.id}`}>{appelOffre.title}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Sélection réseau</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <main className="flex-1 px-6 py-4 space-y-4">
            {/* Info */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Étape 1/2:</span> Sélectionnez les contacts de votre réseau auxquels envoyer cet appel d'offres. 
                Vous pourrez ensuite découvrir des suggestions de nouveaux fournisseurs.
              </p>
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-4">
                <ViewToggle view={view} onViewChange={setView} />
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={selectAllContacts}>
                    Tout sélectionner
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={deselectAllContacts}>
                    Tout désélectionner
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            {filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {contacts.length === 0 
                    ? "Aucun contact dans votre réseau. Vous pouvez passer directement aux suggestions."
                    : "Aucun contact disponible ne correspond à vos critères."
                  }
                </p>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate('/carnet-contacts')}>
                  Gérer mes contacts
                </Button>
              </div>
            ) : view === "widget" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className="cursor-pointer hover:shadow-md transition-shadow relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => toggleContactSelection(contact.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div onClick={() => toggleContactSelection(contact.id)}>
                      <ContactWidgetCard contact={contact} />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between" onClick={() => toggleContactSelection(contact.id)}>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleContactSelection(contact.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <p className="font-medium">{contact.company_name}</p>
                          <p className="text-sm text-muted-foreground">{contact.contact_person}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{contact.email}</p>
                        {contact.sector && (
                          <div className="flex items-center gap-1 justify-end">
                            {(() => {
                              const sectorMeta = getSectorMeta(contact.sector);
                              const IconComponent = sectorMeta.icon;
                              return (
                                <>
                                  <IconComponent className={`h-3 w-3 ${sectorMeta.color}`} />
                                  <span className={`text-xs ${sectorMeta.color}`}>{sectorMeta.label}</span>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>

          {/* Footer */}
          <div className="sticky bottom-0 border-t bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedContacts.length} contact(s) sélectionné(s) de votre réseau
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(`/appels-offres/${appelOffre.id}`)}>
                  Retour
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs"
                  onClick={goToSuggestions}
                >
                  Continuer vers les suggestions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppShellWithVar>
    </>
  );
}