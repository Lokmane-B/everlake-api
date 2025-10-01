import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, MapPin } from "lucide-react";
import { getSectorMeta } from "@/data/secteurs-meta";

interface AppelOffre {
  id: string;
  titre: string;
  description: string;
  dateLimite: string;
  secteur: string;
  ville: string;
}

interface MarcheListViewProps {
  marches: AppelOffre[];
}

export function MarcheListView({ marches }: MarcheListViewProps) {

  const truncateDescription = (description: string, maxLength: number = 80) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-2">
      {marches.map((marche) => {
        const sectorMeta = getSectorMeta(marche.secteur);
        const IconComponent = sectorMeta.icon;
        
        return (
          <div
            key={marche.id}
            className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1">
                <h3 className="text-sm font-normal">{marche.titre}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {truncateDescription(marche.description)}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <Badge className="bg-muted text-muted-foreground text-xs">
                  <IconComponent className={`h-3 w-3 mr-1 ${sectorMeta.color}`} />
                  <span className={sectorMeta.color}>{sectorMeta.label}</span>
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {marche.ville}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {marche.dateLimite}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}