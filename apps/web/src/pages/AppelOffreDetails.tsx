import React, { useState, useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { FileText, Calendar, Euro, File, MapPin, Eye, Download, FileDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";
import { getStatusBadge } from "@/data/status";
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
  budget?: string;
  startDate: string;
  endDate: string;
  devisCount: number;
  visibility: "publique" | "prive";
  status: string;
  quantity?: string;
  description?: string;
  cahierDesCharges?: string;
  documents?: string[];
  contractType?: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
  evaluationCriteria?: string[];
  attributaire_company_name?: string | null;
}

export default function AppelOffreDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appel, setAppel] = useState<AppelOffre | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppelOffre = async () => {
      if (!id || !user) return;

      try {
        // Get marche details
        const { data: marche, error: marcheError } = await supabase
          .from('marches')
          .select('*')
          .eq('id', id)
          .eq('created_by', user.id)
          .single();

        if (marcheError) {
          console.error('Error fetching marche:', marcheError);
          setAppel(null);
          return;
        }

        if (marche) {
          setAppel({
            id: marche.id,
            title: marche.title || "Sans titre",
            sector: marche.sector || "Non défini",
            budget: marche.budget || "Non défini",
            startDate: marche.created_at ? new Date(marche.created_at).toLocaleDateString('fr-FR') : "—",
            endDate: marche.end_date ? new Date(marche.end_date).toLocaleDateString('fr-FR') : "—",
            devisCount: 0, // Will be updated with real count if needed
            status: marche.status || "Actif",
            description: marche.description || "",
            cahierDesCharges: marche.cahier_des_charges || "",
            location: marche.location || "Non définie",
            visibility: (marche.visibility as "publique" | "prive") || "publique",
            contractType: marche.contract_type || "Non défini",
            quantity: marche.quantity || "Non défini",
            evaluationCriteria: Array.isArray(marche.evaluation_criteria) 
              ? marche.evaluation_criteria.map(item => String(item))
              : [],
            attributaire_company_name: marche.attributaire_company_name || null
          });
          
          // Set documents if available
          if (Array.isArray(marche.documents)) {
            setDocuments(marche.documents);
          }
        }
      } catch (error) {
        console.error('Error fetching appel d\'offre:', error);
        setAppel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAppelOffre();

    // Set up realtime subscription for marches changes
    if (id && user) {
      const channel = supabase
        .channel('appel-offre-details')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'marches',
            filter: `id=eq.${id}`
          },
          () => {
            fetchAppelOffre();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, user]);

  if (loading) {
    return (
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1" />
      </AppShellWithVar>
    );
  }

  if (!appel) {
    return (
      <AppShellWithVar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Appel d'offres non trouvé</h2>
            <Button onClick={() => navigate('/appels-offres')}>
              Retour aux appels d'offres
            </Button>
          </div>
        </div>
      </AppShellWithVar>
    );
  }

  const sectorMeta = getSectorMeta(appel.sector);
  const SectorIcon = sectorMeta.icon;

  const handleVoirDevis = () =>
    navigate(`/appels-offres/${id}/devis`, { state: { ao: appel } });

  const handleCloturer = async () => {
    if (!appel) return;
    
    try {
      const { error } = await supabase
        .from('marches')
        .update({ status: 'Terminé' })
        .eq('id', appel.id)
        .eq('created_by', user?.id);

      if (error) throw error;

      toast({ 
        title: "Appel d'offres clôturé", 
        description: "L'appel d'offres a été clôturé avec succès." 
      });

      // Refresh the data
      setAppel(prev => prev ? { ...prev, status: 'Terminé' } : null);
    } catch (error) {
      console.error('Error closing appel offre:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de clôturer l'appel d'offres.", 
        variant: "destructive" 
      });
    }
  };

  const handleSupprimer = async () => {
    if (!appel) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'appel d'offres "${appel.title}" ? Cette action est irréversible.`
    );
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('marches')
        .delete()
        .eq('id', appel.id)
        .eq('created_by', user?.id);

      if (error) throw error;

      toast({ 
        title: "Appel d'offres supprimé", 
        description: "L'appel d'offres a été supprimé avec succès." 
      });

      navigate('/appels-offres');
    } catch (error) {
      console.error('Error deleting appel offre:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer l'appel d'offres.", 
        variant: "destructive" 
      });
    }
  };


  const viewDocument = async (doc: any) => {
    try {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(doc.path);
      
      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le document.",
        variant: "destructive"
      });
    }
  };

  const downloadDocument = async (doc: any) => {
    try {
      const { data } = await supabase.storage
        .from('documents')
        .download(doc.path);
      
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${appel.title} – Appel d'offres`}</title>
        <meta name="description" content={`Détails de l'appel d'offres: ${appel.title}`} />
        <link rel="canonical" href={`/appels-offres/${id}`} />
      </Helmet>
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Appels d'offres</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Gérez vos appels d'offres</p>
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
                  <BreadcrumbPage>{appel.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Content */}
          <main className="flex-1 px-6 py-4 space-y-6">
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {appel.companyLogo && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={appel.companyLogo} alt={appel.companyName} />
                      <AvatarFallback>{appel.companyName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <h2 className="text-sm font-normal text-foreground">{appel.title}</h2>
                  <div className="h-6">
                    {getStatusBadge(appel.status)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => {
                    navigate("/selection-reseau", { 
                      state: { 
                        appelOffre: {
                          id: appel.id,
                          title: appel.title,
                          sector: appel.sector,
                          location: appel.location || "Toute la France",
                          budget: appel.budget,
                          description: appel.description,
                          cahierDesCharges: appel.cahierDesCharges
                        }
                      }
                    });
                  }}>
                    Ajouter des destinataires
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleVoirDevis}>
                    Voir les devis
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs" 
                    onClick={handleCloturer}
                    disabled={appel.status === 'Terminé'}
                  >
                    {appel.status === 'Terminé' ? 'Clôturé' : 'Clôturer'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive" 
                    onClick={handleSupprimer}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Secteur:</span>
                  <span className="flex items-center gap-2 text-foreground">
                    <SectorIcon className={`w-4 h-4 ${sectorMeta.color}`} />
                    <span>{sectorMeta.label}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2"><Calendar className="h-3 w-3" /><span className="text-muted-foreground">Publication:</span><span className="text-foreground">{appel.startDate}</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-3 w-3" /><span className="text-muted-foreground">Date limite:</span><span className="text-foreground">{appel.endDate}</span></div>
                {appel.location && (
                  <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /><span className="text-muted-foreground">Localisation:</span><span className="text-foreground">{appel.location}</span></div>
                )}
                <div className="flex items-center gap-2"><FileText className="h-3 w-3" /><span className="text-muted-foreground">Devis reçus:</span><span className="text-foreground">{appel.devisCount}</span></div>
                <div className="flex items-center gap-2"><Euro className="h-3 w-3" /><span className="text-muted-foreground">Budget:</span><span className="text-foreground">{appel.budget}</span></div>
                {appel.quantity && (
                  <div className="flex items-center gap-2"><span className="text-muted-foreground">Quantité demandée:</span><span className="text-foreground">{appel.quantity}</span></div>
                )}
              </div>
            </section>
            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-normal text-foreground">Description</h3>
              <div className="text-xs text-muted-foreground whitespace-pre-line">{appel.description || "Aucune description fournie."}</div>
            </section>
            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-normal text-foreground">Cahier des charges</h3>
              <div className="text-xs text-muted-foreground whitespace-pre-line">{appel.cahierDesCharges || "Non renseigné."}</div>
            </section>
            <Separator />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-normal text-foreground">Documents</h3>
              </div>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type} • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewDocument(doc)}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadDocument(doc)}
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Aucun document disponible. Cliquez sur "Générer PDF" pour créer le document de l'appel d'offres.</p>
              )}
            </section>
            <Separator />

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-normal text-foreground mb-2">Type de contrat</h3>
                <p className="text-xs text-foreground">{appel.contractType || "Non défini"}</p>
              </div>
              <div>
                <h3 className="text-sm font-normal text-foreground mb-2">Budget</h3>
                <p className="text-xs text-foreground">{appel.budget}</p>
              </div>
            </section>
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
}