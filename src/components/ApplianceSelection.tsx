import { useState, useEffect } from 'react';
import { saveTraining } from '@/lib/saveTraining';

interface Props {
    selected: string[];
    details: any;
    // State Managment Props
    // We "Lift State Up". This component doesn't own the data, the parent (page.tsx) does.
    // We just ask the parent to update it.
    onUpdate: (selected: string[]) => void;
    onDetailsUpdate: (details: any) => void;
    onNext: () => void;
    onBack: () => void;
    mode: 'quick' | 'detailed';
    trainingId: string;
}

export default function ApplianceSelection({ selected, details, onUpdate, onDetailsUpdate, onNext, onBack, mode, trainingId }: Props) {
    // Initialize defaults if not present
    // Auto-Initialize Defaults
    // Nobody has 0 fans in Kerala. We pre-fill "5 Fans" so the user doesn't have to start from scratch.
    // This reduces "Friction" and makes the app feel smarter.
    useEffect(() => {
        if (details.num_fans === undefined) onDetailsUpdate({ ...details, num_fans: 5 });
        if (details.num_led === undefined) onDetailsUpdate({ ...details, num_led: 15 });
        if (details.num_cfl === undefined) onDetailsUpdate({ ...details, num_cfl: 5 });
        if (details.num_tube === undefined) onDetailsUpdate({ ...details, num_tube: 5 });
    }, []);

    const fanCount = details.num_fans ?? 5;
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

    const categories = [
        {
            title: "Major Appliances",
            items: [
                { id: 'air_conditioner', label: 'Air Conditioner (AC)' },
                { id: 'refrigerator', label: 'Refrigerator / Fridge' },
                { id: 'washing_machine', label: 'Washing Machine' },
                { id: 'geyser', label: 'Water Heater / Geyser' },
                { id: 'microwave', label: 'Microwave Oven' },
                { id: 'kettle', label: 'Electric Kettle' },
                { id: 'induction', label: 'Induction Cooktop' },
            ]
        },
        {
            title: "Kitchen Appliances",
            items: [
                { id: 'mixer', label: 'Mixer / Grinder' },
                { id: 'rice_cooker', label: 'Rice Cooker' },
                { id: 'toaster', label: 'Toaster' },
                { id: 'food_processor', label: 'Food Processor' },
            ]
        },
        {
            title: "Other Appliances",
            items: [
                { id: 'tv', label: 'Television' },
                { id: 'desktop', label: 'Desktop Computer' },
                { id: 'laptop', label: 'Laptop' },
                { id: 'pump', label: 'Water Pump / Motor' },
                { id: 'iron', label: 'Iron' },
                { id: 'hair_dryer', label: 'Hair Dryer' },
                { id: 'vacuum', label: 'Vacuum Cleaner' },
            ]
        }
    ];

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

            <div className="section space-y-8">
                {categories.map((cat) => (
                    <div key={cat.title}>
                        <h3 className="text-[#e2e8f0] font-medium text-lg mb-4">{cat.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {cat.items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-lg ${selected.includes(item.id) ? 'bg-blue-600/10 border-blue-500/50' : 'border-slate-700 hover:bg-slate-800'}`}
                                    onClick={() => toggleAppliance(item.id)}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes(item.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                                        {selected.includes(item.id) && <span className="text-white text-xs">✓</span>}
                                    </div>
                                    <span className="text-[#e2e8f0] flex-1 select-none">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Common Items */}
            <div className="section mt-8">
                <h3 className="text-[#e2e8f0] font-medium text-lg mb-4">Common Items</h3>

                <div className="space-y-6">
                    {/* Fans */}
                    <div className="bg-[#1a202c] p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[#e2e8f0] font-medium">Number of ceiling fans</label>
                            <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold">{fanCount}</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="15"
                            value={fanCount}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                updateDetail('num_fans', val);
                                if (val > 0 && !selected.includes('fans')) toggleAppliance('fans');
                                if (val === 0 && selected.includes('fans')) toggleAppliance('fans');
                            }}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0</span>
                            <span>15</span>
                        </div>
                    </div>

                    {/* Lighting */}
                    <div className="bg-[#1a202c] p-4 rounded-xl border border-slate-700">
                        <h4 className="text-[#e2e8f0] font-medium mb-3">Lighting</h4>

                        <div
                            className={`flex items-center space-x-3 p-3 rounded-lg border mb-4 cursor-pointer hover:bg-slate-800 transition-all ${selected.includes('led_lights') ? 'bg-blue-600/10 border-blue-500/50' : 'border-slate-700'}`}
                            onClick={() => toggleAppliance('led_lights')}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes('led_lights') ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                                {selected.includes('led_lights') && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className="text-[#e2e8f0] flex-1 select-none">LED Bulbs</span>
                        </div>

                        {selected.includes('led_lights') && (
                            <div className="animate-in fade-in mt-4 pl-2 border-l-2 border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[#e2e8f0] text-sm">Number of LED bulbs</label>
                                    <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold">{ledCount}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="30"
                                    value={ledCount}
                                    onChange={(e) => updateDetail('num_led', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>0</span>
                                    <span>30</span>
                                </div>
                            </div>
                        )}

                        {/* CFL Lights */}
                        <div
                            className={`flex items-center space-x-3 p-3 rounded-lg border mb-4 cursor-pointer hover:bg-slate-800 transition-all ${selected.includes('cfl_lights') ? 'bg-blue-600/10 border-blue-500/50' : 'border-slate-700'}`}
                            onClick={() => toggleAppliance('cfl_lights')}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes('cfl_lights') ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                                {selected.includes('cfl_lights') && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className="text-[#e2e8f0] flex-1 select-none">CFL Bulbs</span>
                        </div>

                        {selected.includes('cfl_lights') && (
                            <div className="animate-in fade-in mt-4 pl-2 border-l-2 border-slate-700 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[#e2e8f0] text-sm">Number of CFL bulbs</label>
                                    <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold">{details.num_cfl ?? 5}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="30"
                                    value={details.num_cfl ?? 5}
                                    onChange={(e) => updateDetail('num_cfl', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>0</span>
                                    <span>30</span>
                                </div>
                            </div>
                        )}

                        {/* Tube Lights */}
                        <div
                            className={`flex items-center space-x-3 p-3 rounded-lg border mb-4 cursor-pointer hover:bg-slate-800 transition-all ${selected.includes('tube_lights') ? 'bg-blue-600/10 border-blue-500/50' : 'border-slate-700'}`}
                            onClick={() => toggleAppliance('tube_lights')}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes('tube_lights') ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                                {selected.includes('tube_lights') && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className="text-[#e2e8f0] flex-1 select-none">Tube Lights</span>
                        </div>

                        {selected.includes('tube_lights') && (
                            <div className="animate-in fade-in mt-4 pl-2 border-l-2 border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[#e2e8f0] text-sm">Number of Tube lights</label>
                                    <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold">{details.num_tube ?? 5}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="30"
                                    value={details.num_tube ?? 5}
                                    onChange={(e) => updateDetail('num_tube', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>0</span>
                                    <span>30</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-12 pt-6 border-t border-slate-800">
                <button onClick={onBack} className="px-8 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">
                    ← Back
                </button>
                <button onClick={onNext} className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 transition-all shadow-lg shadow-blue-900/20">
                    Next: Usage Details →
                </button>
            </div>
        </div>
    );
}
