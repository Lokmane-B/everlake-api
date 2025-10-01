import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Search, Plus, CheckCircle, Users, FileText, ShoppingCart, FolderOpen, TrendingUp, HelpCircle, Eye, Percent } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardChart } from "./DashboardChart";
import { useState, useMemo } from "react";
import { getStatusBadge } from "@/data/status";
import { useDashboardData } from "@/hooks/useDashboardData";


// Empty data for Veille widget
const veilleData: Array<{
  id: string;
  title: string;
  location: string;
  sector: string;
  budget: string;
  deadline: string;
  match: number;
  status: string;
}> = [];

function VeilleWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-[300px]">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-normal text-white tracking-tight">Veille</CardTitle>
        <Link to="/rechercher-marches">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/10">
            <Eye className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)] flex items-center justify-center">
        <div className="text-center">
          <Search className="h-6 w-6 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-xs font-normal mb-1">Aucune veille configurée</h3>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Configurez votre veille pour être alerté des nouveaux marchés correspondant à vos critères.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


export function MainContent() {
  const { data: dashboardData, loading } = useDashboardData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div>
            <h1 className="text-sm font-normal text-foreground">Tableau de bord</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Vue d'ensemble de votre activité</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-4 bg-main-background space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link to="/appels-offres">
            <Card className="hover:bg-accent/5 transition-all duration-200 cursor-pointer hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide h-6 flex items-end">
                      Appels d'offres actifs
                    </p>
                    <p className="text-sm font-normal text-foreground h-8 flex items-center">
                      {loading ? "..." : dashboardData.activeAO}
                    </p>
                    <p className="text-xs h-6 flex items-start">
                      <span className="text-muted-foreground">
                        {dashboardData.activeAO === 0 ? "Créez votre premier AO" : "Appels d'offres en cours"}
                      </span>
                    </p>
                  </div>
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <FileText className="h-3 w-3 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>


          <Link to="/devis-recus">
            <Card className="hover:bg-accent/5 transition-all duration-200 cursor-pointer hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide h-6 flex items-end">
                      Devis reçus
                    </p>
                     <p className="text-sm font-normal text-foreground h-8 flex items-center">
                       {loading ? "..." : dashboardData.receivedDevis}
                     </p>
                     <p className="text-xs h-6 flex items-start">
                       <span className="text-muted-foreground">
                         {dashboardData.receivedDevis === 0 ? "Aucun devis reçu" : "Devis en attente"}
                       </span>
                     </p>
                  </div>
                  <div className="bg-orange-500/10 p-2 rounded-lg">
                    <FileText className="h-3 w-3 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:bg-accent/5 transition-all duration-200 cursor-pointer hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide h-6 flex items-end">
                    Commandes finalisées
                  </p>
                  <p className="text-sm font-normal text-foreground h-8 flex items-center">
                    {loading ? "..." : dashboardData.acceptedDevis}
                  </p>
                  <p className="text-xs h-6 flex items-start">
                    <span className="text-muted-foreground">
                      {dashboardData.acceptedDevis === 0 ? "Aucune commande finalisée" : "Devis acceptés"}
                    </span>
                  </p>
                </div>
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Main Chart */}
        <DashboardChart />


        {/* Activities */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-white">Activités récentes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Bell className="h-6 w-6 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-xs font-normal mb-1">Aucune activité récente</h3>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                Les activités de votre plateforme apparaîtront ici.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}