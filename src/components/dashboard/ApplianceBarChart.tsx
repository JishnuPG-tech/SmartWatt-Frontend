import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface Props {
    breakdown: any;
}

export default function ApplianceBarChart({ breakdown }: Props) {
    const data = (breakdown?.breakdown || breakdown || [])
        .filter((item: any) => item.kwh > 0.1)
        .sort((a: any, b: any) => b.kwh - a.kwh)
        .slice(0, 10); // Top 10 only

    const COLORS = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];

    if (!data || data.length === 0) {
        return (
            <div className="bg-[#1a202c] border border-slate-700 rounded-2xl p-8 flex items-center justify-center text-slate-500 h-full min-h-[300px]">
                No usage data available to display.
            </div>
        );
    }

    return (
        <div className="bg-[#1a202c] border border-slate-700 rounded-2xl p-6 shadow-xl h-full">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-6">Top Consumers</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data} margin={{ left: 40, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#e2e8f0' }}
                            formatter={(value: number) => [`${value.toFixed(1)} kWh`, 'Usage']}
                        />
                        <Bar dataKey="kwh" radius={[0, 4, 4, 0]} barSize={16}>
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
