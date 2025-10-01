import React from "react";
import { Navigate } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { MainContent } from "@/components/MainContent";
import { useAuth } from "@/hooks/useAuth";

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

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppShellWithVar>
      <EverlakeSidebar />
      <MainContent />
    </AppShellWithVar>
  );
};

export default Index;
