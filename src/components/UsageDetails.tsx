import { useState } from 'react';
import { saveTraining } from '@/lib/api';
import { normalizePattern } from '@/lib/normalizePattern';
import { APPLIANCE_CATEGORIES } from '@/config/appliances';
import { USAGE_FORMS } from '@/config/usageForms';
import { ApplianceDetailCard } from './usage/ApplianceDetailCard';
import { EventApplianceCard } from './usage/EventApplianceCard';
import { RoomBasedCard } from './usage/RoomBasedCard';
import { PumpDetailCard } from './usage/PumpDetailCard';
import { getUsageAlert } from '@/lib/usageAlerts';

interface Props {
    selected: string[];
    details: any;
    onUpdate: (details: any) => void;
    onNext: () => void;
    onBack: () => void;
    mode: 'quick' | 'detailed';
    trainingId: string;
    subStep: number;
    setSubStep: (step: number) => void;
}

export default function UsageDetails({ selected, details, onUpdate, onNext, onBack, mode, trainingId, subStep, setSubStep }: Props) {

    // Helper to categorize appliances based on config
    const getCategories = () => {
        const cats: any = { major: [], kitchen: [], lighting: [], other: [] };

        // Flatten the config to find items easily
        const allItems = APPLIANCE_CATEGORIES.flatMap(c => c.items);

        selected.forEach(id => {
            // Find which category this appliance belongs to in the config
            if (['air_conditioner', 'refrigerator', 'washing_machine', 'geyser'].includes(id)) cats.major.push(id);
            else if (['mixer', 'microwave', 'kettle', 'induction', 'rice_cooker', 'toaster', 'food_processor'].includes(id)) cats.kitchen.push(id);
            else if (['fans', 'led_lights', 'cfl_lights', 'tube_lights'].includes(id)) cats.lighting.push(id);
            else cats.other.push(id);
        });
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

    const updateDetails = (updates: Record<string, any>) => {
        handleUpdate({ ...details, ...updates });
    };

    const updateDetail = (key: string, value: any) => {
        handleUpdate({ ...details, [key]: value });
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

    // --- GENERIC RENDERER ---
    const renderAppliance = (id: string) => {
        // 1. Find Display Info (Icon, Label, Color)
        const allItems = APPLIANCE_CATEGORIES.flatMap(c => c.items);
        const displayInfo = allItems.find(item => item.id === id);

        // 2. Find Form Config
        const formConfig = USAGE_FORMS[id];

        if (!displayInfo || !formConfig) return null;

        // 3. Resolve Props
        const dataKey = formConfig.id; // e.g. 'fridge', 'ac', 'wm'

        // 4. Check if this appliance uses pump-based input (water pumps)
        if (formConfig.pumpBased) {
            return (
                <PumpDetailCard
                    key={id}
                    id={dataKey}
                    icon={<displayInfo.icon className={`w-5 h-5 ${displayInfo.color || 'text-blue-400'}`} />}
                    title={displayInfo.label}
                    values={details}
                    onFieldChange={updateDetail}
                    onBatchChange={(updates) => handleUpdate({ ...details, ...updates })}
                    alert={getUsageAlert(dataKey, details[`${dataKey}_hours`])}
                />
            );
        }

        // 5. Check if this appliance uses room-based input (lights and fans)
        if (formConfig.roomBased) {
            // Get count from quantityConfig or fields
            let count = 1;
            if ('quantityConfig' in displayInfo && displayInfo.quantityConfig) {
                const quantityConfig = displayInfo.quantityConfig as { key: string; defaultValue?: number };
                count = parseInt((details as Record<string, any>)[quantityConfig.key] || quantityConfig.defaultValue?.toString() || '1');
            } else if (formConfig.fields) {
                const countField = formConfig.fields.find(f => f.key.includes('num_'));
                if (countField) {
                    count = parseInt(details[countField.key] || '1');
                }
            }

            return (
                <RoomBasedCard
                    key={id}
                    id={dataKey}
                    icon={<displayInfo.icon className={`w-5 h-5 ${displayInfo.color || 'text-blue-400'}`} />}
                    title={displayInfo.label}
                    values={details}
                    onFieldChange={updateDetail}
                    onBatchChange={(updates) => handleUpdate({ ...details, ...updates })}
                    alert={getUsageAlert(dataKey, details[`${dataKey}_hours`])}
                    count={count}
                    presets={formConfig.roomBased.presets}
                    quantityConfig={'quantityConfig' in displayInfo ? displayInfo.quantityConfig as { key: string; label: string; min: number; max: number; defaultValue: number; } | undefined : undefined}
                    fields={formConfig.fields}
                />
            );
        }

        // 6. Check if this appliance uses event-based input
        if (formConfig.eventBased) {
            const durationOptions = formConfig.eventBased.q2.options.map(opt => ({
                val: opt.value,
                label: opt.label,
                minutes: opt.hours * 60
            }));

            return (
                <EventApplianceCard
                    key={id}
                    id={dataKey}
                    icon={<displayInfo.icon className={`w-5 h-5 ${displayInfo.color || 'text-blue-400'}`} />}
                    title={displayInfo.label}
                    values={details}
                    onFieldChange={updateDetail}
                    onBatchChange={(updates) => handleUpdate({ ...details, ...updates })}
                    alert={getUsageAlert(dataKey, details[`${dataKey}_hours`])}
                    durationOptions={durationOptions}
                    q1Label={formConfig.eventBased.q1.question}
                    q2Label={formConfig.eventBased.q2.question}
                />
            );
        }

        // 7. Otherwise, use pattern-based ApplianceDetailCard
        return (
            <ApplianceDetailCard
                key={id}
                icon={<displayInfo.icon className={`w-5 h-5 ${displayInfo.color || 'text-blue-400'}`} />}
                title={displayInfo.label}
                fields={formConfig.fields}
                usagePatterns={formConfig.patterns || []}
                selectedPattern={details[`${dataKey}_pattern`] || formConfig.defaultPattern || ''}
                onPatternChange={(val) => handlePatternChange(dataKey, val, formConfig.patterns || [])}
                onFieldChange={updateDetail}
                values={details}
                alert={getUsageAlert(dataKey, details[`${dataKey}_hours`])}
                exactHoursKey={`${dataKey}_hours`}
                onExactHoursChange={(val) => updateDetail(`${dataKey}_hours`, val)}
                exactHoursValue={details[`${dataKey}_hours`]}
            />
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
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
                    <span>Step {subStep + 1} of {totalPages + 2}: {currentPage?.title}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-[rgba(30,41,59,0.4)] h-2 rounded-sm overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] h-full transition-all duration-500 ease-out rounded-sm"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Page Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#e2e8f0] mb-2">{currentPage?.title}</h2>
                <p className="text-slate-400">{currentPage?.subtitle}</p>
            </div>

            {/* Appliance List */}
            <div className="space-y-6">
                {currentPage?.items.map(renderAppliance)}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-6 border-t border-slate-800">
                <button
                    onClick={() => {
                        if (subStep > 1) setSubStep(subStep - 1);
                        else onBack();
                    }}
                    className="px-8 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                    ← Back
                </button>
                <button
                    onClick={() => {
                        if (subStep < totalPages) setSubStep(subStep + 1);
                        else onNext();
                    }}
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 transition-all shadow-lg shadow-blue-900/20"
                >
                    {subStep < totalPages ? `Next: ${pages[subStep]?.title} →` : 'Calculate Bill →'}
                </button>
            </div>
        </div>
    );
}
