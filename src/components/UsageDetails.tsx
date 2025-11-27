import { useState, useEffect } from 'react';
import { saveTraining } from '@/lib/saveTraining';
import { normalizePattern } from '@/lib/normalizePattern';
import { ChevronRight } from 'lucide-react';

interface Props {
    selected: string[];
    details: Record<string, any>;
    onUpdate: (details: Record<string, any>) => void;
    onNext: () => void;
    onBack: () => void;
    mode: 'quick' | 'detailed';
    trainingId: string;
}

// --- Reusable Appliance Detail Card Component (Internal) ---
interface SelectOption {
    value: string;
    label: string;
}

interface ApplianceCardProps {
    emoji: string;
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
    emoji,
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
            <h4 className="text-lg font-medium text-[#e2e8f0] mb-4 flex items-center gap-2">
                <span>{emoji}</span> {title}
            </h4>

            {fields && fields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {fields.map((field) => (
                        <div key={field.key}>
                            <label className="text-[#e2e8f0] mb-2 block text-sm">{field.label}</label>
                            <div className="relative">
                                <select
                                    value={values[field.key] || field.options[0].value}
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
                                onChange={(e) => handleExactChange(parseInt(e.target.value) || 0, currentM)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[#e2e8f0] mb-2 block text-sm">Minutes</label>
                            <input
                                type="number" min="0" max="59"
                                value={currentM}
                                onChange={(e) => handleExactChange(currentH, parseInt(e.target.value) || 0)}
                                className="w-full bg-[#1e293b] border border-[#334155] rounded-md py-2 px-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                {usageMode === 'ai' && (
                    <div className="animate-in fade-in pl-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-sm text-blue-200 flex gap-2 items-center">
                        <span>🤖</span>
                        <span>AI will estimate usage for {title} based on your household profile.</span>
                    </div>
                )}
            </div>

            {alert && (
                <div className={`mt-4 p-4 rounded border-l-4 ${alert.type === "warning" ? "bg-orange-900/20 border-orange-500 text-orange-200" :
                    alert.type === "error" ? "bg-red-900/20 border-red-500 text-red-200" :
                        "bg-blue-900/20 border-blue-500 text-blue-200"
                    }`}>
                    <p className="text-sm flex items-start gap-2">
                        <span>{alert.type === "warning" ? "⚠️" : alert.type === "error" ? "❌" : "💡"}</span>
                        <span>{alert.message}</span>
                    </p>
                </div>
            )}
        </div>
    );
}

// --- Main Component ---

export default function UsageDetails({ selected, details, onUpdate, onNext, onBack, mode, trainingId }: Props) {
    const [subStep, setSubStep] = useState(1);

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

    // --- Render Logic for Specific Appliances ---

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
                        emoji="🧊"
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
                        alert={details.fridge_pattern === 'manual' ? { type: "warning", message: "Refrigerators typically run 16-24 hours/day for proper cooling. You selected 12.0 hours - are you sure?" } : undefined}
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
                        emoji="🌬️"
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
                        emoji="🧺"
                        title="Washing Machine"
                        fields={[
                            { label: "Type", key: "wm_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "semi", label: "Semi-Automatic" }, { value: "fully", label: "Fully Automatic" }, { value: "front", label: "Front Load" }] },
                            { label: "Capacity", key: "wm_capacity", options: [{ value: "unknown", label: "Don't Know" }, { value: "6.0", label: "6.0 kg" }, { value: "6.5", label: "6.5 kg" }, { value: "7.0", label: "7.0 kg" }, { value: "8.0", label: "8.0 kg+" }] },
                            { label: "Age", key: "wm_age", options: [{ value: "unknown", label: "Don't Know" }, { value: "<2", label: "< 2 years" }, { value: "2-5", label: "2-5 years" }, { value: "5-10", label: "5-10 years" }, { value: "10+", label: "10+ years" }] }
                        ]}
                        usagePatterns={wmPatterns}
                        selectedPattern={details.wm_pattern || "moderate"}
                        onPatternChange={(val) => handlePatternChange('wm', val, wmPatterns)}
                        onFieldChange={updateDetail}
                        values={details}
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
                        emoji="🚿"
                        title="Water Heater / Geyser"
                        fields={[
                            { label: "Capacity", key: "geyser_capacity", options: [{ value: "unknown", label: "Don't Know" }, { value: "10L", label: "10L" }, { value: "15L", label: "15L" }, { value: "25L", label: "25L" }] },
                            { label: "Age", key: "geyser_age", options: [{ value: "unknown", label: "Don't Know" }, { value: "<2", label: "< 2 years" }, { value: "2-5", label: "2-5 years" }, { value: "5-10", label: "5-10 years" }, { value: "10+", label: "10+ years" }] }
                        ]}
                        usagePatterns={geyserPatterns}
                        selectedPattern={details.geyser_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('geyser', val, geyserPatterns)}
                        onFieldChange={updateDetail}
                        values={details}
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
                        emoji="🥘"
                        title="Mixer / Grinder"
                        usagePatterns={mixerPatterns}
                        selectedPattern={details.mixer_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('mixer', val, mixerPatterns)}
                        exactHoursKey="mixer_hours"
                        onExactHoursChange={(val) => updateDetail('mixer_hours', val)}
                        exactHoursValue={details.mixer_hours}
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
                        emoji="📡"
                        title="Microwave Oven"
                        usagePatterns={microwavePatterns}
                        selectedPattern={details.microwave_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('microwave', val, microwavePatterns)}
                        exactHoursKey="microwave_hours"
                        onExactHoursChange={(val) => updateDetail('microwave_hours', val)}
                        exactHoursValue={details.microwave_hours}
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
                        emoji="☕"
                        title="Electric Kettle"
                        usagePatterns={kettlePatterns}
                        selectedPattern={details.kettle_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('kettle', val, kettlePatterns)}
                        exactHoursKey="kettle_hours"
                        onExactHoursChange={(val) => updateDetail('kettle_hours', val)}
                        exactHoursValue={details.kettle_hours}
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
                        emoji="🍳"
                        title="Induction Cooktop"
                        usagePatterns={inductionPatterns}
                        selectedPattern={details.induction_pattern || "moderate"}
                        onPatternChange={(val) => handlePatternChange('induction', val, inductionPatterns)}
                        exactHoursKey="induction_hours"
                        onExactHoursChange={(val) => updateDetail('induction_hours', val)}
                        exactHoursValue={details.induction_hours}
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
                        emoji="🍚"
                        title="Rice Cooker"
                        usagePatterns={ricePatterns}
                        selectedPattern={details.rice_cooker_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('rice_cooker', val, ricePatterns)}
                        exactHoursKey="rice_cooker_hours"
                        onExactHoursChange={(val) => updateDetail('rice_cooker_hours', val)}
                        exactHoursValue={details.rice_cooker_hours}
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
                        emoji="🍞"
                        title="Toaster"
                        usagePatterns={toasterPatterns}
                        selectedPattern={details.toaster_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('toaster', val, toasterPatterns)}
                        exactHoursKey="toaster_hours"
                        onExactHoursChange={(val) => updateDetail('toaster_hours', val)}
                        exactHoursValue={details.toaster_hours}
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
                        emoji="🥗"
                        title="Food Processor"
                        usagePatterns={fpPatterns}
                        selectedPattern={details.food_processor_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('food_processor', val, fpPatterns)}
                        exactHoursKey="food_processor_hours"
                        onExactHoursChange={(val) => updateDetail('food_processor_hours', val)}
                        exactHoursValue={details.food_processor_hours}
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
                        emoji="🌀"
                        title={`Ceiling Fans`}
                        usagePatterns={fanPatterns}
                        selectedPattern={details.fan_pattern || "few"}
                        onPatternChange={(val) => handlePatternChange('fan', val, fanPatterns)}
                        exactHoursKey="fan_hours"
                        onExactHoursChange={(val) => updateDetail('fan_hours', val)}
                        exactHoursValue={details.fan_hours}
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
                        emoji="💡"
                        title={`LED Lights`}
                        usagePatterns={ledPatterns}
                        selectedPattern={details.led_pattern || "evening"}
                        onPatternChange={(val) => handlePatternChange('led', val, ledPatterns)}
                        exactHoursKey="led_hours"
                        onExactHoursChange={(val) => updateDetail('led_hours', val)}
                        exactHoursValue={details.led_hours}
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
                        emoji="💡"
                        title={`CFL Lights`}
                        usagePatterns={cflPatterns}
                        selectedPattern={details.cfl_pattern || "evening"}
                        onPatternChange={(val) => handlePatternChange('cfl', val, cflPatterns)}
                        exactHoursKey="cfl_hours"
                        onExactHoursChange={(val) => updateDetail('cfl_hours', val)}
                        exactHoursValue={details.cfl_hours}
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
                        emoji="💡"
                        title={`Tube Lights`}
                        usagePatterns={tubePatterns}
                        selectedPattern={details.tube_pattern || "evening"}
                        onPatternChange={(val) => handlePatternChange('tube', val, tubePatterns)}
                        exactHoursKey="tube_hours"
                        onExactHoursChange={(val) => updateDetail('tube_hours', val)}
                        exactHoursValue={details.tube_hours}
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
                        emoji="📺"
                        title="Television"
                        usagePatterns={tvPatterns}
                        selectedPattern={details.tv_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('tv', val, tvPatterns)}
                        exactHoursKey="tv_hours"
                        onExactHoursChange={(val) => updateDetail('tv_hours', val)}
                        exactHoursValue={details.tv_hours}
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
                        emoji="💻"
                        title="Desktop Computer"
                        usagePatterns={desktopPatterns}
                        selectedPattern={details.desktop_pattern || "moderate"}
                        onPatternChange={(val) => handlePatternChange('desktop', val, desktopPatterns)}
                        exactHoursKey="desktop_hours"
                        onExactHoursChange={(val) => updateDetail('desktop_hours', val)}
                        exactHoursValue={details.desktop_hours}
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
                        emoji="🖥️"
                        title="Laptop"
                        usagePatterns={laptopPatterns}
                        selectedPattern={details.laptop_pattern || "moderate"}
                        onPatternChange={(val) => handlePatternChange('laptop', val, laptopPatterns)}
                        exactHoursKey="laptop_hours"
                        onExactHoursChange={(val) => updateDetail('laptop_hours', val)}
                        exactHoursValue={details.laptop_hours}
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
                        emoji="💧"
                        title="Water Pump"
                        usagePatterns={pumpPatterns}
                        selectedPattern={details.pump_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('pump', val, pumpPatterns)}
                        exactHoursKey="pump_hours"
                        onExactHoursChange={(val) => updateDetail('pump_hours', val)}
                        exactHoursValue={details.pump_hours}
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
                        emoji="👕"
                        title="Iron Box"
                        usagePatterns={ironPatterns}
                        selectedPattern={details.iron_pattern || "rarely"}
                        onPatternChange={(val) => handlePatternChange('iron', val, ironPatterns)}
                        exactHoursKey="iron_hours"
                        onExactHoursChange={(val) => updateDetail('iron_hours', val)}
                        exactHoursValue={details.iron_hours}
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
                        emoji="💇"
                        title="Hair Dryer"
                        usagePatterns={hairDryerPatterns}
                        selectedPattern={details.hair_dryer_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('hair_dryer', val, hairDryerPatterns)}
                        exactHoursKey="hair_dryer_hours"
                        onExactHoursChange={(val) => updateDetail('hair_dryer_hours', val)}
                        exactHoursValue={details.hair_dryer_hours}
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
                        emoji="🧹"
                        title="Vacuum Cleaner"
                        usagePatterns={vacuumPatterns}
                        selectedPattern={details.vacuum_pattern || "light"}
                        onPatternChange={(val) => handlePatternChange('vacuum', val, vacuumPatterns)}
                        exactHoursKey="vacuum_hours"
                        onExactHoursChange={(val) => updateDetail('vacuum_hours', val)}
                        exactHoursValue={details.vacuum_hours}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 animate-in slide-in-from-right-8 duration-500">
            <div className="main-header text-center mb-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-2">SMARTWATT</h1>
                <p className="text-slate-400">Kerala Energy Estimator</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-[#cbd5e0] mb-2 font-medium">
                    <span><strong>Step 3.{subStep} of 3.{totalPages}</strong>: Usage Details</span>
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

            <div className="space-y-6">
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
