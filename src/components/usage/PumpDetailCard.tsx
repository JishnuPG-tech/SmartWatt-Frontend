import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface PresetOption {
    label: string;
    val: number;
}

export interface PumpDetailCardProps {
    id: string;
    icon: React.ReactNode;
    title: string;
    values: any;
    onFieldChange?: (key: string, value: string | number) => void;
    onBatchChange?: (updates: Record<string, unknown>) => void;
    alert?: {
        type: "warning" | "info" | "error";
        message: string;
    };
}

const PRESETS: PresetOption[] = [
    { label: 'Small Tank (15m)', val: 0.25 },
    { label: 'Medium (30m)', val: 0.5 },
    { label: 'Large (1h)', val: 1 },
    { label: 'Heavy (2h+)', val: 2 }
];

export function PumpDetailCard({
    id,
    icon,
    title,
    values,
    onFieldChange,
    onBatchChange,
    alert
}: PumpDetailCardProps) {

    const hpKey = `${id}_hp`;
    const wattsKey = `${id}_watts`;
    const hoursKey = `${id}_hours`;

    // Defaults
    const currentHP = values[hpKey] ?? "1.0"; // Default "1.0" as string to match options
    const currentHours = values[hoursKey] ?? 0.5; // Default 30 mins

    const updateHP = (val: string | number) => {
        const valNum = typeof val === 'string' ? parseFloat(val) : val;
        const watts = Math.round(valNum * 746);
        if (onBatchChange) {
            onBatchChange({
                [hpKey]: val.toString(), // Store as string to ensure select match
                [wattsKey]: watts
            });
        }
    };

    const updateHours = (val: number) => {
        if (onFieldChange) onFieldChange(hoursKey, val);
    };

    return (
        <div className="p-4 bg-[#1a202c] border border-[#334155] rounded-lg mb-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Compact Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 bg-slate-800/50 rounded text-blue-400 border border-slate-700/50">
                    {icon}
                </span>
                <span className="text-sm font-semibold text-[#e2e8f0]">{title}</span>
            </div>

            {/* Single Compact Row */}
            <div className="grid grid-cols-2 gap-3">
                {/* Motor Power */}
                <div className="space-y-1.5">
                    <label className="text-slate-500 text-[10px] font-medium uppercase tracking-wide block">Motor Power</label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <select
                                value={currentHP.toString()}
                                onChange={(e) => updateHP(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded py-1.5 px-2 pr-6 text-[#e2e8f0] text-xs appearance-none focus:border-blue-500 focus:outline-none font-semibold"
                            >
                                <option value="0.5">0.5 HP</option>
                                <option value="1.0">1.0 HP</option>
                                <option value="1.5">1.5 HP</option>
                                <option value="2.0">2.0 HP</option>
                            </select>
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="8" height="5" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 px-2 py-1 rounded text-blue-400 font-mono text-[10px] border border-slate-700/50">
                            {values[wattsKey] || 746}W
                        </div>
                    </div>
                </div>

                {/* Runtime */}
                <div className="space-y-1.5">
                    <label className="text-slate-500 text-[10px] font-medium uppercase tracking-wide block">Daily Runtime</label>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.25"
                            value={currentHours || ''}
                            onChange={(e) => updateHours(parseFloat(e.target.value) || 0)}
                            className="flex-1 bg-[#1e293b] border border-[#334155] rounded py-1.5 px-2 text-[#e2e8f0] text-xs focus:border-blue-500 focus:outline-none"
                            placeholder="0.5"
                        />
                        <span className="text-slate-500 text-[10px] font-medium">hrs</span>
                    </div>
                </div>
            </div>

            {/* Compact Presets */}
            <div className="grid grid-cols-4 gap-1 mt-3">
                {PRESETS.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => updateHours(preset.val)}
                        className={`px-1.5 py-1 rounded text-[9px] font-medium transition-all leading-tight ${currentHours === preset.val
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/30'
                            }`}
                    >
                        {preset.label.split(' ')[0]}
                    </button>
                ))}
            </div>

            {/* Compact Alert */}
            {alert && (
                <div className={`mt-3 p-2 rounded border-l-2 flex items-start gap-2 ${alert.type === "warning" ? "bg-orange-900/20 border-orange-500 text-orange-200" :
                        alert.type === "error" ? "bg-red-900/20 border-red-500 text-red-200" :
                            "bg-blue-900/20 border-blue-500 text-blue-200"
                    }`}>
                    <div className="shrink-0 mt-0.5">
                        {alert.type === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                        {alert.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {alert.type === 'info' && <Info className="w-3.5 h-3.5" />}
                    </div>
                    <p className="text-[10px] leading-relaxed">{alert.message}</p>
                </div>
            )}
        </div>
    );
}
