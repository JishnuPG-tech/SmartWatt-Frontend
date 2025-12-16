import { Activity } from 'lucide-react';

export default function SystemActiveHeader() {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/20 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">System Active</span>
        </div>
    );
}
