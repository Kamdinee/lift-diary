"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Check, Clock, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// Types
type Set = {
    seriesIndex: number;
    reps: number;
    weight: number;
    completed: boolean;
};

type WorkoutExercise = {
    id: string; // unique id for this instance in workout
    exerciseId: string;
    name: string;
    sets: Set[];
};

export default function WorkoutPage() {
    const searchParams = useSearchParams();
    const workoutId = searchParams.get("id");
    const router = useRouter();

    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
    const [timer, setTimer] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showExerciseSelector, setShowExerciseSelector] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<any[]>([]);

    // Timer logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused) setTimer((t) => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused]);

    // Fetch available exercises
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const { data } = await api.get("/exercises");
                setAvailableExercises(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchExercises();
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const addExercise = (exercise: any) => {
        const newExercise: WorkoutExercise = {
            id: Math.random().toString(36).substr(2, 9),
            exerciseId: exercise.id,
            name: exercise.name,
            sets: [
                { seriesIndex: 0, reps: 10, weight: 0, completed: false },
                { seriesIndex: 1, reps: 10, weight: 0, completed: false },
                { seriesIndex: 2, reps: 10, weight: 0, completed: false },
            ],
        };
        setExercises([...exercises, newExercise]);
        setShowExerciseSelector(false);
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex] = {
            ...newExercises[exerciseIndex].sets[setIndex],
            [field]: value,
        };
        setExercises(newExercises);
    };

    const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
        const current = exercises[exerciseIndex].sets[setIndex].completed;
        updateSet(exerciseIndex, setIndex, "completed", !current);
    };

    const addSet = (exerciseIndex: number) => {
        const newExercises = [...exercises];
        const previousSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
        newExercises[exerciseIndex].sets.push({
            seriesIndex: newExercises[exerciseIndex].sets.length,
            reps: previousSet ? previousSet.reps : 10,
            weight: previousSet ? previousSet.weight : 0,
            completed: false,
        });
        setExercises(newExercises);
    };

    const finishWorkout = async () => {
        if (!workoutId) return;

        // Flatten sets for API
        const allSets = exercises.flatMap(ex =>
            ex.sets
                .filter(s => s.completed) // Only save completed sets
                .map(s => ({
                    exerciseId: ex.exerciseId,
                    seriesIndex: s.seriesIndex,
                    reps: Number(s.reps),
                    weight: Number(s.weight),
                    completed: s.completed
                }))
        );

        try {
            await api.put(`/workouts/${workoutId}/finish`, {
                endedAt: new Date().toISOString(),
                duration: timer,
                sets: allSets
            });
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la sauvegarde");
        }
    };

    return (
        <div className="pb-32 min-h-screen bg-background">
            {/* Header Fixed */}
            <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    <span className="font-mono text-xl font-bold">{formatTime(timer)}</span>
                </div>
                <Button size="sm" onClick={finishWorkout} className="bg-primary text-white hover:bg-primary/90">
                    Terminer
                </Button>
            </div>

            <div className="pt-20 px-4 space-y-6">
                {exercises.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>Aucun exercice ajouté.</p>
                        <Button variant="outline" className="mt-4" onClick={() => setShowExerciseSelector(true)}>
                            Ajouter un exercice
                        </Button>
                    </div>
                )}

                {exercises.map((exercise, exIndex) => (
                    <Card key={exercise.id} className="glass border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-base">{exercise.name}</CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <Trash2 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-10 gap-2 text-xs text-muted-foreground text-center mb-2">
                                <div className="col-span-1">#</div>
                                <div className="col-span-3">KG</div>
                                <div className="col-span-3">REPS</div>
                                <div className="col-span-3">VALIDER</div>
                            </div>
                            {exercise.sets.map((set, setIndex) => (
                                <div key={setIndex} className={cn("grid grid-cols-10 gap-2 items-center", set.completed && "opacity-50")}>
                                    <div className="col-span-1 text-center font-mono text-sm text-muted-foreground">
                                        {setIndex + 1}
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="number"
                                            value={set.weight}
                                            onChange={(e) => updateSet(exIndex, setIndex, "weight", e.target.value)}
                                            className="h-8 text-center bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="number"
                                            value={set.reps}
                                            onChange={(e) => updateSet(exIndex, setIndex, "reps", e.target.value)}
                                            className="h-8 text-center bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="col-span-3 flex justify-center">
                                        <Button
                                            size="sm"
                                            variant={set.completed ? "default" : "secondary"}
                                            className={cn("h-8 w-full", set.completed ? "bg-green-500 hover:bg-green-600" : "bg-white/10")}
                                            onClick={() => toggleSetComplete(exIndex, setIndex)}
                                        >
                                            <Check size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-muted-foreground" onClick={() => addSet(exIndex)}>
                                <Plus size={14} className="mr-1" /> Ajouter une série
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                <Button
                    variant="outline"
                    className="w-full h-12 border-dashed border-white/20 text-muted-foreground hover:text-primary hover:border-primary/50"
                    onClick={() => setShowExerciseSelector(true)}
                >
                    <Plus className="mr-2" /> Ajouter un exercice
                </Button>
            </div>

            {/* Exercise Selector Modal (Simple overlay for now) */}
            {showExerciseSelector && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm p-4 pt-20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Choisir un exercice</h2>
                        <Button variant="ghost" onClick={() => setShowExerciseSelector(false)}>Fermer</Button>
                    </div>
                    <Input placeholder="Rechercher..." className="mb-4 bg-white/10" />
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {availableExercises.map((ex) => (
                            <div
                                key={ex.id}
                                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer flex justify-between items-center"
                                onClick={() => addExercise(ex)}
                            >
                                <span>{ex.name}</span>
                                <Plus size={16} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
