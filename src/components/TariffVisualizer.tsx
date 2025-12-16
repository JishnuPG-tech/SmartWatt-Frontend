// --- The "Subsidy Ladder" ---
// KSEB billing is like a ladder.
// Step 1 (0-50 units) is cheap. Step 2 is pricier.
// This colorful bar shows you EXACTLY which step you are standing on.
// If the bar turns Yellow, that's your current step!
export default function TariffVisualizer({ householdKwh }: { householdKwh: number }) {
    return (
        <div className="mt-4 mb-4">
            <p className="text-xs text-slate-400 mb-1">Your Tariff Slab Position (Telescopic Pricing)</p>
            <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                {[50, 50, 50, 50, 50, 1000].map((step, idx) => {
                    // Calculate cumulative steps
                    const prevLimit = idx * 50;
                    const limit = prevLimit + step;
                    const monthly = householdKwh / 2;

                    // Determine if user usage falls in or passes this slab
                    let color = 'bg-slate-700';
                    if (monthly > prevLimit) {
                        if (monthly >= limit && idx < 5) color = 'bg-blue-500'; // Full block used
                        else color = 'bg-yellow-400'; // Current block (partial)
                    }

                    return (
                        <div key={idx} className={`flex-1 border-r border-slate-900 ${color} relative group`}>
                            <div className="absolute inset-x-0 bottom-full mb-1 hidden group-hover:block bg-black text-xs text-white p-1 rounded z-10 w-max">
                                Tier {idx + 1}: ₹{3 + idx}/unit
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
                <span>150</span>
                <span>200</span>
                <span>250+</span>
            </div>
        </div>
    );
}
