import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
    breakdown: any; // Using 'any' for flexibility, but expected to be { breakdown: [] } or []
}

export default function BreakdownPieChart({ breakdown }: Props) {
    // --- VISUALIZING THE INVISIBLE ---
    // Numbers are boring. We turn them into a donut!
    // Logic: Filter out tiny usage (noise) and sort biggest to smallest.
    const data = (breakdown?.breakdown || breakdown || [])
        .filter((item: any) => item.kwh > 0.1)
        .sort((a: any, b: any) => b.kwh - a.kwh);

    const COLORS = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];

    if (!data || data.length === 0) return (
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No breakdown data available
        </div>
    );

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="kwh"
                    >
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        formatter={(value: any) => [`${Number(value).toFixed(1)} kWh`, 'Usage']}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
