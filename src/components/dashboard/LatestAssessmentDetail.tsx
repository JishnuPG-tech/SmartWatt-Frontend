import { Zap, Banknote, Users, Home, Sun, ArrowRight, Calendar, TableProperties } from 'lucide-react';
import BreakdownPieChart from './BreakdownPieChart';
import { useState } from 'react';
import DetailedBreakdownModal from './DetailedBreakdownModal';

interface HistoryEntry {
    date: string;
    kwh: number;
    bill: number;
    [key: string]: any;
}

interface Props {
    latest: HistoryEntry | null;
    previous?: HistoryEntry | null;
    fullRecord: any;
    onNavigate: () => void;
}

export default function LatestAssessmentDetail({ latest, previous, fullRecord, onNavigate }: Props) {
    const [showModal, setShowModal] = useState(false);

    if (!latest) return null;

    const date = new Date(latest.date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const breakdown = fullRecord?.final_breakdown?.ai_results?.breakdown ||
        fullRecord?.final_breakdown?.breakdown ||
        fullRecord?.final_breakdown || [];

    // Calculate Trend (The "Better or Worse?" Check)
    // We compare this bill with your previous one.
    // If you saved money (Diff < 0), it's Positive! (Green Trend)
    // If you spent more (Diff > 0), it's Negative... (Red Trend)
    let trend = null;
    if (previous && previous.bill > 0) {
        const diff = latest.bill - previous.bill;
        const percent = (diff / previous.bill) * 100;
        trend = {
            value: Math.abs(Math.round(percent)),
            direction: diff > 0 ? 'up' : 'down',
            isPositive: diff < 0 // 'Positive' means saving money (bill went down)
        };
    }

    return (
        <div className="bg-[#1a202c] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                {/* Left: Summary & Inputs */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Latest Assessment</h2>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Calendar size={14} />
                            <span>{date}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <div className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                                <Zap size={14} className="text-blue-400" /> Total Usage
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {Math.round(latest.kwh)} <span className="text-sm font-normal text-slate-500">kWh</span>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative">
                            <div className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                                <Banknote size={14} className="text-green-400" /> Est. Bill
                            </div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold text-green-400">
                                    ₹{Math.round(latest.bill)}
                                </div>
                                {trend && (
                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${trend.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                        {trend.direction === 'down' ? '↓' : '↑'} {trend.value}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Input Context */}
                    <div className="flex flex-wrap gap-3 text-sm">
                        {fullRecord?.season && (
                            <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 flex items-center gap-2 border border-slate-700">
                                <Sun size={14} className="text-amber-400" /> {fullRecord.season}
                            </span>
                        )}
                        {fullRecord?.num_people && (
                            <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 flex items-center gap-2 border border-slate-700">
                                <Users size={14} className="text-blue-300" /> {fullRecord.num_people} People
                            </span>
                        )}
                        {fullRecord?.house_type && (
                            <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 flex items-center gap-2 border border-slate-700">
                                <Home size={14} className="text-indigo-300" /> {fullRecord.house_type}
                            </span>
                        )}
                        <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700">
                            Input: <b>{fullRecord?.bi_monthly_kwh}</b> units (bi-monthly)
                        </span>
                    </div>

                    {/* CTA Buttons */}
                    <div className="pt-4 flex flex-wrap gap-4">
                        <button
                            onClick={onNavigate}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <Zap size={18} className="fill-current" />
                            Start New Assessment
                        </button>

                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition-all hover:border-slate-500 flex items-center gap-2"
                        >
                            <TableProperties size={18} />
                            View Full Report
                        </button>
                    </div>
                </div>

                {/* Right: Pie Chart */}
                <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-800 flex flex-col items-center">
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2 self-start">Usage Breakdown</h3>
                    <BreakdownPieChart breakdown={breakdown} />
                </div>

            </div>

            <DetailedBreakdownModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                breakdown={breakdown}
                totalKwh={latest.kwh}
                totalBill={latest.bill}
            />
        </div>
    );
}
