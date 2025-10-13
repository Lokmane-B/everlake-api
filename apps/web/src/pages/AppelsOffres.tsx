import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { FileText, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CompactFilterBar } from "@/components/CompactFilterBar";
import { ViewToggle } from "@/components/ViewToggle";
import { AppelOffreListView } from "@/components/AppelOffreListView";
import { AppelOffreWidgetCard } from "@/components/AppelOffreWidgetCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const AppShellWithVar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useSidebar();
  const headerHeight = state === "collapsed" ? "48px" : "60px";
  return (
    <div className="min-h-screen flex w-full bg-main-background relative" style={{ ["--app-header-height" as any]: headerHeight }}>
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[var(--app-header-height)] h-px bg-sidebar-border z-20" />
    </div>
  );
};

// Format renvoyé par GET /api/rfqs (ton contrôleur)
type RfqListItem = {
  id: number;
  title: string;
  sector: string;
  budget: number | string | null;   // BigDecimal côté Java -> number/string ici
  end_date: string | null;
  status: string;
  visibility: "publique" | "privee" | string;
  devisCount: number;
};

const AppelsOffres: React.FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [view, setView] = useState<"widget" | "list">("widget");

  const [rfqs, setRfqs] = useState<RfqListItem[]>([]);
  const [fetching, setFetching] = useState(false);

  // Charge les RFQ UNIQUEMENT quand user + token sont prêts
  useEffect(() => {
    if (loading) return;
    const token = localStorage.getItem("token");
    if (!user || !token) return;

    const fetchRfq = async () => {
      try {
        setFetching(true);
        const res = await fetch("http://localhost:8080/api/rfqs", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });
        if (res.status === 401 || res.status === 403) {
          toast({
            title: "Session requise",
            description: "Veuillez vous reconnecter.",
            variant: "destructive",
          });
          return;
        }
        if (!res.ok) throw new Error("Erreur lors du chargement des demandes de devis");
        const data: RfqListItem[] = await res.json();
        setRfqs(data ?? []);
      } catch (e) {
        console.error(e);
        toast({
          title: "Erreur",
          description: "Impossible de charger les demandes de devis.",
          variant: "destructive",
        });
      } finally {
        setFetching(false);
      }
    };

    fetchRfq();
  }, [user, loading, toast]);

  // Filtrage local basique (recherche + statut)
  const appelsOffres = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rfqs.filter(a => {
      const matchTerm =
        !term ||
        a.title?.toLowerCase().includes(term) ||
        a.sector?.toLowerCase().includes(term);
      const matchStatus =
        selectedStatus === "all" || a.status?.toLowerCase() === selectedStatus;
      return matchTerm && matchStatus;
    });
  }, [rfqs, searchTerm, selectedStatus]);

  if (loading) return null;
  if (!user) return <Navigate to="/homepage" replace />;

  return (
    <>
      <Helmet>
        <title>Demandes de devis - Everlake Platform</title>
        <meta
          name="description"
          content="Gérez vos demandes de devis, suivez leur progression et optimisez votre processus de réponse."
        />
      </Helmet>

      <AppShellWithVar>
        <EverlakeSidebar />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Demandes de devis</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Gérez vos demandes de devis en cours</p>
              </div>
            </div>
          </header>

          {/* Main */}
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
                        { value: "all", label: "Tous" },
                        { value: "actif", label: "Actif" },
                        { value: "brouillon", label: "Brouillon" },
                        { value: "terminé", label: "Terminé" },
                      ],
                      onChange: setSelectedStatus,
                    },
                  ]}
                />
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                  <Link to="/ajouter-appel-offre">
                    <Plus className="h-3 w-3 mr-1.5 text-muted-foreground" />
                    <span className="text-foreground">Créer une demande de devis</span>
                  </Link>
                </Button>
              </div>
              <ViewToggle view={view} onViewChange={setView} />
            </div>

            {fetching && rfqs.length === 0 ? (
              <div className="text-xs text-muted-foreground">Chargement…</div>
            ) : appelsOffres.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucune demande de devis créée"
                description="Créez votre première demande pour lancer une consultation."
                actionLabel="Créer une demande de devis"
                actionTo="/ajouter-appel-offre"
                variant="minimal"
              />
            ) : view === "widget" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {appelsOffres.map((a) => (
                  <AppelOffreWidgetCard
                    key={a.id}
                    appel={{
                      id: a.id,
                      title: a.title,
                      sector: a.sector,
                      budget: a.budget,
                      end_date: a.end_date,
                      status: a.status,
                      visibility: a.visibility,
                      devisCount: a.devisCount,
                    }}
                  />
                ))}
              </div>
            ) : (
              <AppelOffreListView
                appels={appelsOffres.map((a) => ({
                  id: a.id,
                  titre: a.title,
                  secteur: a.sector,
                  budget: a.budget,
                  dateLimite: a.end_date,
                  status: a.status,
                  visibilite: a.visibility,
                  devisCount: a.devisCount,
                }))}
              />
            )}
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
};

export default AppelsOffres;
