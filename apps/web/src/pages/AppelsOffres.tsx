import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Bell, FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CompactFilterBar } from "@/components/CompactFilterBar";
import { ViewToggle } from "@/components/ViewToggle";
import { AppelOffreListView } from "@/components/AppelOffreListView";
import { AppelOffreWidgetCard } from "@/components/AppelOffreWidgetCard";
import { useAuth } from "@/hooks/useAuth";
import { useAppelsOffres } from "@/hooks/useAppelsOffres";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const AppelsOffres = () => {
  const { user, loading } = useAuth();
  const { appelsOffres } = useAppelsOffres();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [view, setView] = useState<"widget" | "list">("widget");

  const handleAddExamples = async () => {
    if (!user) return;
    
    const exampleMarches = [
      {
        title: "Installation système photovoltaïque 500 kWc",
        description: "Installation d'un système photovoltaïque de 500 kWc minimum sur toiture industrielle de 4000 m²",
        sector: "Énergie & Environnement",
        location: "Lyon, Rhône-Alpes",
        budget: "250 000 - 350 000 €",
        status: "Actif",
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_by: user.id,
        company_name: "EcoSolar Industries",
        visibility: "publique",
        cahier_des_charges: `1 Caractéristiques générales

Surface disponible : environ 4 000 m² exploitables.
Puissance installée attendue : ≥ 500 kWc.
Type de panneaux : monocristallins haut rendement (> 20 %).
Onduleurs centralisés ou string, rendement > 97 %.

2 Normes et certifications

Matériel conforme aux normes CE et IEC en vigueur.
Installateur certifié QualiPV.
Garantie constructeur :
Panneaux : 10 ans produit, 25 ans performance (80 % mini).
Onduleurs : 10 ans.

3 Études et documentation

Étude de faisabilité et dimensionnement précis (logiciel PVsyst ou équivalent).
Plans d'implantation.
Schéma électrique unifilaire.
Note de calcul structurelle pour la toiture.

4 Maintenance et suivi

Maintenance préventive annuelle.
Intervention corrective sous 72h en cas de panne critique.
Mise à disposition d'un outil de suivi en ligne (monitoring production).

5 Délais d'exécution

Installation complète : 12 semaines à compter de la signature du marché.
Délai de raccordement réseau : selon délais Enedis (4-8 semaines).`,
        evaluation_criteria: ["Prix (40%)", "Qualité technique (30%)", "Délais (20%)", "Maintenance (10%)"]
      },
      {
        title: "Fourniture équipements électriques industriels",
        description: "Fourniture et installation d'équipements électriques pour modernisation d'atelier de production",
        sector: "Industrie & Manufacturing",
        location: "Marseille, PACA",
        budget: "80 000 - 120 000 €",
        status: "Actif",
        end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_by: user.id,
        company_name: "TechnoIndustries",
        visibility: "publique",
        cahier_des_charges: `1 Caractéristiques générales

Modernisation complète du tableau électrique principal.
Installation de 15 postes de distribution 400V.
Mise en conformité NF C 15-100.
Puissance totale : 300 kW.

2 Normes et certifications

Matériel conforme NF et CE.
Installation par électricien qualifié Qualifelec.
Garantie matériel : 5 ans minimum.
Garantie installation : 2 ans.

3 Études et documentation

Schéma unifilaire détaillé.
Plans d'implantation.
Dossier de conformité Consuel.
Formation utilisateurs incluse.

4 Maintenance et suivi

Maintenance préventive semestrielle.
Intervention sous 24h en cas d'urgence.
Carnet de maintenance fourni.

5 Délais d'exécution

Études et fourniture : 8 semaines.
Installation et mise en service : 4 semaines.`,
        evaluation_criteria: ["Prix (35%)", "Références techniques (25%)", "Délais (25%)", "Garanties (15%)"]
      }
    ];

    try {
      const { error } = await supabase
        .from('marches')
        .insert(exampleMarches);

      if (error) throw error;

      toast({
        title: "Exemples ajoutés",
        description: "Deux appels d'offres exemples ont été créés avec succès."
      });
    } catch (error) {
      console.error('Error adding examples:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les exemples.",
        variant: "destructive"
      });
    }
  };


  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Appels d'offres - Everlake Platform</title>
        <meta name="description" content="Gérez vos appels d'offres, suivez leur progression et optimisez votre processus de réponse aux marchés publics." />
      </Helmet>
      
      <AppShellWithVar>
        <EverlakeSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <div>
                  <h1 className="text-sm font-normal text-foreground">Appels d'offres</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Gérez vos appels d'offres en cours</p>
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
                        label: "Statut",
                        value: selectedStatus,
                        options: [
                          { value: "en cours", label: "En cours" },
                          { value: "cloture", label: "Clôturé" },
                          { value: "brouillon", label: "Brouillon" }
                        ],
                        onChange: setSelectedStatus
                      }
                    ]}
                  />
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                    <Link to="/ajouter-appel-offre">
                      <Plus className="h-3 w-3 mr-1.5 text-muted-foreground" />
                      <span className="text-foreground">Créer un appel d'offres</span>
                    </Link>
                  </Button>
                </div>
                <ViewToggle view={view} onViewChange={setView} />
              </div>

              {appelsOffres.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Aucun appel d'offres créé"
                  description="Créez votre premier appel d'offres pour lancer une consultation auprès de vos fournisseurs. Cette fonctionnalité vous permet de comparer les offres reçues et sélectionner la meilleure proposition."
                  actionLabel="Créer un appel d'offres"
                  actionTo="/ajouter-appel-offre"
                  variant="minimal"
                />
              ) : view === "widget" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {appelsOffres.map((appel) => (
                    <AppelOffreWidgetCard key={appel.id} appel={appel} />
                  ))}
                </div>
              ) : (
                <AppelOffreListView appels={appelsOffres.map(appel => ({
                  id: appel.id,
                  titre: appel.title,
                  secteur: appel.sector,
                  budget: appel.budget,
                  dateLimite: appel.end_date,
                  status: appel.status,
                  visibilite: appel.visibility,
                  devisCount: appel.devisCount
                }))} />
              )}
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
};

export default AppelsOffres;