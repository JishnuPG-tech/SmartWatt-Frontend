import { useEffect } from 'react';
import { saveTraining } from '@/lib/api';
import { Check } from 'lucide-react';
import { APPLIANCE_CATEGORIES } from '@/config/appliances';

interface Props {
    selected: string[];
    details: Record<string, unknown>;
    onUpdate: (selected: string[]) => void;
    onDetailsUpdate: (details: Record<string, unknown>) => void;
    onNext: () => void;
    onBack: () => void;
    mode: 'quick' | 'detailed';
    trainingId: string;
}

export default function ApplianceSelection({ selected, details, onUpdate, onDetailsUpdate, onNext, onBack, mode, trainingId }: Props) {
    // Defaults logic
    useEffect(() => {
        if (details.num_fans === undefined) onDetailsUpdate({ ...details, num_fans: 5 });
        if (details.num_led === undefined) onDetailsUpdate({ ...details, num_led: 15 });
        if (details.num_cfl === undefined) onDetailsUpdate({ ...details, num_cfl: 5 });
        if (details.num_tube === undefined) onDetailsUpdate({ ...details, num_tube: 5 });
    }, [details, onDetailsUpdate]);

    const fanCount = (details.num_fans as number | undefined) ?? 5;
    const ledCount = details.num_led ?? 15;

    const handleUpdate = (newSelected: string[]) => {
        onUpdate(newSelected);
        saveTraining(trainingId, { selected_appliances: newSelected });
    };

    const handleDetailsUpdate = (newDetails: any) => {
        onDetailsUpdate(newDetails);
        saveTraining(trainingId, { appliance_usage: newDetails });
    };

    const toggleAppliance = (id: string) => {
        if (selected.includes(id)) {
            handleUpdate(selected.filter(item => item !== id));
        } else {
            handleUpdate([...selected, id]);
        }
    };

    const updateDetail = (key: string, value: any) => {
        handleDetailsUpdate({ ...details, [key]: value });
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent filter drop-shadow-lg">
                    SMARTWATT
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
                    Kerala Energy Estimator
                </p>
            </div>

            {/* Progress */}
            <div className="section mb-8">
                <div className="flex justify-between text-sm text-[#cbd5e0] mb-2 font-medium">
                    <span>Step 2 of 4: Appliance Selection</span>
                    <span>Detailed Estimate</span>
                </div>
                <div className="w-full bg-[rgba(30,41,59,0.4)] h-2 rounded-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] h-full w-2/4 rounded-sm"></div>
                </div>
            </div>

            <h2 className="text-xl font-normal text-slate-400 tracking-wide mb-6">
                Detailed Estimate - Appliance Selection
            </h2>
            <p className="text-[#e2e8f0] mb-8">Select all appliances you have at home</p>

            {/* Config Driven Display */}
            <div className="section space-y-8">
                {APPLIANCE_CATEGORIES.map((cat) => (
                    <div key={cat.title}>
                        <h3 className="text-[#e2e8f0] font-medium text-lg mb-4">{cat.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {cat.items.map((item: any) => (
                                <div
                                    key={item.id}
                                    className={`flex flex-col p-3 rounded-lg border transition-all cursor-pointer hover:shadow-lg group ${selected.includes(item.id) ? 'bg-blue-600/10 border-blue-500/50' : 'border-slate-700 hover:bg-slate-800'}`}
                                    onClick={() => toggleAppliance(item.id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selected.includes(item.id) ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'}`}>
                                            <item.icon className={`w-5 h-5 ${item.color || 'text-slate-400'}`} />
                                        </div>
                                        <span className="text-[#e2e8f0] flex-1 select-none font-medium">
                                            {item.label}
                                        </span>
                                        {selected.includes(item.id) && <Check className="w-5 h-5 text-blue-500" />}
                                    </div>

                                    {/* Quantity Slider (Only if configured and selected) */}
                                    {selected.includes(item.id) && item.quantityConfig && (
                                        <div className="mt-3 pt-3 border-t border-slate-700/50 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                                                    {item.quantityConfig.label}
                                                </label>
                                                <span className="bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded text-xs font-bold">
                                                    {details[item.quantityConfig.key] ?? item.quantityConfig.defaultValue}
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={item.quantityConfig.min}
                                                max={item.quantityConfig.max}
                                                value={details[item.quantityConfig.key] ?? item.quantityConfig.defaultValue}
                                                onChange={(e) => updateDetail(item.quantityConfig.key!, parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Common Items removed - now handled by generic config above */}

            {/* Navigation */}
            <div className="flex justify-between mt-12 pt-6 border-t border-slate-800">
                <button onClick={onBack} className="px-8 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">
                    ← Back
                </button>
                <button onClick={onNext} className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 transition-all shadow-lg shadow-blue-900/20">
                    {mode === 'quick' ? 'Calculate Results →' : 'Next: Usage Details →'}
                </button>
            </div>
        </div>
    );
}
