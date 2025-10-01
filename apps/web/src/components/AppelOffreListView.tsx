import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Calendar, Building2, Euro, Globe, Lock, FileText } from "lucide-react";
import { getSectorMeta } from "@/data/secteurs-meta";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
interface AppelOffre {
  id: string;
  titre: string;
  secteur: string;
  budget: string | number;
  dateLimite: string;
  status: string;
  fournisseur?: string;
  visibilite?: string;
  devisCount?: number;
}

interface AppelOffreListViewProps {
  appels: AppelOffre[];
}

export function AppelOffreListView({ appels }: AppelOffreListViewProps) {
  const navigate = useNavigate();
  const getVisibilityIcon = (visibilite?: string) => {
    switch (visibilite) {
      case "publique":
        return <Globe className="h-3 w-3 text-green-500" />;
      case "prive":
        return <Lock className="h-3 w-3 text-orange-500" />;
      default:
        return <Globe className="h-3 w-3 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string, fournisseur?: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-500 text-xs">Actif</Badge>;
      case "brouillon":
        return <Badge className="bg-gray-500/10 text-gray-500 text-xs">Brouillon</Badge>;
      case "terminé":
      case "clôturé":
      case "cloturé":
      case "cloture":
      case "clôture":
        return (
          <div className="flex flex-col items-end gap-1">
            <Badge className="bg-blue-500/10 text-blue-500 text-xs">Terminé</Badge>
            {fournisseur && <span className="text-xs text-muted-foreground">{fournisseur}</span>}
          </div>
        );
      case "annulé":
      case "annule":
        return <Badge className="bg-red-500/10 text-red-500 text-xs">Annulé</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-2">
      {appels.map((appel) => (
        <div
          key={appel.id}
          className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
          onClick={() => navigate(`/appels-offres/${appel.id}`, { state: { appel } })}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1">
              <h3 className="text-sm font-normal">{appel.titre}</h3>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {(() => {
                const sectorMeta = getSectorMeta(appel.secteur);
                const IconComponent = sectorMeta.icon;
                return (
                  <>
                    <IconComponent className={`h-3 w-3 ${sectorMeta.color}`} />
                    <span className={sectorMeta.color}>{sectorMeta.label}</span>
                  </>
                );
              })()}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{appel.visibilite === 'prive' ? 'fermé' : (appel.visibilite || 'publique')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Euro className="h-3 w-3" />
              {appel.budget}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {appel.dateLimite}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              {appel.devisCount || 0} devis
            </div>
            
            {getStatusBadge(appel.status, appel.fournisseur)}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 p-2 bg-card border border-border shadow-lg" align="end">
              <DropdownMenuItem onClick={() => navigate(`/appels-offres/${appel.id}`, { state: { appel } })} className="w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-muted">Voir détails</DropdownMenuItem>
              <DropdownMenuItem className="w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-muted">Modifier</DropdownMenuItem>
              <DropdownMenuItem className="w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-muted">Dupliquer</DropdownMenuItem>
              <DropdownMenuItem className="w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-destructive/10 hover:text-destructive">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}