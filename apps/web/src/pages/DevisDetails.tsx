import React from 'react';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Edit, Archive, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

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

interface Devis {
  id: number;
  numero: string;
  offreTitle: string;
  client: string;
  secteur: string;
  montant: string;
  dateEnvoi: string;
  dateExpiration: string;
  status: string;
  commentaire: string;
  items?: LineItem[];
  totalHT?: number;
  tva?: number;
  totalTTC?: number;
}

const format = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export default function DevisDetails() {
  const { id } = useParams();
  const { state } = useLocation() as { state?: { devis?: Devis } };
  const devis = state?.devis;

  if (!devis) {
    return <div>Devis non trouvé</div>;
  }

  // Generate default items if not provided
  const defaultItems: LineItem[] = [
    { description: "Prestation principale", unitPrice: Math.round((parseFloat(devis.montant.replace(/[^\d,]/g, '').replace(',', '.')) || 10000) * 0.6 / 1.2), unit: "forfait", quantity: 1 },
    { description: "Prestation secondaire", unitPrice: Math.round((parseFloat(devis.montant.replace(/[^\d,]/g, '').replace(',', '.')) || 10000) * 0.3 / 1.2), unit: "forfait", quantity: 1 },
    { description: "Options", unitPrice: Math.round((parseFloat(devis.montant.replace(/[^\d,]/g, '').replace(',', '.')) || 10000) * 0.1 / 1.2), unit: "forfait", quantity: 1 },
  ];

  const devisItems = devis.items || defaultItems;
  const totalHT = devis.totalHT || devisItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tva = devis.tva || totalHT * 0.2;
  const totalTTC = devis.totalTTC || totalHT + tva;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "en attente":
        return <Badge className="bg-yellow-500/10 text-yellow-500">En attente</Badge>;
      case "accepté":
        return <Badge className="bg-green-500/10 text-green-500">Accepté</Badge>;
      case "refusé":
        return <Badge className="bg-red-500/10 text-red-500">Refusé</Badge>;
      case "brouillon":
        return <Badge className="bg-gray-500/10 text-gray-500">Brouillon</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${devis.offreTitle} – Détail du devis`}</title>
        <meta name="description" content={`Détail du devis ${devis.numero} pour ${devis.offreTitle}`} />
        <link rel="canonical" href={`/devis/${id}`} />
      </Helmet>
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Devis</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Détail du devis</p>
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <div className="px-6 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink>Devis</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{devis.numero}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <main className="flex-1 px-6 py-4 space-y-6">
            {/* En-tête du devis */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{devis.offreTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">Référence: {devis.numero}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(devis.status)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Archive className="mr-2 h-4 w-4" />
                Archiver
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Trash2 className="mr-2 h-4 w-4" />
                Retirer
              </Button>
            </div>

            {/* En-têtes sociétés */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-normal text-foreground">Entreprise émettrice</h3>
                <p className="text-xs text-muted-foreground">Notre Entreprise</p>
                <p className="text-xs text-muted-foreground">123 rue de l'Innovation, 75001 Paris</p>
                <p className="text-xs text-muted-foreground">contact@notreentreprise.com</p>
                <p className="text-xs text-muted-foreground">01 23 45 67 89</p>
              </div>
              <div className="space-y-1 md:text-right">
                <h3 className="text-sm font-normal text-foreground">Information client</h3>
                <p className="text-xs text-muted-foreground">{devis.client}</p>
                <p className="text-xs text-muted-foreground">Adresse du client</p>
                <p className="text-xs text-muted-foreground">contact@{devis.client.toLowerCase().replace(/\s+/g, '')}.com</p>
              </div>
            </section>

            <div className="border-b border-border" />

            {/* Section Commentaires */}
            <section className="space-y-2">
              <h3 className="text-sm font-normal text-foreground">Commentaires</h3>
              <div className="bg-muted rounded-md p-3 text-xs whitespace-pre-line text-foreground">
                {devis.commentaire}
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
                  {devisItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs">{item.description}</TableCell>
                      <TableCell className="text-xs">{format(item.unitPrice)}</TableCell>
                      <TableCell className="text-xs">{item.unit}</TableCell>
                      <TableCell className="text-xs">{item.quantity}</TableCell>
                      <TableCell className="text-xs text-right">{format(item.unitPrice * item.quantity)}</TableCell>
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