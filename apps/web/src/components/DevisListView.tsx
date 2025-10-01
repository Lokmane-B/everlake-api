import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, FileText, Download, Copy, Trash2, Building2, Euro, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { getSectorMeta } from "@/data/secteurs-meta";

interface Devis {
  id: number;
  numero: string;
  offreTitle: string;
  client: string;
  secteur: string;
  montant: string;
  dateExpiration: string;
  status: string;
  commentaire?: string;
}

interface DevisListViewProps {
  devis: Devis[];
  onDevisClick?: (devis: Devis) => void;
}

export function DevisListView({ devis, onDevisClick }: DevisListViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "en attente":
        return <Badge className="bg-yellow-500/10 text-yellow-500 text-xs">En attente</Badge>;
      case "accepté":
        return <Badge className="bg-green-500/10 text-green-500 text-xs">Accepté</Badge>;
      case "refusé":
        return <Badge className="bg-red-500/10 text-red-500 text-xs">Refusé</Badge>;
      case "brouillon":
        return <Badge className="bg-gray-500/10 text-gray-500 text-xs">Brouillon</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-2">
      {devis.map((devisItem) => (
        <Link
          key={devisItem.id}
          to={`/devis/${devisItem.id}`}
          state={{ devis: devisItem }}
          className="block p-3 bg-card border border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1">
                <h3 className="text-sm font-normal">{devisItem.offreTitle}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Réf: {devisItem.numero} • {devisItem.client}
                </p>
                {devisItem.commentaire && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {devisItem.commentaire.length > 80 ? `${devisItem.commentaire.substring(0, 80)}...` : devisItem.commentaire}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {(() => {
                  const sectorMeta = getSectorMeta(devisItem.secteur);
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
                <Euro className="h-3 w-3" />
                {devisItem.montant}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {devisItem.dateExpiration}
              </div>
              
              {getStatusBadge(devisItem.status)}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 p-2 bg-card border border-border shadow-lg" align="end">
                <DropdownMenuItem className="w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-muted">Télécharger</DropdownMenuItem>
                <DropdownMenuItem className="w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-muted">Dupliquer</DropdownMenuItem>
                <DropdownMenuItem className="w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-destructive/10 hover:text-destructive">Supprimer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Link>
      ))}
    </div>
  );
}