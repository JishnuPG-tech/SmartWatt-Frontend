'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { predictAppliance, calculateBill, simulateSavings } from '@/lib/api';
import { saveTraining } from '@/lib/saveTraining';
import { getNum, parseFloatVal, parseStar, getPhysicsRatio, getExactModeWatts, PHYSICS_DEFAULTS, distributeEnergyGap } from '@/lib/energyUtils';
import { Check, Download, ChevronRight, HelpCircle, Zap, Trophy, Sun, CheckCircle, CloudRain, Droplets, AlertTriangle, AppWindow, Snowflake, AlertOctagon, Shirt, Flame, Utensils, Coffee, Wind, Lightbulb, Ban, Sparkles, Tv, Monitor, Laptop, Droplet, Scissors, BarChart3, ClipboardList, Brain, Search, Trash2, Refrigerator, WashingMachine, Microwave, AirVent, CookingPot, Sandwich, ShowerHead, Disc } from 'lucide-react';
import { toast } from 'sonner';
import SolarCard from './SolarCard';
import TariffVisualizer from './TariffVisualizer';
import BenchmarkCard from './BenchmarkCard';
import InteractiveLoader from './InteractiveLoader';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Props {
    household: any;
    appliances: string[];
    details: any;
    onRestart: () => void;
    trainingId: string;
    mode?: 'quick' | 'detailed' | null;
}

