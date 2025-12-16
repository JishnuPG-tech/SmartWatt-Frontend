export default function BenchmarkCard({ householdKwh, numPeople }: { householdKwh: number, numPeople: string }) {
    // --- SOCIAL COMPARISON (The "Neighbor Test") ---
    // Humans care about social status. "Am I doing better than my neighbor?"
    // We calculate a baseline based on family size (90 units/person).
    // If you beat the baseline, we give you a green badge (Positive Reinforcement).
    // If you lose, we show orange (Urgency).
    const baseline = Math.max(200, parseInt(numPeople || '4') * 90);
    const userKwh = householdKwh;
    const efficiency = ((baseline - userKwh) / baseline) * 100;
    const isEfficient = userKwh <= baseline;
    const width = Math.min(100, (userKwh / (baseline * 1.5)) * 100); // Scale bar

    return (
        <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10">
            {/* Header Bar */}
            <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏘️</span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Community Benchmark</span>
                </div>
                <span className="text-xs text-slate-500">Peer Comparison</span>
            </div>

            <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Text Summary */}
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Vs. Average Kerala Home ({baseline} kWh)</p>
                        <div className="flex items-baseline gap-3 justify-center md:justify-start">
                            <span className={`text-4xl font-bold ${isEfficient ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]' : 'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]'}`}>
                                {isEfficient ? `${Math.round(efficiency)}% Better` : `${Math.round(Math.abs(efficiency))}% Higher`}
                            </span>
                            <span className="text-slate-500 text-sm font-medium">than neighbors</span>
                        </div>
                        <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium border ${isEfficient ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-orange-500/10 border-orange-500/20 text-orange-300'}`}>
                            {isEfficient
                                ? "Excellent Efficiency Standards! 🌿"
                                : "High Consumption Detected ⚠️ Check AC/Geyser"}
                        </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="flex-1 w-full bg-[#1a202c]/50 p-6 rounded-xl border border-slate-700/50">
                        <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            {/* Marker for Avg */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-white/70 z-10 shadow-[0_0_5px_rgba(255,255,255,0.8)]" style={{ left: `${(baseline / (baseline * 1.5)) * 100}%` }}></div>

                            {/* User Bar */}
                            <div
                                className={`h-full rounded-full transition-all duration-1000 relative ${isEfficient ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-orange-600 to-red-500'}`}
                                style={{ width: `${width}%` }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-px bg-white/50"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-3 font-mono uppercase tracking-wider">
                            <span>0 kWh</span>
                            <span className="text-slate-300 font-bold">Avg: {baseline}</span>
                            <span>Max</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
