"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Dumbbell, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RoutinesPage() {
    const [routines, setRoutines] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchRoutines = async () => {
            try {
                const { data } = await api.get("/routines");
                setRoutines(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchRoutines();
    }, []);

    const startRoutine = async (routineId: string) => {
        try {
            // Start workout with this routine
            const routine = routines.find(r => r.id === routineId);
            const { data } = await api.post("/workouts/start", {
                routineId,
                name: routine?.name
            });
            router.push(`/workout?id=${data.id}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-4 space-y-6 pt-10 pb-24">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Routines</h1>
                <Button size="icon" className="rounded-full bg-primary text-white shadow-aura">
                    <Plus />
                </Button>
            </div>

            <div className="grid gap-4">
                {routines.map((routine) => (
                    <Card key={routine.id} className="glass border-white/10 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => startRoutine(routine.id)}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Dumbbell size={18} className="text-primary" />
                                {routine.name}
                            </CardTitle>
                            <ChevronRight className="text-muted-foreground" size={20} />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {routine.exercises.length} exercices • {routine.exercises.map((e: any) => e.exercise.name).slice(0, 3).join(", ")}...
                            </p>
                        </CardContent>
                    </Card>
                ))}

                {routines.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Aucune routine créée.</p>
                        <p className="text-xs mt-2">Créez votre premier programme pour gagner du temps.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
