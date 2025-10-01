import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";

import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CompactFilterBar } from "@/components/CompactFilterBar";
import { DocumentsList } from "@/components/DocumentsList";
import { ViewToggle } from "@/components/ViewToggle";

// Local shell mirroring the app layout with the same header divider
const AppShellWithVar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useSidebar();
  const headerHeight = state === "collapsed" ? "48px" : "60px";
  return (
    <div
      className="min-h-screen flex w-full bg-main-background relative"
      style={{ ["--app-header-height" as any]: headerHeight }}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[var(--app-header-height)] h-px bg-sidebar-border z-20"
      />
    </div>
  );
};

export default function Equipe() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [fileType, setFileType] = useState("all");
  const [view, setView] = useState<"widget" | "list">("widget");

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Documents - Plateforme Everlake</title>
        <meta name="description" content="Gérez et partagez vos documents d'équipe en toute simplicité." />
      </Helmet>

      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                 <div>
                   <h1 className="text-sm font-normal text-foreground">Documents</h1>
                   <p className="text-xs text-muted-foreground mt-0.5">Gestion et partage des documents d'équipe</p>
                 </div>
              </div>
              
            </header>

            <main className="flex-1 p-6 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CompactFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={[
                      {
                        label: "Type de fichier",
                        value: fileType,
                        options: [
                          { value: "all", label: "Tous les fichiers" },
                          { value: "image", label: "Images" },
                          { value: "pdf", label: "PDF" },
                          { value: "document", label: "Documents" },
                          { value: "other", label: "Autres" }
                        ],
                        onChange: setFileType
                      }
                    ]}
                  />
                </div>
                <ViewToggle view={view} onViewChange={setView} />
              </div>

              {/* Documents stockés */}
              <div className="space-y-6">
                <DocumentsList 
                  searchTerm={searchTerm} 
                  fileType={fileType} 
                  view={view} 
                />
              </div>
            </main>
          </div>
        </AppShellWithVar>
    </>
  );
}