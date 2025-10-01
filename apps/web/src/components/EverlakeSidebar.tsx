import { 
  Search, Plus, FileText, 
  User,
  HelpCircle, LogOut, Home, LogIn
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logoMediSante from "@/assets/logos/medisante-logo.png";

const sidebarItems = [
  { title: "Ajouter un appel d'offres", url: "/ajouter-appel-offre", icon: Plus, action: true },
  { title: "Appels d'offres", url: "/appels-offres", icon: FileText },
  { title: "Profil", url: "/company-profile", icon: User },
];

const footerItems = [
  { title: "Support", url: "/support", icon: HelpCircle },
];

export function EverlakeSidebar() {
  const { state } = useSidebar();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };
  
  const profileData = {
    companyName: user ? "Mon Entreprise" : "Everlake",
    userName: user?.user_metadata?.full_name || "Utilisateur",
    companyLogo: null,
    userAvatar: null
  };
  
  const isActive = (path: string) => currentPath === path;

  const getNavClassName = (path: string, isAction?: boolean) => {
    const baseClasses = "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-200";
    
    if (isActive(path)) {
      return `${baseClasses} bg-accent text-white`;
    }
    
    if (isAction) {
      return `${baseClasses} text-white hover:bg-sidebar-accent`;
    }
    
    return `${baseClasses} text-white hover:bg-sidebar-accent`;
  };

  return (
    <Sidebar className={`${collapsed ? "w-12" : "w-56"} border-r border-sidebar-border bg-sidebar`} collapsible="icon">
      <SidebarHeader className="h-[var(--app-header-height)] flex flex-row items-center justify-start px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={profileData.companyLogo || profileData.userAvatar} alt={`Avatar ${profileData.userName}`} loading="lazy" />
              <AvatarFallback>{profileData.userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-normal text-sidebar-foreground tracking-tight">{profileData.companyName}</span>
              <span className="text-xs text-muted-foreground">{profileData.userName}</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-start">
            <Avatar className="h-7 w-7">
              <AvatarImage src={profileData.companyLogo || profileData.userAvatar} alt={`Avatar ${profileData.userName}`} loading="lazy" />
              <AvatarFallback>{profileData.userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-1">
        {!collapsed && (
          <div className="px-4 pb-1 mt-1">
            <div className="relative">
              <Input placeholder="Rechercher..." className="h-7 pl-7 text-xs rounded-sm bg-transparent" />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={collapsed ? 
                        `${getNavClassName(item.url, item.action)} justify-center` : 
                        getNavClassName(item.url, item.action)
                      }
                      title={collapsed ? item.title : undefined}
                      state={{ from: currentPath }}
                    >
                      <item.icon className="w-2.5 h-2.5 text-muted-foreground" />
                      {!collapsed && <span className="text-xs">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-1 border-t border-sidebar-border">
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink 
                  to={item.url} 
                  className={collapsed ? 
                    `${getNavClassName(item.url)} justify-center` : 
                    getNavClassName(item.url)
                  }
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="w-2.5 h-2.5 text-muted-foreground" />
                  {!collapsed && <span className="text-xs">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          {/* Auth Actions */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              {user ? (
                <button 
                  onClick={handleSignOut}
                  className={collapsed ? 
                    `${getNavClassName("/logout")} justify-center` : 
                    getNavClassName("/logout")
                  }
                  title={collapsed ? "Se déconnecter" : undefined}
                >
                  <LogOut className="w-2.5 h-2.5 text-muted-foreground" />
                  {!collapsed && <span className="text-xs">Se déconnecter</span>}
                </button>
              ) : (
                <NavLink 
                  to="/auth" 
                  className={collapsed ? 
                    `${getNavClassName("/auth")} justify-center` : 
                    getNavClassName("/auth")
                  }
                  title={collapsed ? "Se connecter" : undefined}
                >
                  <LogIn className="w-2.5 h-2.5 text-muted-foreground" />
                  {!collapsed && <span className="text-xs">Se connecter</span>}
                </NavLink>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}