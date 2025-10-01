import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";

export default function Auth() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Redirect if already authenticated
  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setMessage("Vérifiez votre email pour confirmer votre inscription!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Handle specific error messages in French
      if (error.message?.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect");
      } else if (error.message?.includes("User already registered")) {
        setError("Un compte existe déjà avec cet email");
      } else if (error.message?.includes("Password should be at least")) {
        setError("Le mot de passe doit contenir au moins 6 caractères");
      } else {
        setError(error.message || "Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isSignUp ? "Inscription" : "Connexion"} - Everlake Platform</title>
        <meta name="description" content="Connectez-vous à votre plateforme Everlake pour gérer vos appels d'offres, devis et projets." />
      </Helmet>
      
      <div className="min-h-screen bg-background flex items-center justify-center p-6 w-full flex-1">
        <div className="w-full max-w-lg">
          <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-sm font-normal text-foreground">
              {isSignUp ? "Créer un compte" : "Se connecter"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {isSignUp 
                ? "Rejoignez la plateforme Everlake" 
                : "Accédez à votre espace Everlake"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                  <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs text-muted-foreground">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground"
                  />
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-muted-foreground">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-8 px-0 text-sm border-0 border-b border-border rounded-none bg-transparent focus-visible:ring-0 focus:outline-none focus:border-foreground"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                size="sm"
                className="w-full font-normal text-sm" 
                disabled={isLoading}
              >
                {isLoading 
                  ? "Chargement..." 
                  : isSignUp 
                    ? "Créer le compte" 
                    : "Se connecter"
                }
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setMessage("");
                }}
              >
                {isSignUp 
                  ? "Déjà un compte ? Se connecter" 
                  : "Pas de compte ? S'inscrire"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}