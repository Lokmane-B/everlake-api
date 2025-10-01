import React from "react";
import { FileText, Eye, Calendar, Euro, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDevis } from "@/hooks/useDevis";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function DevisDocumentsList() {
  const { devis, loading } = useDevis();

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-normal text-foreground tracking-tight">Mes devis</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!devis || devis.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-normal text-foreground tracking-tight">Mes devis</h3>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun devis créé
            </p>
            <Button size="sm" variant="outline" disabled>
                Voir mes devis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-normal text-foreground tracking-tight">Mes devis</h3>
        <Button size="sm" variant="outline" disabled className="h-7 px-2 text-xs">
          Voir tout
        </Button>
      </div>

      <div className="space-y-2">
        {devis.slice(0, 5).map((dev) => (
          <Card key={dev.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-normal text-foreground truncate tracking-tight">
                    {dev.marche_title || "Devis sans titre"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    {dev.company_name && (
                      <span>{dev.company_name}</span>
                    )}
                    {dev.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{dev.location}</span>
                      </div>
                    )}
                    {dev.total_ttc && (
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        <span>{dev.total_ttc}€</span>
                      </div>
                    )}
                    {dev.created_at && (
                      <span>
                        {formatDistanceToNow(new Date(dev.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {dev.status || "Brouillon"}
                    </Badge>
                    {dev.marche_sector && (
                      <Badge variant="secondary" className="text-xs">
                        {dev.marche_sector}
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
                <Link to={`/devis/${dev.id}`}>
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