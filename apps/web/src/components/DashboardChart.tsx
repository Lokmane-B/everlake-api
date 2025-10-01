import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { ChevronDown } from "lucide-react";

const timeRanges = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "4m", label: "Trimestre" },
  { value: "1y", label: "1 année" },
];

const metrics = [
  { value: "expenses", label: "Dépenses" },
];


// Empty data for charts
const emptyConversionData = [
  { name: "Devis acceptés", value: 0, color: "#22c55e" },
  { name: "Devis refusés", value: 0, color: "#eab308" },
];

const barMetrics = [
  { value: "operations", label: "Opérations" },
  { value: "tenders", label: "Appels d'offres émis" },
  { value: "quotes", label: "Devis envoyés" },
];

// Generate empty data structure
const generateEmptyData = (range: string) => {
  const dataPoints = range === "7d" ? 7 : range === "30d" ? 30 : range === "4m" ? 16 : 52;
  const data = [];
  
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  
  for (let i = 0; i < dataPoints; i++) {
    const currentDate = new Date();
    let name = "";
    let fullDate = "";
    
    if (range === "7d") {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (6 - i));
      name = days[date.getDay()];
      fullDate = date.toLocaleDateString('fr-FR');
    } else if (range === "30d") {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (29 - i));
      name = date.getDate().toString();
      fullDate = date.toLocaleDateString('fr-FR');
    } else if (range === "4m") {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - ((15 - i) * 7));
      name = `S${Math.ceil((i + 1))}`;
      fullDate = `Semaine du ${date.toLocaleDateString('fr-FR')}`;
    } else {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - (11 - i), 1);
      name = months[date.getMonth()];
      fullDate = `${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    
    data.push({
      name,
      fullDate,
      revenue: 0,
      expenses: 0,
      profit: 0,
      revenueChange: 0,
      expenseChange: 0
    });
  }

  return data;
};

const generateEmptyBarData = (metric: string) => {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
  const sectors = ["Construction", "Rénovation", "Infrastructure"];
  
  return months.map(month => {
    const data: any = { month };
    sectors.forEach(sector => {
      data[sector] = 0;
    });
    return data;
  });
};

// Dynamic title generation
const getDynamicTitle = (range: string) => {
  const currentDate = new Date();
  
  const periodLabels = {
    "7d": "hebdomadaire",
    "30d": "mensuel", 
    "4m": "trimestriel",
    "1y": "annuel"
  };
  
  const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", 
                     "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  
  const period = periodLabels[range as keyof typeof periodLabels] || "mensuel";
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  return `Dépenses ${period} • ${currentMonth} ${currentYear}`;
};

// Fonction pour calculer le pourcentage d'évolution basé sur les données réelles
const getEvolutionPercentage = (data: any[], metric: string, isMultiMetric: boolean) => {
  if (data.length < 2) return 0;
  
  const firstValue = isMultiMetric 
    ? data[0][metric]
    : data[0].value;
  const lastValue = isMultiMetric 
    ? data[data.length - 1][metric]
    : data[data.length - 1].value;
    
  if (firstValue === 0) return 0;
  return ((lastValue - firstValue) / firstValue) * 100;
};

export function DashboardChart() {
  const [selectedRange, setSelectedRange] = useState("30d");

  // Use empty data instead of demo data
  const emptyData = generateEmptyData(selectedRange);
  const chartData = emptyData;
  
  const totalValue = 0;
  const deltaAbs = 0;
  const evolutionPercent = 0;
  
  const dynamicTitle = getDynamicTitle(selectedRange);
  
  // Définir les couleurs selon le thème
  const colors = {
    revenue: "#22c55e", // vert
    expenses: "#eab308", // jaune
  };

  // Empty chart configuration
  const yAxisMin = 0;
  const yAxisMax = 100;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-normal text-card-foreground mb-2 tracking-tight">
              {dynamicTitle}
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-lg font-normal text-foreground tracking-tight">
                €{(totalValue / 1000).toFixed(0)}k
              </div>
              <div className="text-xs">
                <span className={evolutionPercent > 0 ? 'text-green-500' : 'text-red-500'}>
                  {deltaAbs > 0 ? '+' : ''}€{Math.round(deltaAbs).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-none gap-1">
                  <span className="text-foreground">
                    {timeRanges.find((t) => t.value === selectedRange)?.label}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 p-2 bg-card border border-border shadow-lg" align="end">
              {timeRanges.map((range) => (
                <DropdownMenuItem
                  key={range.value}
                  onClick={() => setSelectedRange(range.value)}
                  className={`w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-muted ${selectedRange === range.value ? "bg-accent" : ""}`}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={[yAxisMin, yAxisMax]}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={() => (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="text-xs text-muted-foreground">
                      Aucune donnée disponible
                    </div>
                  </div>
                )}
              />
              
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
                name="Dépenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend simplifiée */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: "#eab308" }}></div>
            <span className="text-xs text-muted-foreground">
              Dépenses
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversionChart() {
  const totalQuotes = emptyConversionData.reduce((sum, item) => sum + item.value, 0);
  const evolution = 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-normal text-white tracking-tight">Taux de conversion</CardTitle>
        <CardDescription className="text-muted-foreground font-light">
          Devis envoyés vs acceptés
        </CardDescription>
        <div className="mt-2">
          <span className="text-2xl font-light text-foreground">
            0%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emptyConversionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                {emptyConversionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: any) => [`${value}%`, ""]}
                labelStyle={{ color: "white" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {emptyConversionData.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function BarChart3D() {
  const [selectedBarMetric, setSelectedBarMetric] = useState("operations");
  const barData = generateEmptyBarData(selectedBarMetric);
  const sectors = ["Construction", "Rénovation", "Infrastructure"];
  const colors = ["#3b82f6", "#ff6b35", "#eab308"];
  const evolution = 0;
  
  const currentBarMetric = barMetrics.find(m => m.value === selectedBarMetric);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xs font-normal text-white tracking-tight">{currentBarMetric?.label} par secteur</CardTitle>
            <CardDescription className="text-muted-foreground font-light">
              Répartition mensuelle par secteur d'activité
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-none gap-1">
                <span className="text-foreground">{currentBarMetric?.label}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 p-2 bg-card border border-border shadow-lg" align="end">
              {barMetrics.map((metric) => (
                  <DropdownMenuItem
                    key={metric.value}
                    onClick={() => setSelectedBarMetric(metric.value)}
                    className={`w-full justify-start h-8 px-2 text-xs font-normal tracking-tight hover:bg-muted ${selectedBarMetric === metric.value ? "bg-accent" : ""}`}
                  >
                  {metric.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center h-full">
        <div className="h-[180px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} maxBarSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
              />
              {sectors.map((sector, index) => (
                <Bar 
                  key={sector}
                  dataKey={sector} 
                  fill={colors[index]}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={20}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4">
          {sectors.map((sector, index) => (
            <div key={sector} className="flex items-center gap-1.5">
              <div 
                className="w-1.5 h-1.5 rounded-sm" 
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-xs text-muted-foreground">{sector}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}