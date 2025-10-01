import React, { useState, useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { Phone, Mail, MapPin, Building, Tag, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useContacts } from "@/hooks/useContacts";
import { toast } from "sonner";

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

const MesFournisseurs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contacts, loading } = useContacts();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  
  const criteria = location.state?.criteria;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString('fr-FR');
    } catch {
      return "—";
    }
  };

  const handleContactSelect = (contactId: string, checked: boolean) => {
    setSelectedContacts(prev => 
      checked 
        ? [...prev, contactId]
        : prev.filter(id => id !== contactId)
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  const handleContinue = () => {
    // Store selected contacts in localStorage for later use
    if (selectedContacts.length > 0) {
      localStorage.setItem('selectedContacts', JSON.stringify(selectedContacts));
      toast.success(`${selectedContacts.length} fournisseur(s) sélectionné(s)`);
    }
    
    // Navigate to supplier suggestions with criteria
    navigate('/suggestions-fournisseurs', {
      state: { 
        criteria,
        selectedContactIds: selectedContacts
      }
    });
  };

  if (!criteria) {
    // If no criteria is passed, redirect back to create tender page
    navigate('/ajouter-appel-offre');
    return null;
  }

  return (
    <AppShellWithVar>
      <EverlakeSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div>
              <h1 className="text-sm font-normal text-foreground">Sélectionner vos fournisseurs</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Choisissez les fournisseurs que vous connaissez déjà</p>
            </div>
          </div>
          
        </header>
    
        <main className="flex-1 p-6">
          <div className="w-full">
            <section className="mb-6">
              <Helmet>
                <title>Mes fournisseurs - Sélection</title>
                <meta name="description" content="Sélectionnez vos fournisseurs existants avant de découvrir de nouvelles suggestions." />
                <link rel="canonical" href="/mes-fournisseurs" />
              </Helmet>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-normal text-foreground">Mes fournisseurs ({contacts.length})</h2>
                  <p className="text-xs text-muted-foreground">Sélectionnez les fournisseurs à qui envoyer cet appel d'offres</p>
                </div>
                
                {contacts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 px-3 text-xs"
                  >
                    {selectedContacts.length === contacts.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </Button>
                )}
              </div>

              {selectedContacts.length > 0 && (
                <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-md">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent-foreground" />
                    <span className="text-xs text-accent-foreground">
                      {selectedContacts.length} fournisseur(s) sélectionné(s)
                    </span>
                  </div>
                </div>
              )}
            </section>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/50 rounded-full inline-block mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-2">Aucun fournisseur enregistré</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Vous n'avez pas encore ajouté de fournisseurs dans votre carnet de contacts.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/carnet-contacts')}
                    className="h-8 px-3 text-xs"
                  >
                    Ajouter des fournisseurs
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleContinue}
                    className="h-8 px-3 text-xs"
                  >
                    Continuer sans sélection
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {contacts.map((contact) => (
                    <Card key={contact.id} className="transition-all duration-200 hover:shadow-md">
                      <CardHeader className="p-4 pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={selectedContacts.includes(contact.id)}
                              onCheckedChange={(checked) => handleContactSelect(contact.id, checked as boolean)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-foreground truncate">
                                {contact.company_name || "Entreprise sans nom"}
                              </h3>
                              {contact.contact_person && (
                                <p className="text-xs text-muted-foreground">{contact.contact_person}</p>
                              )}
                            </div>
                          </div>
                          {contact.tags && contact.tags.length > 0 && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              <Tag className="h-2.5 w-2.5 mr-1" />
                              {contact.tags[0]}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-1.5">
                          {contact.email && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                          
                          {contact.phone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          
                          {contact.location && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{contact.location}</span>
                            </div>
                          )}
                          
                          {contact.sector && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{contact.sector}</span>
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                            <span className="font-medium">Ajouté le:</span> {formatDate(contact.created_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  <span className="text-xs text-muted-foreground mr-4">
                    {selectedContacts.length} sur {contacts.length} sélectionné(s)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/ajouter-appel-offre')}
                    className="h-8 px-3 text-xs"
                  >
                    Retour
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleContinue}
                    className="h-8 px-3 text-xs"
                  >
                    Suivant
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </AppShellWithVar>
  );
};

export default MesFournisseurs;