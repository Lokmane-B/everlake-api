import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CompactFilterBar } from "@/components/CompactFilterBar";
import { ViewToggle } from "@/components/ViewToggle";
import { NotificationWidgetCard } from "@/components/NotificationWidgetCard";
import { NotificationListItem } from "@/components/NotificationListItem";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

const AppShellWithVar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useSidebar();
  const headerHeight = state === "collapsed" ? "48px" : "60px";
  return (
    <div className="min-h-screen flex w-full bg-main-background relative" style={{ ["--app-header-height" as any]: headerHeight }}>
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[var(--app-header-height)] h-px bg-sidebar-border z-20" />
    </div>
  );
};

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string | null;
  message: string | null;
  created_at: string | null;
  read: boolean | null;
  link_url: string | null;
}

export default function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const { notifications, loading, markAsRead, deleteNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [view, setView] = useState<"widget" | "list">("widget");

  // Mark all unread notifications as read when page loads
  useEffect(() => {
    if (!loading && notifications.length > 0) {
      const unreadNotifications = notifications.filter(n => !n.read);
      unreadNotifications.forEach(notification => {
        markAsRead(notification.id);
      });
    }
  }, [loading, notifications, markAsRead]);

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = (notification.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (notification.message?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || notification.type === selectedType;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "read" && notification.read) ||
                         (selectedStatus === "unread" && !notification.read);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <Helmet>
        <title>Notifications - Everlake Platform</title>
        <meta name="description" content="Centre de notifications et activités de votre plateforme Everlake." />
      </Helmet>
      
      <AppShellWithVar>
      <EverlakeSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-normal text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-primary rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Centre de notifications et activités</p>
          </div>
        </div>
        
        <Bell className="w-4 h-4 text-muted-foreground" />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CompactFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={[
                {
                  label: "Type",
                  value: selectedType,
                  options: [
                    { value: "info", label: "Information" },
                    { value: "success", label: "Succès" },
                    { value: "warning", label: "Attention" },
                    { value: "error", label: "Erreur" }
                  ],
                  onChange: setSelectedType
                },
                {
                  label: "Statut",
                  value: selectedStatus,
                  options: [
                    { value: "read", label: "Lues" },
                    { value: "unread", label: "Non lues" }
                  ],
                  onChange: setSelectedStatus
                }
              ]}
            />
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification trouvée"
            description="Vous n'avez aucune notification correspondant à vos critères de recherche."
            variant="minimal"
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationListItem 
                key={notification.id} 
                notification={{
                  id: notification.id,
                  type: notification.type,
                  title: notification.title || "Notification",
                  message: notification.message || "",
                  created_at: notification.created_at || "",
                  read: !!notification.read,
                  link_url: notification.link_url || undefined
                }} 
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </main>
        </div>
      </AppShellWithVar>
    </>
  );
}