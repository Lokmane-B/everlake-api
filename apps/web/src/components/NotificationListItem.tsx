import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link_url?: string;
}

interface NotificationListItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationListItem({ notification, onMarkAsRead, onDelete }: NotificationListItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (notification.link_url) {
      navigate(notification.link_url);
    }
  };

  return (
    <Card className={`w-full transition-all hover:shadow-sm ${notification.link_url ? 'cursor-pointer' : ''}`} onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
            notification.read ? 'bg-muted-foreground/30' : 'bg-green-500'
          }`}></div>
          
          <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-light text-foreground mb-1">{notification.title}</h4>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString('fr-FR')} à {new Date(notification.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}