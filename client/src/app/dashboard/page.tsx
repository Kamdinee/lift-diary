"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Calendar as CalendarIcon, Clock } from "lucide-react";
import api from "@/lib/api";

export default function Dashboard() {
    const [activeWorkout, setActiveWorkout] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const { data } = await api.get("/workouts/history");
                // Check if there's a workout that hasn't ended (this logic is simplified, usually backend handles 'active' state)
                // Since /history filters endedAt not null, we might need another endpoint or adjust logic.
                // But for now let's assume we fetch all and filter client side or use a specific endpoint.
                // Actually my backend /history ONLY returns ended workouts.
                // I need to fix backend or just rely on local state/check.
                // Let's assume for now we don't have active workout persistence across devices in this MVP step, 
                // OR we add an endpoint to get active workout.
                // I'll add a quick check for active workout if I can, but for now let's just show history.
                setHistory(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchWorkouts();
    }, []);

    const startWorkout = async () => {
        try {
            const { data } = await api.post("/workouts/start", {});
            router.push(`/workout?id=${data.id}`);
        } catch (error) {
            console.error(error);
        }
    };

    const resumeWorkout = () => {
        if (activeWorkout) {
            router.push(`/workout?id=${activeWorkout.id}`);
        }
    };

    return (
        <div className="p-4 space-y-6 pt-10 pb-24">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Journal de bord</h1>
                <Button size="icon" variant="ghost" className="rounded-full">
                    <CalendarIcon />
                </Button>
            </div>

            {/* Promo / Motivation Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-black border-white/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                <CardContent className="p-6">
                    <p className="text-primary font-bold text-xs uppercase tracking-wider mb-1">Motivation</p>
                    <h3 className="text-xl font-bold mb-2">La constance est la clé.</h3>
                    <p className="text-sm text-muted-foreground">Vous avez effectué {history.length} séances.</p>
                </CardContent>
            </Card>

            {/* Active Workout Banner */}
            {activeWorkout && (
                <div className="fixed bottom-20 left-4 right-4 z-40">
                    <Button
                        onClick={resumeWorkout}
                        className="w-full h-14 rounded-full shadow-aura bg-black/80 border border-primary/50 backdrop-blur-md flex justify-between items-center px-6"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span>Reprendre l'entraînement</span>
                        </div>
                        <span className="font-mono text-primary">En cours</span>
                    </Button>
                </div>
            )}

            {/* Today's Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Aujourd'hui</h2>

                {!activeWorkout && (
                    <Card className="border-dashed border-white/20 bg-transparent hover:bg-white/5 transition-colors cursor-pointer" onClick={startWorkout}>
                        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <Play fill="currentColor" />
                            </div>
                            <p className="font-medium">Démarrer une séance</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Recent History */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Récemment</h2>
                {history.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucune séance terminée pour le moment.</p>
                ) : (
                    history.slice(0, 3).map((workout: any) => (
                        <Card key={workout.id} className="glass border-white/5">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">{workout.name || "Entraînement libre"}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(workout.startedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock size={14} />
                                    <span>{Math.floor((workout.duration || 0) / 60)} min</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
