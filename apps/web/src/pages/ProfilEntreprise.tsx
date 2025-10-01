import * as React from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { EverlakeSidebar } from "@/components/EverlakeSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Star, Plus, Pencil } from "lucide-react";
import { secteursEntreprises, departementsFR } from "@/data/constants";
import { Helmet } from "react-helmet-async";

const AppShellWithVar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useSidebar();
  const headerHeight = state === "collapsed" ? "48px" : "60px";
  return (
    <div
      className="min-h-screen flex w-full bg-main-background relative"
      style={{ ["--app-header-height" as any]: headerHeight, ["--profile-left-width" as any]: state === "collapsed" ? "24rem" : "20rem" }}
    >
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[var(--app-header-height)] h-px bg-sidebar-border z-50" />
    </div>
  );
};

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

export default function ProfilEntreprise() {
  const loadProfile = () => {
    return {
      companyName: "",
      description: "",
      sector: "",
      location: "",
      year: "",
      rating: 0,
      team: [],
      validated: false
    };
  };

  const savedProfile = loadProfile();
  const [validated, setValidated] = React.useState(savedProfile.validated);
  const [companyName, setCompanyName] = React.useState(savedProfile.companyName);
  const [description, setDescription] = React.useState(savedProfile.description);
  const [sector, setSector] = React.useState<string>(savedProfile.sector);
  const [location, setLocation] = React.useState<string>(savedProfile.location);
  const [year, setYear] = React.useState<string>(savedProfile.year);
  const [rating, setRating] = React.useState<number>(savedProfile.rating);
  const [team, setTeam] = React.useState<TeamMember[]>(savedProfile.team);

  const addMember = () => {
    setTeam((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), firstName: "", lastName: "", role: "", avatar: undefined },
    ]);
  };

  const removeMember = (id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  };

  const setMember = (id: string, patch: Partial<TeamMember>) => {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const fullName = React.useMemo(() => companyName.trim() || "Entreprise", [companyName]);

  const renderStars = (value: number) => {
    const stars = [] as React.ReactNode[];
    for (let i = 1; i <= 5; i++) {
      const active = i <= value;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className="p-0.5"
          aria-label={`Note ${i}`}
          title={`Note ${i}`}
        >
          <Star className={`w-3.5 h-3.5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} fill={active ? "currentColor" : "none"} />
        </button>
      );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  const onSave = () => {
    setValidated(true);
    console.log("Profil sauvegardé");
  };

  return (
    <>
      <Helmet>
        <title>Profil entreprise – {fullName}</title>
        <meta name="description" content={`Profil de l'entreprise ${fullName}: informations, équipe, secteur, localisation.`} />
        <link rel="canonical" href="/company-profile" />
      </Helmet>
      <AppShellWithVar>
        <EverlakeSidebar />
        <div className="flex-1 flex flex-col">
          <header className="w-full flex items-center justify-between h-[var(--app-header-height)] px-6 bg-main-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-normal text-foreground">Profil d'entreprise</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Gérez les informations de votre entreprise</p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-0 min-h-0">
            <section className="w-full flex-1 flex min-h-0">
              <div className="flex flex-1 min-h-0">
                <section className="flex-1 flex flex-col min-w-0">
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-normal text-foreground">{fullName}</h2>
                      {validated && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <form className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-normal text-foreground">Information</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Nom de l'entreprise</label>
                          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Courte description</label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[90px] text-sm px-0 border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Secteur</label>
                          <Select value={sector} onValueChange={setSector}>
                            <SelectTrigger className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground">
                              <SelectValue placeholder="Sélectionner un secteur" />
                            </SelectTrigger>
                            <SelectContent className="z-50 bg-background border border-border">
                              {secteursEntreprises.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Localisation</label>
                          <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger className="h-8 px-0 text-sm border-0 rounded-none bg-transparent focus-visible:ring-0 focus:outline-none">
                              <SelectValue placeholder="Sélectionner un département" />
                            </SelectTrigger>
                            <SelectContent className="z-50 bg-background border border-border max-h-64">
                              {departementsFR.map((d) => (
                                <SelectItem key={d} value={d} className="text-xs">
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Année de création</label>
                          <Input value={year} onChange={(e) => setYear(e.target.value)} className="h-8 px-0 text-sm border-0 rounded-none bg-transparent focus-visible:ring-0 focus:outline-none" inputMode="numeric" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-normal text-foreground">Équipe</h3>
                          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={addMember}>
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Ajouter un membre
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {team.map((m) => (
                            <div key={m.id} className="grid grid-cols-[auto,1fr,1fr,1fr,auto] items-center gap-3 py-2 border-b border-border last:border-0">
                              <div className="flex items-center">
                                <div className="relative">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={m.avatar} alt={`Avatar ${m.firstName} ${m.lastName}`} />
                                    <AvatarFallback>{`${m.firstName.slice(0,1)}${m.lastName.slice(0,1)}`.toUpperCase() || "MB"}</AvatarFallback>
                                  </Avatar>
                                   <input
                                     type="file"
                                     accept="image/*"
                                     className="hidden"
                                     id={`upload-${m.id}`}
                                     onChange={(e) => {
                                       const f = e.target.files?.[0];
                                       if (f) {
                                         const reader = new FileReader();
                                         reader.onload = (event) => {
                                           const result = event.target?.result as string;
                                           if (result) setMember(m.id, { avatar: result });
                                         };
                                         reader.readAsDataURL(f);
                                       }
                                     }}
                                   />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground">Prénom</label>
                                <Input value={m.firstName} onChange={(e) => setMember(m.id, { firstName: e.target.value })} className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground">Nom</label>
                                <Input value={m.lastName} onChange={(e) => setMember(m.id, { lastName: e.target.value })} className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground">Poste</label>
                                <Input value={m.role} onChange={(e) => setMember(m.id, { role: e.target.value })} className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground" />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => removeMember(m.id)}>
                                  Supprimer
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => (document.getElementById(`upload-${m.id}`) as HTMLInputElement | null)?.click()}
                                >
                                  Changer la photo
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" className="h-8 px-3 text-xs" onClick={() => window.history.back()}>
                          Annuler
                        </Button>
                        <Button type="button" className="h-8 px-3 text-xs" onClick={onSave}>
                          Enregistrer
                        </Button>
                      </div>
                    </form>
                  </ScrollArea>
                </section>
              </div>
            </section>
          </main>
        </div>
      </AppShellWithVar>
    </>
  );
}