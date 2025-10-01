import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, Building, Tag, Inbox, Trash2, Edit, MoreHorizontal } from "lucide-react";
import { getSectorMeta } from "@/data/secteurs-meta";

interface Contact {
  id: string;
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  sector: string | null;
  location: string | null;
  notes: string | null;
  tags: string[];
  created_at: string | null;
}

interface ContactWidgetCardProps {
  contact: Contact;
  onDelete?: (contactId: string) => void;
  onEdit?: (contactId: string) => void;
  onCreateConversation?: (contactId: string) => void;
}

export function ContactWidgetCard({ 
  contact, 
  onDelete, 
  onEdit, 
  onCreateConversation 
}: ContactWidgetCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr?: string | null) => {
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
    <Card className="hover:shadow-md transition-shadow p-3">
      <CardHeader className="p-0 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-xs text-foreground truncate">
              {contact.company_name || "Entreprise sans nom"}
            </h3>
            {contact.contact_person && (
              <p className="text-xs text-muted-foreground">{contact.contact_person}</p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {contact.tags && contact.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs mr-1">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {contact.tags[0]}
              </Badge>
            )}
            {/* Actions menu */}
            {(onCreateConversation || onEdit || onDelete) && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 bg-card border border-border shadow-lg" align="end">
                  <div className="space-y-1">
                    {onCreateConversation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCreateConversation(contact.id)}
                        className="w-full justify-start h-8 px-2 text-xs font-normal hover:bg-muted"
                      >
                        <Inbox className="h-3 w-3 mr-2" />
                        Créer une conversation
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(contact.id)}
                        className="w-full justify-start h-8 px-2 text-xs font-normal hover:bg-muted"
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Modifier le contact
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(contact.id)}
                        className="w-full justify-start h-8 px-2 text-xs font-normal hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Supprimer le contact
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1.5">
          {contact.email && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          
          {contact.phone && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{contact.phone}</span>
            </div>
          )}
          
          {contact.location && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{contact.location}</span>
            </div>
          )}
          
          {contact.sector && (
            <div className="text-xs flex items-center gap-2">
              {(() => {
                const sectorMeta = getSectorMeta(contact.sector);
                const IconComponent = sectorMeta.icon;
                return (
                  <>
                    <IconComponent className={`h-3 w-3 ${sectorMeta.color}`} />
                    <span className={`truncate ${sectorMeta.color}`}>{sectorMeta.label}</span>
                  </>
                );
              })()}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            <span className="font-normal tracking-tight">Ajouté le:</span> {formatDate(contact.created_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}