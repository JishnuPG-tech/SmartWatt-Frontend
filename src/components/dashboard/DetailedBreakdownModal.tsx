import { X, Zap, Banknote } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    breakdown: any[];
    totalKwh: number;
    totalBill: number;
}

export default function DetailedBreakdownModal({ isOpen, onClose, breakdown, totalKwh, totalBill }: Props) {
    if (!isOpen) return null;

    if (!breakdown || breakdown.length === 0) return null;

    if (!breakdown || breakdown.length === 0) return null;

    // --- FULL TRANSPARENCY MODE ---
    // The user wants to see *exactly* where every rupee went.
    // We show everything, sorted by the biggest power guzzlers.
    const sortedData = [...breakdown]
        .filter(item => item.kwh > 0.01)
        .sort((a, b) => b.kwh - a.kwh);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1a202c] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="text-blue-400" size={20} />
                            Appliance Consumption Detail
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Sorted by Usage</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#1a202c] border-b border-slate-700/50 sticky top-0">
                                <tr>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Appliance</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Usage (kWh)</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Confidence</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Percentage</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Cost (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30 text-slate-200">
                                {sortedData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="py-4 px-6 text-slate-200 font-medium group-hover:text-blue-300 transition-colors">
                                            {item.name}
                                        </td>
                                        <td className="text-right py-4 px-6 font-mono">{item.kwh.toFixed(2)}</td>
                                        <td className="text-right py-4 px-6 text-slate-500 text-xs">
                                            {item.uncertainty ? `±${item.uncertainty.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="text-right py-4 px-6 font-mono">
                                            {item.percentage ? item.percentage.toFixed(1) : ((item.kwh / totalKwh) * 100).toFixed(1)}%
                                        </td>
                                        <td className="text-right py-4 px-6 font-mono font-bold text-green-400">
                                            ₹{Math.round(item.cost).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {/* Total Row */}
                                <tr className="bg-slate-800/50 border-t border-slate-600/50 sticky bottom-0">
                                    <td className="py-4 px-6 text-white font-bold uppercase tracking-wider text-xs">TOTAL</td>
                                    <td className="text-right py-4 px-6 text-white font-bold font-mono">{totalKwh.toFixed(1)}</td>
                                    <td className="text-right py-4 px-6"></td>
                                    <td className="text-right py-4 px-6 text-white font-bold font-mono">100%</td>
                                    <td className="text-right py-4 px-6 text-white font-bold font-mono text-lg">₹{Math.floor(totalBill)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/30 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
