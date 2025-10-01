import React, { useState, useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Paperclip } from "lucide-react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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

interface LineItem {
  description: string;
  unitPrice: number;
  unit: string;
  quantity: number;
}

const format = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export default function MarcheEnvoyerDevis() {
  const { id } = useParams();
  const { state } = useLocation() as { state?: { marche?: any } };
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [items, setItems] = useState<LineItem[]>([
    { description: "", unitPrice: 0, unit: "pièce", quantity: 1 }
  ]);
  const [commentaire, setCommentaire] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const marche = state?.marche;
  
  const totalHT = items.reduce((sum, it) => sum + (it.unitPrice || 0) * (it.quantity || 0), 0);
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;

  const addLine = () => {
    setItems([...items, { description: "", unitPrice: 0, unit: "pièce", quantity: 1 }]);
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleEnvoyerDevis = () => {
    toast({
      title: "Devis en préparation",
      description: "Votre devis sera bientôt envoyé via la plateforme."
    });

    navigate("/devis");
  };

  const handleCancel = () => {
    navigate(`/marches/${id}`);
  };

  return (
    <>
      <Helmet>
        <title>{`${marche?.title || "Marché"} – Envoyer un devis`}</title>
        <meta name="description" content={`Composer un devis pour ${marche?.title || "le marché"}`} />
        <link rel="canonical" href={`/marches/${id}/devis`} />
      </Helmet>
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Recherche de marchés</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Trouvez et répondez aux appels d'offres</p>
              </div>
            </div>
          </header>

          <div className="px-6 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/rechercher-marches">Recherche de marchés</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/marches/${id}`}>{marche?.title || "Marché"}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Envoyer un devis</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <main className="flex-1 px-6 py-4 space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-normal text-foreground">Entreprise émettrice</h3>
                <p className="text-xs text-muted-foreground">HexaTech Solutions</p>
                <p className="text-xs text-muted-foreground">15 rue de l'Innovation, 75011 Paris</p>
                <p className="text-xs text-muted-foreground">contact@hexatech-solutions.com</p>
                <p className="text-xs text-muted-foreground">01 23 45 67 89</p>
              </div>
              <div className="space-y-1 md:text-right">
                <h3 className="text-sm font-normal text-foreground">Information client</h3>
                <p className="text-xs text-muted-foreground">{marche?.companyName || "Client"}</p>
                <p className="text-xs text-muted-foreground">{marche?.location || "Adresse non renseignée"}</p>
                <p className="text-xs text-muted-foreground">contact@client.com</p>
              </div>
            </section>

            <div className="border-b border-border" />

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-normal text-foreground">Commentaires</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="attachment-upload"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setAttachments(prev => [...prev, ...files]);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('attachment-upload')?.click()}
                    className="text-xs gap-1"
                    title="Ajouter des documents"
                  >
                    <Paperclip className="w-4 h-4" />
                    Joindre un document
                  </Button>
                </div>
              </div>
              <Textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="text-sm bg-muted border-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                placeholder="Informations complémentaires, conditions particulières, délais, etc."
                rows={3}
              />
              {attachments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pièces jointes ({attachments.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                        <Paperclip className="w-3 h-3" />
                        {file.name}
                        <button
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={addLine}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Ajouter une ligne
              </Button>
            </section>

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
                  {items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs p-2">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="bg-transparent border-0 focus:ring-0 text-xs p-1 h-auto"
                          placeholder="Description du produit/service"
                        />
                      </TableCell>
                      <TableCell className="text-xs p-2">
                        <Input
                          type="number"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="bg-transparent border-0 focus:ring-0 text-xs p-1 h-auto"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-xs p-2">
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                          className="bg-transparent border-0 focus:ring-0 text-xs p-1 h-auto"
                          placeholder="unité"
                        />
                      </TableCell>
                      <TableCell className="text-xs p-2">
                        <Input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="bg-transparent border-0 focus:ring-0 text-xs p-1 h-auto"
                          placeholder="1"
                        />
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {format((item.unitPrice || 0) * (item.quantity || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>

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

            <section className="space-y-2">
              <h3 className="text-sm font-normal text-foreground">Signature électronique</h3>
              <div className="h-28 border-2 border-dashed border-border rounded-md flex items-center justify-center text-xs text-muted-foreground">
                Espace de signature
              </div>
            </section>

            <section className="space-y-1">
              <h3 className="text-sm font-normal text-foreground">Informations générales de l'entreprise émettrice</h3>
              <p className="text-xs text-muted-foreground">SIRET 987 654 321 00015 • RCS Paris • IBAN FR76 3000 6000 0112 3456 7890 189 • BIC BDFEFRPPXXX</p>
            </section>

            <section className="flex justify-end gap-4 pt-4">
              <Button variant="ghost" onClick={handleCancel}>
                Annuler
              </Button>
              <Button onClick={handleEnvoyerDevis}>
                Envoyer le devis
              </Button>
            </section>
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
}