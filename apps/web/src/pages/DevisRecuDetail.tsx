import React, { useState } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Check, X } from "lucide-react";

import { Link, useLocation, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useDevisActions } from "@/hooks/useDevisActions";

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

interface LineItem {
  description: string;
  unitPrice: number;
  unit: string;
  quantity: number;
}

const items: LineItem[] = [
  { description: "Poste de travail HP ProDesk 600 G6", unitPrice: 850, unit: "pièce", quantity: 10 },
  { description: "Moniteur 24\"", unitPrice: 120, unit: "pièce", quantity: 10 },
  { description: "Installation et configuration", unitPrice: 500, unit: "forfait", quantity: 1 },
];

const format = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export default function DevisRecuDetail() {
  const { id, devisId } = useParams();
  const { state } = useLocation() as { state?: { devis?: any; ao?: any } };
  const { acceptDevis, refuseDevis, selectDevis, loading } = useDevisActions();
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  
  // Use items from devis state if available, otherwise use default
  const devisItems = state?.devis?.items || items;
  const commentaire = state?.devis?.commentaire || "Installation comprise dans le prix. Garantie constructeur 3 ans. Formation utilisateurs incluse (2 sessions de 4h). Maintenance préventive recommandée après 18 mois d'utilisation.";
  
  // Use pre-calculated totals if available, otherwise calculate from items
  const totalHT = state?.devis?.total_ht || devisItems.reduce((sum, it) => sum + (it.unitPrice || it.totalPrice / it.quantity) * it.quantity, 0);
  const tva = state?.devis?.tva || (totalHT * 0.2);
  const totalTTC = state?.devis?.total_ttc || (totalHT + tva);
  const devisRef = state?.devis?.reference || (id && devisId ? `DV-${id}-${devisId}` : undefined);
  const companyName = state?.devis?.company_name || "HexaTech";
  const location = state?.devis?.location || "10 rue de l'Innovation, 75010 Paris";
  
  // Déterminer le statut actuel (local ou depuis les données)
  const currentStatus = localStatus || state?.devis?.status;
  const isRefused = currentStatus === 'Refusé';
  const isSelected = currentStatus === 'Sélectionné';

  const handleRefuseDevis = async () => {
    if (devisId) {
      await refuseDevis(devisId);
      setLocalStatus('Refusé');
    }
  };

  const handleSelectDevis = async () => {
    if (devisId && id && companyName) {
      await selectDevis(devisId, id, companyName);
      setLocalStatus('Sélectionné');
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${(devisRef || "Devis")} – Détail`}</title>
        <meta name="description" content={`Détail du devis ${devisRef || devisId}`} />
        <link rel="canonical" href={`/appels-offres/${id}/devis/${devisId}`} />
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
                  <BreadcrumbLink asChild>
                    <Link to={`/appels-offres/${id}/devis`}>Devis reçus</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{devisRef || "Détail du devis"}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <main className="flex-1 px-6 py-4 space-y-6">
            {/* En-têtes sociétés */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-normal text-foreground">Entreprise émettrice</h3>
                <p className="text-xs text-muted-foreground">{companyName}</p>
                <p className="text-xs text-muted-foreground">{location}</p>
                <p className="text-xs text-muted-foreground">contact@{companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
                <p className="text-xs text-muted-foreground">01 23 45 67 89</p>
              </div>
              <div className="space-y-1 md:text-right">
                <h3 className="text-sm font-normal text-foreground">Information client</h3>
                <p className="text-xs text-muted-foreground">TechCorp</p>
                <p className="text-xs text-muted-foreground">22 avenue des Entrepreneurs, 75008 Paris</p>
                <p className="text-xs text-muted-foreground">achats@techcorp.com</p>
              </div>
            </section>

            <div className="border-b border-border" />

            {/* Section Commentaires */}
            <section className="space-y-2">
              <h3 className="text-sm font-normal text-foreground">Commentaires</h3>
              <div className="bg-muted rounded-md p-3 text-xs whitespace-pre-line text-foreground">
                {commentaire}
              </div>
            </section>

            {/* Tableau des lignes */}
            <section>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Prix unitaire</TableHead>
                    <TableHead className="text-xs">Unité</TableHead>
                    <TableHead className="text-xs">Quantité</TableHead>
                    <TableHead className="text-xs text-right">Montant HT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {devisItems.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">{it.description}</TableCell>
                      <TableCell className="text-xs">{format(it.unitPrice || (it.totalPrice / it.quantity))}</TableCell>
                      <TableCell className="text-xs">{it.unit}</TableCell>
                      <TableCell className="text-xs">{it.quantity}</TableCell>
                      <TableCell className="text-xs text-right">{format(it.totalPrice || (it.unitPrice * it.quantity))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>

            {/* Totaux */}
            <section className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-8 text-xs">
                <span className="text-muted-foreground">Total HT</span>
                <span className="text-foreground">{format(totalHT)}</span>
              </div>
              <div className="flex items-center gap-8 text-xs">
                <span className="text-muted-foreground">TVA (20%)</span>
                <span className="text-foreground">{format(tva)}</span>
              </div>
              <div className="flex items-center gap-8 text-xs">
                <span className="text-muted-foreground">Net à payer</span>
                <span className="text-foreground">{format(totalTTC)}</span>
              </div>
            </section>


            {/* Signature */}
            <section className="space-y-2">
              <h3 className="text-sm font-normal text-foreground">Signature électronique</h3>
              <div className="h-28 border-2 border-dashed border-border rounded-md flex items-center justify-center text-xs text-muted-foreground">
                Espace de signature
              </div>
            </section>

            {/* Buttons */}
            <section className="flex justify-end items-center gap-4 pt-4">
              <button 
                className="h-8 px-3 text-xs text-destructive hover:text-destructive/80 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                disabled={loading || isSelected}
                onClick={handleRefuseDevis}
              >
                <X className="h-3 w-3" />
                Refuser ce devis
              </button>
              <button 
                className={`h-8 px-3 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                  isSelected 
                    ? "text-green-600" 
                    : isRefused 
                      ? "text-muted-foreground cursor-not-allowed" 
                      : "text-green-600 hover:text-green-700"
                }`}
                disabled={loading || isRefused || isSelected}
                onClick={handleSelectDevis}
              >
                <Check className="h-3 w-3" />
                {isSelected ? "Devis sélectionné" : "Sélectionner ce devis"}
              </button>
            </section>

            {/* Infos entreprises */}
            <section className="space-y-1">
              <h3 className="text-sm font-normal text-foreground">Informations générales de l'entreprise émettrice</h3>
              <p className="text-xs text-muted-foreground">SIRET 123 456 789 00010 • RCS Paris • IBAN FR76 3000 6000 0112 3456 7890 189 • BIC BDFEFRPPXXX</p>
            </section>
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
}
