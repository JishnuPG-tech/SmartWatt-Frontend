import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { predictAppliance, calculateBill } from '@/lib/api';
import { saveTraining } from '@/lib/saveTraining';
import { Download, ChevronRight } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Props {
    household: any;
    appliances: string[];
    details: any;
    onRestart: () => void;
    trainingId: string;
}

// Physics constants from app.py
const PHYSICS_DEFAULTS: Record<string, number> = {
    ac: 1500, ceiling_fan: 75, cfl_bulb: 15, fridge: 200, led_light: 10,
    microwave: 1200, mixer_grinder: 750, television: 100, tube_light: 40,
    washing_machine: 500, water_heater: 2000, water_pump: 750,
    desktop: 200, laptop: 50, iron: 1000, kettle: 1500, induction: 1500,
    rice_cooker: 700, toaster: 800, food_processor: 500, hair_dryer: 1200, vacuum: 1000
};

export default function ResultsReport({ household, appliances, details, onRestart, trainingId }: Props) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<any>(null);
    const [billDetails, setBillDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const runAnalysis = async () => {
            try {
                setLoading(true);
                setError(null);
                setProgress(0);

                const totalBillKwh = household.kwh;
                const predictions: Record<string, number> = {};
                const uncertainties: Record<string, number> = {};
                let rawTotal = 0;

                // 1. Calculate Bill
                const billRes = await calculateBill(totalBillKwh);
                setBillDetails(billRes);

                // 2. Run Predictions (AI + Physics Fallback)
                const itemsToPredict = appliances.map(id => {
                    // Map frontend IDs to backend/physics IDs
                    if (id === 'air_conditioner') return 'ac';
                    if (id === 'refrigerator') return 'fridge';
                    if (id === 'fans') return 'ceiling_fan';
                    if (id === 'led_lights') return 'led_light';
                    if (id === 'cfl_lights') return 'cfl_bulb';
                    if (id === 'tube_lights') return 'tube_light';
                    if (id === 'mixer') return 'mixer_grinder';
                    if (id === 'geyser') return 'water_heater';
                    if (id === 'pump') return 'water_pump';
                    if (id === 'tv') return 'television';
                    return id;
                });

                if (itemsToPredict.length === 0) {
                    const emptyResults = {
                        breakdown: [],
                        rawTotal: 0,
                        correctionFactor: 0,
                        predictions: {},
                        uncertainties: {}
                    };
                    setResults(emptyResults);
                    setLoading(false);
                    return;
                }

                for (let i = 0; i < itemsToPredict.length; i++) {
                    const name = itemsToPredict[i];
                    setProgress(((i + 1) / itemsToPredict.length) * 100);

                    // Prepare details for this specific appliance
                    const appDetails: any = { ...details };

                    // Helper to parse star rating (e.g., "3-star" -> 3)
                    const parseStar = (key: string) => {
                        const val = details[key] || '3';
                        return parseInt(val.toString().split('-')[0]) || 3;
                    };

                    // Helper to parse float from string (e.g., "1.5 ton" -> 1.5)
                    const parseFloatVal = (key: string, defaultVal: number) => {
                        const val = details[key];
                        if (!val) return defaultVal;
                        return parseFloat(val.toString().split(' ')[0]) || defaultVal;
                    };

                    // Construct specific inputs based on appliance type (matching app.py logic)
                    const payloadDetails: any = {
                        total_kwh_monthly: totalBillKwh
                    };

                    // Map backend IDs to UsageDetails titles for mode checking
                    const TITLE_MAP: Record<string, string> = {
                        ac: 'Air Conditioner',
                        fridge: 'Refrigerator',
                        washing_machine: 'Washing Machine',
                        ceiling_fan: 'Ceiling Fans',
                        led_light: 'LED Lights',
                        cfl_bulb: 'CFL Lights',
                        tube_light: 'Tube Lights',
                        television: 'Television',
                        water_heater: 'Water Heater / Geyser',
                        mixer_grinder: 'Mixer / Grinder',
                        microwave: 'Microwave Oven',
                        kettle: 'Electric Kettle',
                        induction: 'Induction Cooktop',
                        water_pump: 'Water Pump',
                        iron: 'Iron Box',
                        desktop: 'Desktop Computer',
                        laptop: 'Laptop'
                    };

                    const title = TITLE_MAP[name];
                    const modeKey = title ? `usage_mode_${title}` : null;
                    const isExactMode = modeKey && details[modeKey] === 'exact';

                    // Helper to safely get number (preserving 0)
                    const getNum = (key: string, defaultVal: number) => {
                        const val = details[key];
                        if (val === undefined || val === null || val === '') return defaultVal;
                        return Number(val);
                    };

                    if (name === 'ac') {
                        payloadDetails.ac_hours_per_day = getNum('ac_hours', 6);
                        payloadDetails.ac_tonnage = parseFloatVal('ac_tonnage', 1.5);
                        payloadDetails.ac_star_rating = parseStar('ac_star');
                        payloadDetails.num_ac_units = getNum('ac_units', 1);
                        payloadDetails.ac_type = details.ac_type || 'split';
                        payloadDetails.ac_usage_pattern = details.ac_pattern || 'moderate';
                    } else if (name === 'fridge') {
                        payloadDetails.fridge_capacity_liters = parseFloatVal('fridge_capacity', 250);
                        payloadDetails.fridge_age_years = details.fridge_age === '<1' ? 0.5 : parseFloatVal('fridge_age', 5);
                        payloadDetails.fridge_star_rating = parseStar('fridge_star');
                        payloadDetails.fridge_type = details.fridge_type === 'frost' ? 'frost_free' : 'direct_cool';
                    } else if (name === 'washing_machine') {
                        payloadDetails.wm_cycles_per_week = 4; // Default
                        payloadDetails.wm_capacity_kg = parseFloatVal('wm_capacity', 7.0);
                        payloadDetails.wm_star_rating = 4;
                        payloadDetails.wm_type = details.wm_type === 'front' ? 'front_load' : 'top_load';
                    } else if (name === 'ceiling_fan') {
                        payloadDetails.num_ceiling_fans = getNum('num_fans', 3);
                        payloadDetails.fan_hours_per_day = getNum('fan_hours', 15);
                        payloadDetails.fan_star_rating = 3;
                        payloadDetails.fan_type = 'standard';
                    } else if (name === 'led_light') {
                        payloadDetails.num_led_lights = getNum('num_led', 5);
                        payloadDetails.light_hours_per_day = getNum('led_hours', 6);
                    } else if (name === 'television') {
                        payloadDetails.tv_hours_per_day = getNum('tv_hours', 5);
                        payloadDetails.tv_size_inches = 43;
                        payloadDetails.num_televisions = 1;
                        payloadDetails.tv_type = 'LED';
                    } else if (name === 'water_heater') {
                        payloadDetails.water_heater_usage_hours = getNum('geyser_hours', 1);
                        payloadDetails.water_heater_capacity_liters = parseFloatVal('geyser_capacity', 15);
                        payloadDetails.water_heater_type = 'instant';
                    } else if (name === 'desktop') {
                        payloadDetails.desktop_hours_per_day = getNum('desktop_hours', 4);
                    } else if (name === 'laptop') {
                        payloadDetails.laptop_hours_per_day = getNum('laptop_hours', 4);
                    } else if (name === 'iron') {
                        payloadDetails.iron_hours_per_day = getNum('iron_hours', 0.2);
                    } else if (name === 'kettle') {
                        payloadDetails.kettle_hours_per_day = getNum('kettle_hours', 0.2);
                    } else if (name === 'induction') {
                        payloadDetails.induction_hours_per_day = getNum('induction_hours', 1.0);
                    } else if (name === 'rice_cooker') {
                        payloadDetails.rice_cooker_hours_per_day = getNum('rice_cooker_hours', 0.5);
                    } else if (name === 'mixer_grinder') {
                        payloadDetails.mixer_grinder_usage_minutes_per_day = getNum('mixer_hours', 0.5) * 60;
                        payloadDetails.mixer_grinder_wattage = 750;
                    } else if (name === 'microwave') {
                        payloadDetails.microwave_usage_minutes_per_day = getNum('microwave_hours', 0.5) * 60;
                        payloadDetails.microwave_capacity_liters = 20;
                    } else if (name === 'water_pump') {
                        payloadDetails.water_pump_usage_hours_per_day = getNum('pump_hours', 0.5);
                        payloadDetails.water_pump_hp = 1.0;
                    } else if (name === 'cfl_bulb') {
                        payloadDetails.num_cfl_bulbs = getNum('num_cfl', 2);
                        payloadDetails.light_hours_per_day = getNum('cfl_hours', 5);
                    } else if (name === 'tube_light') {
                        payloadDetails.num_tube_lights = getNum('num_tube', 2);
                        payloadDetails.light_hours_per_day = getNum('tube_hours', 5);
                    }
                    // Add other mappings as needed...

                    // Call AI or Force Physics
                    try {
                        let val = 0;
                        let uncertainty = 0;

                        // If user selected "Exact Hours", prioritize physics calculation
                        if (isExactMode) {
                            const watts = PHYSICS_DEFAULTS[name] || 100;
                            let hours = 0;
                            let count = 1;

                            if (name === 'ac') { hours = getNum('ac_hours', 0); count = getNum('ac_units', 1); }
                            else if (name === 'fridge') hours = getNum('fridge_hours', 24);
                            else if (name === 'ceiling_fan') { hours = getNum('fan_hours', 12); count = getNum('num_fans', 3); }
                            else if (name === 'led_light') { hours = getNum('led_hours', 6); count = getNum('num_led', 5); }
                            else if (name === 'television') hours = getNum('tv_hours', 5);
                            else if (name === 'washing_machine') hours = (getNum('wm_times_week', 4) * 1.5) / 7;
                            else if (name === 'water_heater') hours = getNum('geyser_hours', 1);
                            else if (name === 'mixer_grinder') hours = getNum('mixer_hours', 0.5);
                            else if (name === 'microwave') hours = getNum('microwave_hours', 0.5);
                            else if (name === 'kettle') hours = getNum('kettle_hours', 0.5);
                            else if (name === 'induction') hours = getNum('induction_hours', 1.5);
                            else if (name === 'water_pump') hours = getNum('pump_hours', 0.5);
                            else if (name === 'iron') hours = getNum('iron_hours', 0.5);
                            else if (name === 'desktop') hours = getNum('desktop_hours', 4);
                            else if (name === 'laptop') hours = getNum('laptop_hours', 4);
                            else if (name === 'cfl_bulb') { hours = getNum('cfl_hours', 5); count = 2; }
                            else if (name === 'tube_light') { hours = getNum('tube_hours', 5); count = 2; }
                            else if (name === 'toaster') hours = 0.15; // ~10 mins
                            else if (name === 'food_processor') hours = 0.2; // ~12 mins
                            else if (name === 'hair_dryer') hours = 0.15; // ~10 mins
                            else if (name === 'vacuum') hours = 0.3; // ~20 mins

                            val = (watts * hours * 30 * count) / 1000;
                            uncertainty = val * 0.05; // Very low uncertainty for exact inputs
                        } else {
                            // Use AI Prediction
                            const aiRes = await predictAppliance(name, payloadDetails, totalBillKwh);
                            val = aiRes.status === 'success' ? aiRes.prediction : 0;
                            uncertainty = val * 0.12;

                            // Physics Fallback if AI is too low/failed (only if NOT exact mode)
                            if (val < 0.5) {
                                const watts = PHYSICS_DEFAULTS[name] || 100;
                                let hours = 0;
                                let count = 1;

                                if (name === 'ac') hours = getNum('ac_hours', 6);
                                else if (name === 'fridge') hours = getNum('fridge_hours', 24);
                                else if (name === 'ceiling_fan') { hours = getNum('fan_hours', 12); count = getNum('num_fans', 3); }
                                else if (name === 'led_light') { hours = getNum('led_hours', 6); count = getNum('num_led', 5); }
                                else if (name === 'television') hours = getNum('tv_hours', 5);
                                else if (name === 'washing_machine') hours = (getNum('wm_times_week', 4) * 1.5) / 7;
                                else if (name === 'water_heater') hours = getNum('geyser_hours', 1);
                                else if (name === 'mixer_grinder') hours = getNum('mixer_hours', 0.5);
                                else if (name === 'microwave') hours = getNum('microwave_hours', 0.5);
                                else if (name === 'kettle') hours = getNum('kettle_hours', 0.5);
                                else if (name === 'induction') hours = getNum('induction_hours', 1.5);
                                else if (name === 'water_pump') hours = getNum('pump_hours', 0.5);
                                else if (name === 'iron') hours = getNum('iron_hours', 0.5);
                                else if (name === 'desktop') hours = getNum('desktop_hours', 4);
                                else if (name === 'laptop') hours = getNum('laptop_hours', 4);
                                else if (name === 'cfl_bulb') { hours = getNum('cfl_hours', 5); count = 2; }
                                else if (name === 'tube_light') { hours = getNum('tube_hours', 5); count = 2; }
                                else if (name === 'toaster') hours = 0.15;
                                else if (name === 'food_processor') hours = 0.2;
                                else if (name === 'hair_dryer') hours = 0.15;
                                else if (name === 'vacuum') hours = 0.3;

                                if (hours > 0) {
                                    val = (watts * hours * 30 * count) / 1000;
                                    uncertainty = val * 0.08;
                                }
                            }
                        }

                        predictions[name] = val;
                        uncertainties[name] = uncertainty;
                        rawTotal += val;
                    } catch (err) {
                        console.error(`Failed to predict for ${name}:`, err);
                        predictions[name] = 0;
                        uncertainties[name] = 0;
                    }
                }

                // 3. Normalization & Cost Distribution
                const correctionFactor = rawTotal > 0 ? totalBillKwh / rawTotal : 0;
                const estimatedTotalCost = billRes.total;

                const breakdown: any[] = [];
                let totalCalculatedCost = 0;

                Object.entries(predictions).forEach(([name, kwh]) => {
                    const correctedKwh = kwh * correctionFactor;
                    const correctedUncertainty = uncertainties[name] * correctionFactor;

                    if (correctedKwh > 0.01) {
                        const percentage = (correctedKwh / totalBillKwh) * 100;
                        const rawCost = (correctedKwh / totalBillKwh) * estimatedTotalCost;
                        const cost = Math.floor(rawCost); // Int rounding

                        totalCalculatedCost += cost;

                        // Display Name Mapping
                        const displayName = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            .replace('Ac', 'Air Conditioner')
                            .replace('Fridge', 'Refrigerator')
                            .replace('Ceiling Fan', 'Ceiling Fans');

                        breakdown.push({
                            name: displayName,
                            kwh: correctedKwh,
                            uncertainty: correctedUncertainty,
                            percentage,
                            cost
                        });
                    }
                });

                // Penny Rounding
                const diff = Math.floor(estimatedTotalCost) - totalCalculatedCost;
                if (breakdown.length > 0 && diff !== 0) {
                    breakdown.sort((a, b) => b.cost - a.cost);
                    breakdown[0].cost += diff;
                }

                // Sort by usage for display
                breakdown.sort((a, b) => b.kwh - a.kwh);

                const finalResults = {
                    breakdown,
                    rawTotal,
                    correctionFactor,
                    predictions,
                    uncertainties
                };

                setResults(finalResults);

                // Save results to Supabase
                saveTraining(trainingId, {
                    estimated_bill: estimatedTotalCost,
                    ai_results: finalResults
                });

                setLoading(false);
            } catch (e: any) {
                console.error("Analysis Failed:", e);
                setError(e.message || "An unexpected error occurred during analysis.");
                setLoading(false);
            }
        };

        runAnalysis();
    }, []);

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-20">
                <div className="main-header mb-8">
                    <h1>SMARTWATT AI</h1>
                    <p>Analysis Failed</p>
                </div>
                <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200">
                    <h3 className="text-xl font-bold mb-2">Oops! Something went wrong.</h3>
                    <p className="mb-6">{error}</p>
                    <button onClick={onRestart} className="st-button-secondary px-8">
                        TRY AGAIN
                    </button>
                </div>
            </div>
        );
    }

    if (loading || !results || !billDetails) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-20">
                <div className="main-header">
                    <h1>SMARTWATT AI</h1>
                    <p>Neural Network Analysis</p>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-slate-400 animate-pulse">Processing household energy patterns...</p>
            </div>
        );
    }

    const avgCost = billDetails.total / household.kwh;

    // --- Grouping Logic ---
    const THRESHOLD = 6.0; // kWh
    const mainItems = results.breakdown.filter((i: any) => i.kwh >= THRESHOLD);
    const smallItems = results.breakdown.filter((i: any) => i.kwh < THRESHOLD);

    let groupedBreakdown = [...mainItems];
    let otherTotalKwh = 0;
    let otherTotalCost = 0;
    let otherPercentage = 0;

    if (smallItems.length > 0) {
        otherTotalKwh = smallItems.reduce((acc: number, curr: any) => acc + curr.kwh, 0);
        otherTotalCost = smallItems.reduce((acc: number, curr: any) => acc + curr.cost, 0);
        otherPercentage = smallItems.reduce((acc: number, curr: any) => acc + curr.percentage, 0);

        groupedBreakdown.push({
            name: "Other Appliances",
            kwh: otherTotalKwh,
            uncertainty: 0, // Not really applicable for group
            percentage: otherPercentage,
            cost: otherTotalCost,
            isGroup: true
        });
    }

    // Sort again to ensure "Other" is in correct place (usually last if small, but maybe not)
    groupedBreakdown.sort((a, b) => b.kwh - a.kwh);

    return (
        <div className="w-full max-w-5xl mx-auto px-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="main-header">
                <h1>SMARTWATT AI</h1>
                <p>Neural Network Analysis</p>
            </div>

            {/* Analysis Summary Banner */}
            <div className="section bg-[#1a1f3a] border border-[#60a5fa]/30 p-6 rounded-xl mb-8">
                <div className="text-sm text-[#cbd5e0] mb-4">
                    <span className="font-medium text-white">AI Analysis Complete</span> | Household: {household.num_people} people | Monthly: {(household.kwh / 2).toFixed(1)} kWh (~₹{Math.floor(billDetails.total / 2)}) | Bi-monthly KSEB Bill: ₹{Math.floor(billDetails.total)}
                </div>

                <div className="mb-4">
                    <h3 className="font-medium text-white mb-2">AI Processing with Physics Validation</h3>
                    <details className="group">
                        <summary className="flex items-center gap-2 text-[#60a5fa] hover:text-[#93c5fd] text-sm cursor-pointer list-none">
                            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                            🔬 View AI Raw Predictions with Confidence Intervals
                        </summary>
                        <div className="mt-4 p-4 bg-[#0f1419]/50 rounded border border-slate-700/30 text-sm text-slate-400 font-mono">
                            <p>Total Bill: {household.kwh} kWh</p>
                            <p>Raw AI Total: {results.rawTotal.toFixed(2)} kWh</p>
                            <p>Correction Factor: {results.correctionFactor.toFixed(3)}</p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                {Object.entries(results.predictions).map(([name, val]: [string, any]) => (
                                    <li key={name}>
                                        {name}: {val.toFixed(2)} kWh (±{results.uncertainties[name].toFixed(2)})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </details>
                </div>

                <div className="p-4 bg-green-900/20 border-l-4 border-green-500 rounded mb-4">
                    <p className="text-green-200 font-medium">
                        Analysis Complete | {household.kwh} kWh → ₹{Math.floor(billDetails.total)} Bi-monthly Bill | Avg: ₹{avgCost.toFixed(2)}/unit
                    </p>
                </div>

                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded">
                    <p className="text-sm text-blue-200">
                        📊 <strong>About Confidence Intervals:</strong> Values shown as X.XX (±Y.YY) indicate AI prediction uncertainty.
                        For example, 1.24 (±0.18) means actual consumption is likely between 1.06 and 1.42 kWh.
                    </p>
                </div>
            </div>

            {/* KSEB Details Expander */}
            <details className="section group mb-8 bg-[#1a202c] border border-slate-700 rounded-md overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer bg-gradient-to-r from-[#1a1f3a] to-[#0f1419] hover:bg-slate-800 transition-colors list-none">
                    <div className="flex items-center gap-2 text-white font-medium">
                        <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                        KSEB Billing Details (Bi-Monthly Calculation)
                    </div>
                </summary>
                <div className="p-4 text-slate-300 space-y-2 text-sm">
                    <p><strong>Bi-Monthly Consumption:</strong> {household.kwh} units</p>
                    <p><strong>Monthly Average:</strong> {(household.kwh / 2).toFixed(1)} units/month</p>
                    <p><strong>Base Energy Charge:</strong> ₹{Math.floor(billDetails.total * 0.965)}</p>
                    <p><strong>Fuel Surcharge (~₹0.13/unit):</strong> ₹{Math.floor(billDetails.total * 0.035)}</p>
                    <p className="text-white font-bold pt-2 border-t border-slate-700">Total Energy Charge: ₹{Math.floor(billDetails.total)}</p>
                </div>
            </details>

            {/* Breakdown Table */}
            <h2 className="text-white text-2xl font-medium mb-4">Appliance-wise Breakdown</h2>

            <div className="section bg-[#1a202c] border border-slate-700 rounded-xl p-6 mb-8">
                <div className="mb-4">
                    <p className="text-green-400 font-medium">✓ KSEB Bill Calculation Complete</p>
                    <ul className="text-sm text-slate-400 mt-2 space-y-1">
                        <li>• Bi-monthly Units: {household.kwh} kWh</li>
                        <li>• Total Bill: ₹{Math.floor(billDetails.total)}</li>
                    </ul>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-700">
                            <tr>
                                <th className="text-left py-3 px-4 text-white font-medium">Appliance</th>
                                <th className="text-right py-3 px-4 text-white font-medium">Usage (kWh)</th>
                                <th className="text-right py-3 px-4 text-white font-medium">Confidence</th>
                                <th className="text-right py-3 px-4 text-white font-medium">Percentage</th>
                                <th className="text-right py-3 px-4 text-white font-medium">Cost (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {groupedBreakdown.map((item: any, idx: number) => (
                                <tr key={idx} className={item.isGroup ? "bg-blue-900/10" : ""}>
                                    <td className="py-3 px-4 text-slate-200 font-medium">
                                        {item.name}
                                        {item.isGroup && <span className="ml-2 text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full">{smallItems.length} items</span>}
                                    </td>
                                    <td className="text-right py-3 px-4 text-slate-200">{item.kwh.toFixed(2)}</td>
                                    <td className="text-right py-3 px-4 text-slate-500 text-xs">
                                        {item.isGroup ? "-" : `±${item.uncertainty.toFixed(2)}`}
                                    </td>
                                    <td className="text-right py-3 px-4 text-slate-200">{item.percentage.toFixed(1)}%</td>
                                    <td className="text-right py-3 px-4 text-slate-200">₹{item.cost}</td>
                                </tr>
                            ))}
                            <tr className="font-bold bg-slate-800/30">
                                <td className="py-3 px-4 text-white">TOTAL</td>
                                <td className="text-right py-3 px-4 text-white">{household.kwh.toFixed(1)}</td>
                                <td className="text-right py-3 px-4"></td>
                                <td className="text-right py-3 px-4 text-white">100%</td>
                                <td className="text-right py-3 px-4 text-white">₹{Math.floor(billDetails.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>


                {/* Expandable "Other Appliances" Details */}
                {smallItems.length > 0 && (
                    <details className="group mt-4 border-t border-slate-700 pt-4">
                        <summary className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 cursor-pointer list-none transition-colors">
                            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                            View breakdown of "Other Appliances" ({smallItems.length} items &lt; {THRESHOLD} kWh)
                        </summary>
                        <div className="mt-4 pl-6 overflow-x-auto">
                            <table className="w-full text-sm text-slate-400">
                                <thead className="text-xs uppercase text-slate-500 border-b border-slate-700/50">
                                    <tr>
                                        <th className="text-left py-2">Item</th>
                                        <th className="text-right py-2">Usage</th>
                                        <th className="text-right py-2">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {smallItems.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="py-2">{item.name}</td>
                                            <td className="text-right py-2">{item.kwh.toFixed(2)} kWh</td>
                                            <td className="text-right py-2">₹{item.cost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                )}
            </div>

            {/* Visual Analysis Charts */}
            <h2 className="text-white text-2xl font-medium mb-4">Visual Analysis</h2>
            <div className="section grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Donut Chart - Energy Distribution */}
                <div className="bg-[#1a202c] border border-slate-700 rounded-xl p-4 overflow-hidden">
                    <h3 className="text-slate-300 font-medium mb-2 text-center">Energy Distribution (kWh)</h3>
                    <div className="w-full h-[300px]">
                        <Plot
                            data={[
                                {
                                    values: results.breakdown.map((i: any) => i.kwh),
                                    labels: results.breakdown.map((i: any) => i.name),
                                    type: 'pie',
                                    hole: 0.4,
                                    textinfo: 'label+percent',
                                    textposition: 'inside',
                                    marker: {
                                        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']
                                    }
                                }
                            ]}
                            layout={{
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                font: { color: '#e2e8f0' },
                                showlegend: false,
                                margin: { t: 20, b: 20, l: 20, r: 20 },
                                autosize: true
                            }}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '100%' }}
                            config={{ displayModeBar: false }}
                        />
                    </div>
                </div>

                {/* Bar Chart - Cost Breakdown */}
                <div className="bg-[#1a202c] border border-slate-700 rounded-xl p-4 overflow-hidden">
                    <h3 className="text-slate-300 font-medium mb-2 text-center">Cost Impact (₹)</h3>
                    <div className="w-full h-[300px]">
                        <Plot
                            data={[
                                {
                                    x: results.breakdown.map((i: any) => i.name),
                                    y: results.breakdown.map((i: any) => i.cost),
                                    type: 'bar',
                                    marker: {
                                        color: '#3b82f6',
                                        opacity: 0.8
                                    },
                                    error_y: {
                                        type: 'data',
                                        array: results.breakdown.map((i: any) => (i.uncertainty / household.kwh) * billDetails.total),
                                        visible: true,
                                        color: '#94a3b8'
                                    }
                                }
                            ]}
                            layout={{
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                font: { color: '#e2e8f0' },
                                xaxis: { tickangle: -45, automargin: true },
                                yaxis: { title: { text: 'Cost (₹)' }, gridcolor: '#334155' },
                                margin: { t: 20, b: 80, l: 50, r: 20 },
                                autosize: true
                            }}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '100%' }}
                            config={{ displayModeBar: false }}
                        />
                    </div>
                </div>
            </div>

            {/* Kerala Tips Card */}
            <div className="mb-8 bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] border border-[#60a5fa]/30 rounded-xl p-6">
                <h3 className="text-[#60a5fa] font-medium text-lg mb-4">Kerala-Specific Energy Saving Tips</h3>
                <ul className="space-y-3 text-[#bfdbfe] text-sm leading-relaxed">
                    <li className="flex gap-2">
                        <span>•</span>
                        Use overhead tank water (sun-heated by Kerala's tropical climate) instead of geyser
                    </li>
                    <li className="flex gap-2">
                        <span>•</span>
                        Utilize monsoon season for natural cooling (reduce AC usage)
                    </li>
                    <li className="flex gap-2">
                        <span>•</span>
                        Run washing machine/dishwasher during off-peak hours (10 PM - 6 AM)
                    </li>
                    <li className="flex gap-2">
                        <span>•</span>
                        Cook rice in pressure cooker instead of rice cooker (50% less energy)
                    </li>
                    <li className="flex gap-2">
                        <span>•</span>
                        Install solar panels (Kerala has ~250 sunny days/year - great ROI!)
                    </li>
                </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
                <button onClick={onRestart} className="st-button-secondary px-8">
                    START NEW ESTIMATE
                </button>
                <button
                    onClick={async () => {
                        try {
                            const jsPDF = (await import('jspdf')).default;
                            const autoTable = (await import('jspdf-autotable')).default;

                            const doc = new jsPDF();

                            // Title
                            doc.setFontSize(22);
                            doc.setTextColor(41, 128, 185); // Blue
                            doc.text("SmartWatt Energy Report", 14, 20);

                            // Subtitle / Date
                            doc.setFontSize(10);
                            doc.setTextColor(100);
                            doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 28);

                            // Household Summary
                            doc.setFontSize(14);
                            doc.setTextColor(0);
                            doc.text("Household Summary", 14, 40);

                            doc.setFontSize(10);
                            doc.setTextColor(80);
                            const summaryData = [
                                [`Household Size: ${household.num_people} People`, `Season: ${household.season.toUpperCase()}`],
                                [`House Type: ${household.house_type.toUpperCase()}`, `Bi-Monthly Units: ${household.kwh} kWh`],
                                [`Estimated Bill: Rs. ${Math.floor(billDetails.total)}`, `Avg Cost/Unit: Rs. ${avgCost.toFixed(2)}`]
                            ];

                            autoTable(doc, {
                                startY: 45,
                                head: [],
                                body: summaryData,
                                theme: 'plain',
                                styles: { fontSize: 10, cellPadding: 2 },
                                columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90 } }
                            });

                            // Breakdown Table
                            doc.setFontSize(14);
                            doc.setTextColor(0);
                            doc.text("Appliance Breakdown", 14, (doc as any).lastAutoTable.finalY + 15);

                            const tableData = results.breakdown.map((item: any) => [
                                item.name,
                                `${item.kwh.toFixed(2)} kWh`,
                                `${item.percentage.toFixed(1)}%`,
                                `Rs. ${item.cost}`
                            ]);

                            // Add Total Row
                            tableData.push([
                                'TOTAL',
                                `${household.kwh.toFixed(1)} kWh`,
                                '100%',
                                `Rs. ${Math.floor(billDetails.total)}`
                            ]);

                            autoTable(doc, {
                                startY: (doc as any).lastAutoTable.finalY + 20,
                                head: [['Appliance', 'Usage', 'Percentage', 'Cost']],
                                body: tableData,
                                theme: 'grid',
                                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                                styles: { fontSize: 10, cellPadding: 4 },
                                columnStyles: {
                                    0: { fontStyle: 'bold' },
                                    3: { fontStyle: 'bold', halign: 'right' },
                                    1: { halign: 'right' },
                                    2: { halign: 'right' }
                                },
                                didParseCell: (data) => {
                                    if (data.row.index === tableData.length - 1) {
                                        data.cell.styles.fontStyle = 'bold';
                                        data.cell.styles.fillColor = [240, 240, 240];
                                    }
                                }
                            });

                            // Energy Tips
                            const finalY = (doc as any).lastAutoTable.finalY + 15;
                            doc.setFontSize(14);
                            doc.setTextColor(0);
                            doc.text("Energy Saving Tips", 14, finalY);

                            doc.setFontSize(10);
                            doc.setTextColor(80);
                            const tips = [
                                "- Use overhead tank water (sun-heated) instead of geyser.",
                                "- Utilize monsoon season for natural cooling to reduce AC usage.",
                                "- Run washing machine/dishwasher during off-peak hours (10 PM - 6 AM).",
                                "- Cook rice in pressure cooker instead of rice cooker (50% less energy).",
                                "- Install solar panels (Kerala has ~250 sunny days/year)."
                            ];

                            let tipY = finalY + 10;
                            tips.forEach(tip => {
                                doc.text(tip, 14, tipY);
                                tipY += 6;
                            });

                            // Footer
                            doc.setFontSize(8);
                            doc.setTextColor(150);
                            doc.text("SmartWatt AI - Kerala Energy Estimator", 14, 285);

                            doc.save('SmartWatt-Report.pdf');

                        } catch (err) {
                            console.error('PDF Generation Failed:', err);
                            alert('Failed to generate PDF. Please try again.');
                        }
                    }}
                    className="st-button px-8 flex items-center gap-2 bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] border-none"
                >
                    <Download size={18} />
                    DOWNLOAD REPORT (PDF)
                </button>
            </div>
        </div >
    );
}
