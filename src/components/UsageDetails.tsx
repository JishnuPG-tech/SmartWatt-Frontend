import { useState, useEffect, ReactNode } from 'react';
import { saveTraining } from '@/lib/saveTraining';
import { normalizePattern } from '@/lib/normalizePattern';
import {
    ChevronRight, AlertTriangle, AlertCircle, Info,
    Snowflake, Shirt, Flame, Utensils, Coffee, Wind, Lightbulb,
    Tv, Monitor, Laptop, Droplet, Zap, Refrigerator, WashingMachine,
    Microwave, AirVent, CookingPot, Heater, Disc, Sandwich, ShowerHead
} from 'lucide-react';

interface Props {
    selected: string[];
    details: Record<string, any>;
    onUpdate: (details: Record<string, any>) => void;
    onNext: () => void;
    onBack: () => void;
    mode: 'quick' | 'detailed';
    trainingId: string;
    subStep: number;
    setSubStep: (step: number) => void;
}

// --- Reusable Appliance Detail Card Component (Internal) ---
// This isn't just a card; it's a "Smart Wrapper" for every appliance.
// It handles:
// 1. The Questions (How old? What capacity?)
// 2. The Inputs (Pattern dropdown, Exact sliders, AI toggle)
// 3. The Alerts (Warning you if you say you use an AC for 25 hours a day!)
interface SelectOption {
    value: string;
    label: string;
}

