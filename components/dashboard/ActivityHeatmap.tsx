"use client";

import { useEffect, useState } from "react";
import { billingsService, DailyStat } from "@/services/billings.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

export default function ActivityHeatmap() {
    const { user } = useAuthStore();
    const [data, setData] = useState<DailyStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === "Doctor") {
            fetchHeatmap();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchHeatmap = async () => {
        try {
            const res = await billingsService.getHeatmap();
            setData(res.data || []);
        } catch (err) {
            console.error("Failed to fetch heatmap", err);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== "Doctor") return null;

    // Simple implementation of a heatmap-like structure (last 90 days)
    const days = 90;
    const today = new Date();
    const heatmapGrid = [];
    
    // Create a map for quick lookup
    const dataMap = new Map(data.map(d => [d.date, d.count]));

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = dataMap.get(dateStr) || 0;
        heatmapGrid.push({ date: dateStr, count });
    }

    const getColor = (count: number) => {
        if (count === 0) return "bg-gray-100 dark:bg-gray-800";
        if (count < 3) return "bg-emerald-200 dark:bg-emerald-900";
        if (count < 6) return "bg-emerald-400 dark:bg-emerald-700";
        if (count < 10) return "bg-emerald-500 dark:bg-emerald-600";
        return "bg-emerald-600 dark:bg-emerald-500";
    };

    return (
        <Card className="clay-card">
            <CardHeader>
                <CardTitle>Patient Activity Heatmap</CardTitle>
                <CardDescription>Daily patient diagnosis frequency over the last 90 days.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-24 flex items-center justify-center text-muted-foreground">Loading...</div>
                ) : data.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-muted-foreground">No data available</div>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {heatmapGrid.map((day, idx) => (
                            <div 
                                key={idx} 
                                className={`w-4 h-4 rounded-sm ${getColor(day.count)} transition-colors hover:ring-2 ring-emerald-400 cursor-pointer`}
                                title={`${day.date}: ${day.count} patients`}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
