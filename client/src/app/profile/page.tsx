"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/");
    };

    return (
        <div className="p-4 space-y-6 pt-10 pb-24">
            <h1 className="text-3xl font-bold">Profil</h1>

            <div className="flex items-center space-x-4 mb-8">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary">
                    U
                </div>
                <div>
                    <h2 className="text-xl font-bold">Utilisateur</h2>
                    <p className="text-sm text-muted-foreground">Membre depuis 2025</p>
                </div>
            </div>

            <div className="space-y-4">
                <Card className="glass border-white/10">
                    <CardContent className="p-0">
                        <Button variant="ghost" className="w-full justify-start p-6 h-auto rounded-none border-b border-white/5">
                            <User className="mr-4" /> Informations personnelles
                        </Button>
                        <Button variant="ghost" className="w-full justify-start p-6 h-auto rounded-none border-b border-white/5">
                            <Settings className="mr-4" /> Paramètres
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start p-6 h-auto rounded-none text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-4" /> Déconnexion
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
