import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Building2, Euro, FileText, Download, Copy, Trash2, User } from "lucide-react";

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
}

interface DevisDetailModalProps {
  devis: Devis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DevisDetailModal({ devis, open, onOpenChange }: DevisDetailModalProps) {
  if (!devis) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xs font-normal tracking-tight">{devis.offreTitle}</DialogTitle>
          <p className="text-xs text-muted-foreground">Référence: {devis.numero}</p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal tracking-tight">Statut</span>
            {getStatusBadge(devis.status)}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" alt={devis.client} />
                <AvatarFallback className="bg-muted">
                  <User className="h-3 w-3 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-normal tracking-tight">{devis.client}</p>
                <p className="text-xs text-muted-foreground">{devis.secteur}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Euro className="h-3 w-3 text-muted-foreground" />
              <span className="font-normal tracking-tight">Montant:</span>
              <span className="font-normal tracking-tight">{devis.montant}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="font-normal tracking-tight">Date d'envoi:</span>
              <span className="text-muted-foreground">{devis.dateEnvoi}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="font-normal tracking-tight">Date d'expiration:</span>
              <span className="text-muted-foreground">{devis.dateExpiration}</span>
            </div>
          </div>
          
          {devis.commentaire && (
            <div className="space-y-2">
              <h4 className="text-xs font-normal tracking-tight">Commentaires</h4>
              <p className="text-xs text-muted-foreground whitespace-pre-line">{devis.commentaire}</p>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button size="sm" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Dupliquer
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}