export default function ResultsReport({ household, appliances, details, onRestart, trainingId, mode }: Props) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<any>(null);
    const [billDetails, setBillDetails] = useState<any>(null);
    const [optimization, setOptimization] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSolar, setShowSolar] = useState(false);
    const [showTariff, setShowTariff] = useState(false);
    const [showBenchmark, setShowBenchmark] = useState(false);

    // --- WHAT-IF SIMULATION LOGIC ---
    // --- WHAT-IF SIMULATION LOGIC (The "Crystal Ball") ---
    // User asks: "How can I save money?"
    // We send their data to the AI. The AI looks for inefficiencies (e.g., Old Fridge, excessive AC).
    // It returns a list of "Insights" (Actionable Tips) and how much kWh they save.
    const simulateOptimization = async () => {
        if (!billDetails) return;

        const toastId = toast.loading("Analyzing consumption patterns...");

        try {
            // Call Backend AI for Insights
            // Context: Pass Monthly Average Units (not Bi-Monthly) for better AI Context
            const monthlyUnits = household.kwh / 2;
            const simRes = await simulateSavings(details, monthlyUnits);

            if (simRes.status === 'success' && simRes.insights) {
                let totalSavedKwh = 0;
                const savingsBreakdown: string[] = [];

                if (simRes.insights.length === 0) {
                    toast.dismiss(toastId);
                    toast.info("Your usage is already highly optimized!");
                    return;
                }

                simRes.insights.forEach((insight: any) => {
                    totalSavedKwh += insight.saved_kwh;
                    savingsBreakdown.push(`${insight.title} (Save ${Math.round(insight.saved_kwh)} kWh)`);
                });

                // Calculate New Bill
                // Savings are monthly, so * 2 for bi-monthly comparison?
                // Wait. simRes returns 'saved_kwh' (Monthly).
                // Our Bill is Bi-Monthly. So we save 2 * Monthly Savings.
                const biMonthlySavings = totalSavedKwh * 2;

                const optimizedKwh = Math.max(50, household.kwh - biMonthlySavings);
                const optimizedBill = await calculateBill(optimizedKwh);

                setOptimization({
                    originalKwh: household.kwh,
                    newKwh: optimizedKwh,
                    originalBill: billDetails.total,
                    newBill: optimizedBill.total,
                    savedAmount: billDetails.total - optimizedBill.total,
                    breakdown: savingsBreakdown
                });
                toast.success("Optimization Complete!");
            } else {
                toast.error("No optimization insights found.");
            }
        } catch (err) {
            console.error("Simulation failed:", err);
            toast.error("Could not generate AI insights.");
        } finally {
            toast.dismiss(toastId);
        }
    };

    // --- SMART DIAGNOSTICS (The "Virtual Energy Auditor") ---
    // This function runs a series of "Rules" against your home.
    // It checks Seasons, Appliance Types, and Usage Hours.
    // It's like a checklist a real auditor would use, but instant.
    // We 'memoize' it (calculate once) so it doesn't slow down the UI.
    const smartInsights = (() => {
        const insights: any[] = [];
        if (!process.browser) return []; // Safety check

        // helper for safe number parsing
        const getNum = (val: any) => Number(val || 0);
        const getStr = (val: any) => (val || '').toString().toLowerCase();

        // --- 1. GLOBAL CONTEXT & SEASONALITY ---
        const season = household.season?.toLowerCase() || 'neutral';
        const totalKwh = household.kwh || 0;

        // Pricing Tier Alert
        if (totalKwh > 500) {
            insights.push({
                icon: <Zap className="w-6 h-6 text-red-500" />,
                color: "text-red-300",
                msg: "High Usage Alert: Total consumption exceeds 500 units. You are in the highest pricing slab where rates peak."
            });
        } else if (totalKwh < 150) {
            insights.push({
                icon: <Trophy className="w-6 h-6 text-green-500" />,
                color: "text-green-300",
                msg: "Eco Champion: Your total consumption is under 150 units. Excellent energy management!"
            });
        }

        // Seasonal Logic
        if (season === 'summer') {
            if (appliances.includes('air_conditioner') || appliances.includes('ac')) {
                const acHours = getNum(details.ac_hours);
                if (acHours > 8) {
                    insights.push({ icon: <Sun className="w-6 h-6 text-orange-500" />, color: "text-orange-300", msg: "Summer Critical: AC usage > 8 hrs significantly increases cooling costs. Use curtains to block solar heat." });
                } else {
                    insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Summer Smart: Keeping AC use minimal during peak heat is the best way to save bills." });
                }
            }
        } else if (season === 'monsoon') {
            if (appliances.includes('washing_machine')) {
                insights.push({ icon: <CloudRain className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "High Humidity: Use extra spin cycle only if clothes are not drying due to moisture." });
            }
            if (appliances.includes('ac')) {
                insights.push({ icon: <Droplets className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Humidity CTRL: Use AC 'Dry Mode' to remove moisture efficiently without over-cooling." });
            }
        }

        // --- 2. APPLIANCE SPECIFIC LOGIC (ALL 22 APPLIANCES) ---

        // 1. Air Conditioner
        if (appliances.includes('air_conditioner') || appliances.includes('ac')) {
            const hours = getNum(details.ac_hours);
            const star = parseInt(details.ac_star || '3');
            const type = getStr(details.ac_type);

            if (star < 4) insights.push({ icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />, color: "text-yellow-300", msg: `AC Efficiency: Your ${star} -Star AC consumes more power.Consider upgrading to a 5 - Star model.` });
            if (type === 'window') insights.push({ icon: <AppWindow className="w-6 h-6 text-orange-500" />, color: "text-orange-300", msg: "AC Type: Window units often have poorer insulation sealing than Split units." });

            if (hours > 10) insights.push({ icon: <Snowflake className="w-6 h-6 text-cyan-400" />, color: "text-red-300", msg: `AC Overload: Running ${hours} hrs / day.Try setting temperature to 26°C to save ~15 %.` });
            else if (hours < 4) insights.push({ icon: <Snowflake className="w-6 h-6 text-green-400" />, color: "text-green-300", msg: "AC Optimized: Low daily usage detected. Good use of natural ventilation." });
        }

        // 2. Refrigerator
        if (appliances.includes('refrigerator') || appliances.includes('fridge')) {
            const age = getNum(details.fridge_age?.toString().split(' ')[0] || 5);

            if (age > 10) insights.push({ icon: <AlertOctagon className="w-6 h-6 text-red-500" />, color: "text-red-300", msg: `Old Fridge: ${age} + years old.Efficiency drops significantly after 10 years.Planning a replacement ? ` });
            else insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Healthy Fridge: Modern unit detected. Keep coils clean for max efficiency." });
        }

        // 3. Washing Machine
        if (appliances.includes('washing_machine')) {
            const hours = getNum(details.wm_hours);
            const type = getStr(details.wm_type);

            if (type.includes('top')) insights.push({ icon: <Shirt className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Washer Type: Top loads use more water/heating energy than Front loads." });
            if (hours > 1.5) insights.push({ icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />, color: "text-yellow-300", msg: "High Wash Load: >1.5 hrs/daily average? Ensure you run full loads only." });
        }

        // 4. Geyser / Water Heater
        if (appliances.includes('geyser') || appliances.includes('water_heater')) {
            const hours = getNum(details.geyser_hours);
            if (hours > 1.5) insights.push({ icon: <Flame className="w-6 h-6 text-red-500" />, color: "text-red-300", msg: "Heating Alert: Geysers are top energy consumers. Limit use to mornings or install a timer." });
            else if (hours < 0.5) insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Efficient Heating: Quick showers save massive energy." });
        }

        // 5. Microwave
        if (appliances.includes('microwave')) {
            const hours = getNum(details.microwave_hours);
            if (hours > 1) insights.push({ icon: <Utensils className="w-6 h-6 text-yellow-500" />, color: "text-yellow-200", msg: "Microwave: Efficient for reheating, but prolonged cooking costs more than gas." });
        }

        // 6. Kettle
        if (appliances.includes('kettle')) {
            const hours = getNum(details.kettle_hours);
            if (hours > 1) insights.push({ icon: <Coffee className="w-6 h-6 text-orange-500" />, color: "text-orange-300", msg: "Kettle: Boiling more water than needed? That's wasted kilowatt-hours." });
        }

        // 7. Induction Cooktop
        if (appliances.includes('induction')) {
            const hours = getNum(details.induction_hours);
            if (hours > 2) insights.push({ icon: <Flame className="w-6 h-6 text-red-500" />, color: "text-red-300", msg: "Induction Heavy Use: >2 hours/day makes it costlier than Gas/LPG cooking." });
            else if (hours < 0.5) insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Induction Smart: Using it for quick boiling only is cost-effective." });
        }

        // 8. Rice Cooker
        if (appliances.includes('rice_cooker')) {
            const hours = getNum(details.rice_cooker_hours);
            if (hours > 1.5) insights.push({ icon: <Utensils className="w-6 h-6 text-yellow-500" />, color: "text-yellow-300", msg: "Rice Cooker: Avoid 'Warm Mode' for long durations after cooking is done." });
        }

        // 9. Toaster
        if (appliances.includes('toaster')) {
            const hours = getNum(details.toaster_hours);
            if (hours > 0.5) insights.push({ icon: <Utensils className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Toaster: High usage. Ensure you toast multiple slices in one go." });
        }

        // 10. Food Processor
        if (appliances.includes('food_processor')) {
            const hours = getNum(details.food_processor_hours);
            if (hours > 1) insights.push({ icon: <Utensils className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Food Processor: Heavy usage detected. Good for bulk prep!" });
        }

        // 11. Ceiling Fans
        const numFans = getNum(details.num_fans);
        if (numFans > 0) {
            const hours = getNum(details.fan_hours);
            if (hours > 12) insights.push({ icon: <Wind className="w-6 h-6 text-orange-500" />, color: "text-orange-300", msg: `Fan Usage: ${numFans} fans running > 12 hrs.BLDC fans could save 60 % power.` });
            else if (hours < 6) insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Fan Usage: Conservative usage helps keep base load low." });
        }

        // 12. LED Lights
        const numLed = getNum(details.num_led);
        if (numLed > 20) insights.push({ icon: <Lightbulb className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: `High Light Count: You have ${numLed} LEDs.Ensure unoccupied rooms are dark.` });

        // 13. CFL / Tube Lights (Legacy)
        const numCfl = appliances.includes('cfl_bulb') ? getNum(details.num_cfl) : 0;
        const numTube = appliances.includes('tube_light') ? getNum(details.num_tube) : 0;
        if (numCfl > 0 || numTube > 0) {
            insights.push({ icon: <Ban className="w-6 h-6 text-red-500" />, color: "text-red-300", msg: `Legacy Lighting: ${numCfl} CFLs / ${numTube} Tubes detected.Replace with LEDs immediately to save 50 %.` });
        } else {
            insights.push({ icon: <Sparkles className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "100% LED: Excellent! No inefficient lighting detected in your home." });
        }

        // 14. Television
        if (appliances.includes('tv')) {
            const hours = getNum(details.tv_hours);
            if (hours > 6) insights.push({ icon: <Tv className="w-6 h-6 text-yellow-500" />, color: "text-yellow-300", msg: "High TV Time: >6 hrs/day. Lower the brightness/backlight to save panel energy." });
            else if (hours < 2) insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Low TV Usage: Great for energy bills and productivity." });
        }

        // 15. Desktop
        if (appliances.includes('desktop')) {
            const hours = getNum(details.desktop_hours);
            if (hours > 8) insights.push({ icon: <Monitor className="w-6 h-6 text-yellow-500" />, color: "text-yellow-300", msg: "Desktop Workstation: Running long hours? Ensure 'Sleep' settings are active after 10 mins." });
        }

        // 16. Laptop
        if (appliances.includes('laptop')) {
            const hours = getNum(details.laptop_hours);
            if (hours > 12) insights.push({ icon: <Laptop className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Laptop: Always plugged in? Modern batteries manage charge, but it still draws power." });
        }

        // 17. Water Pump
        if (appliances.includes('pump') || appliances.includes('water_pump')) {
            const hours = getNum(details.pump_hours);
            if (hours > 1.5) insights.push({ icon: <Droplet className="w-6 h-6 text-red-500" />, color: "text-red-300", msg: "Pump Alert: > 1.5 hrs/day is high. Check for leaks or float-valve failure." });
            else if (hours < 0.5) insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Pump Optimized: Your water usage system is very efficient." });
        }

        // 18. Iron Box
        if (appliances.includes('iron')) {
            const hours = getNum(details.iron_hours);
            if (hours > 0.5) insights.push({ icon: <Shirt className="w-6 h-6 text-orange-500" />, color: "text-orange-300", msg: "Ironing: Daily heating wastes energy. Iron all clothes in one weekly batch." });
        }

        // 19. Hair Dryer
        if (appliances.includes('hair_dryer')) {
            const hours = getNum(details.hair_dryer_hours);
            if (hours > 0.5) insights.push({ icon: <Wind className="w-6 h-6 text-yellow-500" />, color: "text-yellow-200", msg: "Hair Dryer: High heat device. 30 mins is equivalent to running 100 LEDs." });
        }

        // 20. Vacuum Cleaner
        if (appliances.includes('vacuum')) {
            const hours = getNum(details.vacuum_hours);
            if (hours > 0.4) insights.push({ icon: <Wind className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Vacuuming: Frequent heavy motor usage. Check bag/filter to shorten cleaning time." });
        }

        // 21. Mixer
        if (appliances.includes('mixer')) {
            const hours = getNum(details.mixer_hours);
            if (hours > 0.5) insights.push({ icon: <Utensils className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Mixer/Grinder: Heavy preparation detected. Ensure lids are tight to avoid re-grinding." });
        }

        // Fallback
        if (insights.length === 0) {
            insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Efficiency Pro: Your energy habits are exemplary. Low consumption profile." });
        }

        // Priority Sort: Red > Orange > Yellow > Blue > Green
        const colorPriority = { "text-red-300": 4, "text-orange-300": 3, "text-yellow-300": 2, "text-yellow-200": 2, "text-blue-200": 1, "text-blue-300": 1, "text-green-300": 0 };

        insights.sort((a, b) => (colorPriority[b.color as keyof typeof colorPriority] || 0) - (colorPriority[a.color as keyof typeof colorPriority] || 0));

        return insights;
    })();

    // --- UI RENDER LOGIC ---
    useEffect(() => {
        const runAnalysis = async () => {

            try {
                setLoading(true);
                setError(null);
                setProgress(0);

                const totalBillKwh = household.kwh;
                const predictions: Record<string, number> = {};
                const uncertainties: Record<string, number> = {};
                const anomalies: Record<string, any> = {};
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

                const requests: any[] = [];
                const requestMap: Record<string, any> = {};

                // LOGIC SPLIT:
                // If Mode is Quick, we ignore the passed `details` (user inputs) and use empty/defaults for calculation.
                // This ensures "Quick" always gives "Standard" results.
                // We still save the original `details` to DB so user doesn't lose data.
                const calculationDetails = (mode === 'quick') ? {} : details;

                // Loop through every selected appliance to prepare the AI Request
                for (let i = 0; i < itemsToPredict.length; i++) {
                    const name = itemsToPredict[i];

                    // Prepare details for this specific appliance
                    const appDetails: any = { ...details };

                    // Helper to parse star rating (e.g., "3-star" -> 3)
                    const parseStar = (key: string) => {
                        const val = details[key] || '3';
                        return parseInt(val.toString().split('-')[0]) || 3;
                    };

                    // Helper to parse float from string (e.g., "1.5 ton" -> 1.5)
                    const parseFloatVal = (key: string, defaultVal: number) => {
                        const val = calculationDetails[key];
                        if (!val) return defaultVal;
                        return parseFloat(val.toString().split(' ')[0]) || defaultVal;
                    };

                    const payloadDetails: any = {
                        total_kwh_monthly: totalBillKwh,
                        // Context for AI Detective 🕵️‍♂️
                        n_occupants: household.num_people || 4,
                        season: household.season || 'monsoon',
                        location_type: (household.house_type === 'independent') ? 'rural' : 'urban'
                    };

                    // Helper to safely get number (preserving 0)
                    const getNum = (key: string, defaultVal: number) => {
                        const val = calculationDetails[key];
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
                        payloadDetails.fridge_hours_per_day = getNum('fridge_hours', 22);
                    } else if (name === 'washing_machine') {
                        payloadDetails.wm_cycles_per_week = getNum('wm_cycles', 4);
                        payloadDetails.wm_capacity_kg = parseFloatVal('wm_capacity', 7.0);
                        payloadDetails.wm_star_rating = parseStar('wm_star') || 4;
                        payloadDetails.wm_type = details.wm_type || 'top_load';
                    } else if (name === 'ceiling_fan') {
                        payloadDetails.num_ceiling_fans = getNum('num_fans', 3);
                        payloadDetails.fan_hours_per_day = getNum('fan_hours', 15);
                        payloadDetails.fan_star_rating = details.fan_type === 'bldc' ? 5 : 3;
                        payloadDetails.fan_type = details.fan_type || 'standard';
                    } else if (name === 'led_light') {
                        payloadDetails.num_led_lights = getNum('num_led', 5);
                        payloadDetails.light_hours_per_day = getNum('led_hours', 6);
                    } else if (name === 'tube_light') {
                        payloadDetails.num_tube_lights = getNum('num_tube', 2);
                        payloadDetails.light_hours_per_day = getNum('tube_hours', 6);
                    } else if (name === 'cfl_bulb') {
                        payloadDetails.num_cfl_bulbs = getNum('num_cfl', 2);
                        payloadDetails.light_hours_per_day = getNum('cfl_hours', 6);
                    } else if (name === 'television') {
                        payloadDetails.tv_hours_per_day = getNum('tv_hours', 5);
                        payloadDetails.tv_size_inches = parseFloatVal('tv_size', 43);
                        payloadDetails.num_televisions = getNum('num_tv', 1);
                        payloadDetails.tv_type = details.tv_type || 'LED';
                    } else if (name === 'water_heater') {
                        payloadDetails.water_heater_usage_hours = getNum('geyser_hours', 1);
                        payloadDetails.water_heater_capacity_liters = parseFloatVal('geyser_capacity', 15);
                        payloadDetails.water_heater_type = details.geyser_type || 'instant';
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
                        payloadDetails.water_pump_hp = parseFloatVal('pump_hp', 1.0);
                    } else if (name === 'cfl_bulb') {
                        payloadDetails.num_cfl_bulbs = getNum('num_cfl', 2);
                        payloadDetails.light_hours_per_day = getNum('cfl_hours', 5);
                    } else if (name === 'tube_light') {
                        payloadDetails.num_tube_lights = getNum('num_tube', 2);
                        payloadDetails.light_hours_per_day = getNum('tube_hours', 5);
                    }

                    // Store for batch request
                    requests.push({
                        appliance_name: name,
                        details: payloadDetails,
                        total_bill: totalBillKwh
                    });

                    // Store other needed context
                    requestMap[name] = {
                        payload: payloadDetails,
                        details: details, // Original full details for exact mode logic
                        isExactMode: false // Will calculate below
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
                    requestMap[name].isExactMode = modeKey && details[modeKey] === 'exact';
                }

                // --- BATCH PREDICTION CALL ---
                // Import locally to avoid top-level dependency if preferred, or use top-level
                const { predictAllAppliances } = await import('@/lib/api');
                const batchResults = await predictAllAppliances(requests);

                // Process Results
                for (const name of itemsToPredict) {
                    try {
                        let val = 0;
                        let uncertainty = 0;

                        const aiRes = batchResults[name] || { status: 'error', prediction: 0 };
                        let baseVal = aiRes.status === 'success' ? aiRes.prediction : 0;

                        // Physics Scaling Logic (Reused)
                        const ctx = requestMap[name];
                        const physicsRatio = getPhysicsRatio(name, ctx.details);

                        val = baseVal * physicsRatio;
                        uncertainty = val * 0.10;

                        // Capture Anomaly
                        if (aiRes.insights?.anomaly) {
                            if (aiRes.insights.anomaly.status !== 'Normal') {
                                anomalies[name] = aiRes.insights.anomaly;
                            }
                        }

                        // 4. Handle "Exact Mode" Overrides
                        if (ctx.isExactMode) {
                            let hours = 0;
                            let count = 1;

                            // Re-using the getNum helper from above logic (need to re-establish scope or copy logic)
                            const getNum = (key: string, defaultVal: number) => {
                                const val = details[key];
                                if (val === undefined || val === null || val === '') return defaultVal;
                                return Number(val);
                            };
                            const parseFloatVal = (key: string, defaultVal: number) => {
                                const val = details[key];
                                if (!val) return defaultVal;
                                return parseFloat(val.toString().split(' ')[0]) || defaultVal;
                            };

                            // Get Hours & Count
                            if (name === 'ac') { hours = getNum('ac_hours', 6); count = getNum('ac_units', 1); }
                            else if (name === 'ceiling_fan') { hours = getNum('fan_hours', 12); count = getNum('num_fans', 3); }
                            else if (name === 'led_light') { hours = getNum('led_hours', 6); count = getNum('num_led', 5); }
                            else if (name === 'tube_light') { hours = getNum('tube_hours', 5); count = 2; }
                            else if (name === 'cfl_bulb') { hours = getNum('cfl_hours', 5); count = 2; }
                            else if (name === 'fridge') hours = getNum('fridge_hours', 24);
                            else if (name === 'television') hours = getNum('tv_hours', 5);
                            else if (name === 'washing_machine') hours = (getNum('wm_times_week', 4) * 1.5) / 7;
                            else if (name === 'water_heater') hours = getNum('geyser_hours', 1);
                            else if (name === 'water_pump') hours = getNum('pump_hours', 0.5);
                            else if (name === 'mixer_grinder') hours = getNum('mixer_hours', 0.5);
                            else if (name === 'microwave') hours = getNum('microwave_hours', 0.5);
                            else if (name === 'kettle') hours = getNum('kettle_hours', 0.5);
                            else if (name === 'induction') hours = getNum('induction_hours', 1.5);
                            else if (name === 'iron') hours = getNum('iron_hours', 0.5);
                            else if (name === 'desktop') hours = getNum('desktop_hours', 4);
                            else if (name === 'laptop') hours = getNum('laptop_hours', 4);
                            else if (name === 'rice_cooker') hours = getNum('rice_cooker_hours', 0.5);
                            else if (name === 'toaster') hours = 0.15;
                            else if (name === 'food_processor') hours = 0.2;
                            else if (name === 'hair_dryer') hours = 0.15;
                            else if (name === 'vacuum') hours = 0.3;

                            if (hours > 0) {
                                if (name === 'washing_machine') {
                                    const cyclesPerMonth = getNum('wm_times_week', 4) * 4;
                                    const cap = parseFloatVal('wm_capacity', 7.0);
                                    val = cyclesPerMonth * cap * 0.15;
                                }
                                else if (name === 'fridge') {
                                    const cap = parseFloatVal('fridge_capacity', 250);
                                    const baseUnits = (cap / 250) * 30;
                                    const ageFactor = details.fridge_age === '10+' ? 1.3 : 1.0;
                                    val = baseUnits * ageFactor * (hours / 24);
                                }
                                else {
                                    // General Wattage * Hours
                                    const manualWatts = getExactModeWatts(name, details);
                                    val = (manualWatts * hours * 30 * count) / 1000;
                                }
                                uncertainty = val * 0.05;
                            }
                        } else {
                            // Non-Exact Mode: Check for low AI confidence
                            if (val < 0.1) {
                                val = 10; // Fallback nominal
                                uncertainty = 5;
                            }
                        }

                        predictions[name] = val;
                        uncertainties[name] = uncertainty;
                        rawTotal += val;
                    } catch (err) {
                        console.error(`Failed to predict for ${name}: `, err);
                        predictions[name] = 0;
                        uncertainties[name] = 0;
                    }
                }

                // --- CONFIDENCE AGGREGATION ---
                // Calculate weighted average confidence based on consumption
                let totalScore = 0;
                let totalWeight = 0;
                let dominantModel = "Hybrid AI-Physics";
                let dominantAccuracy = "High Accuracy";

                for (const name of itemsToPredict) {
                    const aiRes = batchResults[name];
                    const kwh = predictions[name] || 0;
                    if (aiRes && aiRes.status === 'success' && aiRes.insights?.confidence_score) {
                        const score = aiRes.insights.confidence_score;
                        totalScore += (score * kwh);
                        totalWeight += kwh;

                        // If any major appliance sets a warning, downgrade tags
                        if (aiRes.insights.accuracy_tag === "Low Confidence" && kwh > 50) {
                            dominantAccuracy = "Review Needed";
                        }
                    }
                }

                const finalConfidence = totalWeight > 0 ? (totalScore / totalWeight) : 98.2;
                const roundedConfidence = Math.min(99.9, Math.max(60.0, finalConfidence));

                // 3. Absolute Physics Logic (V2) - No Forced Scaling
                // We trust the physics/AI accuracy. Mismatches are "Unaccounted" or "Anomalies".
                const estimatedTotalCost = billRes.total;

                const breakdown: any[] = [];
                let totalCalculatedKwh = 0;

                Object.entries(predictions).forEach(([name, kwh]) => {
                    if (kwh > 0.01) {
                        // V2: Use absolute kWh directly
                        const percentage = (kwh / totalBillKwh) * 100;
                        const cost = Math.round((kwh / totalBillKwh) * estimatedTotalCost);

                        totalCalculatedKwh += kwh;

                        // Display Name Mapping
                        const displayName = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            .replace('Ac', 'Air Conditioner')
                            .replace('Fridge', 'Refrigerator')
                            .replace('Ceiling Fan', 'Ceiling Fans');

                        breakdown.push({
                            id: name,
                            name: displayName,
                            kwh: kwh,
                            uncertainty: uncertainties[name],
                            percentage,
                            cost
                        });
                    }
                });

                // 4. Smart Gap Distribution (Delegated to Utility)
                // This handles Caps, Confidence Weights, Unaccounted calculation, and Scale Down.
                const processedBreakdown = distributeEnergyGap(breakdown, totalBillKwh, estimatedTotalCost);

                // Sort by usage for display
                const sortedBreakdown = [...processedBreakdown].sort((a, b) => b.kwh - a.kwh);

                const finalResults = {
                    totalUsage: totalBillKwh, // Bill is truth
                    billEstimate: estimatedTotalCost,
                    breakdown: sortedBreakdown,
                    predictions: predictions,
                    anomalies: anomalies,
                    uncertainties: uncertainties,

                    rawTotal: totalCalculatedKwh,
                    metrics: {
                        confidence: roundedConfidence.toFixed(1),
                        model: dominantModel,
                        accuracy: dominantAccuracy
                    }
                };

                setResults(finalResults);

                // Auto-Save to History
                const newEntry = {
                    date: new Date().toISOString(),
                    kwh: household.kwh,
                    bill: Math.floor(billRes.total),
                    mode: details.mode || 'Standard'
                };

                const currentHistory = details.history || [];
                const lastEntry = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1] : null;

                // Check for duplicates (ignore date)
                const isDuplicate = lastEntry &&
                    lastEntry.kwh === newEntry.kwh &&
                    lastEntry.bill === newEntry.bill &&
                    lastEntry.mode === newEntry.mode;

                const updatedHistory = isDuplicate ? currentHistory : [...currentHistory, newEntry];

                // Save results to Supabase (Current + History)
                saveTraining(trainingId, {
                    estimated_bill: estimatedTotalCost,
                    ai_results: finalResults,
                    appliance_usage: { ...details, history: updatedHistory }
                });
                toast.success("Analysis complete! Bill and usage calculated.");

                setLoading(false);
            } catch (e: any) {
                console.error("Analysis Failed:", e);
                setError(e.message || "An unexpected error occurred during analysis.");
                toast.error("Analysis failed. Please try again.");
                setLoading(false);
            }
        };

        runAnalysis();
    }, [household, appliances, details, trainingId]);

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
        return <InteractiveLoader progress={progress} />;
    }


    const avgCost = billDetails.total / household.kwh;

    // --- Grouping Logic Removed ---
    // We want to show ALL appliances to demonstrate model granularity
    const sortedBreakdown = [...results.breakdown].sort((a, b) => b.kwh - a.kwh);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 animate-in fade-in duration-200">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent filter drop-shadow-lg">
                    SMARTWATT
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
                    Kerala Energy Estimator
                </p>
            </div>

            {/* "Hero" Analysis Summary Card */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10">
                {/* Top Status Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Analysis Complete</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Session ID: {trainingId?.slice(0, 8)}...</span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch relative animate-in fade-in duration-700">

                    {/* ANOMALY ALERTS (If Any) */}
                    {results.anomalies && Object.keys(results.anomalies).length > 0 && (
                        <div className="col-span-1 md:col-span-2 mb-4">
                            <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4">
                                <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    AI Health Anomalies Detected
                                </h4>
                                <div className="grid gap-2">
                                    {Object.entries(results.anomalies).map(([app, detail]: [string, any]) => (
                                        <div key={app} className="flex items-start gap-3 bg-red-900/20 p-2 rounded-lg text-sm text-red-200">
                                            <span className="font-bold uppercase text-xs mt-0.5 bg-red-500/20 px-1.5 py-0.5 rounded text-red-300">
                                                {app.replace(/_/g, ' ')}
                                            </span>
                                            <span>
                                                {detail.message}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stat 1: Total Bill (Hero Card) - Clean & Solid */}
                    <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                                Estimate
                            </span>
                        </div>

                        <div className="mt-2">
                            <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">Bi-Monthly Bill</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl text-slate-500 font-normal">₹</span>
                                <span className="text-6xl font-black text-white tracking-tighter group-hover:text-blue-50 transition-colors">
                                    {Math.floor(billDetails.total)}
                                </span>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                                    <span className="text-sm font-medium text-slate-200">{household.kwh} Units</span>
                                </div>
                                <span className="text-slate-500 text-sm">@ Season {household.season}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat 2: Breakdown Stack (Right Side) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Monthly Avg */}
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-center transition-all hover:bg-slate-800 hover:border-slate-600">
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Monthly Avg</p>
                            <p className="text-3xl font-bold text-white mb-1">₹{Math.floor(billDetails.total / 2)}</p>
                            <p className="text-slate-500 text-[10px]">Per Month</p>
                        </div>

                        {/* Cost Per Unit */}
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-center transition-all hover:bg-slate-800 hover:border-slate-600">
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Avg Cost / Unit</p>
                            <p className="text-3xl font-bold text-white mb-1">₹{avgCost.toFixed(2)}</p>
                            <p className="text-slate-500 text-[10px]">KSEB Tiered</p>
                        </div>

                        {/* AI Confidence (Full Width) */}
                        <div className="col-span-1 sm:col-span-2 bg-emerald-950/20 rounded-2xl border border-emerald-500/20 p-4 flex items-center justify-between transition-all hover:bg-emerald-950/30 hover:border-emerald-500/30">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-emerald-400 font-bold text-lg leading-tight">{results?.metrics?.confidence || '98.2'}% Confidence</p>
                                    <p className="text-emerald-500/60 text-xs uppercase tracking-wider font-semibold">{results?.metrics?.model || 'Physics-Verified Model'}</p>
                                </div>
                            </div>
                            <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
                                {results?.metrics?.accuracy || 'High Accuracy'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Toggles (KSEB & Debug) */}
                <div className="bg-[#0f172a] border-t border-[#334155] divide-y divide-[#334155]">

                    {/* Transparency Note (Visible by Default) */}
                    <div className="px-6 py-3 bg-blue-950/20 border-b border-blue-500/10">
                        <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                            <strong className="text-blue-400">Note:</strong> Your bill includes standby usage, efficiency loss, and behavior patterns.
                            SmartWatt distributes this difference intelligently across appliances.
                        </p>
                    </div>

                    {/* 1. KSEB Billing Structure Toggle */}
                    <details className="group px-6 py-2">
                        <summary className="flex items-center justify-between gap-2 text-[10px] text-slate-400 hover:text-blue-400 cursor-pointer uppercase tracking-widest transition-colors py-2 list-none">
                            <div className="flex items-center gap-2">
                                <span>View KSEB Billing Structure</span>
                                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-slate-500 group-hover:text-blue-400 transition-colors">Assessment</span>
                            </div>
                            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                        </summary>

                        <div className="pb-4 pt-4 border-t border-[#334155]/50 mt-2 animate-in fade-in slide-in-from-top-1">
                            {/* Tariff Slab Visualizer (Prominent) */}
                            <div className="mb-6">
                                <TariffVisualizer householdKwh={household.kwh} />
                            </div>

                            {/* Cost Breakdown Grid (Compact Mode) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Base Charge */}
                                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Base Charge</p>
                                    <p className="text-lg font-bold text-white">₹{Math.floor(billDetails.total * 0.965)}</p>
                                </div>
                                {/* Fuel Surcharge */}
                                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Fuel Surcharge</p>
                                    <p className="text-lg font-bold text-white">₹{Math.floor(billDetails.total * 0.035)}</p>
                                </div>
                                {/* Total Charge */}
                                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20">
                                    <p className="text-blue-400 text-[10px] uppercase tracking-wider mb-1">Final Bill</p>
                                    <p className="text-lg font-bold text-white">₹{Math.floor(billDetails.total)}</p>
                                </div>
                            </div>
                        </div>
                    </details>

                    {/* 2. Transparency Center (Estimation Logic) */}
                    <details className="group px-6 py-2">
                        <summary className="flex items-center justify-between gap-2 text-[10px] text-slate-600 hover:text-blue-400 cursor-pointer uppercase tracking-widest transition-colors py-2 list-none">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">How we estimated this</span>
                                <span className="px-1.5 py-0.5 bg-slate-900 rounded text-[9px] text-slate-500 group-hover:text-blue-400 transition-colors">Logic</span>
                            </div>
                            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                        </summary>

                        <div className="pb-4 pt-4 border-t border-[#334155]/50 mt-2 animate-in fade-in slide-in-from-top-1">
                            {/* Explanatory Note */}
                            {/* Explanatory Note Removed (Redundant) */}

                            {/* Comparison Table */}
                            <div className="overflow-x-auto rounded-lg border border-slate-800">
                                <table className="w-full text-left text-[10px]">
                                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-3 py-2 font-medium">Appliance</th>
                                            <th className="px-3 py-2 font-medium text-right">Physics (Raw)</th>
                                            <th className="px-3 py-2 font-medium text-right text-white">Adjusted</th>
                                            <th className="px-3 py-2 font-medium text-right text-slate-500">Diff</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 bg-[#1a202c]/30">
                                        {results.breakdown
                                            .filter((item: any) => item.id !== 'system_overhead') // Remove Overhead from Raw Comparison
                                            .map((item: any) => {
                                                const rawVal = results.predictions[item.id] || 0;

                                                // Handle "System Overhead" unique display
                                                const isOverhead = item.id === 'system_overhead';
                                                const rawDisplay = isOverhead ? 0 : rawVal;
                                                const diff = item.kwh - rawDisplay;

                                                return (
                                                    <tr key={item.name} className="hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-3 py-2 text-slate-300 font-medium">
                                                            {isOverhead ? (
                                                                <div className="flex items-center gap-1.5 cursor-help min-w-0" title="Overhead reduces as input accuracy improves. Includes wiring loss, inverters, and standby power.">
                                                                    <span className="truncate">{item.name}</span>
                                                                    <HelpCircle className="w-3 h-3 text-slate-500 hover:text-blue-400 shrink-0" />
                                                                </div>
                                                            ) : (
                                                                <span>{item.name}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-slate-500">{rawDisplay.toFixed(1)}</td>
                                                        <td className="px-3 py-2 text-right text-white font-bold">{item.kwh.toFixed(1)}</td>
                                                        <td className={`px-3 py-2 text-right font-mono ${diff > 0.1 ? 'text-blue-400' : diff < -0.1 ? 'text-orange-400' : 'text-slate-600'}`}>
                                                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        {/* Total Row */}
                                        <tr className="bg-slate-900/50 font-bold border-t border-slate-700">
                                            <td className="px-3 py-2 text-slate-200">TOTAL</td>
                                            <td className="px-3 py-2 text-right text-slate-400">{results.rawTotal.toFixed(1)}</td>
                                            <td className="px-3 py-2 text-right text-white">{household.kwh}</td>
                                            <td className="px-3 py-2 text-right text-slate-500">
                                                {(household.kwh - results.rawTotal).toFixed(1)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </details>
                </div>
            </div>




            {/* Visual Analysis Card (Hero Theme) */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10" >
                {/* Header Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm" >
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-400" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Visual Analysis</span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Donut Chart - Energy Distribution */}
                    <div className="bg-[#1a202c]/50 border border-slate-700/50 rounded-xl p-4 overflow-hidden relative">
                        <h3 className="text-slate-300 font-medium mb-2 text-center text-sm uppercase tracking-wider">Energy Distribution (kWh)</h3>
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
                    <div className="bg-[#1a202c]/50 border border-slate-700/50 rounded-xl p-4 overflow-hidden relative">
                        <h3 className="text-slate-300 font-medium mb-2 text-center text-sm uppercase tracking-wider">Cost Impact (₹)</h3>
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
            </div>

            {/* Appliance Breakdown Card (Hero Theme) */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10" >
                {/* Header Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm" >
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-blue-400" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Appliance Consumption Detail</span>
                    </div>
                    <span className="text-xs text-slate-500">Sorted by Usage</span>
                </div>

                <div className="p-0"> {/* No padding for table to go edge-to-edge */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#1a202c] border-b border-slate-700/50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Appliance</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Usage (kWh)</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Confidence</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Percentage</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium uppercase tracking-wider text-xs">Cost (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {sortedBreakdown.map((item: any, idx: number) => {
                                    const getApplianceIcon = (id: string) => {
                                        if (id.includes('ac') || id.includes('air_conditioner')) return <AirVent className="w-4 h-4" />;
                                        if (id.includes('fridge') || id.includes('refrigerator')) return <Refrigerator className="w-4 h-4" />;
                                        if (id.includes('washing')) return <WashingMachine className="w-4 h-4" />;
                                        if (id.includes('geyser') || id.includes('heater') || id.includes('water_heater')) return <ShowerHead className="w-4 h-4" />;
                                        if (id.includes('microwave') || id.includes('oven')) return <Microwave className="w-4 h-4" />;
                                        if (id.includes('kettle')) return <Coffee className="w-4 h-4" />;
                                        if (id.includes('induction') || id.includes('cooker')) return <Zap className="w-4 h-4" />;
                                        if (id.includes('rice')) return <CookingPot className="w-4 h-4" />;
                                        if (id.includes('toaster')) return <Sandwich className="w-4 h-4" />;
                                        if (id.includes('mixer')) return <Disc className="w-4 h-4" />;
                                        if (id.includes('fan')) return <Wind className="w-4 h-4" />;
                                        if (id.includes('light') || id.includes('led') || id.includes('bulb')) return <Lightbulb className="w-4 h-4" />;
                                        if (id.includes('tv') || id.includes('television')) return <Tv className="w-4 h-4" />;
                                        if (id.includes('desktop') || id.includes('monitor')) return <Monitor className="w-4 h-4" />;
                                        if (id.includes('laptop')) return <Laptop className="w-4 h-4" />;
                                        if (id.includes('pump') || id.includes('water')) return <Droplet className="w-4 h-4" />;
                                        if (id.includes('iron')) return <Shirt className="w-4 h-4" />;
                                        if (id.includes('hair') || id.includes('vacuum')) return <Wind className="w-4 h-4" />;
                                        if (id === 'system_overhead') return <Zap className="w-4 h-4 text-amber-400" />;
                                        return <Zap className="w-4 h-4" />; // Default
                                    };

                                    return (
                                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="py-4 px-6 text-slate-200 font-medium group-hover:text-blue-300 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                                        {getApplianceIcon(item.id)}
                                                    </div>
                                                    {item.id === 'system_overhead' ? (
                                                        <div className="flex items-center gap-1.5 cursor-help" title="Overhead includes wiring loss, inverters, and standby power.">
                                                            <span>{item.name}</span>
                                                            <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-blue-400" />
                                                        </div>
                                                    ) : (
                                                        item.name
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-right py-4 px-6 text-slate-200 font-mono">{item.kwh.toFixed(2)}</td>
                                            <td className="text-right py-4 px-6 text-slate-500 text-xs">
                                                {`±${item.uncertainty.toFixed(2)} `}
                                            </td>
                                            <td className="text-right py-4 px-6 text-slate-200 font-mono">{item.percentage.toFixed(1)}%</td>
                                            <td className="text-right py-4 px-6 text-slate-200 font-mono font-bold">₹{item.cost}</td>
                                        </tr>
                                    );
                                })}
                                <tr className="bg-slate-800/50 border-t border-slate-600/50">
                                    <td className="py-4 px-6 text-white font-bold uppercase tracking-wider text-xs">TOTAL</td>
                                    <td className="text-right py-4 px-6 text-white font-bold font-mono">{household.kwh.toFixed(1)}</td>
                                    <td className="text-right py-4 px-6"></td>
                                    <td className="text-right py-4 px-6 text-white font-bold font-mono">100%</td>
                                    <td className="text-right py-4 px-6 text-white font-bold font-mono text-lg">₹{Math.floor(billDetails.total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Smart Diagnostics Card (Hero Theme) */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10" >
                {/* Header Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm" >
                    <div className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-blue-400" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Smart Energy Diagnostics</span>
                    </div>
                    <span className="text-xs text-slate-500">AI-Powered Insights</span>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {smartInsights.slice(0, 6).map((insight, idx) => (
                            <div key={idx} className="flex gap-3 items-start bg-[#1a202c]/50 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all duration-300 group">
                                <span className="text-xl mt-0.5 filter drop-shadow-lg group-hover:scale-110 transition-transform">{insight.icon}</span>
                                <p className={`text - sm leading - relaxed ${insight.color} `}>{insight.msg}</p>
                            </div>
                        ))}
                        {smartInsights.length > 6 && (
                            <div className="col-span-1 md:col-span-2 text-center mt-2">
                                <span className="text-xs text-slate-500 italic bg-slate-800/30 px-3 py-1 rounded-full border border-slate-700/30">
                                    + {smartInsights.length - 6} more insights available in PDF Report
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Community Benchmark (Peer Comparison) */}
            <div className="mb-8" >
                <BenchmarkCard householdKwh={household.kwh} numPeople={household.num_people} />
            </div>

            {/* Solar ROI Estimator */}
            <div className="mb-8" >
                <SolarCard householdKwh={household.kwh} totalBill={billDetails.total} />
            </div>

            {/* WHAT-IF OPTIMIZATION SECTION (Hero Theme) */}
            <div className="section bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] p-0 rounded-2xl mb-10 overflow-hidden shadow-2xl shadow-blue-900/10" >
                {/* Header Bar */}
                <div className="bg-[#1e293b]/50 px-6 py-3 border-b border-[#334155] flex justify-between items-center backdrop-blur-sm" >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-green-400" />
                        <span className="text-xs font-medium text-green-400 uppercase tracking-widest">What-If Optimization</span>
                    </div>
                    <span className="text-xs text-slate-500">AI Savings Engine</span>
                </div>

                <div className="p-8">
                    {!optimization ? (
                        <div className="text-center py-4">
                            <p className="text-slate-400 mb-6 max-w-xl mx-auto text-sm leading-relaxed text-center">
                                Leverage our AI-driven simulation engine to forecast potential savings.
                                optimize your consumption patterns and visualize the impact on your KSEB bill structure.
                            </p>
                            <button
                                onClick={simulateOptimization}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 border border-blue-500/50 uppercase tracking-wide"
                            >
                                <Sparkles className="w-5 h-5" /> Run AI Optimization
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Simulator Results Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Current */}
                                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 flex flex-col items-center text-center">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2">Current Bill</p>
                                    <p className="text-3xl font-bold text-white mb-1">₹{Math.round(optimization.originalBill)}</p>
                                    <p className="text-xs text-slate-500 font-mono">{optimization.originalKwh.toFixed(0)} Units</p>
                                </div>

                                {/* Optimized */}
                                <div className="p-4 bg-green-900/10 rounded-xl border border-green-500/30 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-green-500/5 blur-xl"></div>
                                    <p className="text-green-400 text-[10px] uppercase tracking-wider mb-2 relative z-10">Optimized Bill</p>
                                    <p className="text-4xl font-bold text-green-400 mb-1 relative z-10 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">₹{Math.round(optimization.newBill)}</p>
                                    <p className="text-xs text-green-300/70 font-mono relative z-10">{optimization.newKwh.toFixed(0)} Units</p>
                                </div>

                                {/* Savings */}
                                <div className="p-4 bg-yellow-900/10 rounded-xl border border-yellow-500/30 flex flex-col items-center text-center">
                                    <p className="text-yellow-500 text-[10px] uppercase tracking-wider mb-2">Potential Savings</p>
                                    <p className="text-3xl font-bold text-yellow-400 mb-1">₹{Math.round(optimization.savedAmount)}</p>
                                    <span className="inline-block px-2 py-1 bg-yellow-500/20 rounded text-[10px] text-yellow-300 border border-yellow-500/20">
                                        Save {((optimization.savedAmount / optimization.originalBill) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            {/* Breakdown Pills */}
                            <div className="text-center">
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-4">Recommended Actions</p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {optimization.breakdown.map((item: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 bg-slate-800/50 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 hover:border-green-500/50 hover:bg-slate-800 transition-colors text-xs shadow-sm">
                                            <Check className="w-3.5 h-3.5 text-green-400" /> {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center" >
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
                            doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} `, 14, 28);

                            // Household Summary
                            doc.setFontSize(14);
                            doc.setTextColor(0);
                            doc.text("Household Summary", 14, 40);

                            doc.setFontSize(10);
                            doc.setTextColor(80);
                            const summaryData = [
                                [`Household Size: ${household.num_people} People`, `Season: ${household.season.toUpperCase()} `],
                                [`House Type: ${household.house_type.toUpperCase()} `, `Bi - Monthly Units: ${household.kwh} kWh`],
                                [`Estimated Bill: Rs.${Math.floor(billDetails.total)} `, `Avg Cost / Unit: Rs.${avgCost.toFixed(2)} `]
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
                                `${item.percentage.toFixed(1)}% `,
                                `Rs.${item.cost} `
                            ]);

                            // Add Total Row
                            tableData.push([
                                'TOTAL',
                                `${household.kwh.toFixed(1)} kWh`,
                                '100%',
                                `Rs.${Math.floor(billDetails.total)} `
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

                            // Use the actual AI insights from the component logic
                            // Fallback to generic tips only if insights are empty (rare)
                            const tips = smartInsights.length > 0
                                ? smartInsights.slice(0, 6).map(ins => `- ${ins.msg} `)
                                : [
                                    "- Use overhead tank water (sun-heated) instead of geyser.",
                                    "- Utilize monsoon season for natural cooling to reduce AC usage.",
                                    "- Run washing machine during off-peak hours.",
                                    "- Install solar panels (Kerala has ~250 sunny days/year)."
                                ];

                            let tipY = finalY + 10;
                            tips.forEach(tip => {
                                // Simple text wrapping simulation
                                const splitTip = doc.splitTextToSize(tip, 180);
                                doc.text(splitTip, 14, tipY);
                                tipY += (splitTip.length * 6) + 2;
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
        </div>
    );
}
