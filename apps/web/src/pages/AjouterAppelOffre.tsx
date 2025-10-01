import React, { useState } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Factory, Building2, Laptop, Leaf, Truck, Heart, ShoppingBag, BookOpen, Building, Scale, Wrench, Users, TreePine, ChefHat, Palette, Calendar, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { departementsFR } from "@/data/constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

const AjouterAppelOffre = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    typeAchat: "",
    secteur: "",
    description: "",
    cahierDesCharges: "",
    quantite: "",
    localisation: "",
    budgetEstime: "",
    typeContrat: "",
    visibilite: "publique",
    dateLimite: "",
    criteres: "",
    delaisExecution: "",
    document: null as File | null
  });


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatBudget = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue === '') return '';
    return new Intl.NumberFormat('fr-FR').format(parseInt(numericValue));
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatBudget(e.target.value);
    setFormData(prev => ({ ...prev, budgetEstime: formattedValue }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, document: file }));
  };

  const createMarche = async (status: 'Actif' | 'Brouillon') => {
    if (!user) {
      toast.error("Vous devez être connecté pour créer un appel d'offres");
      return null;
    }

    if (!formData.titre.trim()) {
      toast.error("Le titre est obligatoire");
      return null;
    }

    try {
      setLoading(true);

      // Parse evaluation criteria into array
      const evaluationCriteriaArray = formData.criteres
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());

      // Add execution deadlines to cahier des charges
      let fullCahier = formData.cahierDesCharges;
      if (formData.delaisExecution) {
        fullCahier += `\n\n5 Délais d'exécution\n\n${formData.delaisExecution}`;
      }

      // Create the marche
      const { data: marche, error } = await supabase
        .from('marches')
        .insert({
          title: formData.titre,
          sector: formData.secteur || null,
          description: formData.description || null,
          cahier_des_charges: fullCahier || null,
          quantity: formData.quantite || null,
          location: formData.localisation || null,
          budget: formData.budgetEstime || null,
          contract_type: formData.typeContrat || null,
          visibility: formData.visibilite,
          status: status,
          end_date: formData.dateLimite || null,
          created_by: user.id,
          company_name: null, // Will be filled from profile if needed
          evaluation_criteria: evaluationCriteriaArray
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Marche created:', marche);

      // If publishing, generate PDF and create notification
      if (status === 'Actif') {
        try {
          // Generate PDF
          const { error: pdfError } = await supabase.functions.invoke('generate-ao-pdf', {
            body: { marcheId: marche.id }
          });

          if (pdfError) {
            console.error('PDF generation failed:', pdfError);
            // Don't fail the whole process, just log the error
          }

          // Create notification
          const { error: notifError } = await supabase.functions.invoke('create-notification', {
            body: {
              userId: user.id,
              type: 'success',
              title: 'Appel d\'offres publié',
              message: `Votre appel d'offres "${formData.titre}" a été publié avec succès.`
            }
          });

          if (notifError) {
            console.error('Notification creation failed:', notifError);
            // Don't fail the whole process, just log the error
          }
        } catch (funcError) {
          console.error('Edge function error:', funcError);
          // Continue despite edge function failures
        }
      }

      return marche;
    } catch (error) {
      console.error('Error creating marche:', error);
      toast.error("Erreur lors de la création de l'appel d'offres");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePublier = async () => {
    const marche = await createMarche('Actif');
    if (marche) {
      toast.success("Appel d'offres publié avec succès !");
      // Navigate to the supplier selection page (same as "ajouter des destinataires")
      navigate('/selection-reseau', {
        state: {
          appelOffre: {
            id: marche.id,
            title: marche.title,
            sector: marche.sector,
            location: marche.location || "Toute la France",
            budget: marche.budget,
            description: marche.description,
            cahierDesCharges: marche.cahier_des_charges
          }
        }
      });
    }
  };

  const handleSauvegarder = async () => {
    const marche = await createMarche('Brouillon');
    if (marche) {
      toast.success("Appel d'offres sauvegardé en brouillon");
      navigate('/appels-offres');
    }
  };

  return (
    <AppShellWithVar>
      <EverlakeSidebar />
      
      <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Ajouter un appel d'offres</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Créez un nouvel appel d'offres pour vos besoins d'achat</p>
              </div>
            </div>
            
          </header>
      
          <main className="flex-1 p-6">
            <div className="w-full">
          
          <section className="mb-6">
            <Helmet>
              <title>Ajouter un appel d'offres</title>
              <meta name="description" content="Créez un nouvel appel d'offres: titre, secteur, budget et échéances." />
              <link rel="canonical" href="/ajouter-appel-offre" />
            </Helmet>
            <h2 className="text-sm font-normal text-foreground">Nouvel appel d'offres</h2>
            <p className="text-xs text-muted-foreground">Remplissez le formulaire ci-dessous</p>
          </section>

          <div className="space-y-6">
            {/* Titre de l'appel d'offre */}
            <div className="space-y-1.5">
              <label htmlFor="titre" className="text-xs text-muted-foreground">Titre de l'appel d'offres</label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => handleInputChange("titre", e.target.value)}
                placeholder="Entrez le titre de votre appel d'offres"
                className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm placeholder:text-muted-foreground"
              />
            </div>

            {/* Type d'achat */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Type d'achat</label>
              <Select value={formData.typeAchat} onValueChange={(value) => handleInputChange("typeAchat", value)}>
                <SelectTrigger className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm">
                  <SelectValue placeholder="Sélectionner le type d'achat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produits">Produits</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="produits-et-services">Produits et services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Secteur */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Secteur</label>
              <Select value={formData.secteur} onValueChange={(value) => handleInputChange("secteur", value)}>
                <SelectTrigger className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm">
                  <SelectValue placeholder="Sélectionner le secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="industrie-fabrication">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-orange-500" />
                      Industrie et fabrication
                    </div>
                  </SelectItem>
                  <SelectItem value="btp-construction">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-amber-600" />
                      BTP et construction
                    </div>
                  </SelectItem>
                  <SelectItem value="informatique-numerique">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-blue-500" />
                      Informatique et numérique
                    </div>
                  </SelectItem>
                  <SelectItem value="energie-environnement">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      Énergie et environnement
                    </div>
                  </SelectItem>
                  <SelectItem value="transport-logistique">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-purple-500" />
                      Transport, logistique et mobilité
                    </div>
                  </SelectItem>
                  <SelectItem value="sante-medico-social">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Santé et médico-social
                    </div>
                  </SelectItem>
                  <SelectItem value="commerce-distribution">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-pink-500" />
                      Commerce et distribution
                    </div>
                  </SelectItem>
                  <SelectItem value="conseil-audit-formation">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      Conseil, audit et formation
                    </div>
                  </SelectItem>
                  <SelectItem value="architecture-ingenierie">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-500" />
                      Architecture, ingénierie et études techniques
                    </div>
                  </SelectItem>
                  <SelectItem value="juridique">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-indigo-600" />
                      Juridique
                    </div>
                  </SelectItem>
                  <SelectItem value="finance-assurance">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      Finance et assurance
                    </div>
                  </SelectItem>
                  <SelectItem value="services-generaux">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-gray-500" />
                      Services généraux et facility management
                    </div>
                  </SelectItem>
                  <SelectItem value="education-rh">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-teal-500" />
                      Éducation, RH et formation
                    </div>
                  </SelectItem>
                  <SelectItem value="agriculture-ressources">
                    <div className="flex items-center gap-2">
                      <TreePine className="h-4 w-4 text-emerald-600" />
                      Agriculture et gestion des ressources naturelles
                    </div>
                  </SelectItem>
                  <SelectItem value="hotellerie-restauration">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-orange-400" />
                      Hôtellerie, restauration et tourisme d'affaires
                    </div>
                  </SelectItem>
                  <SelectItem value="culture-medias">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-violet-500" />
                      Culture, médias et industries créatives
                    </div>
                  </SelectItem>
                  <SelectItem value="evenementiel">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-cyan-500" />
                      Événementiel professionnel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs text-muted-foreground">Description</label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-[120px] bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm placeholder:text-muted-foreground"
                placeholder="Décrivez en détail votre appel d'offres..."
              />
            </div>

            {/* Cahier des charges */}
            <div className="space-y-1.5">
              <label htmlFor="cahierDesCharges" className="text-xs text-muted-foreground">Cahier des charges</label>
              <Textarea
                id="cahierDesCharges"
                value={formData.cahierDesCharges}
                onChange={(e) => handleInputChange("cahierDesCharges", e.target.value)}
                className="min-h-[120px] bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm placeholder:text-muted-foreground"
                placeholder="Spécifications techniques et exigences détaillées..."
              />
            </div>

            {/* Délais d'exécution */}
            <div className="space-y-1.5">
              <label htmlFor="delaisExecution" className="text-xs text-muted-foreground">Délais d'exécution</label>
              <Input
                id="delaisExecution"
                value={formData.delaisExecution}
                onChange={(e) => handleInputChange("delaisExecution", e.target.value)}
                placeholder="Ex: 12 semaines à compter de la signature"
                className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm placeholder:text-muted-foreground"
              />
            </div>

            {/* Critères d'évaluation */}
            <div className="space-y-1.5">
              <label htmlFor="criteres" className="text-xs text-muted-foreground">Critère(s) d'évaluation</label>
              <Textarea
                id="criteres"
                value={formData.criteres}
                onChange={(e) => handleInputChange("criteres", e.target.value)}
                className="min-h-[80px] bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm placeholder:text-muted-foreground"
                placeholder="Prix (40%)&#10;Qualité technique (30%)&#10;Délais (20%)&#10;Maintenance (10%)"
              />
            </div>

            {/* Localisation */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Localisation</label>
              <Select value={formData.localisation} onValueChange={(value) => handleInputChange("localisation", value)}>
                <SelectTrigger className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departementsFR.map((dep) => (
                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget estimé et Type de contrat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="budget" className="text-xs text-muted-foreground">Budget estimé</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                  <Input
                    id="budget"
                    value={formData.budgetEstime}
                    onChange={handleBudgetChange}
                    className="pl-6 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm placeholder:text-muted-foreground"
                    placeholder="Ex: 50 000"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Type de contrat</label>
                <Select value={formData.typeContrat} onValueChange={(value) => handleInputChange("typeContrat", value)}>
                  <SelectTrigger className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm">
                    <SelectValue placeholder="Sélectionner le type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achat-ponctuel">Contrat d'achat ponctuel</SelectItem>
                    <SelectItem value="cadre-approvisionnement">Contrat-cadre d'approvisionnement</SelectItem>
                    <SelectItem value="consignation">Contrat de consignation</SelectItem>
                    <SelectItem value="fourniture-demande">Contrat de fourniture à la demande</SelectItem>
                    <SelectItem value="location-option-achat">Contrat de location avec option d'achat</SelectItem>
                    <SelectItem value="prestation-services">Contrat de prestation de services</SelectItem>
                    <SelectItem value="sous-traitance">Contrat de sous-traitance</SelectItem>
                    <SelectItem value="maintenance-support">Contrat de maintenance / support technique</SelectItem>
                    <SelectItem value="assistance-consulting">Contrat d'assistance / consulting</SelectItem>
                    <SelectItem value="formation-accompagnement">Contrat de formation / accompagnement</SelectItem>
                    <SelectItem value="projet-cle-main">Contrat de projet clé en main</SelectItem>
                    <SelectItem value="conception-realisation">Contrat de conception-réalisation</SelectItem>
                    <SelectItem value="mixte-produits-services">Contrat mixte (produits + services)</SelectItem>
                    <SelectItem value="abonnement">Contrat d'abonnement</SelectItem>
                    <SelectItem value="integration-developpement">Contrat d'intégration / développement spécifique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            {/* Date limite de réponse */}
            <div className="space-y-1.5">
              <label htmlFor="dateLimite" className="text-xs text-muted-foreground">Date limite de candidature</label>
              <Input
                id="dateLimite"
                type="date"
                value={formData.dateLimite}
                onChange={(e) => handleInputChange("dateLimite", e.target.value)}
                className="w-full md:w-1/2 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:outline-none focus:border-foreground text-sm"
              />
            </div>


            {/* Document */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Documents</label>
              <div className="bg-background/50 rounded-md p-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-muted/50 rounded-full">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Glissez-déposez vos fichiers ici ou</p>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Parcourir les fichiers
                        </span>
                      </Button>
                      <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="*" />
                    </Label>
                  </div>
                  {formData.document && (
                    <p className="text-sm text-foreground font-medium">Fichier sélectionné: {formData.document.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSauvegarder}
                disabled={loading}
                className="h-8 px-3 text-xs"
              >
                {loading ? "Sauvegarde..." : "Sauvegarder en brouillon"}
              </Button>
              <Button 
                size="sm"
                onClick={handlePublier}
                disabled={loading}
                className="h-8 px-3 text-xs"
              >
                {loading ? "Publication..." : "Publier"}
              </Button>
            </div>
          </div>
            </div>
          </main>
        </div>
      </AppShellWithVar>
  );
};

export default AjouterAppelOffre;