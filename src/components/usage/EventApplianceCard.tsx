import { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface DurationOption {
    val: string;
    label: string;
    minutes: number;
}

export interface EventCardProps {
    id: string; // 'kettle', 'mixer', 'iron' etc
    icon: ReactNode;
    title: string;
    values: Record<string, any>;
    onFieldChange?: (key: string, value: any) => void;
    onBatchChange?: (updates: Record<string, any>) => void;
    alert?: {
        type: "warning" | "info" | "error";
        message: string;
    };
    durationOptions?: DurationOption[];
    q1Label?: string;
    q2Label?: string;
}

const DEFAULT_DURATIONS: DurationOption[] = [
    { val: '5', label: '5 minutes', minutes: 5 },
    { val: '10', label: '10 minutes', minutes: 10 },
    { val: '15', label: '15 minutes', minutes: 15 },
    { val: '30', label: '30 minutes', minutes: 30 },
    { val: '60', label: '60 minutes', minutes: 60 }
];

export function EventApplianceCard({
    id,
    icon,
    title,
    values,
    onFieldChange,
    onBatchChange,
    alert,
    durationOptions = DEFAULT_DURATIONS,
    q1Label = "How often do you use it?",
    q2Label = "Average duration per session"
}: EventCardProps) {

    // --- STATE MANAGEMENT ---
    const freqKey = `${id}_frequency`;
    const durKey = `${id}_duration`;
    const hoursKey = `${id}_hours`;

    const frequency = values[freqKey] || 'weekly'; // daily, 2-3, weekly, rarely
    // Default to middle option '15' if not set
    const duration = values[durKey] || '15';

    // --- CALCULATION LOGIC ---
    const calculateHours = (freq: string, durVal: string) => {
        let weeklySessions = 0;
        if (freq === 'daily') weeklySessions = 7;
        if (freq === '2-3') weeklySessions = 3;   // "Few times a week" -> ~3
        if (freq === 'weekly') weeklySessions = 1; // "Once a week" -> 1
        if (freq === 'rarely') weeklySessions = 0.5; // "Rarely" -> once every 2 weeks

        // Find minutes for selected duration
        const match = durationOptions.find(d => d.val === durVal);
        const minutes = match ? match.minutes : 15;

        // Daily Average = (Sessions/Week * Hours/Session) / 7
        const dailyHours = (weeklySessions * (minutes / 60)) / 7;
        return Number(dailyHours.toFixed(3));
    };

    const updateHours = (freq: string, dur: string) => {
        const newHours = calculateHours(freq, dur);

        if (onBatchChange) {
            onBatchChange({
                [freqKey]: freq,
                [durKey]: dur,
                [hoursKey]: newHours
            });
        } else if (onFieldChange) {
            // Note: calling multiple onFieldChange might rely on parent merging state correctly
            // Ideally onBatchChange should always be used if available
            onFieldChange(freqKey, freq);
            onFieldChange(durKey, dur);
            onFieldChange(hoursKey, newHours);
        }
    };

    const handleFreqChange = (val: string) => {
        updateHours(val, duration);
    };

    const handleDurChange = (val: string) => {
        updateHours(frequency, val);
    };

    return (
        <div className="p-6 bg-[#1a202c] border border-[#4a5568] rounded-xl mb-6 shadow-sm">
            <h4 className="text-lg font-medium text-[#e2e8f0] mb-6 flex items-center gap-3">
                <span className="p-2 bg-slate-800 rounded-lg text-blue-400 border border-slate-700">
                    {icon}
                </span>
                <span>{title}</span>
            </h4>

            <div className="grid grid-cols-1 gap-6">

                {/* Question 1: Frequency */}
                <div>
                    <label className="text-[#e2e8f0] mb-3 block text-sm font-medium">{q1Label}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        {[
                            { val: 'daily', label: 'Daily' },
                            { val: '2-3', label: 'Few times/wk' },
                            { val: 'weekly', label: 'Once/wk' },
                            { val: 'rarely', label: 'Rarely' }
                        ].map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => handleFreqChange(opt.val)}
                                className={`
                                    relative group p-3 rounded-xl border text-left transition-all duration-200
                                    ${frequency === opt.val
                                        ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                        : 'bg-[#1e293b] border-[#334155] hover:border-slate-400 hover:bg-slate-800'
                                    }
                                `}
                            >
                                <div className="flex flex-col gap-1">
                                    <span className={`text-sm font-medium ${frequency === opt.val ? 'text-blue-300' : 'text-slate-200'}`}>
                                        {opt.label}
                                    </span>
                                </div>
                                {frequency === opt.val && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question 2: Duration */}
                <div>
                    <label className="text-[#e2e8f0] mb-3 block text-sm font-medium">{q2Label}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {durationOptions.map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => handleDurChange(opt.val)}
                                className={`
                                    relative group p-3 rounded-xl border text-left transition-all duration-200
                                    ${duration === opt.val
                                        ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                        : 'bg-[#1e293b] border-[#334155] hover:border-slate-400 hover:bg-slate-800'
                                    }
                                `}
                            >
                                <div className="flex flex-col gap-1">
                                    <span className={`text-sm font-medium ${duration === opt.val ? 'text-blue-300' : 'text-slate-200'}`}>
                                        {opt.label.split(' ')[0]} {/* e.g. "15" */}
                                    </span>
                                    <span className={`text-xs ${duration === opt.val ? 'text-blue-200/70' : 'text-slate-500'}`}>
                                        minutes
                                    </span>
                                </div>
                                {duration === opt.val && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hours & Minutes Input */}
            <div className="mt-8 pt-6 border-t border-slate-700/50">
                <label className="text-slate-400 text-sm font-medium mb-2 block">Total Daily Usage</label>
                <div className="flex gap-4 mb-2">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="24"
                                value={Math.floor(values[hoursKey] || 0) || ''}
                                onChange={(e) => {
                                    const newH = parseFloat(e.target.value) || 0;
                                    const currentM = Math.round(((values[hoursKey] || 0) % 1) * 60);
                                    if (onBatchChange) {
                                        onBatchChange({ [hoursKey]: newH + (currentM / 60) });
                                    } else if (onFieldChange) {
                                        onFieldChange(hoursKey, newH + (currentM / 60));
                                    }
                                }}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                                placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">hrs</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={Math.round(((values[hoursKey] || 0) % 1) * 60) || ''}
                                onChange={(e) => {
                                    const newM = parseFloat(e.target.value) || 0;
                                    const currentH = Math.floor(values[hoursKey] || 0);
                                    if (onBatchChange) {
                                        onBatchChange({ [hoursKey]: currentH + (newM / 60) });
                                    } else if (onFieldChange) {
                                        onFieldChange(hoursKey, currentH + (newM / 60));
                                    }
                                }}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                                placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">min</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>~{(values[hoursKey] * 60).toFixed(0)} min/day avg</span>
                    {values[hoursKey] > 1.0 && <span className="text-orange-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High Usage</span>}
                </div>
            </div>

            {alert && (
                <div className={`mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3 ${alert.type === "warning" ? "bg-orange-900/20 border-orange-500 text-orange-200" :
                    alert.type === "error" ? "bg-red-900/20 border-red-500 text-red-200" :
                        "bg-blue-900/20 border-blue-500 text-blue-200"
                    }`}>
                    <div className="shrink-0 mt-0.5">
                        {alert.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {alert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                        {alert.type === 'info' && <Info className="w-5 h-5" />}
                    </div>
                    <p className="text-sm leading-relaxed">
                        {alert.message}
                    </p>
                </div>
            )}
        </div>
    );
}
