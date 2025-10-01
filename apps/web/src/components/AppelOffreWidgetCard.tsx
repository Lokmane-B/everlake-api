import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Calendar, FileText, CheckCircle, Clock, XCircle, Edit, Award } from "lucide-react";
import { getStatusBadge } from "@/data/status";
import { getSectorMeta } from "@/data/secteurs-meta";

interface AppelOffreWidgetCardProps {
  appel: {
    id: string;
    title: string;
    sector: string;
    budget?: number | string;
    end_date: string;
    status: string;
    visibility?: string;
    devisCount?: number;
    purchase_type?: string;
    quantity?: string;
    contract_type?: string;
    evaluation_criteria?: string[];
    attributaire_company_name?: string;
  };
}

export function AppelOffreWidgetCard({ appel }: AppelOffreWidgetCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString('fr-FR');
    } catch {
      return "—";
    }
  };

  const sectorMeta = getSectorMeta(appel.sector);
  const SectorIcon = sectorMeta.icon;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow p-3"
      onClick={() => navigate(`/appels-offres/${appel.id}`)}
    >
      <CardHeader className="p-0 pb-2">
        <h3 className="font-normal text-xs text-foreground truncate leading-tight tracking-tight">{appel.title}</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <SectorIcon className={`w-3 h-3 ${sectorMeta.color}`} />
            <span className="truncate">{sectorMeta.label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(appel.end_date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>{appel.devisCount || 0} devis</span>
          </div>
          {appel.status === 'Attribué' && appel.attributaire_company_name && (
            <div className="flex items-center gap-1.5 text-xs text-green-700">
              <Award className="w-3 h-3" />
              <span className="truncate">Attribué à {appel.attributaire_company_name}</span>
            </div>
          )}
          <div className="pt-0.5">
            {getStatusBadge(appel.status)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}