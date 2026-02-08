import { useState, useCallback, useEffect, useRef } from 'react';
import { calculateBill, predictAllAppliances, saveTraining } from '@/lib/api';
import { getExactModeWatts, distributeEnergyGap } from '@/lib/energyUtils';
import { toast } from 'sonner';
import { BillResult } from '@/lib/types';

interface AnomalyInfo {
    status: string;
    message: string;
    type?: string;
    [key: string]: unknown;
}

export interface AnalysisResult {
    totalUsage: number;
    billEstimate: number;
    breakdown: Array<{ id?: string; name?: string; appliance?: string; kwh: number;[key: string]: unknown }>;
    predictions: Record<string, number>;
    anomalies: Record<string, AnomalyInfo>;
    uncertainties: Record<string, number>;
    rawTotal: number;
    metrics: {
        confidence: string;
        model: string;
        accuracy: string;
    };
}

export function useAnalysisEngine(
    household: Record<string, unknown>,
    appliances: string[],
    details: Record<string, unknown>,
    trainingId: string,
    mode?: 'quick' | 'detailed' | null
) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [billDetails, setBillDetails] = useState<BillResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const hasRunRef = useRef(false);

    const runAnalysis = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setProgress(0);

            const totalBillKwh = household.kwh as number;
            const predictions: Record<string, number> = {};
            const uncertainties: Record<string, number> = {};
            const anomalies: Record<string, AnomalyInfo> = {};
            let rawTotal = 0;

            // 1. Calculate Bill
            const billRes = await calculateBill(totalBillKwh);
            setBillDetails(billRes);

            // 2. Run Predictions (AI + Physics Fallback)
            const itemsToPredict = appliances.map(id => {
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
                setResults({
                    breakdown: [],
                    rawTotal: 0,
                    predictions: {},
                    uncertainties: {},
                    anomalies: {},
                    totalUsage: totalBillKwh,
                    billEstimate: billRes.total,
                    metrics: { confidence: '100', model: 'None', accuracy: 'N/A' }
                });
                setLoading(false);
                return;
            }

            const requests: any[] = [];
            const requestMap: Record<string, Record<string, unknown>> = {};
            const calculationDetails = (mode === 'quick') ? {} : details;

            // Loop and Prepare Payloads
            for (let i = 0; i < itemsToPredict.length; i++) {
                const name = itemsToPredict[i];
                const getNum = (key: string, defaultVal: number) => {
                    const val = calculationDetails[key];
                    if (val === undefined || val === null || val === '') return defaultVal;
                    return Number(val);
                };
                const parseFloatVal = (key: string, defaultVal: number) => {
                    const val = calculationDetails[key];
                    if (!val) return defaultVal;
                    return parseFloat(val.toString().split(' ')[0]) || defaultVal;
                };
                const parseStar = (key: string) => {
                    const val = details[key] || '3';
                    return parseInt(val.toString().split('-')[0]) || 3;
                };

                // Convert usage pattern to hours
                const patternToHours = (applianceId: string, pattern: string | undefined, defaultHours: number) => {
                    if (!pattern) return defaultHours;

                    // TV patterns: light=2, moderate=4, heavy=6.5, always=10
                    if (applianceId === 'tv') {
                        if (pattern === 'light') return 2;
                        if (pattern === 'moderate') return 4;
                        if (pattern === 'heavy') return 6.5;
                        if (pattern === 'always') return 10;
                    }

                    // Desktop/Laptop: light=1.5, moderate=4, heavy=8, always=24
                    if (applianceId === 'desktop' || applianceId === 'laptop') {
                        if (pattern === 'light') return 1.5;
                        if (pattern === 'moderate') return 4;
                        if (pattern === 'heavy') return 8;
                        if (pattern === 'always') return 24;
                    }

                    // Iron: rarely=0.16, light=0.33, moderate=0.75, heavy=1.5
                    if (applianceId === 'iron') {
                        if (pattern === 'rarely') return 0.16;
                        if (pattern === 'light') return 0.33;
                        if (pattern === 'moderate') return 0.75;
                        if (pattern === 'heavy') return 1.5;
                    }

                    return defaultHours;
                };

                const payloadDetails: any = {
                    total_kwh_monthly: totalBillKwh,
                    n_occupants: household.num_people || 4,
                    season: household.season || 'monsoon',
                    location_type: household.location_type || ((household.house_type === 'independent') ? 'rural' : 'urban')
                };

                // --- MAPPING LOGIC START ---
                // GLOBAL: Always map explicit hours if available
                const mapHours = (sourceKey: string, targetKey: string, defaultHours: number) => {
                    const val = getNum(sourceKey, -1);
                    if (val >= 0) payloadDetails[targetKey] = val;
                };

                if (name === 'ac' || name === 'air_conditioner') {
                    payloadDetails.ac_hours_per_day = getNum('ac_hours', 6);
                    payloadDetails.ac_tonnage = parseFloatVal('ac_tonnage', 1.5);
                    payloadDetails.ac_star_rating = parseStar('ac_star');
                    payloadDetails.num_ac_units = getNum('ac_units', 1);
                    payloadDetails.ac_type = details.ac_type || 'split';
                    payloadDetails.ac_usage_pattern = details.ac_usage_pattern || details.ac_pattern || 'moderate';
                } else if (name === 'fridge' || name === 'refrigerator') {
                    payloadDetails.fridge_hours = getNum('fridge_hours', 24); // Map hours
                    payloadDetails.fridge_capacity_liters = parseFloatVal('fridge_capacity', 250);
                    payloadDetails.fridge_age_years = details.fridge_age === '<1' ? 0.5 : parseFloatVal('fridge_age', 5);
                    payloadDetails.fridge_star_rating = parseStar('fridge_star');
                    payloadDetails.fridge_type = details.fridge_type === 'frost' ? 'frost_free' : 'direct_cool';
                    payloadDetails.refrigerator_usage_pattern = details.fridge_pattern || 'always';
                } else if (name === 'washing_machine') {
                    // WM defines usage by cycles, but we can also map hours if needed
                    payloadDetails.wm_cycles_per_week = parseFloatVal('wm_cycles_per_week', 4);
                    payloadDetails.wm_capacity_kg = parseFloatVal('wm_capacity', 7.0);
                    payloadDetails.wm_star_rating = parseStar('wm_star') || 4;
                    payloadDetails.wm_type = details.wm_type || 'top_load';
                } else if (name === 'ceiling_fan') {
                    payloadDetails.ceiling_fan_hours = getNum('fan_hours', 12); // Map hours
                    payloadDetails.num_ceiling_fans = parseFloatVal('num_fans', 3);
                    payloadDetails.fan_type = details.fan_type || 'standard'; // For physics fallback only
                    payloadDetails.fan_usage_pattern = details.fan_pattern || 'most';
                } else if (name === 'led_light') {
                    payloadDetails.led_lights_hours = getNum('led_hours', 6); // Map hours
                    payloadDetails.num_led_lights = getNum('num_led', 5);
                    payloadDetails.led_lights_usage_pattern = details.led_pattern || 'evening';
                } else if (name === 'tube_light') {
                    payloadDetails.tube_lights_hours = getNum('tube_hours', 5); // Map hours
                    payloadDetails.num_tube_lights = getNum('num_tube', 2);
                    payloadDetails.tube_lights_usage_pattern = details.tube_pattern || 'evening';
                } else if (name === 'cfl_bulb') {
                    payloadDetails.cfl_lights_hours = getNum('cfl_hours', 5); // Map hours
                    payloadDetails.num_cfl_bulbs = getNum('num_cfl', 2);
                    payloadDetails.cfl_lights_usage_pattern = details.cfl_pattern || 'evening';
                } else if (name === 'television') {
                    payloadDetails.television_hours = getNum('tv_hours', 4); // Map hours
                    const tvPattern = details.tv_pattern || 'moderate';
                    payloadDetails.television_usage_pattern = tvPattern;
                    payloadDetails.tv_size_inches = parseFloatVal('tv_size', 43);
                    payloadDetails.num_televisions = getNum('num_tv', 1);
                    payloadDetails.television_type = details.tv_type || 'LED';
                } else if (name === 'water_heater') {
                    payloadDetails.water_heater_hours = getNum('geyser_hours', 0.5); // Map hours
                    payloadDetails.water_heater_capacity_liters = parseFloatVal('geyser_capacity', 15);
                    payloadDetails.water_heater_type = details.geyser_type || 'instant';
                    payloadDetails.geyser_usage_pattern = details.geyser_pattern || 'light';
                } else if (name === 'desktop') {
                    payloadDetails.desktop_hours = getNum('desktop_hours', 2); // Map hours
                    payloadDetails.desktop_usage_pattern = details.desktop_pattern || 'moderate';
                } else if (name === 'laptop') {
                    payloadDetails.laptop_hours = getNum('laptop_hours', 4); // Map hours
                    payloadDetails.laptop_usage_pattern = details.laptop_pattern || 'moderate';
                } else if (name === 'iron') {
                    payloadDetails.iron_hours = getNum('iron_hours', 0.16); // Map hours from EventCard
                    const freq = details.iron_frequency;
                    const pattern = freq === 'daily' ? 'heavy' : freq === '2-3' ? 'moderate' : freq === 'weekly' ? 'light' : 'rarely';
                    payloadDetails.iron_usage_pattern = pattern;
                } else if (name === 'kettle') {
                    payloadDetails.kettle_hours = getNum('kettle_hours', 0.1); // Map hours
                    const freq = details.kettle_frequency;
                    const pattern = freq === 'daily' ? 'heavy' : freq === '2-3' ? 'moderate' : freq === 'weekly' ? 'light' : 'rarely';
                    payloadDetails.kettle_usage_pattern = pattern;
                } else if (name === 'induction') {
                    payloadDetails.induction_hours = getNum('induction_hours', 1); // Map hours
                    const freq = details.induction_frequency;
                    const pattern = freq === 'daily' ? 'very_heavy' : freq === '2-3' ? 'heavy' : freq === 'weekly' ? 'moderate' : 'light';
                    payloadDetails.induction_usage_pattern = pattern;
                } else if (name === 'rice_cooker') {
                    payloadDetails.rice_cooker_hours = getNum('rice_cooker_hours', 0.5); // Map hours
                    const freq = details.rice_cooker_frequency;
                    const pattern = freq === 'daily' ? 'heavy' : freq === '2-3' ? 'moderate' : freq === 'weekly' ? 'light' : 'rarely';
                    payloadDetails.rice_cooker_usage_pattern = pattern;
                } else if (name === 'mixer_grinder') {
                    payloadDetails.mixer_hours = getNum('mixer_hours', 0.1); // Map hours
                    const freq = details.mixer_grinder_frequency;
                    const pattern = freq === 'daily' ? 'heavy' : freq === '2-3' ? 'moderate' : freq === 'weekly' ? 'light' : 'rarely';
                    payloadDetails.mixer_usage_pattern = pattern;
                    payloadDetails.mixer_grinder_wattage = 750;
                } else if (name === 'microwave') {
                    payloadDetails.microwave_hours = getNum('microwave_hours', 0.1); // Map hours
                    const freq = details.microwave_frequency;
                    const pattern = freq === 'daily' ? 'heavy' : freq === '2-3' ? 'moderate' : freq === 'weekly' ? 'light' : 'rarely';
                    payloadDetails.microwave_usage_pattern = pattern;
                    payloadDetails.microwave_capacity_liters = 20;
                } else if (name === 'water_pump') {
                    payloadDetails.water_pump_hours = getNum('pump_hours', 0.5); // Map hours
                    payloadDetails.water_pump_hp = parseFloatVal('pump_hp', 1.0);
                    payloadDetails.pump_usage_pattern = details.pump_pattern || 'moderate';
                } else if (name === 'toaster') {
                    payloadDetails.toaster_hours = getNum('toaster_hours', 0.05); // Map hours
                    const freq = details.toaster_frequency;
                    const pattern = freq === 'daily' ? 'heavy' : freq === '2-3' ? 'moderate' : freq === 'weekly' ? 'light' : 'rarely';
                    payloadDetails.toaster_usage_pattern = pattern;
                } else if (name === 'food_processor') {
                    payloadDetails.food_processor_hours = getNum('food_processor_hours', 0.2); // Map hours
                    const freq = details.food_processor_frequency;
                    const pattern = freq === 'daily' ? 'heavy' : freq === '2-3' ? 'moderate' : freq === 'weekly' ? 'light' : 'rarely';
                    payloadDetails.food_processor_usage_pattern = pattern;
                } else if (name === 'hair_dryer') {
                    payloadDetails.hair_dryer_hours = getNum('hair_dryer_hours', 0.1); // Map hours
                    const freq = details.hair_dryer_frequency;
                    const pattern = freq === 'daily' ? 'heavy' : freq === '2-3' ? 'moderate' : freq === 'weekly' ? 'light' : 'rarely';
                    payloadDetails.hair_dryer_usage_pattern = pattern;
                } else if (name === 'vacuum') {
                    payloadDetails.vacuum_hours = getNum('vacuum_hours', 0.2); // Map hours
                    const freq = details.vacuum_frequency;
                    const pattern = freq === 'daily' ? 'heavy' : freq === '2-3' ? 'moderate' : freq === 'weekly' ? 'light' : 'rarely';
                    payloadDetails.vacuum_usage_pattern = pattern;
                }
                // --- MAPPING LOGIC END ---

                requests.push({
                    appliance_name: name,
                    details: payloadDetails,
                    total_bill: totalBillKwh
                });

                requestMap[name] = {
                    payload: payloadDetails,
                    details: details,
                    isExactMode: false
                };

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
                    laptop: 'Laptop',
                    rice_cooker: 'Rice Cooker',
                    toaster: 'Toaster',
                    food_processor: 'Food Processor',
                    hair_dryer: 'Hair Dryer',
                    vacuum: 'Vacuum Cleaner'
                };
                const title = TITLE_MAP[name];
                const modeKey = title ? `usage_mode_${title}` : null;
                requestMap[name].isExactMode = modeKey && details[modeKey] === 'exact';
            }

            // Batch Prediction
            const batchResults = await predictAllAppliances(requests);

            // Process Results
            for (const name of itemsToPredict) {
                try {
                    let val = 0;
                    let uncertainty = 0;

                    const aiRes = batchResults[name] || { status: 'error', prediction: 0 };
                    const baseVal = aiRes.status === 'success' ? aiRes.prediction : 0;

                    const ctx = requestMap[name];
                    // val = baseVal * physicsRatio; 
                    // FIX: Backend now handles tonnage/star rating logic directly. 
                    // Applying physicsRatio again was double-counting the reduction (e.g. 7.5kWh -> 4.0kWh).
                    val = baseVal;
                    const physicsRatio = 1.0; // Kept for reference if needed later
                    uncertainty = val * 0.10;

                    if (aiRes.insights?.anomaly && aiRes.insights?.anomaly?.status !== 'Normal') {
                        anomalies[name] = aiRes.insights?.anomaly;
                    }

                    // Exact Mode Logic
                    if (ctx.isExactMode) {
                        // Re-instantiate helpers for local scope if needed or just use logic
                        // For brevity, we assume the exact mode helper from energyUtils could handle this better, 
                        // but we'll keep the custom logic structure for now to match original behavior.
                        // ... (Exact logic skipped for brevity, should use getExactModeWatts fully if possible)

                        // Using the exact same logic as original file:
                        const getNum = (key: string, def: number) => details[key] ? Number(details[key]) : def;
                        const parseFloatVal = (key: string, def: number) => details[key] ? parseFloat(details[key].toString().split(' ')[0]) || def : def;

                        // Pattern to hours for exact mode
                        const patternToHoursExact = (appId: string, pattern: string | undefined, def: number) => {
                            if (!pattern) return def;
                            if (appId === 'tv') {
                                if (pattern === 'light') return 2;
                                if (pattern === 'moderate') return 4;
                                if (pattern === 'heavy') return 6.5;
                                if (pattern === 'always') return 10;
                            }
                            return def;
                        };

                        let hours = 0;
                        let count = 1;

                        if (name === 'ac') { hours = getNum('ac_hours', 6); count = getNum('ac_units', 1); }
                        else if (name === 'ceiling_fan') { hours = getNum('fan_hours', 12); count = parseFloatVal('num_fans', 3); }
                        else if (name === 'led_light') { hours = getNum('led_hours', 6); count = getNum('num_led', 5); }
                        else if (name === 'tube_light') { hours = getNum('tube_hours', 5); count = 2; }
                        else if (name === 'cfl_bulb') { hours = getNum('cfl_hours', 5); count = 2; }
                        else if (name === 'fridge') hours = getNum('fridge_hours', 24);
                        else if (name === 'television') {
                            const tvPattern = (details.tv_pattern as string) || 'moderate';
                            hours = getNum('tv_hours', patternToHoursExact('tv', tvPattern, 4));
                        }
                        else if (name === 'washing_machine') hours = (parseFloatVal('wm_cycles_per_week', 4) * 1.5) / 7;
                        else if (name === 'water_heater') hours = getNum('geyser_hours', 1);
                        else if (name === 'water_pump') hours = getNum('pump_hours', 0.5);
                        else if (name === 'mixer_grinder') hours = getNum('mixer_hours', 0.5);
                        else if (name === 'microwave') hours = getNum('microwave_hours', 0.5);
                        else if (name === 'kettle') hours = getNum('kettle_hours', 0.5);
                        else if (name === 'induction') hours = getNum('induction_hours', 1.5);
                        else if (name === 'iron') hours = getNum('iron_hours', 0.5);
                        else if (name === 'desktop') hours = getNum('desktop_hours', 4);
                        else if (name === 'laptop') hours = getNum('laptop_hours', 4);
                        // ... others

                        if (hours > 0) {
                            if (name === 'washing_machine') {
                                const cycles = getNum('wm_times_week', 4) * 4;
                                const cap = parseFloatVal('wm_capacity', 7.0);
                                val = cycles * cap * 0.15;
                            } else if (name === 'fridge') {
                                const cap = parseFloatVal('fridge_capacity', 250);
                                const baseUnits = (cap / 250) * 30;
                                const ageFactor = details.fridge_age === '10+' ? 1.3 : 1.0;
                                val = baseUnits * ageFactor * (hours / 24);
                            } else {
                                const manualWatts = getExactModeWatts(name, details as any);
                                val = (manualWatts * hours * 30 * count) / 1000;
                            }
                            uncertainty = val * 0.05;
                        }
                    } else {
                        if (val < 0.1) { val = 10; uncertainty = 5; }
                    }

                    predictions[name] = val;
                    uncertainties[name] = uncertainty;
                    rawTotal += val;

                } catch (err) {
                    console.error(`Prediction error for ${name}`, err);
                }
            }

            // Confidence
            let totalScore = 0, totalWeight = 0;
            const dominantModel = "Hybrid AI-Physics";
            let dominantAccuracy = "High Accuracy";
            itemsToPredict.forEach(name => {
                const aiRes = batchResults[name];
                const kwh = predictions[name] || 0;
                if (aiRes?.status === 'success' && aiRes.insights?.confidence_score) {
                    totalScore += (aiRes.insights.confidence_score * kwh);
                    totalWeight += kwh;
                    if (aiRes.insights.accuracy_tag === "Low Confidence" && kwh > 50) {
                        dominantAccuracy = "Review Needed";
                    }
                }
            });
            const finalConfidence = totalWeight > 0 ? (totalScore / totalWeight) : 98.2;
            const roundedConfidence = Math.min(99.9, Math.max(60.0, finalConfidence));

            const estimatedTotalCost = billRes.total;
            const breakdown: Array<{
                id: string;
                name: string;
                kwh: number;
                uncertainty?: number;
                percentage: number;
                cost: number;
            }> = [];
            let totalCalculatedKwh = 0;

            Object.entries(predictions).forEach(([name, kwh]) => {
                if (kwh > 0.01) {
                    const percentage = (kwh / totalBillKwh) * 100;
                    const cost = Math.round((kwh / totalBillKwh) * estimatedTotalCost);
                    totalCalculatedKwh += kwh;

                    const displayName = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        .replace('Ac', 'Air Conditioner')
                        .replace('Fridge', 'Refrigerator')
                        .replace('Ceiling Fan', 'Ceiling Fans');

                    breakdown.push({
                        id: name,
                        name: displayName,
                        kwh,
                        uncertainty: uncertainties[name] || 0,
                        percentage,
                        cost
                    });
                }
            });

            const processedBreakdown = distributeEnergyGap(breakdown as any[], totalBillKwh, estimatedTotalCost);
            const sortedBreakdown = [...processedBreakdown].sort((a, b) => b.kwh - a.kwh);

            const finalResults = {
                totalUsage: totalBillKwh,
                billEstimate: estimatedTotalCost,
                breakdown: sortedBreakdown as any,
                predictions,
                anomalies,
                uncertainties,
                rawTotal: totalCalculatedKwh,
                metrics: {
                    confidence: roundedConfidence.toFixed(1),
                    model: dominantModel,
                    accuracy: dominantAccuracy
                }
            };

            setResults(finalResults);

            // Auto Save
            const newEntry = {
                date: new Date().toISOString(),
                kwh: household.kwh as number,
                bill: Math.floor(billRes.total),
                mode: details.mode || 'Standard',
                // FIX: Store detailed results in history so Dashboard can show past breakdowns
                breakdown: finalResults.breakdown,
                metrics: finalResults.metrics
            };
            const isValidEntry = newEntry.bill > 0 || newEntry.kwh < 5;
            const currentHistory = (details.history as any[]) || [];
            const lastEntry = currentHistory[currentHistory.length - 1];
            const isDuplicate = lastEntry && lastEntry.kwh === newEntry.kwh && lastEntry.bill === newEntry.bill;

            let updatedHistory = currentHistory;
            if (isValidEntry && !isDuplicate) updatedHistory = [...currentHistory, newEntry];

            saveTraining(trainingId, {
                estimated_bill: estimatedTotalCost,
                bi_monthly_kwh: household.kwh as number,  // Include actual kWh for input_kwh column
                final_breakdown: finalResults,  // Use final_breakdown for self-learning
                ai_results: finalResults,  // Keep for backward compatibility
                appliance_usage: { ...details, history: updatedHistory } as any
            });

            toast.success("Analysis complete!");
            setLoading(false);

        } catch (e: any) {
            console.error("Analysis Failed:", e);
            setError(e.message || "Unknown error");
            toast.error("Analysis failed.");
            setLoading(false);
        }
    }, [household, appliances, details, trainingId, mode]);

    // Auto-run analysis on mount
    useEffect(() => {
        if (!hasRunRef.current) {
            hasRunRef.current = true;
            // Wrap async call to satisfy ESLint
            void (async () => {
                await runAnalysis();
            })();
        }
    }, [runAnalysis]);

    return { loading, progress, results, billDetails, error, runAnalysis };
}
