export default function SolarCard({ householdKwh, totalBill }: { householdKwh: number, totalBill: number }) {
    // 1. SCIENTIFIC SIZING LOGIC 📐 (The "Right Size" Formula)
    // We don't guess. We calculate based on physics.
    // 1 kW of Solar in Kerala generates ~4 units/day.
    // Formula: (Your Monthly Usage / 30) / 4 units per kW.
    // We assume a 10% buffering for cloudy days (Monsoon factor).
    const monthlyUnits = householdKwh / 2;
    const dailyNeeds = monthlyUnits / 30;

    // Safety Margin: +10% for cloudy days / degradation
    const targetDailyGeneration = dailyNeeds * 1.1;

    // Size = Target / 4
    const rawSize = targetDailyGeneration / 4;
    // Round to nearest 0.5 kW (Solar panels come in standard sizes)
    const requiredKw = Math.ceil(rawSize * 2) / 2;

    // 2. FINANCIALS 💰
    const baseCostPerKw = 60000;
    const rawCost = requiredKw * baseCostPerKw;

    // PM Surya Ghar Muft Bijli Yojana / Soura Subsidy Estimates (Approx)
    // ₹30,000 for 1kW, ₹60,000 for 2kW, ₹78,000 for 3kW+
    let subsidy = 0;
    if (requiredKw <= 1) subsidy = 30000;
    else if (requiredKw <= 2) subsidy = 60000;
    else subsidy = 78000;

    // Cap subsidy at cost (unlikely but safe)
    if (subsidy > rawCost) subsidy = rawCost * 0.9;

    const netCost = rawCost - subsidy;
    const annualBill = totalBill * 6;
    const roiYears = (netCost / annualBill).toFixed(1);

    // 3. PHYSICAL REQS 🏗️
    // ~100 sq ft per kW
    const roofArea = Math.ceil(requiredKw * 100);

    return (
        <div className="section bg-gradient-to-br from-yellow-950/40 to-orange-950/40 border border-yellow-500/30 p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-yellow-900/10">
            {/* Header Bar */}
            <div className="bg-yellow-900/20 px-6 py-4 border-b border-yellow-500/20 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-500/20 grid place-items-center border border-yellow-500/40">
                        <span className="text-lg">☀️</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-yellow-100 uppercase tracking-widest">Scientific Solar Plan</h3>
                        <p className="text-[10px] text-yellow-400/60">Based on your {householdKwh} unit load</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-yellow-500">PM Surya Ghar Compatible</span>
                    <span className="text-[10px] text-yellow-600/60">Net Metering Ready</span>
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COL 1: The Recommendation */}
                    <div className="col-span-1 lg:col-span-1 border-r border-yellow-500/10 pr-0 lg:pr-8">
                        <p className="text-yellow-200/50 text-[10px] uppercase tracking-widest mb-4">Recommended System</p>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">{requiredKw}</span>
                            <span className="text-2xl font-bold text-yellow-500">kW</span>
                        </div>
                        <p className="text-sm text-yellow-200/70 mb-6">On-Grid Hybrid Plant</p>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Daily Generation</span>
                                <span className="text-white font-medium">~{Math.round(requiredKw * 4)} Units</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Roof Area Req.</span>
                                <span className="text-white font-medium">{roofArea} sq.ft</span>
                            </div>
                        </div>
                    </div>

                    {/* COL 2: Financial ROI */}
                    <div className="col-span-1 lg:col-span-2 pl-0 lg:pl-4">
                        <p className="text-yellow-200/50 text-[10px] uppercase tracking-widest mb-4">Financial Feasibility</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-500/10">
                                <p className="text-xs text-slate-400 mb-1">Project Cost</p>
                                <p className="text-xl font-bold text-white">₹{(rawCost / 100000).toFixed(2)} L</p>
                                <p className="text-[10px] text-slate-500">@ ₹60k/kW</p>
                            </div>
                            <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-1 bg-green-500/20 rounded-bl text-[8px] text-green-400 font-bold">ESTIMATED</div>
                                <p className="text-xs text-slate-400 mb-1">State Subsidy</p>
                                <p className="text-xl font-bold text-green-400">- ₹{(subsidy / 1000).toFixed(0)} k</p>
                                <p className="text-[10px] text-green-500/60">Direct Transfer</p>
                            </div>
                            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/10">
                                <p className="text-xs text-slate-400 mb-1">Net Investment</p>
                                <p className="text-xl font-bold text-blue-300">₹{(netCost / 100000).toFixed(2)} L</p>
                                <p className="text-[10px] text-blue-400/60">Final Out of Pocket</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                            <div className="h-10 w-10 flex-shrink-0 bg-yellow-500 rounded flex items-center justify-center font-bold text-black text-xl">
                                %
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-white font-bold text-sm">Return on Investment</h4>
                                <p className="text-xs text-slate-400">
                                    You save <span className="text-green-400 font-bold">₹{totalBill}</span> every 2 months.
                                    System pays for itself in <span className="text-yellow-400 font-bold">{roiYears} years</span>.
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-white">{roiYears}</p>
                                <p className="text-[10px] text-slate-500 uppercase">Years ROI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
