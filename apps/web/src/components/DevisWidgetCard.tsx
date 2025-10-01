import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Devis {
  id: string;
  marche_title: string;
  company_name?: string;
  location?: string;
  status: string;
  total_ttc?: number;
  created_at: string;
  marche_sector?: string;
  marche_end_date?: string;
}

interface DevisWidgetCardProps {
  devis: Devis;
}

export function DevisWidgetCard({ devis }: DevisWidgetCardProps) {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepté":
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Accepté</Badge>;
      case "En attente":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">En attente</Badge>;
      case "Refusé":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusé</Badge>;
      case "Brouillon":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Brouillon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString('fr-FR');
    } catch {
      return "—";
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow p-3"
      onClick={() => navigate(`/devis/${devis.id}`)}
    >
      <CardHeader className="p-0 pb-2">
        <h3 className="font-normal text-xs text-foreground truncate leading-tight tracking-tight">{devis.marche_title}</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1.5">
          <div className="pt-0.5">
            {getStatusBadge(devis.status)}
          </div>
          <div className="text-xs text-muted-foreground">
            {devis.total_ttc ? `${devis.total_ttc.toLocaleString('fr-FR')} €` : "Prix non défini"}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(devis.marche_end_date)}
          </div>
          <div className="text-xs text-muted-foreground">
            {devis.company_name || "Client non défini"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}