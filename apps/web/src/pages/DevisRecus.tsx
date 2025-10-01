import React, { useEffect, useState } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Eye, Check, X } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatEUR } from "@/lib/utils";

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

interface DevisItem {
  id: number;
  company: string;
  priceTotal: string;
  sentAt: string;
  paymentTerms: string;
  deliveryDelay: string;
  commentaire: string;
  items?: Array<{
    description: string;
    unitPrice: number;
    unit: string;
    quantity: number;
  }>;
}


export default function DevisRecus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { ao?: any } };
  
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [seedTried, setSeedTried] = useState(false);

  const aoId = id;
  const aoTitle = (state?.ao as any)?.title || `Appel d'offres #${id}`;
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/appels-offres/${id}/devis` : `/appels-offres/${id}/devis`;

  // Liste des devis pour ce marché
  const devisForAo = list;

  useEffect(() => {
    if (!aoId || !user) { setList([]); setLoadingList(false); return; }

    const load = async () => {
      try {
        setLoadingList(true);
        const { data, error } = await supabase
          .from('devis')
          .select('*')
          .eq('marche_id', aoId)
          .eq('sent_to', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];
        setList(rows);
        return rows;
      } catch (err) {
        console.error('[DevisRecus] fetch error', err);
        setList([]);
        return [] as any[];
      } finally {
        setLoadingList(false);
      }
    };

    const run = async () => {
      const first = await load();
      const empty = first.length === 0 || first.every((d: any) => !d.items || d.items.length === 0);
      if (!seedTried && empty) {
        setSeedTried(true);
        try {
          const { data, error } = await supabase.functions.invoke('seed-devis', { body: { marcheId: aoId, userId: user.id } });
          console.log('[DevisRecus] seed response', { error, data });
          await load();
        } catch (e) {
          console.error('[DevisRecus] seed error', e);
        }
      }
    };

    run();

    // Set up realtime subscription for devis changes
    const channel = supabase
      .channel('devis-changes-for-ao')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devis',
          filter: `marche_id=eq.${aoId}`
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [aoId, user, seedTried]);


  const openDetail = (d: any) => {
    navigate(`/appels-offres/${id}/devis/${d.id}`, { state: { devis: d, ao: state?.ao } });
  };


  return (
    <>
      <Helmet>
        <title>{`${aoTitle} – Devis reçus`}</title>
        <meta name="description" content={`Liste des devis reçus pour l'appel d'offres ${aoTitle}`} />
        <link rel="canonical" href={canonicalUrl} />
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
                  <BreadcrumbPage>Devis reçus</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <main className="flex-1 px-6 py-4 space-y-4">

            {loadingList ? (
              <div className="flex justify-center py-8">
                <div className="text-sm text-muted-foreground">Chargement des devis...</div>
              </div>
            ) : devisForAo.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="text-sm text-muted-foreground">Aucun devis reçu pour cet appel d'offres</div>
              </div>
            ) : (
              <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="text-xs">Statut</TableHead>
                     <TableHead className="text-xs">Entreprise</TableHead>
                     <TableHead className="text-xs">Prix total</TableHead>
                     <TableHead className="text-xs">Date de création</TableHead>
                     <TableHead className="text-xs">Commentaire</TableHead>
                     <TableHead className="text-xs text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                   {devisForAo.map((d: any) => (
                     <TableRow key={d.id} className="hover:bg-accent/50">
                       <TableCell className="text-xs">
                         <div className="flex items-center gap-2">
                           {d.status === 'Accepté' && <Check className="h-4 w-4 text-green-600" />}
                           {d.status === 'Refusé' && <X className="h-4 w-4 text-red-600" />}
                           {d.status === 'Sélectionné' && <Check className="h-4 w-4 text-green-600" />}
                           <span className={`
                             ${d.status === 'Accepté' ? 'text-green-700' : ''}
                             ${d.status === 'Refusé' ? 'text-red-700' : ''}
                             ${d.status === 'Sélectionné' ? 'text-green-700' : ''}
                           `}>
                             {d.status || 'Envoyé'}
                           </span>
                         </div>
                       </TableCell>
                       <TableCell className="text-xs">{d.company_name || 'Non spécifié'}</TableCell>
                       <TableCell className="text-xs">{d.total_ttc != null ? formatEUR(Number(d.total_ttc)) : 'Non spécifié'}</TableCell>
                       <TableCell className="text-xs">{d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '-'}</TableCell>
                       <TableCell className="text-xs max-w-[200px] truncate">{d.commentaire || '-'}</TableCell>
                       <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                           <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openDetail(d)}>
                             <Eye className="h-3.5 w-3.5 mr-1" /> Voir le devis
                           </Button>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                </TableBody>
              </Table>
            )}
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
}