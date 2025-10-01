import React from "react";
import { FileText, Eye, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAppelsOffres } from "@/hooks/useAppelsOffres";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function AppelOffreDocumentsList() {
  const { appelsOffres, loading } = useAppelsOffres();

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-normal text-foreground tracking-tight">Mes appels d'offres</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!appelsOffres || appelsOffres.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-normal text-foreground tracking-tight">Mes appels d'offres</h3>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun appel d'offres créé
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link to="/ajouter-appel-offre">
                Créer un appel d'offres
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-normal text-foreground tracking-tight">Mes appels d'offres</h3>
        <Button size="sm" variant="outline" asChild className="h-7 px-2 text-xs">
          <Link to="/appels-offres">Voir tout</Link>
        </Button>
      </div>

      <div className="space-y-2">
        {appelsOffres.slice(0, 5).map((ao) => (
          <Card key={ao.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-normal text-foreground truncate tracking-tight">
                    {ao.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    {ao.sector && (
                      <div className="flex items-center gap-1">
                        <span>{ao.sector}</span>
                      </div>
                    )}
                    {ao.end_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Fin: {new Date(ao.end_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {ao.status}
                    </Badge>
                    {ao.sector && (
                      <Badge variant="secondary" className="text-xs">
                        {ao.sector}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                asChild
              >
                <Link to={`/appel-offre/${ao.id}`}>
                  <Eye className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}