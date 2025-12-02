"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dumbbell, TrendingUp, Trophy } from "lucide-react";
import api from "@/lib/api";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, { email, password });

      if (isLogin) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        router.push("/dashboard");
      } else {
        setIsLogin(true); // Switch to login after register
        alert("Compte créé ! Connectez-vous.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          LiftDiary
        </h1>
        <p className="text-muted-foreground">Votre progression, redéfinie.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <div className="flex flex-col items-center space-y-2 p-4 rounded-xl glass">
          <Dumbbell className="text-primary" />
          <span className="text-xs font-medium">Suivi</span>
        </div>
        <div className="flex flex-col items-center space-y-2 p-4 rounded-xl glass">
          <Trophy className="text-primary" />
          <span className="text-xs font-medium">Records</span>
        </div>
        <div className="flex flex-col items-center space-y-2 p-4 rounded-xl glass">
          <TrendingUp className="text-primary" />
          <span className="text-xs font-medium">Analyse</span>
        </div>
      </div>

      <Card className="w-full max-w-md glass border-white/10">
        <CardHeader>
          <CardTitle>{isLogin ? "Connexion" : "Inscription"}</CardTitle>
          <CardDescription>
            {isLogin ? "Bon retour parmi nous" : "Commencez votre transformation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/20 border-white/10"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Chargement..." : (isLogin ? "Se connecter" : "Créer un compte")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