interface ApplianceCardProps {
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

function ApplianceDetailCard({
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
    const currentH = Math.floor(exactHoursValue || 0);
    const currentM = Math.round(((exactHoursValue || 0) % 1) * 60);

    const usageModeKey = `usage_mode_${title}`;
    const usageMode = values[usageModeKey] || 'pattern';

    const handleModeChange = (mode: 'pattern' | 'exact' | 'ai') => {
        onFieldChange?.(usageModeKey, mode);
    };

    const handleExactChange = (h: number, m: number) => {
        onExactHoursChange(h + (m / 60));
    };

    return (
        <div className="p-6 bg-[#1a202c] border border-[#4a5568] rounded-xl mb-6 shadow-sm">
            <h4 className="text-lg font-medium text-[#e2e8f0] mb-4 flex items-center gap-3">
                <span className="p-2 bg-slate-800 rounded-lg text-blue-400 border border-slate-700">
                    {icon}
                </span>
                <span>{title}</span>
            </h4>

            {fields && fields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {fields.map((field) => (
                        <div key={field.key}>
                            <label className="text-[#e2e8f0] mb-2 block text-sm">{field.label}</label>
                            <div className="relative">
                                <select
                                    value={values[field.key]?.toString() ?? field.options[0].value}
                                    onChange={(e) => onFieldChange?.(field.key, e.target.value)}
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
                </div>
            )}

            <div className="mb-4">
                <label className="text-[#e2e8f0] font-medium mb-3 block">{title} Usage</label>

                <div className="flex flex-col gap-3 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name={`usage_mode_${title}`}
                            checked={usageMode === 'pattern'}
                            onChange={() => handleModeChange('pattern')}
                            className="accent-blue-500"
                        />
                        <span className="text-sm text-[#e2e8f0]">Choose usage pattern</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name={`usage_mode_${title}`}
                            checked={usageMode === 'exact'}
                            onChange={() => handleModeChange('exact')}
                            className="accent-blue-500"
                        />
                        <span className="text-sm text-[#e2e8f0]">Enter exact hours and minutes</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name={`usage_mode_${title}`}
                            checked={usageMode === 'ai'}
                            onChange={() => handleModeChange('ai')}
                            className="accent-blue-500"
                        />
                        <span className="text-sm text-[#e2e8f0]">Use AI estimate</span>
                    </label>
                </div>

                {usageMode === 'pattern' && (
                    <div className="animate-in fade-in">
                        <label className="text-[#e2e8f0] mb-2 block text-sm">Usage Pattern:</label>
                        <div className="relative">
                            <select
                                value={selectedPattern}
                                onChange={(e) => onPatternChange(e.target.value)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] appearance-none focus:border-blue-500 focus:outline-none"
                            >
                                {usagePatterns.map((pattern) => (
                                    <option key={pattern.value} value={pattern.value}>
                                        {pattern.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {usageMode === 'exact' && (
                    <div className="animate-in fade-in pl-6 grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[#e2e8f0] mb-2 block text-sm">Hours</label>
                            <input
                                type="number" min="0" max="24"
                                value={currentH}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    handleExactChange(Math.max(0, Math.min(24, val)), currentM);
                                }}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[#e2e8f0] mb-2 block text-sm">Minutes</label>
                            <input
                                type="number" min="0" max="59"
                                value={currentM}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    handleExactChange(currentH, Math.max(0, Math.min(59, val)));
                                }}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                {usageMode === 'ai' && (
                    <div className="animate-in fade-in pl-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-sm text-blue-200 flex gap-2 items-center">
                        <span>AI will estimate usage for {title} based on your household profile.</span>
                    </div>
                )}
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

// --- Main Component ---

export default function UsageDetails({ selected, details, onUpdate, onNext, onBack, mode, trainingId, subStep, setSubStep }: Props) {
    // const [subStep, setSubStep] = useState(1); // Controlled by parent


    // Helper to categorize appliances
    const getCategories = () => {
        const cats = {
            major: ['air_conditioner', 'refrigerator', 'washing_machine', 'geyser'].filter(id => selected.includes(id)),
            kitchen: ['mixer', 'microwave', 'kettle', 'induction', 'rice_cooker', 'toaster', 'food_processor'].filter(id => selected.includes(id)),
            lighting: ['fans', 'led_lights', 'cfl_lights', 'tube_lights'].filter(id => selected.includes(id)),
            other: ['tv', 'desktop', 'laptop', 'pump', 'iron', 'hair_dryer', 'vacuum'].filter(id => selected.includes(id))
        };
        return cats;
    };

    const categories = getCategories();

    // --- INSTANT ALERT LOGIC (The "Friendly Cop") ---
    // Users make mistakes. They might typo "24 hours" for a toaster.
    // Instead of waiting for a valid bill, we warn them RIGHT NOW.
    // We check high usage for energy guzzlers like ACs and Geysers.
    const getUsageAlert = (name: string, hours: number): { type: "warning" | "info" | "error"; message: string } | undefined => {
        if (!hours) return undefined;

        // AC Logic
        if (name === 'ac') {
            if (hours > 16) return { type: "error", message: "Critical: continuous AC usage (>16h) will drastically spike your bill." };
            if (hours > 12) return { type: "warning", message: "Notice: High AC usage detected. Expect a significant impact on your monthly bill." };
        }

        // Geyser Logic
        if (name === 'geyser') {
            if (hours > 3) return { type: "error", message: "Critical: Geyser running >3 hours/day is extremely expensive." };
            if (hours > 1.5) return { type: "warning", message: "Warning: Most households only need 30-60 mins of geyser usage per day." };
        }

        // Pump Logic
        if (name === 'pump') {
            if (hours > 2) return { type: "error", message: "Critical: Water Pump > 2 hours? Check for leaks or float valve failure." };
            if (hours > 1) return { type: "warning", message: "Notice: Pump usage is higher than average (30-45 mins)." };
        }

        // Induction Logic
        if (name === 'induction') {
            if (hours > 3) return { type: "error", message: "Heavy Load: Induction > 3 hours makes electricity costlier than LPG." };
            if (hours > 2) return { type: "warning", message: "Warning: High induction usage detected." };
        }

        // Iron Logic
        if (name === 'iron') {
            if (hours > 1) return { type: "warning", message: "Tip: Ironing > 1 hour/day? Try batch ironing weekly to save power." };
        }

        // --- NEW APPLIANCES ---

        // Refrigerator
        if (name === 'fridge') {
            if (hours > 24) return { type: "error", message: "Hours cannot exceed 24." };
            if (hours < 10) return { type: "warning", message: "Warning: < 10 hours may cause food spoilage unless empty." };
        }

        // Washing Machine
        if (name === 'wm') {
            if (hours > 3) return { type: "warning", message: "High usage: > 3 hours/day. Verify if this is accurate." };
        }

        // Kitchen Utils
        if (['microwave', 'kettle', 'rice_cooker', 'food_processor'].includes(name)) {
            if (hours > 1.5) return { type: "warning", message: `High usage for ${name.replace('_', ' ')}. > 1.5 hours is unusual.` };
        }
        if (name === 'mixer') {
            if (hours > 1) return { type: "warning", message: "Mixer running > 1 hr? Ensure jars are not overloaded." };
        }
        if (name === 'toaster') {
            if (hours > 0.5) return { type: "warning", message: "> 30 mins of toasting? That's a lot of bread!" };
        }

        // Lights & Fans
        if (name === 'fans') {
            if (hours > 20) return { type: "warning", message: "Fans running > 20 hours. Consider BLDC fans to save 60%." };
        }
        if (['led', 'cfl', 'tube'].includes(name)) {
            if (hours > 18) return { type: "warning", message: "Lights on > 18 hours? Ensure you switch off when leaving rooms." };
        }

        // Electronics
        if (name === 'tv') {
            if (hours > 10) return { type: "warning", message: "TV on > 10 hours. Consider lowering brightness to save power." };
        }
        if (name === 'desktop') {
            if (hours > 16) return { type: "warning", message: "Desktop > 16 hours. Enable Sleep Mode when efficient." };
        }
        if (name === 'laptop') {
            if (hours > 16) return { type: "warning", message: "Laptop plugged in > 16 hours. Modern batteries prefer cycling." };
        }

        // Cleaning / Grooming
        if (name === 'hair_dryer') {
            if (hours > 0.5) return { type: "warning", message: "Hair Dryer > 30 mins is equivalent to running 100 LED bulbs!" };
        }
        if (name === 'vacuum') {
            if (hours > 1) return { type: "warning", message: "Vacuuming > 1 hour daily? Check bag/filter for blockages." };
        }

        return undefined;
    };

    // Determine active pages
    const pages = [
        ...(categories.major.length ? [{ id: 'major', title: 'Major Appliances', subtitle: 'High-impact appliances - typically 60-80% of your bill', items: categories.major }] : []),
        ...(categories.kitchen.length ? [{ id: 'kitchen', title: 'Kitchen Appliances', subtitle: 'Cooking and preparation', items: categories.kitchen }] : []),
        ...(categories.lighting.length ? [{ id: 'lighting', title: 'Lighting & Fans', subtitle: 'Lighting and ventilation systems', items: categories.lighting }] : []),
        ...(categories.other.length ? [{ id: 'other', title: 'Other Appliances', subtitle: 'Electronics and other devices', items: categories.other }] : [])
    ];

    const totalPages = pages.length;

    if (totalPages === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 text-center py-12">
                <div className="main-header"><h1>SMARTWATT</h1></div>
                <div className="st-alert-info mb-6">No appliances selected for detailed analysis.</div>
                <button onClick={onNext} className="st-button">Calculate Results →</button>
            </div>
        );
    }


    const currentPage = pages[subStep - 1];
    const progress = (subStep / (totalPages + 1)) * 100;

    const handleUpdate = (newDetails: Record<string, any>) => {
        onUpdate(newDetails);
        saveTraining(trainingId, { appliance_usage: newDetails });
    };

    const updateDetail = (key: string, value: any) => {
        handleUpdate({ ...details, [key]: value });
    };

    const updateDetails = (updates: Record<string, any>) => {
        handleUpdate({ ...details, ...updates });
    };

    // Helper to handle pattern changes with normalization
    const handlePatternChange = (
        keyPrefix: string,
        val: string,
        patterns: Array<{ value: string, label: string }>
    ) => {
        const selectedPattern = patterns.find(p => p.value === val);
        const label = selectedPattern ? selectedPattern.label : "";
        const normalized = normalizePattern(label);

        updateDetails({
            [`${keyPrefix}_pattern`]: val,
            [`${keyPrefix}_hours`]: normalized.avg_hours,
            [`${keyPrefix}_min_hours`]: normalized.min_hours,
            [`${keyPrefix}_max_hours`]: normalized.max_hours,
            [`${keyPrefix}_avg_hours`]: normalized.avg_hours,
            [`${keyPrefix}_category`]: normalized.category
        });
    };

    // --- Render Logic (The massive Switch-Case) ---
    // This looks repetitive, but it allows us to customize every single question for every appliance.
    // For a Fridge, we ask about "Litres". For an AC, we ask about "Tons" and "Stars".
    // One size does NOT fit all here.

    const renderAppliance = (id: string) => {
        switch (id) {
            // --- MAJOR APPLIANCES ---
            case 'refrigerator':
                const fridgePatterns = [
                    { value: "manual", label: "Manual control (10-14 hours) - Night + brief evening use" },
                    { value: "light", label: "Light use (16-20 hours) - Occasional off periods during day" },
                    { value: "normal", label: "Normal use (20-23 hours) - Regular household with defrost breaks" },
                    { value: "always", label: "Always running (24 hours) - Continuous operation, never off" }
                ];
                return (
                    <ApplianceDetailCard
                        key="refrigerator"
                        icon={<Refrigerator className="w-5 h-5 text-blue-400" />}
                        title="Refrigerator"
                        fields={[
                            { label: "Star rating", key: "fridge_star", options: [{ value: "unknown", label: "Don't Know" }, { value: "3-star", label: "3-star" }, { value: "4-star", label: "4-star" }, { value: "5-star", label: "5-star" }] },
                            { label: "Capacity", key: "fridge_capacity", options: [{ value: "unknown", label: "Don't Know" }, { value: "190L", label: "190L" }, { value: "215L", label: "215L" }, { value: "240L", label: "240L" }, { value: "300L+", label: "300L+" }] },
                            { label: "Type", key: "fridge_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "direct", label: "Direct Cool" }, { value: "frost", label: "Frost Free" }] },
                            { label: "Age", key: "fridge_age", options: [{ value: "unknown", label: "Don't Know" }, { value: "<1", label: "< 1 year" }, { value: "1-3", label: "1-3 years" }, { value: "3-5", label: "3-5 years" }, { value: "5-10", label: "5-10 years" }, { value: "10+", label: "10+ years" }] }
                        ]}
                        usagePatterns={fridgePatterns}
                        selectedPattern={details.fridge_pattern || "normal"}
                        onPatternChange={(val) => handlePatternChange('fridge', val, fridgePatterns)}
                        onFieldChange={updateDetail}
                        values={details}
                        alert={getUsageAlert('fridge', details.fridge_hours)}
                        exactHoursKey="fridge_hours"
                        onExactHoursChange={(val) => updateDetail('fridge_hours', val)}
                        exactHoursValue={details.fridge_hours}
                    />
                );
            case 'air_conditioner':
                const acPatterns = [
                    { value: "light", label: "Light (1-3 hours/day) - Bedroom at night" },
                    { value: "moderate", label: "Moderate (4-8 hours/day) - Daily evening use" },
                    { value: "heavy", label: "Heavy (9-16 hours/day) - Most of the day" },
                    { value: "always", label: "Always on (20-24 hours/day) - Server room, office" }
                ];
                return (
                    <ApplianceDetailCard
                        key="ac"
                        icon={<AirVent className="w-5 h-5 text-cyan-400" />}
                        title="Air Conditioner"
                        fields={[
                            { label: "Star rating", key: "ac_star", options: [{ value: "unknown", label: "Don't Know" }, { value: "3-star", label: "3-star" }, { value: "4-star", label: "4-star" }, { value: "5-star", label: "5-star" }] },
                            { label: "Tonnage", key: "ac_tonnage", options: [{ value: "unknown", label: "Don't Know" }, { value: "1.0", label: "1.0 ton" }, { value: "1.5", label: "1.5 ton" }, { value: "2.0", label: "2.0 ton" }] },
                            { label: "Type", key: "ac_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "window", label: "Window" }, { value: "split", label: "Split" }, { value: "inverter", label: "Inverter" }] },
                            { label: "Age", key: "ac_age", options: [{ value: "unknown", label: "Don't Know" }, { value: "<2", label: "< 2 years" }, { value: "2-5", label: "2-5 years" }, { value: "5-10", label: "5-10 years" }, { value: "10+", label: "10+ years" }] }
                        ]}
                        usagePatterns={acPatterns}
                        selectedPattern={details.ac_pattern || "moderate"}
                        onPatternChange={(val) => handlePatternChange('ac', val, acPatterns)}
                        onFieldChange={updateDetail}
                        values={details}
                        exactHoursKey="ac_hours"
                        onExactHoursChange={(val) => updateDetail('ac_hours', val)}
                        exactHoursValue={details.ac_hours}
                        alert={getUsageAlert('ac', details.ac_hours)}
                    />
                );
            case 'washing_machine':
                const wmPatterns = [
                    { value: "light", label: "Light (1-2 cycles/week) - Small household" },
                    { value: "moderate", label: "Moderate (3-4 cycles/week) - Regular household" },
                    { value: "heavy", label: "Heavy (5-6 cycles/week) - Large family" },
                    { value: "very_heavy", label: "Very Heavy (7+ cycles/week) - Daily washing" }
                ];
                return (
                    <ApplianceDetailCard
                        key="wm"
                        icon={<WashingMachine className="w-5 h-5 text-indigo-400" />}
                        title="Washing Machine"
                        fields={[
                            { label: "Type", key: "wm_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "semi_automatic", label: "Semi-Automatic" }, { value: "top_load", label: "Top Load (Fully Automatic)" }, { value: "front_load", label: "Front Load (Fully Automatic)" }] },
                            { label: "Capacity", key: "wm_capacity", options: [{ value: "unknown", label: "Don't Know" }, { value: "6.0", label: "6.0 kg" }, { value: "6.5", label: "6.5 kg" }, { value: "7.0", label: "7.0 kg" }, { value: "8.0", label: "8.0 kg+" }] },
                            { label: "Star Rating", key: "wm_star", options: [{ value: "unknown", label: "Don't Know" }, { value: "3", label: "3 Star" }, { value: "4", label: "4 Star" }, { value: "5", label: "5 Star" }] },
                            { label: "Age", key: "wm_age", options: [{ value: "unknown", label: "Don't Know" }, { value: "<2", label: "< 2 years" }, { value: "2-5", label: "2-5 years" }, { value: "5-10", label: "5-10 years" }, { value: "10+", label: "10+ years" }] }
                        ]}
                        usagePatterns={wmPatterns}
                        selectedPattern={details.wm_pattern || "moderate"}
                        onPatternChange={(val) => handlePatternChange('wm', val, wmPatterns)}
                        onFieldChange={updateDetail}
                        values={details}
                        alert={getUsageAlert('wm', details.wm_hours)}
                        exactHoursKey="wm_hours"
                        onExactHoursChange={(val) => updateDetail('wm_hours', val)}
                        exactHoursValue={details.wm_hours}
                    />
                );
            case 'geyser':
                const geyserPatterns = [
                    { value: "minimal", label: "Minimal (30 min/day) - Quick showers" },
                    { value: "light", label: "Light (1-2 hours/day) - Morning use only" },
                    { value: "moderate", label: "Moderate (2-3 hours/day) - Morning + evening" },
                    { value: "heavy", label: "Heavy (3+ hours/day) - Frequent hot water use" }
                ];
                return (
                    <ApplianceDetailCard
                        key="geyser"
                        icon={<ShowerHead className="w-5 h-5 text-red-500" />}
                        title="Water Heater / Geyser"
                        fields={[
                            { label: "Type", key: "geyser_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "instant", label: "Instant (3kW+)" }, { value: "storage", label: "Storage (2kW)" }, { value: "gas", label: "Gas Geyser" }] },
                            { label: "Capacity", key: "geyser_capacity", options: [{ value: "unknown", label: "Don't Know" }, { value: "3L", label: "3 Liters (Instant)" }, { value: "10L", label: "10 Liters" }, { value: "15L", label: "15 Liters" }, { value: "25L", label: "25 Liters+" }] },
                            { label: "Age", key: "geyser_age", options: [{ value: "unknown", label: "Don't Know" }, { value: "<2", label: "< 2 years" }, { value: "2-5", label: "2-5 years" }, { value: "5-10", label: "5-10 years" }, { value: "10+", label: "10+ years" }] }
                        ]}
                        usagePatterns={geyserPatterns}
                        selectedPattern={details.geyser_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('geyser', val, geyserPatterns)}
                        onFieldChange={updateDetail}
                        values={details}
                        alert={getUsageAlert('geyser', details.geyser_hours)}
                        exactHoursKey="geyser_hours"
                        onExactHoursChange={(val) => updateDetail('geyser_hours', val)}
                        exactHoursValue={details.geyser_hours}
                    />
                );

            // --- KITCHEN APPLIANCES ---
            case 'mixer':
                const mixerPatterns = [
                    { value: "rarely", label: "Rarely (10-15 min/day) - Occasional use" },
                    { value: "light", label: "Light (20-30 min/day) - Daily grinding" },
                    { value: "moderate", label: "Moderate (30-45 min/day) - Multiple times" },
                    { value: "heavy", label: "Heavy (1+ hour/day) - Frequent cooking" }
                ];
                return (
                    <ApplianceDetailCard
                        key="mixer"
                        icon={<Disc className="w-5 h-5 text-slate-400" />}
                        title="Mixer / Grinder"
                        usagePatterns={mixerPatterns}
                        selectedPattern={details.mixer_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('mixer', val, mixerPatterns)}
                        exactHoursKey="mixer_hours"
                        onExactHoursChange={(val) => updateDetail('mixer_hours', val)}
                        exactHoursValue={details.mixer_hours}

                        alert={getUsageAlert('mixer', details.mixer_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'microwave':
                const microwavePatterns = [
                    { value: "rarely", label: "Rarely (10-15 min/day) - Occasional heating" },
                    { value: "light", label: "Light (20-30 min/day) - Daily reheating" },
                    { value: "moderate", label: "Moderate (30-60 min/day) - Regular cooking" },
                    { value: "heavy", label: "Heavy (1-2 hours/day) - Primary cooking" }
                ];
                return (
                    <ApplianceDetailCard
                        key="microwave"
                        icon={<Microwave className="w-5 h-5 text-orange-400" />}
                        title="Microwave Oven"
                        usagePatterns={microwavePatterns}
                        selectedPattern={details.microwave_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('microwave', val, microwavePatterns)}
                        exactHoursKey="microwave_hours"
                        onExactHoursChange={(val) => updateDetail('microwave_hours', val)}
                        exactHoursValue={details.microwave_hours}

                        alert={getUsageAlert('microwave', details.microwave_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'kettle':
                const kettlePatterns = [
                    { value: "rarely", label: "Rarely (10-15 min/day) - Occasional tea/coffee" },
                    { value: "light", label: "Light (20-30 min/day) - 2-3 times daily" },
                    { value: "moderate", label: "Moderate (30-45 min/day) - 4-5 times daily" },
                    { value: "heavy", label: "Heavy (1+ hour/day) - Multiple users" }
                ];
                return (
                    <ApplianceDetailCard
                        key="kettle"
                        icon={<Coffee className="w-5 h-5 text-amber-600" />}
                        title="Electric Kettle"
                        usagePatterns={kettlePatterns}
                        selectedPattern={details.kettle_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('kettle', val, kettlePatterns)}
                        exactHoursKey="kettle_hours"
                        onExactHoursChange={(val) => updateDetail('kettle_hours', val)}
                        exactHoursValue={details.kettle_hours}

                        alert={getUsageAlert('kettle', details.kettle_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'induction':
                const inductionPatterns = [
                    { value: "light", label: "Light (30-60 min/day) - Occasional cooking" },
                    { value: "moderate", label: "Moderate (1-2 hours/day) - Daily meals" },
                    { value: "heavy", label: "Heavy (2-3 hours/day) - All meals" },
                    { value: "very_heavy", label: "Very Heavy (3+ hours/day) - Large family" }
                ];
                return (
                    <ApplianceDetailCard
                        key="induction"
                        icon={<Zap className="w-5 h-5 text-red-500" />}
                        title="Induction Cooktop"
                        usagePatterns={inductionPatterns}
                        selectedPattern={details.induction_pattern || "moderate"}
                        onPatternChange={(val) => handlePatternChange('induction', val, inductionPatterns)}
                        exactHoursKey="induction_hours"
                        onExactHoursChange={(val) => updateDetail('induction_hours', val)}
                        exactHoursValue={details.induction_hours}

                        alert={getUsageAlert('induction', details.induction_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'rice_cooker':
                const ricePatterns = [
                    { value: "rarely", label: "Rarely (15-20 min/day) - Occasional use" },
                    { value: "light", label: "Light (30-45 min/day) - Daily rice" },
                    { value: "moderate", label: "Moderate (1 hour/day) - Two meals" },
                    { value: "heavy", label: "Heavy (1.5+ hours/day) - Large family" }
                ];
                return (
                    <ApplianceDetailCard
                        key="rice_cooker"
                        icon={<CookingPot className="w-5 h-5 text-white" />}
                        title="Rice Cooker"
                        usagePatterns={ricePatterns}
                        selectedPattern={details.rice_cooker_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('rice_cooker', val, ricePatterns)}
                        exactHoursKey="rice_cooker_hours"
                        onExactHoursChange={(val) => updateDetail('rice_cooker_hours', val)}
                        exactHoursValue={details.rice_cooker_hours}

                        alert={getUsageAlert('rice_cooker', details.rice_cooker_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'toaster':
                const toasterPatterns = [
                    { value: "rarely", label: "Rarely (5-10 min/day)" },
                    { value: "light", label: "Light (10-15 min/day) - Breakfast" },
                    { value: "moderate", label: "Moderate (20-30 min/day) - Family breakfast" },
                    { value: "heavy", label: "Heavy (45+ min/day) - Frequent use" }
                ];
                return (
                    <ApplianceDetailCard
                        key="toaster"
                        icon={<Sandwich className="w-5 h-5 text-orange-300" />}
                        title="Toaster"
                        usagePatterns={toasterPatterns}
                        selectedPattern={details.toaster_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('toaster', val, toasterPatterns)}
                        exactHoursKey="toaster_hours"
                        onExactHoursChange={(val) => updateDetail('toaster_hours', val)}
                        exactHoursValue={details.toaster_hours}

                        alert={getUsageAlert('toaster', details.toaster_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'food_processor':
                const fpPatterns = [
                    { value: "rarely", label: "Rarely (10 min/day)" },
                    { value: "light", label: "Light (15-20 min/day) - Prep work" },
                    { value: "moderate", label: "Moderate (30-45 min/day) - Daily cooking" },
                    { value: "heavy", label: "Heavy (1+ hour/day) - Extensive prep" }
                ];
                return (
                    <ApplianceDetailCard
                        key="food_processor"
                        icon={<Utensils className="w-5 h-5 text-gray-400" />}
                        title="Food Processor"
                        usagePatterns={fpPatterns}
                        selectedPattern={details.food_processor_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('food_processor', val, fpPatterns)}
                        exactHoursKey="food_processor_hours"
                        onExactHoursChange={(val) => updateDetail('food_processor_hours', val)}
                        exactHoursValue={details.food_processor_hours}

                        alert={getUsageAlert('food_processor', details.food_processor_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );

            // --- LIGHTING & FANS ---
            case 'fans':
                const fanPatterns = [
                    { value: "rarely", label: "Rarely (< 4 hours)" },
                    { value: "few", label: "Few hours (4-8 hours)" },
                    { value: "most", label: "Most of day (8-16 hours)" },
                    { value: "all", label: "All day (16+ hours)" }
                ];
                return (
                    <ApplianceDetailCard
                        key="fans"
                        icon={<Wind className="w-5 h-5 text-cyan-200" />}
                        title={`Ceiling Fans`}
                        fields={[
                            { label: "Fan Type", key: "fan_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "standard", label: "Standard (Old, ~75W)" }, { value: "bldc", label: "BLDC (Energy Saver, ~30W)" }] }
                        ]}
                        usagePatterns={fanPatterns}
                        selectedPattern={details.fan_pattern || "few"}
                        onPatternChange={(val) => handlePatternChange('fan', val, fanPatterns)}
                        onFieldChange={updateDetail}
                        values={details}
                        exactHoursKey="fan_hours"
                        onExactHoursChange={(val) => updateDetail('fan_hours', val)}
                        exactHoursValue={details.fan_hours}
                        alert={getUsageAlert('fans', details.fan_hours)}
                    />
                );
            case 'led_lights':
                const ledPatterns = [
                    { value: "evening", label: "Evening only (4-6 hours)" },
                    { value: "morning-evening", label: "Morning & evening (6-8 hours)" },
                    { value: "most", label: "Most of day (8-12 hours)" },
                    { value: "all", label: "All day (12+ hours)" }
                ];
                return (
                    <ApplianceDetailCard
                        key="led"
                        icon={<Lightbulb className="w-5 h-5 text-yellow-400" />}
                        title={`LED Lights`}
                        usagePatterns={ledPatterns}
                        selectedPattern={details.led_pattern || "evening"}
                        onPatternChange={(val) => handlePatternChange('led', val, ledPatterns)}
                        exactHoursKey="led_hours"
                        onExactHoursChange={(val) => updateDetail('led_hours', val)}
                        exactHoursValue={details.led_hours}

                        alert={getUsageAlert('led', details.led_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'cfl_lights':
                const cflPatterns = [
                    { value: "evening", label: "Evening only (4-6 hours)" },
                    { value: "morning-evening", label: "Morning & evening (6-8 hours)" },
                    { value: "most", label: "Most of day (8-12 hours)" },
                    { value: "all", label: "All day (12+ hours)" }
                ];
                return (
                    <ApplianceDetailCard
                        key="cfl"
                        icon={<Lightbulb className="w-5 h-5 text-white" />}
                        title={`CFL Lights`}
                        usagePatterns={cflPatterns}
                        selectedPattern={details.cfl_pattern || "evening"}
                        onPatternChange={(val) => handlePatternChange('cfl', val, cflPatterns)}
                        exactHoursKey="cfl_hours"
                        onExactHoursChange={(val) => updateDetail('cfl_hours', val)}
                        exactHoursValue={details.cfl_hours}

                        alert={getUsageAlert('cfl', details.cfl_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'tube_lights':
                const tubePatterns = [
                    { value: "evening", label: "Evening only (4-6 hours)" },
                    { value: "morning-evening", label: "Morning & evening (6-8 hours)" },
                    { value: "most", label: "Most of day (8-12 hours)" },
                    { value: "all", label: "All day (12+ hours)" }
                ];
                return (
                    <ApplianceDetailCard
                        key="tube"
                        icon={<Lightbulb className="w-5 h-5 text-blue-100" />}
                        title={`Tube Lights`}
                        usagePatterns={tubePatterns}
                        selectedPattern={details.tube_pattern || "evening"}
                        onPatternChange={(val) => handlePatternChange('tube', val, tubePatterns)}
                        exactHoursKey="tube_hours"
                        onExactHoursChange={(val) => updateDetail('tube_hours', val)}
                        exactHoursValue={details.tube_hours}

                        alert={getUsageAlert('tube', details.tube_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );

            // --- OTHER APPLIANCES ---
            case 'tv':
                const tvPatterns = [
                    { value: "light", label: "Light (1-3 hours/day) - Occasional viewing" },
                    { value: "moderate", label: "Moderate (3-5 hours/day) - Daily evening" },
                    { value: "heavy", label: "Heavy (5-8 hours/day) - Regular watching" },
                    { value: "always", label: "Always on (8+ hours/day) - Background TV" }
                ];
                return (
                    <ApplianceDetailCard
                        key="tv"
                        icon={<Tv className="w-5 h-5 text-emerald-400" />}
                        title="Television"
                        fields={[
                            { label: "Screen Type", key: "tv_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "LED", label: "LED / LCD (Standard)" }, { value: "CRT", label: "Old Box TV (CRT)" }, { value: "OLED", label: "OLED / QLED (Premium)" }] },
                            { label: "Screen Size", key: "tv_size", options: [{ value: "unknown", label: "Don't Know" }, { value: "32", label: "32 inch (Small)" }, { value: "43", label: "43 inch (Medium)" }, { value: "55", label: "55 inch+ (Large)" }] }
                        ]}
                        usagePatterns={tvPatterns}
                        selectedPattern={details.tv_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('tv', val, tvPatterns)}
                        onFieldChange={updateDetail}
                        values={details}
                        exactHoursKey="tv_hours"
                        onExactHoursChange={(val) => updateDetail('tv_hours', val)}
                        exactHoursValue={details.tv_hours}
                        alert={getUsageAlert('tv', details.tv_hours)}
                    />
                );
            case 'desktop':
                const desktopPatterns = [
                    { value: "light", label: "Light (2-4 hours/day) - Casual use" },
                    { value: "moderate", label: "Moderate (4-8 hours/day) - Daily work" },
                    { value: "heavy", label: "Heavy (8-12 hours/day) - Full workday" },
                    { value: "always", label: "Always on (12+ hours/day) - Extended use" }
                ];
                return (
                    <ApplianceDetailCard
                        key="desktop"
                        icon={<Monitor className="w-5 h-5 text-blue-500" />}
                        title="Desktop Computer"
                        usagePatterns={desktopPatterns}
                        selectedPattern={details.desktop_pattern || "moderate"}
                        onPatternChange={(val) => handlePatternChange('desktop', val, desktopPatterns)}
                        exactHoursKey="desktop_hours"
                        onExactHoursChange={(val) => updateDetail('desktop_hours', val)}
                        exactHoursValue={details.desktop_hours}
                        alert={getUsageAlert('desktop', details.desktop_hours)}
                    />
                );
            case 'laptop':
                const laptopPatterns = [
                    { value: "light", label: "Light (2-4 hours/day) - Casual browsing" },
                    { value: "moderate", label: "Moderate (4-8 hours/day) - Regular work" },
                    { value: "heavy", label: "Heavy (8-12 hours/day) - Full workday" },
                    { value: "always", label: "Always on (12+ hours/day) - Extended sessions" }
                ];
                return (
                    <ApplianceDetailCard
                        key="laptop"
                        icon={<Laptop className="w-5 h-5 text-sky-400" />}
                        title="Laptop"
                        usagePatterns={laptopPatterns}
                        selectedPattern={details.laptop_pattern || "moderate"}
                        onPatternChange={(val) => handlePatternChange('laptop', val, laptopPatterns)}
                        exactHoursKey="laptop_hours"
                        onExactHoursChange={(val) => updateDetail('laptop_hours', val)}
                        exactHoursValue={details.laptop_hours}

                        alert={getUsageAlert('laptop', details.laptop_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'pump':
                const pumpPatterns = [
                    { value: "minimal", label: "Minimal (15-30 min/day) - Small household" },
                    { value: "light", label: "Light (30-60 min/day) - Regular use" },
                    { value: "moderate", label: "Moderate (1-2 hours/day) - Frequent filling" },
                    { value: "heavy", label: "Heavy (2+ hours/day) - Large consumption" }
                ];
                return (
                    <ApplianceDetailCard
                        key="pump"
                        icon={<Droplet className="w-5 h-5 text-blue-600" />}
                        title="Water Pump"
                        fields={[
                            { label: "Motor Power (HP)", key: "pump_hp", options: [{ value: "unknown", label: "Don't Know" }, { value: "0.5", label: "0.5 HP (Small)" }, { value: "1.0", label: "1.0 HP (Medium)" }, { value: "1.5", label: "1.5 HP (Large)" }, { value: "2.0", label: "2.0 HP+ (Heavy)" }] }
                        ]}
                        usagePatterns={pumpPatterns}
                        selectedPattern={details.pump_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('pump', val, pumpPatterns)}
                        onFieldChange={updateDetail}
                        values={details}
                        exactHoursKey="pump_hours"
                        onExactHoursChange={(val) => updateDetail('pump_hours', val)}
                        exactHoursValue={details.pump_hours}
                        alert={getUsageAlert('pump', details.pump_hours)}
                    />
                );
            case 'iron':
                const ironPatterns = [
                    { value: "weekly", label: "Weekly 15 min (once per week)" },
                    { value: "rarely", label: "Rarely (10-20 min/day) - Occasional ironing" },
                    { value: "moderate", label: "Moderate (40-60 min/day) - Regular ironing" },
                    { value: "heavy", label: "Heavy (1+ hour/day) - Daily ironing" }
                ];
                return (
                    <ApplianceDetailCard
                        key="iron"
                        icon={<Shirt className="w-5 h-5 text-yellow-500" />}
                        title="Iron Box"
                        usagePatterns={ironPatterns}
                        selectedPattern={details.iron_pattern || "rarely"}
                        onPatternChange={(val) => handlePatternChange('iron', val, ironPatterns)}
                        exactHoursKey="iron_hours"
                        onExactHoursChange={(val) => updateDetail('iron_hours', val)}
                        exactHoursValue={details.iron_hours}

                        alert={getUsageAlert('iron', details.iron_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'hair_dryer':
                const hairDryerPatterns = [
                    { value: "rarely", label: "Rarely (5-10 min/day)" },
                    { value: "light", label: "Light (10-15 min/day) - Quick dry" },
                    { value: "moderate", label: "Moderate (20-30 min/day) - Styling" },
                    { value: "heavy", label: "Heavy (45+ min/day) - Multiple users" }
                ];
                return (
                    <ApplianceDetailCard
                        key="hair_dryer"
                        icon={<Wind className="w-5 h-5 text-pink-400" />}
                        title="Hair Dryer"
                        usagePatterns={hairDryerPatterns}
                        selectedPattern={details.hair_dryer_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('hair_dryer', val, hairDryerPatterns)}
                        exactHoursKey="hair_dryer_hours"
                        onExactHoursChange={(val) => updateDetail('hair_dryer_hours', val)}
                        exactHoursValue={details.hair_dryer_hours}

                        alert={getUsageAlert('hair_dryer', details.hair_dryer_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            case 'vacuum':
                const vacuumPatterns = [
                    { value: "rarely", label: "Rarely (15 min/week)" },
                    { value: "light", label: "Light (30 min/week) - Quick clean" },
                    { value: "moderate", label: "Moderate (1 hour/week) - Full clean" },
                    { value: "heavy", label: "Heavy (2+ hours/week) - Large home" }
                ];
                return (
                    <ApplianceDetailCard
                        key="vacuum"
                        icon={<Wind className="w-5 h-5 text-teal-400" />}
                        title="Vacuum Cleaner"
                        usagePatterns={vacuumPatterns}
                        selectedPattern={details.vacuum_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('vacuum', val, vacuumPatterns)}
                        exactHoursKey="vacuum_hours"
                        onExactHoursChange={(val) => updateDetail('vacuum_hours', val)}
                        exactHoursValue={details.vacuum_hours}

                        alert={getUsageAlert('vacuum', details.vacuum_hours)}
                        onFieldChange={updateDetail}
                        values={details}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent filter drop-shadow-lg">
                    SMARTWATT
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
                    Kerala Energy Estimator
                </p>
            </div>

            {/* Progress Bar */}
            <div className="section mb-8">
                <div className="flex justify-between text-sm text-[#cbd5e0] mb-2 font-medium">
                    <span>Step 3 of 4: Usage Details</span>
                    <span>Detailed Estimate</span>
                </div>
                <div className="w-full bg-[rgba(30,41,59,0.4)] h-2 rounded-sm overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] h-full rounded-sm transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <h2 className="text-xl font-normal text-slate-400 tracking-wide mb-2">
                {currentPage.title}
            </h2>
            <p className="text-sm text-slate-500 mb-8">
                {currentPage.subtitle}
            </p>

            <div className="section space-y-6">
                {currentPage.items.map(item => renderAppliance(item))}
            </div>

            <div className="flex justify-between mt-12 pt-6 border-t border-slate-800">
                <button
                    onClick={() => {
                        if (subStep > 1) setSubStep(subStep - 1);
                        else onBack();
                    }}
                    className="px-8 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                    {subStep === 1 ? "← Back to Appliances" : "← Previous"}
                </button>
                <button
                    onClick={() => {
                        if (subStep < totalPages) setSubStep(subStep + 1);
                        else onNext();
                    }}
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 transition-all shadow-lg shadow-blue-900/20"
                >
                    {subStep < totalPages ? `Next: ${pages[subStep].title.split(' ')[0]} →` : "Calculate Results →"}
                </button>
            </div>
        </div>
    );
}
