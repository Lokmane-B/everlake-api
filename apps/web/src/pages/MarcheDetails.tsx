import React, { useState, useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Calendar, Euro, File, Factory, Building2, Laptop, Leaf, Truck, Heart, ShoppingCart, BookOpen, Building, MapPin, Bookmark, Send, Eye } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";
import { getStatusBadge, normalizeStatus } from "@/data/status";
import { useMarches } from "@/hooks/useMarches";
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

interface Marche {
  id: number;
  title: string;
  sector: string;
  budget: string;
  startDate: string;
  endDate: string;
  devisCount: number;
  visibility: "publique" | "prive";
  quantity?: string;
  description: string;
  cahierDesCharges?: string;
  documents?: string[];
  contractType?: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
}

const FALLBACK: Marche = {
  id: 0,
  title: "Renouvellement parc informatique",
  sector: "Informatique et numérique",
  budget: "25 000 €",
  startDate: "01/07/2025",
  endDate: "31/07/2025",
  devisCount: 3,
  visibility: "publique",
  description: "Remplacement de 10 postes de travail, écrans 24\", installation et configuration complètes.",
  documents: ["CCTP_v1.pdf", "Plan_implantation.pdf"],
  contractType: "Fourniture et services",
};

export default function MarcheDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { marche?: any } };
  const { getMarcheById } = useMarches();
  const { user, loading: authLoading } = useAuth();
  const [marche, setMarche] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarche = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;
      
      // Redirect to auth if not authenticated (security requirement)
      if (!user) {
        navigate('/auth');
        return;
      }
      
      console.log('Loading marché with ID:', id);
      console.log('State from navigation:', state);
      
      if (state?.marche) {
        // Si on a les données dans le state, les utiliser
        console.log('Using marché from state:', state.marche);
        setMarche(state.marche);
        setLoading(false);
      } else if (id) {
        // Sinon récupérer depuis la base
        console.log('Fetching marché from database...');
        const marcheData = await getMarcheById(id);
        console.log('Marché data from DB:', marcheData);
        if (marcheData) {
          setMarche(marcheData);
        }
        setLoading(false);
      } else {
        console.log('No ID provided');
        setLoading(false);
      }
    };

    loadMarche();
  }, [id, state, getMarcheById, user, authLoading, navigate]);

  if (loading) {
    return (
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Détail du marché</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Chargement...</p>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            <div className="text-center text-muted-foreground">Chargement du marché...</div>
          </main>
        </div>
      </AppShellWithVar>
    );
  }

  if (!marche) {
    return (
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Marché introuvable</h1>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            <div className="text-center text-muted-foreground">Ce marché n'existe pas ou n'est plus disponible.</div>
          </main>
        </div>
      </AppShellWithVar>
    );
  }

  const { toast } = useToast();
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Non spécifiée";
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getSectorIcon = (sector: string | null) => {
    switch (sector) {
      case "industrie-fabrication":
        return <Factory className="w-4 h-4 text-orange-500" />;
      case "btp-construction":
        return <Building2 className="w-4 h-4 text-orange-500" />;
      case "informatique-numerique":
        return <Laptop className="w-4 h-4 text-blue-500" />;
      case "energie-environnement":
        return <Leaf className="w-4 h-4 text-green-500" />;
      case "transport-logistique":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "sante-medico-social":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "commerce-distribution":
        return <ShoppingCart className="w-4 h-4 text-pink-500" />;
      case "conseil-audit-formation":
      case "education-rh":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "services-generaux":
        return <Building className="w-4 h-4 text-gray-500" />;
      default:
        return <Building className="w-4 h-4 text-gray-500" />;
    }
  };


  const handleEnregistrer = () => {
    toast({ description: "Fonctionnalité de favoris sera bientôt disponible." });
  };

  const handleEnvoyerDevis = () => {
    navigate(`/marches/${id}/devis`, { state: { marche } });
  };

  return (
    <>
      <Helmet>
        <title>{`${marche.title} – Marché public`}</title>
        <meta name="description" content={`Détails du marché public: ${marche.title}`} />
        <link rel="canonical" href={`/marches/${id}`} />
      </Helmet>
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Recherche de marchés</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Consultez les marchés publics</p>
              </div>
            </div>
          </header>

          <div className="px-6 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/recherche-marches">Recherche de marchés</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{marche.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <main className="flex-1 px-6 py-4 space-y-6">
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {marche.company_name && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{marche.company_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <h2 className="text-sm font-normal text-foreground">{marche.title}</h2>
                  <div className="h-6">
                    <Badge variant="outline" className="text-xs">
                      {marche.status || 'Actif'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleEnregistrer}>
                    <Bookmark className="h-3.5 w-3.5 mr-1" /> Enregistrer
                  </Button>
                  <Button size="sm" className="h-7 px-2 text-xs" onClick={handleEnvoyerDevis}>
                    <Send className="h-3.5 w-3.5 mr-1" /> Envoyer un devis
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Type d'achat:</span>
                  <span className="text-foreground">{marche.contract_type || 'Non spécifié'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Secteur:</span>
                  <span className="flex items-center gap-2 text-foreground">
                    {getSectorIcon(marche.sector)}
                    <span>{marche.sector || 'Non spécifié'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span className="text-muted-foreground">Date publication:</span>
                  <span className="text-foreground">{formatDate(marche.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span className="text-muted-foreground">Date limite:</span>
                  <span className="text-foreground">{formatDate(marche.end_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="text-muted-foreground">Localisation:</span>
                  <span className="text-foreground">{marche.location || 'Non spécifiée'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="h-3 w-3" />
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="text-foreground">{marche.budget || 'Non communiqué'}</span>
                </div>
              </div>
            </section>
            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-normal text-foreground">Description</h3>
              <div className="text-xs text-muted-foreground whitespace-pre-line">{marche.description || "Aucune description fournie."}</div>
            </section>
            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-normal text-foreground">Cahier des charges</h3>
              <div className="text-xs text-muted-foreground whitespace-pre-line">{marche.cahier_des_charges || "Non renseigné."}</div>
            </section>
            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-normal text-foreground">Critères d'évaluation</h3>
              {marche.evaluation_criteria && Array.isArray(marche.evaluation_criteria) && marche.evaluation_criteria.length > 0 ? (
                <div className="space-y-2">
                  {marche.evaluation_criteria.map((critere: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-accent pl-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-medium text-foreground">{critere.criterion}</h4>
                        <span className="text-xs text-muted-foreground">{critere.weight}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{critere.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Aucun critère d'évaluation spécifié.</p>
              )}
            </section>
            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-normal text-foreground">Documents</h3>
              {marche.documents && Array.isArray(marche.documents) && marche.documents.length > 0 ? (
                <div className="space-y-2">
                  {marche.documents.map((doc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-accent/30 rounded">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <div>
                          <p className="text-xs font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} - {doc.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Aucun document joint.</p>
              )}
            </section>
            <Separator />

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-normal text-foreground mb-2">Type de contrat</h3>
                <p className="text-xs text-foreground">{marche.contract_type || 'Non spécifié'}</p>
              </div>
              <div>
                <h3 className="text-sm font-normal text-foreground mb-2">Budget estimé</h3>
                <p className="text-xs text-foreground">{marche.budget || 'Non communiqué'}</p>
              </div>
              {marche.start_date && (
                <div>
                  <h3 className="text-sm font-normal text-foreground mb-2">Date de début souhaitée</h3>
                  <p className="text-xs text-foreground">{formatDate(marche.start_date)}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-normal text-foreground mb-2">Délais d'exécution</h3>
                <p className="text-xs text-foreground">
                  {marche.start_date && marche.end_date 
                    ? `Du ${formatDate(marche.start_date)} au ${formatDate(marche.end_date)}`
                    : 'À définir selon les spécifications du cahier des charges'
                  }
                </p>
              </div>
            </section>
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
}