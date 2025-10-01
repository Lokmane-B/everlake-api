import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { secteursEntreprises, departementsFR } from '@/data/constants';
import { getSectorMeta } from '@/data/secteurs-meta';

const contactSchema = z.object({
  company_name: z.string().min(1, 'Le nom de l\'entreprise est obligatoire'),
  email: z.string().email('Adresse email invalide'),
  sector: z.string().min(1, 'Le secteur est obligatoire'),
  phone: z.string().optional(),
  location: z.string().optional(),
  contact_person: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface AddContactFormProps {
  onContactAdded?: () => void;
}

export function AddContactForm({ onContactAdded }: AddContactFormProps) {
  const [open, setOpen] = useState(false);
  const [existingCompanies, setExistingCompanies] = useState<string[]>([]);
  const [matchedCompany, setMatchedCompany] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      company_name: '',
      email: '',
      sector: '',
      phone: '',
      location: '',
      contact_person: '',
      notes: '',
    },
  });

  const checkExistingCompany = async (companyName: string) => {
    if (!companyName || companyName.length < 3) {
      setExistingCompanies([]);
      setMatchedCompany(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('company_name')
        .ilike('company_name', `%${companyName}%`)
        .limit(5);

      if (error) throw error;

      const companies = data?.map(c => c.company_name).filter(Boolean) as string[] || [];
      setExistingCompanies(companies);
      
      // Check for exact match
      const exactMatch = companies.find(c => 
        c.toLowerCase() === companyName.toLowerCase()
      );
      setMatchedCompany(exactMatch || null);
    } catch (error) {
      console.error('Error checking existing companies:', error);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          company_name: data.company_name,
          email: data.email,
          sector: data.sector,
          phone: data.phone || null,
          location: data.location || null,
          contact_person: data.contact_person || null,
          notes: data.notes || null,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Contact ajouté",
        description: `${data.company_name} a été ajouté à votre carnet de contacts.`,
      });

      form.reset();
      setOpen(false);
      setMatchedCompany(null);
      setExistingCompanies([]);
      onContactAdded?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le contact",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <Plus className="h-3 w-3 mr-1.5 text-muted-foreground" />
          <span className="text-foreground">Nouveau contact</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-main-background">
        <SheetHeader>
          <SheetTitle className="text-sm font-normal text-foreground">Ajouter un contact</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Ajoutez un nouveau fournisseur à votre carnet de contacts.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Nom de l'entreprise *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="Ex: ACME Construction"
                      className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground"
                      onChange={(e) => {
                        field.onChange(e);
                        checkExistingCompany(e.target.value);
                      }}
                    />
                  </FormControl>
                  {matchedCompany && (
                    <div className="flex items-center gap-2 text-amber-600 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      Cette entreprise existe déjà dans votre carnet
                    </div>
                  )}
                  {existingCompanies.length > 0 && !matchedCompany && (
                    <div className="text-xs text-muted-foreground">
                      Entreprises similaires : {existingCompanies.join(', ')}
                    </div>
                  )}
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="contact@entreprise.com" className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Secteur *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground">
                        <SelectValue placeholder="Sélectionner le secteur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-50 bg-background border border-border max-h-64">
                      {secteursEntreprises.map((secteur) => {
                        const sectorMeta = getSectorMeta(secteur);
                        const IconComponent = sectorMeta.icon;
                        return (
                          <SelectItem key={secteur} value={secteur} className="text-sm">
                            <div className="flex items-center gap-2">
                              <IconComponent className={`h-3 w-3 ${sectorMeta.color}`} />
                              <span>{secteur}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Personne de contact</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Jean Dupont" className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Téléphone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="01 23 45 67 89" className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Localisation</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground">
                        <SelectValue placeholder="Sélectionner le département" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-50 bg-background border border-border max-h-64">
                      {departementsFR.map((dept) => (
                        <SelectItem key={dept} value={dept} className="text-sm">
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Informations complémentaires..."
                      rows={3}
                      className="min-h-[80px] px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 h-8 text-xs"
                size="sm"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 h-8 text-xs"
                size="sm"
              >
                {isSubmitting ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}