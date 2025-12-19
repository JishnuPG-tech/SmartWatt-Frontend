import { useState, useEffect } from 'react';
import { getPhysicsRatio, getExactModeWatts } from '@/lib/energyUtils';
import { Zap, X, Check } from 'lucide-react';

interface TestScenario {
    name: string;
    appliance: string;
    description: string;
    inputs: any;
    baselineInputs?: any;
    expectedCondition: (result: number, baseline: number) => boolean;
}

export default function VerificationDashboard({ onClose }: { onClose: () => void }) {
    const [results, setResults] = useState<any[]>([]);

    const scenarios: TestScenario[] = [
        {
            name: "Pump HP Sensitivity",
            appliance: "water_pump",
            description: "Verify 2.0 HP consumes more than 0.5 HP",
            inputs: { pump_hp: "2.0", pump_hours: 1 },
            baselineInputs: { pump_hp: "0.5", pump_hours: 1 },
            expectedCondition: (res, base) => res > base * 2.5 // Expect ~4x, allowing buffer
        },
        {
            name: "AC Efficiency Check",
            appliance: "ac",
            description: "Verify 5-Star AC consumes LESS than 3-Star AC",
            inputs: { ac_tonnage: "1.5", ac_star: "5-star", ac_hours: 1 },
            baselineInputs: { ac_tonnage: "1.5", ac_star: "3-star", ac_hours: 1 },
            expectedCondition: (res, base) => res < base // 5-star should be strictly less
        },
        {
            name: "Fan Motor Efficiency",
            appliance: "ceiling_fan",
            description: "Verify BLDC consumes significantly less than Standard",
            inputs: { fan_type: "bldc", fan_hours: 1 },
            baselineInputs: { fan_type: "standard", fan_hours: 1 },
            expectedCondition: (res, base) => res < base * 0.5 // Expect <50% of standard
        },
        {
            name: "TV Size Impact",
            appliance: "television",
            description: "Verify 55-inch consumes more than 32-inch",
            inputs: { tv_size: "55", tv_hours: 1 },
            baselineInputs: { tv_size: "32", tv_hours: 1 },
            expectedCondition: (res, base) => res > base * 1.5
        },
        {
            name: "Geyser Type Check",
            appliance: "water_heater",
            description: "Verify Instant (3kW) consumes more than Storage (2kW)",
            inputs: { geyser_type: "instant", geyser_hours: 1 },
            baselineInputs: { geyser_type: "storage", geyser_hours: 1 },
            expectedCondition: (res, base) => res > base
        }
    ];

    useEffect(() => {
        runTests();
    }, []);

    const runTests = () => {
        const newResults = scenarios.map(scenario => {
            // Check Ratio Logic (Physics-Scaled AI proxy)
            const ratio = getPhysicsRatio(scenario.appliance, scenario.inputs);
            const baseRatio = getPhysicsRatio(scenario.appliance, scenario.baselineInputs || {});

            // Check Exact Wattage Logic (Physical Truth)
            const watts = getExactModeWatts(scenario.appliance, scenario.inputs);
            const baseWatts = getExactModeWatts(scenario.appliance, scenario.baselineInputs || {});

            const passed = scenario.expectedCondition(watts, baseWatts);

            return {
                ...scenario,
                ratio,
                baseRatio,
                watts,
                baseWatts,
                passed
            };
        });
        setResults(newResults);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-400" /> Automated Logic Verification
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                                    <th className="pb-3 pl-2">Test Scenario</th>
                                    <th className="pb-3">Appliance</th>
                                    <th className="pb-3 text-right">Target Output (Watts)</th>
                                    <th className="pb-3 text-right">Baseline (Watts)</th>
                                    <th className="pb-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {results.map((res, idx) => (
                                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                        <td className="py-4 pl-2">
                                            <p className="font-medium text-slate-200">{res.name}</p>
                                            <p className="text-xs text-slate-500">{res.description}</p>
                                        </td>
                                        <td className="py-4 text-slate-400 font-mono">{res.appliance}</td>
                                        <td className="py-4 text-right text-emerald-400 font-mono font-bold">
                                            {res.watts.toFixed(0)} W
                                        </td>
                                        <td className="py-4 text-right text-slate-500 font-mono">
                                            {res.baseWatts.toFixed(0)} W
                                        </td>
                                        <td className="py-4 text-center">
                                            {res.passed ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                                                    <Check className="w-3 h-3" /> PASS
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">
                                                    <X className="w-3 h-3" /> FAIL
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-500">
                        Tests verified against shared logic engine (SmartWatt AI) • {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
