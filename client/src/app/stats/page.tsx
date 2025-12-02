"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from "@/lib/api";

export default function StatsPage() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/stats/summary");
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);

    // Mock data for chart since we don't have historical aggregation endpoint yet
    const data = [
        { name: 'Lun', volume: 4000 },
        { name: 'Mar', volume: 3000 },
        { name: 'Mer', volume: 2000 },
        { name: 'Jeu', volume: 2780 },
        { name: 'Ven', volume: 1890 },
        { name: 'Sam', volume: 2390 },
        { name: 'Dim', volume: 3490 },
    ];

    return (
        <div className="p-4 space-y-6 pt-10 pb-24">
            <h1 className="text-3xl font-bold">Statistiques</h1>

            <div className="grid grid-cols-2 gap-4">
                <Card className="glass border-white/10">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{stats?.totalWorkouts || 0}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Séances</span>
                    </CardContent>
                </Card>
                <Card className="glass border-white/10">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{(stats?.totalVolume || 0) / 1000}k</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Volume (kg)</span>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass border-white/10">
                <CardHeader>
                    <CardTitle>Volume Hebdomadaire</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
