import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HistoryEntry {
    date: string;
    kwh: number;
    bill: number;
    mode?: string;
    [key: string]: unknown;
}

interface Props {
    history: HistoryEntry[];
}

export default function UsageChart({ history }: Props) {
    // Deduplicate history using robust Set-based logic
    const seen = new Set();
    const uniqueHistory = history.filter((entry) => {
        // 1. Sanity Check: Hide "Zero Bill" glitches (legacy data cleanup)
        const bill = Number(entry.bill || 0);
        const kwh = Number(entry.kwh || 0);

        if (bill === 0 && kwh > 5) {
            return false;
        }

        // 2. Deduplication: Create a unique key based on content
        const key = `${entry.kwh}-${entry.bill}-${entry.mode}`;

        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    if (uniqueHistory.length < 2) {
        return (
            <div className="bg-[#1a202c] border border-slate-700 rounded-2xl p-8 flex items-center justify-center text-slate-500 h-[300px]">
                Add more assessments to see trends over time.
            </div>
        );
    }

    // Sort by date asc for chart
    const data = [...uniqueHistory]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(entry => ({
            date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            bill: Math.round(entry.bill),
            kwh: Math.round(entry.kwh)
        }));

    return (
        <div className="bg-[#1a202c] border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-6">Historical Trends: Cost vs Usage</h3>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value} u`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        <Bar
                            yAxisId="left"
                            dataKey="bill"
                            name="Bill (₹)"
                            fill="#4ade80"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                            fillOpacity={0.8}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="kwh"
                            name="Usage (Units)"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6, stroke: '#1e40af', strokeWidth: 2 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
