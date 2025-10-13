import React, { useState, useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { FileText, Calendar, Euro, File, MapPin, Eye, Download } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";
import { getStatusBadge } from "@/data/status";
import { getSectorMeta } from "@/data/secteurs-meta";
import { useAuth } from "@/hooks/useAuth";

const AppShellWithVar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useSidebar();
  const headerHeight = state === "collapsed" ? "48px" : "60px";
  return (
    <div
      className="min-h-screen flex w-full bg-main-background relative"
      style={{ ["--app-header-height" as any]: headerHeight }}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[var(--app-header-height)] h-px bg-sidebar-border z-20"
      />
    </div>
  );
};

interface AppelOffre {
  id: number | string;
  title: string;
  sector: string;
  budget?: string | number | null;
  startDate: string;
  endDate: string;
  devisCount: number;
  visibility: "publique" | "privee";
  status: string;
  quantity?: string;
  description?: string;
  cahierDesCharges?: string;
  documents?: { name: string; type?: string; createdAt?: string; url?: string }[];
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
  const [documents, setDocuments] = useState<AppelOffre["documents"]>([]);
  const { toast } = useToast();

  // Charge les détails depuis le backend Spring
  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/rfqs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erreur lors du chargement du RFQ");
        const data = await res.json();

        setAppel({
          id: data.id,
          title: data.title ?? "Sans titre",
          sector: data.sector ?? "Non défini",
          budget: data.budget ?? "Non défini",
          startDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString("fr-FR") : "—",
          endDate: data.end_date ? new Date(data.end_date).toLocaleDateString("fr-FR") : "—",
          devisCount: data.devisCount ?? 0,
          status: data.status ?? "Actif",
          description: data.description ?? "",
          cahierDesCharges: data.cahierDesCharges ?? "",
          location: data.location ?? "Non définie",
          visibility: (data.visibility as "publique" | "privee") ?? "publique",
          contractType: data.contractType ?? "Non défini",
          quantity: data.quantity ?? "Non défini",
          evaluationCriteria: Array.isArray(data.evaluationCriteria) ? data.evaluationCriteria : [],
          attributaire_company_name: data.attributaire_company_name ?? null,
          documents: Array.isArray(data.documents) ? data.documents : []
        });

        setDocuments(Array.isArray(data.documents) ? data.documents : []);
      } catch (e) {
        console.error(e);
        setAppel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleVoirDevis = () =>
    navigate(`/appels-offres/${id}/devis`, { state: { ao: appel } });

  // PATCH status = Terminé (prévois l’endpoint côté backend)
  const handleCloturer = async () => {
    if (!appel) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/rfqs/${appel.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Terminé" })
      });
      if (!res.ok) throw new Error();
      setAppel(prev => (prev ? { ...prev, status: "Terminé" } : prev));
      toast({ title: "Demande de devis clôturée", description: "La demande a été clôturée." });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de clôturer la demande de devis.",
        variant: "destructive"
      });
    }
  };

  // DELETE RFQ (prévois l’endpoint côté backend)
  const handleSupprimer = async () => {
    if (!appel) return;
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la demande de devis "${appel.title}" ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/rfqs/${appel.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      toast({ title: "Demande de devis supprimée", description: "Suppression réussie." });
      navigate("/appels-offres");
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la demande de devis.",
        variant: "destructive"
      });
    }
  };

  // Placeholders pour la gestion de documents (à brancher sur ton stockage plus tard)
  const viewDocument = async (doc: any) => {
    if (doc?.url) return window.open(doc.url, "_blank");
    toast({
      title: "Non disponible",
      description: "Visualisation de documents non configurée.",
      variant: "destructive"
    });
  };

  const downloadDocument = async (doc: any) => {
    if (doc?.url) return window.open(doc.url, "_blank");
    toast({
      title: "Non disponible",
      description: "Téléchargement de documents non configuré.",
      variant: "destructive"
    });
  };

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
            <h2 className="text-lg font-semibold mb-2">Demande de devis non trouvée</h2>
            <Button onClick={() => navigate("/appels-offres")}>Retour aux demandes de devis</Button>
          </div>
        </div>
      </AppShellWithVar>
    );
  }

  const sectorMeta = getSectorMeta(appel.sector);
  const SectorIcon = sectorMeta.icon;

  return (
    <>
      <Helmet>
        <title>{`${appel.title} – Demande de devis`}</title>
        <meta name="description" content={`Détails de la demande de devis: ${appel.title}`} />
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
                <h1 className="text-sm font-normal text-foreground">Demandes de devis</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Gérez vos demandes de devis</p>
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <div className="px-6 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/appels-offres">Demandes de devis</Link>
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
                  <div className="h-6">{getStatusBadge(appel.status)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
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
                    }}
                  >
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
                    disabled={appel.status === "Terminé"}
                  >
                    {appel.status === "Terminé" ? "Clôturé" : "Clôturer"}
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
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span className="text-muted-foreground">Publication:</span>
                  <span className="text-foreground">{appel.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span className="text-muted-foreground">Date limite:</span>
                  <span className="text-foreground">{appel.endDate}</span>
                </div>
                {appel.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span className="text-muted-foreground">Localisation:</span>
                    <span className="text-foreground">{appel.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  <span className="text-muted-foreground">Devis reçus:</span>
                  <span className="text-foreground">{appel.devisCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="h-3 w-3" />
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="text-foreground">{String(appel.budget)}</span>
                </div>
                {appel.quantity && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Quantité demandée:</span>
                    <span className="text-foreground">{appel.quantity}</span>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-normal text-foreground">Description</h3>
              <div className="text-xs text-muted-foreground whitespace-pre-line">
                {appel.description || "Aucune description fournie."}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="text-sm font-normal text-foreground">Cahier des charges</h3>
              <div className="text-xs text-muted-foreground whitespace-pre-line">
                {appel.cahierDesCharges || "Non renseigné."}
              </div>
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
                            {doc.type} •{" "}
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("fr-FR") : "Date inconnue"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => viewDocument(doc)} className="h-6 w-6 p-0">
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
                <p className="text-xs text-muted-foreground">
                  Aucun document disponible. (À brancher quand tu auras un stockage fichiers.)
                </p>
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
                <p className="text-xs text-foreground">{String(appel.budget)}</p>
              </div>
            </section>
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
}
