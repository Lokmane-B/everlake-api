import React, { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CompactFilterBar } from "@/components/CompactFilterBar";
import { ViewToggle } from "@/components/ViewToggle";
import { Building2, MapPin, Users, Award, Phone, Mail, Globe, ChevronDown, Calendar, TrendingUp, TrendingDown, Search, Filter, Grid3X3, List, Eye, Send, CheckSquare, MoreHorizontal, Laptop, Hammer, Wrench, Zap, Truck, Heart, ShoppingCart, BookOpen, User, Leaf, Package, GraduationCap, CheckCircle2 } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";
import { Supplier, AOCriteria } from "@/types/supplier";
import { generateSuppliers } from "@/utils/supplierGenerator";

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

export default function SuggestionsFournisseurs() {
  const { state } = useLocation() as { 
    state?: { 
      criteria?: AOCriteria; 
      selectedNetworkContacts?: any[];
      appelOffre?: any;
    } 
  };
  const navigate = useNavigate();
  const { toast } = useToast();

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Récupération ou génération des critères par défaut
  const criteria: AOCriteria = state?.criteria || {
    titre: "Appel d'offres par défaut",
    secteur: "informatique-numerique",
    typeAchat: "services",
    localisation: "75 - Paris",
    budgetEstime: "50 000 €",
    description: "Recherche de fournisseurs spécialisés",
    cahierDesCharges: "Critères techniques standards"
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [tailleFilter, setTailleFilter] = useState("all");
  const [localisationFilter, setLocalisationFilter] = useState("all");
  const [view, setView] = useState<"widget" | "list">("widget");

  const suppliers = useMemo(() => generateSuppliers(criteria, 12), [criteria]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.specialites.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTaille = tailleFilter === "all" || supplier.taille === tailleFilter;
      const matchesLocalisation = localisationFilter === "all" || supplier.ville.toLowerCase().includes(localisationFilter.toLowerCase());
      
      return matchesSearch && matchesTaille && matchesLocalisation;
    });
  }, [suppliers, searchTerm, tailleFilter, localisationFilter]);

  const toggleSupplierSelection = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const selectAll = () => {
    setSelectedSuppliers(filteredSuppliers.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedSuppliers([]);
  };

  const handleEnvoyerAO = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { useAuth } = await import("@/hooks/useAuth");
      
      // Récupérer l'utilisateur actuel (on devrait avoir un hook pour ça)
      const user = supabase.auth.getUser();
      
      const selectedNetworkContacts = state?.selectedNetworkContacts || [];
      const selectedSuppliersData = suppliers.filter(s => selectedSuppliers.includes(s.id));
      const appelOffre = state?.appelOffre;
      
      if (!appelOffre) {
        toast({
          title: "Erreur",
          description: "Informations de l'appel d'offres manquantes.",
          variant: "destructive"
        });
        return;
      }

      // Créer les devis pour les contacts du réseau
      for (const contact of selectedNetworkContacts) {
        await supabase.from('devis').insert({
          marche_id: appelOffre.id,
          marche_title: appelOffre.title,
          company_name: contact.company_name,
          location: contact.location,
          sent_to: contact.id,
          created_by: (await user).data.user?.id,
          status: 'Envoyé'
        });
      }

      // Créer les devis pour les fournisseurs suggérés
      for (const supplier of selectedSuppliersData) {
        await supabase.from('devis').insert({
          marche_id: appelOffre.id,
          marche_title: appelOffre.title,
          company_name: supplier.nom,
          location: supplier.ville,
          created_by: (await user).data.user?.id,
          status: 'Envoyé'
        });
      }

      const totalRecipients = selectedNetworkContacts.length + selectedSuppliers.length;
      
      toast({ 
        title: "Appel d'offres envoyé",
        description: `L'appel d'offres a été envoyé à ${totalRecipients} destinataire(s) (${selectedNetworkContacts.length} de votre réseau + ${selectedSuppliers.length} suggestions).` 
      });
      
      navigate('/appels-offres');
    } catch (error) {
      console.error('Error sending AO:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de l'appel d'offres.",
        variant: "destructive"
      });
    }
  };

  const getMatchingColor = (score: number) => {
    if (score >= 70) return "bg-green-500/10 text-green-500";
    if (score >= 50) return "bg-yellow-500/10 text-yellow-500";
    return "bg-red-500/10 text-red-500";
  };

  const getSectorUI = (slug: string) => {
    const sectorMap: Record<string, { icon: React.ReactNode; label: string }> = {
      "informatique-numerique": {
        icon: <Laptop className="h-3 w-3 text-blue-500" />,
        label: "Informatique et numérique"
      },
      "btp-construction": {
        icon: <Hammer className="h-3 w-3 text-orange-500" />,
        label: "BTP et construction"
      },
      "energie-environnement": {
        icon: <Leaf className="h-3 w-3 text-green-500" />,
        label: "Énergie et environnement"
      },
      "transport-logistique": {
        icon: <Truck className="h-3 w-3 text-purple-500" />,
        label: "Transport, logistique et mobilité"
      },
      "sante-medico-social": {
        icon: <Heart className="h-3 w-3 text-red-500" />,
        label: "Santé et médico-social"
      },
      "commerce-distribution": {
        icon: <Package className="h-3 w-3 text-gray-500" />,
        label: "Commerce et distribution"
      },
      "conseil-audit-formation": {
        icon: <GraduationCap className="h-3 w-3 text-blue-500" />,
        label: "Conseil, audit et formation"
      }
    };

    return sectorMap[slug] || {
      icon: <Building2 className="h-3 w-3 text-gray-500" />,
      label: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };
  };

  const filters = [
    {
      label: "Localisation",
      value: localisationFilter,
      options: [
        { value: "paris", label: "Paris" },
        { value: "lyon", label: "Lyon" },
        { value: "marseille", label: "Marseille" },
        { value: "toulouse", label: "Toulouse" }
      ],
      onChange: setLocalisationFilter
    }
  ];

  return (
    <>
      <Helmet>
        <title>Suggestions de fournisseurs</title>
        <meta name="description" content="Liste des fournisseurs suggérés pour votre appel d'offres" />
        <link rel="canonical" href="/suggestions-fournisseurs" />
      </Helmet>
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Fournisseurs suggérés</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{filteredSuppliers.length} fournisseur(s) trouvé(s)</p>
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
                  <BreadcrumbPage>Suggestions fournisseurs</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <main className="flex-1 px-6 py-4 space-y-4">
            {/* Info sur les contacts du réseau sélectionnés */}
            {state?.selectedNetworkContacts && state.selectedNetworkContacts.length > 0 && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Étape 2/2:</span> {state.selectedNetworkContacts.length} contact(s) de votre réseau déjà sélectionné(s). 
                  Sélectionnez maintenant des fournisseurs suggérés et envoyez l'appel d'offres à tous.
                </p>
              </div>
            )}
            {/* Filters and Controls */}
            <div className="flex items-center justify-between">
              <CompactFilterBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
              />
              <div className="flex items-center gap-4">
                <ViewToggle view={view} onViewChange={setView} />
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={selectAll}>
                    Tout sélectionner
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={deselectAll}>
                    Tout désélectionner
                  </Button>
                </div>
              </div>
            </div>

            {/* Suppliers Display */}
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun fournisseur ne correspond à vos critères.</p>
              </div>
            ) : (
              <>
                {view === "widget" ? (
                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredSuppliers.map((supplier) => (
                        <Card key={supplier.id} className="cursor-pointer hover:shadow-md transition-shadow p-3" onClick={() => setSelectedSupplier(supplier)}>
                          <CardHeader className="p-0 pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                 <div className="flex-1 min-w-0">
                                   <HoverCard>
                                     <HoverCardTrigger asChild>
                                       <CardTitle className="text-xs font-medium truncate leading-tight hover:text-primary cursor-pointer">{supplier.nom}</CardTitle>
                                     </HoverCardTrigger>
                                     <HoverCardContent className="w-80">
                                       <div className="space-y-2">
                                         <div className="flex items-center gap-2">
                                            <div>
                                              <p className="text-sm font-medium">{supplier.nom}</p>
                                              <div className="flex items-center gap-1">
                                                {getSectorUI(supplier.secteurActivite).icon}
                                                <span className="text-xs text-muted-foreground">{getSectorUI(supplier.secteurActivite).label}</span>
                                              </div>
                                            </div>
                                         </div>
                                           <div className="space-y-1 text-xs">
                                             <p><span className="font-medium">Adresse:</span> {supplier.adresse}, {supplier.ville}</p>
                                             {supplier.telephone && <p><span className="font-medium">Tél:</span> {supplier.telephone}</p>}
                                             {supplier.email && <p><span className="font-medium">Email:</span> {supplier.email}</p>}
                                           </div>
                                       </div>
                                     </HoverCardContent>
                                   </HoverCard>
                                     <div className="flex items-center gap-1 mt-0.5">
                                       <MapPin className="h-2 w-2 text-muted-foreground flex-shrink-0" />
                                       <span className="text-xs text-muted-foreground truncate">{supplier.ville}</span>
                                     </div>
                                  </div>
                               </div>
                               <Checkbox
                                 checked={selectedSuppliers.includes(supplier.id)}
                                 onCheckedChange={() => toggleSupplierSelection(supplier.id)}
                                 onClick={(e) => e.stopPropagation()}
                                 className="flex-shrink-0"
                               />
                             </div>
                           </CardHeader>
                            <CardContent className="p-0 space-y-1.5">
                               {/* Secteur */}
                               <div className="flex items-center gap-1">
                                 {getSectorUI(supplier.secteurActivite).icon}
                                 <span className="text-xs text-muted-foreground">{getSectorUI(supplier.secteurActivite).label}</span>
                               </div>

                                {/* Score */}
                                <div className="flex items-center justify-between gap-1.5">
                                   <Badge className={`text-xs px-1.5 py-0 ${getMatchingColor(supplier.matchingScore)}`}>
                                     {supplier.matchingScore}%
                                   </Badge>
                               </div>

                             {/* Spécialités */}
                             <div className="space-y-0.5">
                               <div className="flex flex-wrap gap-0.5">
                                  {supplier.specialites.slice(0, 2).map((specialite, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                      {specialite}
                                    </Badge>
                                  ))}
                                 {supplier.specialites.length > 2 && (
                                   <Tooltip>
                                     <TooltipTrigger>
                                        <Badge variant="secondary" className="text-xs px-1 py-0">
                                          +{supplier.specialites.length - 2}
                                        </Badge>
                                     </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        {supplier.specialites.slice(2).map((spec, index) => (
                                          <p key={index} className="text-xs">{spec}</p>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>

                             {/* Certifications */}
                             {supplier.certifications.length > 0 && (
                               <div className="flex flex-wrap gap-0.5">
                                 {supplier.certifications.slice(0, 1).map((cert, index) => (
                                   <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                     <Award className="h-2 w-2 mr-0.5" />
                                     {cert}
                                   </Badge>
                                 ))}
                                 {supplier.certifications.length > 1 && (
                                   <Tooltip>
                                     <TooltipTrigger>
                                       <Badge variant="secondary" className="text-xs px-1 py-0">
                                         +{supplier.certifications.length - 1}
                                       </Badge>
                                     </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        {supplier.certifications.slice(1).map((cert, index) => (
                                          <p key={index} className="text-xs">{cert}</p>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            )}

                            {/* Contact Icons */}
                            <div className="flex items-center gap-2 pt-1">
                              {supplier.telephone && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Phone className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">{supplier.telephone}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {supplier.email && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Mail className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">{supplier.email}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {supplier.siteWeb && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Globe className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">{supplier.siteWeb}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-6 text-xs p-1 mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSupplier(supplier);
                              }}
                            >
                              <Eye className="h-2.5 w-2.5 mr-1" />
                              Voir détails
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <div className="space-y-2">
                      {filteredSuppliers.map((supplier) => (
                        <Card key={supplier.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedSupplier(supplier)}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  checked={selectedSuppliers.includes(supplier.id)}
                                  onCheckedChange={() => toggleSupplierSelection(supplier.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={supplier.logoUrl} alt={supplier.nom} />
                                  <AvatarFallback className="bg-muted">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="grid grid-cols-5 gap-4 items-center">
                                    {/* Nom + Ville */}
                                    <div className="min-w-0">
                                      <HoverCard>
                                        <HoverCardTrigger asChild>
                                          <span className="text-sm font-medium hover:text-primary cursor-pointer truncate block">{supplier.nom}</span>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-80">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <Avatar className="h-8 w-8">
                                                <AvatarImage src={supplier.logoUrl} alt={supplier.nom} />
                                                <AvatarFallback className="bg-muted">
                                                  <User className="h-4 w-4 text-muted-foreground" />
                                                </AvatarFallback>
                                              </Avatar>
                                               <div>
                                                 <p className="text-sm font-medium">{supplier.nom}</p>
                                                 <div className="flex items-center gap-1">
                                                   {getSectorUI(supplier.secteurActivite).icon}
                                                   <span className="text-xs text-muted-foreground">{getSectorUI(supplier.secteurActivite).label}</span>
                                                 </div>
                                               </div>
                                            </div>
                                             <div className="space-y-1 text-xs">
                                               <p><span className="font-medium">Adresse:</span> {supplier.adresse}, {supplier.ville}</p>
                                               {supplier.telephone && <p><span className="font-medium">Tél:</span> {supplier.telephone}</p>}
                                               {supplier.email && <p><span className="font-medium">Email:</span> {supplier.email}</p>}
                                             </div>
                                          </div>
                                        </HoverCardContent>
                                      </HoverCard>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground truncate">{supplier.ville}</span>
                                      </div>
                                    </div>

                                     {/* Secteur */}
                                     <div className="min-w-0">
                                       <div className="flex items-center gap-1">
                                         {getSectorUI(supplier.secteurActivite).icon}
                                         <span className="text-xs text-muted-foreground truncate">{getSectorUI(supplier.secteurActivite).label}</span>
                                       </div>
                                     </div>

                                    {/* Spécialités */}
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap gap-1">
                                        {supplier.specialites.slice(0, 1).map((specialite, index) => (
                                          <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0 truncate max-w-full">
                                            {specialite}
                                          </Badge>
                                        ))}
                                        {supplier.specialites.length > 1 && (
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                +{supplier.specialites.length - 1}
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <div className="space-y-1">
                                                {supplier.specialites.slice(1).map((spec, index) => (
                                                  <p key={index} className="text-xs">{spec}</p>
                                                ))}
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                    </div>

                                    {/* Certifications */}
                                    <div className="min-w-0">
                                      {supplier.certifications.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {supplier.certifications.slice(0, 1).map((cert, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0 truncate max-w-full">
                                              <Award className="h-2.5 w-2.5 mr-1" />
                                              {cert}
                                            </Badge>
                                          ))}
                                          {supplier.certifications.length > 1 && (
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                  +{supplier.certifications.length - 1}
                                                </Badge>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <div className="space-y-1">
                                                  {supplier.certifications.slice(1).map((cert, index) => (
                                                    <p key={index} className="text-xs">{cert}</p>
                                                  ))}
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          )}
                                        </div>
                                      )}
                                    </div>

                     {/* Score */}
                     <div className="flex flex-col items-end">
                         <Badge className={`text-[10px] px-1.5 py-0.5 ${getMatchingColor(supplier.matchingScore)}`}>
                           {supplier.matchingScore}%
                         </Badge>
                     </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSupplier(supplier);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Voir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TooltipProvider>
                )}
              </>
            )}
          </main>

          {/* Footer */}
          <div className="sticky bottom-0 border-t bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedSuppliers.length + (state?.selectedNetworkContacts?.length || 0)} destinataire(s) au total
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/selection-reseau', { state })}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  Retour
                </Button>
                <Button 
                  onClick={handleEnvoyerAO}
                  disabled={selectedSuppliers.length === 0 && (!state?.selectedNetworkContacts || state.selectedNetworkContacts.length === 0)}
                  variant="ghost"
                  size="sm" 
                  className="h-7 px-2 text-xs"
                >
                  Envoyer l'appel d'offres
                </Button>
              </div>
            </div>
          </div>


          {/* Supplier Details Dialog */}
          <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-sm font-normal">
                  {selectedSupplier?.nom}
                </DialogTitle>
              </DialogHeader>
              {selectedSupplier && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-normal mb-3">Informations générales</h3>
                       <div className="space-y-2 text-xs text-muted-foreground">
                          <div><span className="text-muted-foreground">Secteur:</span> 
                            <div className="flex items-center gap-1 inline-flex">
                              {getSectorUI(selectedSupplier.secteurActivite).icon}
                              <span>{getSectorUI(selectedSupplier.secteurActivite).label}</span>
                            </div>
                          </div>
                        <div><span className="text-muted-foreground">CA:</span> {selectedSupplier.chiffreAffaires}</div>
                        <div><span className="text-muted-foreground">Employés:</span> {selectedSupplier.nombreEmployes}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-normal mb-3">Contact</h3>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{selectedSupplier.adresse}, {selectedSupplier.ville}</span>
                        </div>
                        {selectedSupplier.telephone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{selectedSupplier.telephone}</span>
                          </div>
                        )}
                        {selectedSupplier.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{selectedSupplier.email}</span>
                          </div>
                        )}
                        {selectedSupplier.siteWeb && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span>{selectedSupplier.siteWeb}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-normal mb-3">Spécialités</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.specialites.map((specialite, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialite}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-normal mb-3">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-normal mb-3">Correspondance</h3>
                     <div className="space-y-2">
                         <Badge className={`text-[10px] px-1.5 py-0.5 ${getMatchingColor(selectedSupplier.matchingScore)}`}>
                           {selectedSupplier.matchingScore}% de correspondance
                         </Badge>
                      <div className="space-y-1">
                        {selectedSupplier.matchingReasons.map((reason, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-muted-foreground">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-normal mb-2">Description</h3>
                    <p className="text-xs text-muted-foreground">{selectedSupplier.description}</p>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Données mises à jour le {new Date(selectedSupplier.derniereMiseAJour).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AppShellWithVar>
    </>
  );
}