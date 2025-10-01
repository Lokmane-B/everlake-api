import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Calendar, Trash2 } from "lucide-react";
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

interface NotificationWidgetCardProps {
  notification: Notification;
  onDelete?: (id: string) => void;
}

export function NotificationWidgetCard({ notification, onDelete }: NotificationWidgetCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (notification.link_url) {
      navigate(notification.link_url);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Succès</Badge>;
      case "warning":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Attention</Badge>;
      case "error":
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">Erreur</Badge>;
      case "info":
        return <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">Info</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Card 
      className={`transition-all ${!notification.read ? 'ring-1 ring-primary/20 bg-primary/5' : ''} ${notification.link_url ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {getTypeIcon(notification.type)}
          <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <h3 className="font-light text-xs text-foreground">{notification.title}</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                    notification.read ? 'bg-muted-foreground/30' : 'bg-primary'
                  }`}></div>
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
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{notification.message}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{new Date(notification.created_at).toLocaleDateString()}</span>
          </div>
          {getTypeBadge(notification.type)}
        </div>
      </CardContent>
    </Card>
  );
}