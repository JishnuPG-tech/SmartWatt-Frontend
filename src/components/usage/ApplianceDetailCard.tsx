import { ReactNode, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
}

export interface ApplianceCardProps {
    icon: ReactNode;
    title: string;
    fields?: Array<{
        label: string;
        key: string;
        options: SelectOption[];
    }>;
    usagePatterns: SelectOption[];
    selectedPattern: string;
    onPatternChange: (value: string) => void;
    onFieldChange?: (key: string, value: string) => void;
    values?: Record<string, any>;
    alert?: {
        type: "warning" | "info" | "error";
        message: string;
    };
    exactHoursKey: string;
    onExactHoursChange: (val: number) => void;
    exactHoursValue: number;
}

export function ApplianceDetailCard({
    icon,
    title,
    fields,
    usagePatterns,
    selectedPattern,
    onPatternChange,
    onFieldChange,
    values = {},
    alert,
    exactHoursKey,
    onExactHoursChange,
    exactHoursValue
}: ApplianceCardProps) {
    // const currentH = Math.floor(exactHoursValue || 0); // Unused
    // const currentM = Math.round(((exactHoursValue || 0) % 1) * 60); // Unused

    const usageModeKey = `usage_mode_${title}`;
    // const usageMode = values[usageModeKey] || 'pattern'; // Unused

    // Handle field changes and extract hours from usage pattern
    const handleFieldChange = (key: string, value: string) => {
        // First, update the field value
        if (onFieldChange) {
            onFieldChange(key, value);
        }

        // If this is a usage pattern field (legacy check for inline fields), extract hours from the label
        // NOTE: We are moving towards the top-level usagePatterns prop, but keeping this for backward compat
        if (key.includes('usage_pattern') || key.includes('_pattern')) {
            const field = fields?.find(f => f.key === key);
            const selectedOption = field?.options.find(opt => opt.value === value);

            if (selectedOption) {
                // Extract hours from label like "Moderate (6-10 hrs/day)" or "Rare (0–1 hr/day)"
                // Matches standard hyphen (-), en-dash (–), and supports "hrs/night"
                const match = selectedOption.label.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?).*?hrs?/i) ||
                    selectedOption.label.match(/(\d+(?:\.\d+)?).*?hrs?/i);

                if (match) {
                    const min = parseFloat(match[1]);
                    const max = match[2] ? parseFloat(match[2]) : min;
                    const avg = (min + max) / 2;
                    // Update hours immediately
                    onExactHoursChange(avg);
                }
            }
        }
    };

    return (
        <div className="p-6 bg-[#1a202c] border border-[#4a5568] rounded-xl mb-6 shadow-sm">
            <h4 className="text-lg font-medium text-[#e2e8f0] mb-4 flex items-center gap-3">
                <span className="p-2 bg-slate-800 rounded-lg text-blue-400 border border-slate-700">
                    {icon}
                </span>
                <span>{title}</span>
            </h4>

            {/* Combined Grid for Fields and Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Existing Fields */}
                {fields && fields.map((field) => (
                    <div key={field.key}>
                        <label className="text-[#e2e8f0] mb-2 block text-sm">{field.label}</label>
                        <div className="relative">
                            <select
                                value={values[field.key]?.toString() ?? field.options[0].value}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] appearance-none focus:border-blue-500 focus:outline-none"
                            >
                                {field.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Usage Pattern Selector - Button Grid */}
                {usagePatterns && usagePatterns.length > 0 && (
                    <div className="md:col-span-2">
                        <label className="text-[#e2e8f0] mb-3 block text-sm font-medium">Usage Pattern</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {usagePatterns.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => onPatternChange(opt.value)}
                                    className={`
                                        relative group p-3 rounded-xl border text-left transition-all duration-200
                                        ${selectedPattern === opt.value
                                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-[#1e293b] border-[#334155] hover:border-slate-400 hover:bg-slate-800'
                                        }
                                    `}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-sm font-medium ${selectedPattern === opt.value ? 'text-blue-300' : 'text-slate-200'}`}>
                                            {opt.label.includes('(') ? opt.label.split('(')[0].trim() : opt.label}
                                        </span>
                                        {opt.label.includes('(') && (
                                            <span className={`text-xs ${selectedPattern === opt.value ? 'text-blue-200/70' : 'text-slate-500'}`}>
                                                {opt.label.match(/\((.*?)\)/)?.[1]}
                                                {opt.label.includes(') - ') ? ` • ${opt.label.split(') - ')[1]}` : ''}
                                            </span>
                                        )}
                                    </div>

                                    {selectedPattern === opt.value && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Hours & Minutes Input */}
            <div className="mb-4">
                <label className="text-slate-400 text-sm font-medium mb-2 block">Daily Usage</label>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="24"
                                value={Math.floor(exactHoursValue || 0) || ''}
                                onChange={(e) => {
                                    const newH = parseFloat(e.target.value) || 0;
                                    const currentM = Math.round(((exactHoursValue || 0) % 1) * 60);
                                    onExactHoursChange(newH + (currentM / 60));
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
                                value={Math.round(((exactHoursValue || 0) % 1) * 60) || ''}
                                onChange={(e) => {
                                    const newM = parseFloat(e.target.value) || 0;
                                    const currentH = Math.floor(exactHoursValue || 0);
                                    onExactHoursChange(currentH + (newM / 60));
                                }}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                                placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">min</span>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Total: {exactHoursValue?.toFixed(2)} hours/day
                </p>
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
