import { useState, useEffect } from 'react';
import { saveTraining } from '@/lib/saveTraining';

interface HouseholdData {
    num_people: number;
    season: string;
    house_type: string;
    kwh: number;
    estimated_bill: number;
}

interface Props {
    data: HouseholdData;
    onUpdate: (data: HouseholdData) => void;
    onNext: () => void;
    onBack: () => void;
    mode: 'quick' | 'detailed';
    trainingId: string;
}

export default function HouseholdInfo({ data, onUpdate, onNext, onBack, mode, trainingId }: Props) {

    // Calculate bill for real-time analysis (Ported from backend/kseb_tariff.py)
    const calculateBill = (biMonthlyUnits: number) => {
        const monthlyUnits = biMonthlyUnits / 2;
        let energyCharge = 0;

        // Rates from kseb_tariff.py (Nov 2023)
        const TELESCOPIC_SLABS = [
            { limit: 50, rate: 3.25 },
            { limit: 50, rate: 4.05 },
            { limit: 50, rate: 5.10 },
            { limit: 50, rate: 6.95 },
            { limit: 50, rate: 8.20 }
        ];

        const FLAT_SLABS = [
            { limit: 300, rate: 6.40 },
            { limit: 350, rate: 7.25 },
            { limit: 400, rate: 7.60 },
            { limit: 500, rate: 7.90 },
            { limit: Infinity, rate: 8.80 }
        ];

        const FSM_RATE = 0.13;

        if (monthlyUnits <= 250) {
            // Telescopic
            let remaining = monthlyUnits;
            for (const slab of TELESCOPIC_SLABS) {
                if (remaining > 0) {
                    const chunk = Math.min(remaining, slab.limit);
                    energyCharge += chunk * slab.rate;
                    remaining -= chunk;
                } else {
                    break;
                }
            }
        } else {
            // Non-Telescopic (Flat)
            for (const slab of FLAT_SLABS) {
                if (monthlyUnits <= slab.limit) {
                    energyCharge = monthlyUnits * slab.rate;
                    break;
                }
            }
        }

        const totalEnergyCharge = energyCharge * 2; // For 2 months
        const fuelSurcharge = biMonthlyUnits * FSM_RATE;
        const total = totalEnergyCharge + fuelSurcharge;

        return Math.round(total);
    };

    const handleUpdate = (newData: HouseholdData) => {
        // Recalculate bill if kwh changed
        const newBill = calculateBill(newData.kwh);
        const updatedData = { ...newData, estimated_bill: newBill };

        onUpdate(updatedData);
        saveTraining(trainingId, {
            num_people: updatedData.num_people,
            season: updatedData.season,
            house_type: updatedData.house_type,
            bi_monthly_kwh: updatedData.kwh,
            estimated_bill: updatedData.estimated_bill
        });
    };

    const biMonthlyCost = calculateBill(data.kwh);
    const monthlyCost = Math.round(biMonthlyCost / 2);
    const monthlyUnits = data.kwh / 2;

    // Determine consumption status
    const getStatus = (mUnits: number) => {
        if (mUnits < 120) return { label: 'LOW', color: '#10b981', text: 'Below average - Good efficiency!' };
        if (mUnits < 150) return { label: 'AVERAGE', color: '#f59e0b', text: 'Standard consumption' };
        if (mUnits < 200) return { label: 'ABOVE AVERAGE', color: '#f97316', text: 'Higher than average - Room for savings' };
        return { label: 'HIGH', color: '#ef4444', text: 'Very high consumption' };
    };

    const status = getStatus(monthlyUnits);

    const quickSetupOptions = [
        { id: "small", emoji: "🏠", label: "Small Home", description: "2-3 people, 150-250 units", people: 3, units: 200 },
        { id: "medium", emoji: "🏡", label: "Medium Home", description: "4-5 people, 300-450 units", people: 4, units: 375 },
        { id: "large", emoji: "🏰", label: "Large Home", description: "6+ people, 500+ units", people: 6, units: 550 },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="main-header text-center mb-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 mb-2">SMARTWATT</h1>
                <p className="text-slate-400">Kerala Energy Estimator</p>
            </div>

            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-[#cbd5e0] mb-2 font-medium">
                    <span>Step 1 of 4: Household Information</span>
                    <span>{mode === 'quick' ? 'Quick Estimate' : 'Detailed Estimate'}</span>
                </div>
                <div className="w-full bg-[rgba(30,41,59,0.4)] h-2 rounded-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] h-full w-1/4 rounded-sm"></div>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-normal text-slate-400 tracking-wide mb-6">
                    Detailed Estimate - Basic Information
                </h2>

                {/* Quick Setup */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {quickSetupOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleUpdate({ ...data, num_people: opt.people, kwh: opt.units })}
                            className="bg-[#1e293b] border border-[#334155] hover:border-[#667eea] hover:bg-[#1e293b]/80 text-left p-4 rounded-xl transition-all duration-200 group"
                        >
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">{opt.emoji}</div>
                            <div className="font-medium text-[#e2e8f0]">{opt.label}</div>
                            <div className="text-xs text-[#94a3b8] mt-1">{opt.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Inputs */}
            <div className="space-y-8">
                {/* People */}
                <div>
                    <label className="text-[#e2e8f0] mb-3 block text-base">
                        👥 Number of people in household
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="1" max="15"
                            value={data.num_people}
                            onChange={(e) => handleUpdate({ ...data, num_people: parseInt(e.target.value) })}
                            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-[#e2e8f0] font-medium w-8 text-center">{data.num_people}</span>
                    </div>
                </div>

                {/* Season */}
                <div>
                    <label className="text-[#e2e8f0] mb-2 block text-base">Current Season</label>
                    <p className="text-sm text-slate-400 mb-3">
                        Season affects AC and water heater usage significantly
                    </p>
                    <div className="space-y-3">
                        {[
                            { id: 'summer', label: 'Summer (March - May)' },
                            { id: 'monsoon', label: 'Monsoon (June - September)' },
                            { id: 'winter', label: 'Winter (October - February)' }
                        ].map((opt) => (
                            <label key={opt.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${data.season === opt.id ? 'bg-blue-600/20 border-blue-500' : 'border-slate-700 hover:bg-slate-800'}`}>
                                <input
                                    type="radio"
                                    name="season"
                                    value={opt.id}
                                    checked={data.season === opt.id}
                                    onChange={(e) => handleUpdate({ ...data, season: e.target.value })}
                                    className="accent-blue-500 w-4 h-4"
                                />
                                <span className="text-[#e2e8f0]">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* House Type */}
                <div>
                    <label className="text-[#e2e8f0] mb-3 block text-base">House Type</label>
                    <div className="space-y-3">
                        {[
                            { id: 'apartment', label: 'Apartment' },
                            { id: 'independent', label: 'Independent House' },
                            { id: 'villa', label: 'Villa' }
                        ].map((opt) => (
                            <label key={opt.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${data.house_type === opt.id ? 'bg-blue-600/20 border-blue-500' : 'border-slate-700 hover:bg-slate-800'}`}>
                                <input
                                    type="radio"
                                    name="house_type"
                                    value={opt.id}
                                    checked={data.house_type === opt.id}
                                    onChange={(e) => handleUpdate({ ...data, house_type: e.target.value })}
                                    className="accent-blue-500 w-4 h-4"
                                />
                                <span className="text-[#e2e8f0]">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Total Units */}
                <div>
                    <label className="text-[#e2e8f0] mb-2 block text-base">
                        📋 Total units from your KSEB bill
                    </label>
                    <p className="text-sm text-slate-400 mb-3">
                        Note: KSEB bills are bi-monthly (2 months). Look for 'Units Consumed' or 'Total Units' on your bill.
                    </p>
                    <input
                        type="number"
                        value={data.kwh || ''}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            handleUpdate({ ...data, kwh: isNaN(val) ? 0 : val });
                        }}
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-3 text-[#e2e8f0] focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Analysis Card */}
                <div
                    className="p-6 rounded-xl border relative overflow-hidden transition-all duration-300"
                    style={{
                        background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1419 100%)',
                        borderColor: status.color,
                        boxShadow: `0 4px 20px -5px ${status.color}40`
                    }}
                >
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: status.color }}></div>

                    <h4 className="text-[#94a3b8] uppercase tracking-wider text-xs font-bold mb-2">Consumption Analysis</h4>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold" style={{ color: status.color }}>{status.label}</span>
                        <span className="text-[#64748b] text-sm">consumption</span>
                    </div>

                    <div className="space-y-2 text-sm text-[#cbd5e0] font-mono">
                        <div className="flex justify-between">
                            <span>• Bi-monthly:</span>
                            <span>{data.kwh} units</span>
                        </div>
                        <div className="flex justify-between">
                            <span>• Monthly average:</span>
                            <span>{monthlyUnits} units/month</span>
                        </div>
                        <div className="text-[#94a3b8] italic pt-2 border-t border-slate-700/50 mt-2">
                            {status.text}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
                        <span className="text-[#94a3b8] text-sm">Estimated KSEB Bill:</span>
                        <div className="text-right">
                            <div className="text-xl font-bold text-white">₹{biMonthlyCost}</div>
                            <div className="text-xs text-[#64748b]">(bi-monthly)</div>
                        </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 text-center italic">
                        Note: Energy charge shown is an estimate. Small variations may occur due to slab rounding.
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-12 pt-6 border-t border-slate-800">
                <button onClick={onBack} className="px-8 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">
                    ← Back to Mode Selection
                </button>
                <button onClick={onNext} className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 transition-all shadow-lg shadow-blue-900/20">
                    Next: Appliances →
                </button>
            </div>
        </div>
    );
}