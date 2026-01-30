import {
    Check, Download, ChevronRight, HelpCircle, Zap, Trophy, Sun, CheckCircle, CloudRain, Droplets,
    AlertTriangle, AppWindow, Snowflake, AlertOctagon, Shirt, Flame, Utensils, Coffee, Wind,
    Lightbulb, Ban, Sparkles, Tv, Monitor, Laptop, Droplet, Scissors, BarChart3, ClipboardList,
    Brain, Search, Trash2, Refrigerator, WashingMachine, Microwave, AirVent, CookingPot,
    Sandwich, ShowerHead, Disc
} from 'lucide-react';
import React from 'react';

// Helper for safe number parsing
const getNum = (val: any) => Number(val || 0);


export const runDiagnostics = (household: any, appliances: string[], details: any) => {
    const insights: any[] = [];

    // 1. Refrigerator Analysis
    if (appliances.includes('refrigerator') || appliances.includes('fridge')) {
        const age = getNum(details.fridge_age);
        if (age > 10) insights.push({ icon: <Refrigerator className="w-6 h-6 text-red-500" />, color: "text-red-300", msg: "Old Refrigerator: >10 years old. Likely consumes 2x power of new models." });
        else if (age > 5) insights.push({ icon: <Refrigerator className="w-6 h-6 text-yellow-500" />, color: "text-yellow-300", msg: "Aging Refrigerator: Check door seals. Efficiency drops 2% per year." });
    }

    // 2. AC Assessment
    if (appliances.includes('air_conditioner') || appliances.includes('ac')) {
        const star = getNum(details.ac_star_rating);
        const temp = getNum(details.ac_temperature);

        if (star < 3 && star > 0) insights.push({ icon: <Snowflake className="w-6 h-6 text-red-400" />, color: "text-red-300", msg: "Inefficient AC: Low Star Rating (< 3 Stars). Consider upgrading to 5-Star Inverter AC." });
        if (temp < 24 && temp > 16) insights.push({ icon: <Snowflake className="w-6 h-6 text-orange-400" />, color: "text-orange-300", msg: `Low AC Temp (${temp}°C): Every degree below 24°C increases bill by ~6%. Set to 24°C.` });
    }

    // 3. Washing Machine
    if (appliances.includes('washing_machine')) {
        const type = details.wm_type || 'unknown';
        if (type.includes('top') || type.includes('semi')) {
            insights.push({ icon: <WashingMachine className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Washing Machine: Front Loaders use 40% less water & energy than Top Loaders." });
        }
    }

    // 4. Geyser / Water Heater
    if (appliances.includes('geyser') || appliances.includes('water_heater')) {
        insights.push({ icon: <Flame className="w-6 h-6 text-orange-500" />, color: "text-orange-300", msg: "Water Heater: High consumption device. Switch to Solar Water Heater if possible." });
    }

    // 5. Lighting Analysis
    if (appliances.includes('cfl_lights') || appliances.includes('cfl_bulb') || appliances.includes('tube_lights') || appliances.includes('tube_light')) {
        insights.push({ icon: <Lightbulb className="w-6 h-6 text-yellow-400" />, color: "text-yellow-200", msg: "Old Lighting: CFL/Tube lights waste heat. Switch to LEDs to save 50% on lighting." });
    }

    // 6. Ceiling Fans
    if (appliances.includes('fans') || appliances.includes('ceiling_fan')) {
        // Assume standard unless specified
        const type = details.fan_type || 'standard';
        if (type !== 'bldc') {
            insights.push({ icon: <Wind className="w-6 h-6 text-blue-300" />, color: "text-blue-200", msg: "Ceiling Fans: Standard fans use 75W. BLDC fans use only 28W (60% Savings)." });
        }
    }

    // 7. General - Household Size
    if (household.num_people > 4 && household.kwh > 400) {
        insights.push({ icon: <AlertTriangle className="w-6 h-6 text-red-400" />, color: "text-red-300", msg: "High Consumption: Large family usage detected. Focus on behavioral changes." });
    }

    // 8. Seasonality
    if (household.season === 'summer' && (appliances.includes('ac') || appliances.includes('air_conditioner'))) {
        insights.push({ icon: <Sun className="w-6 h-6 text-yellow-500" />, color: "text-yellow-300", msg: "Summer Peak: Cooling costs act as the primary bill driver. Use curtains/blinds." });
    }

    // 9. Water Pump
    if (appliances.includes('pump') || appliances.includes('water_pump')) {
        const hours = getNum(details.pump_hours);
        if (hours > 1.5) insights.push({ icon: <Droplet className="w-6 h-6 text-red-500" />, color: "text-red-300", msg: "Pump Alert: > 1.5 hrs/day is high. Check for leaks or float-valve failure." });
        else if (hours < 0.5) insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Pump Optimized: Your water usage system is very efficient." });
    }

    // 10. Desktop
    if (appliances.includes('desktop')) {
        const hours = getNum(details.desktop_hours);
        if (hours > 8) insights.push({ icon: <Monitor className="w-6 h-6 text-yellow-500" />, color: "text-yellow-300", msg: "Desktop Workstation: Running long hours? Ensure 'Sleep' settings are active after 10 mins." });
    }

    // 11. Laptop
    if (appliances.includes('laptop')) {
        const hours = getNum(details.laptop_hours);
        if (hours > 12) insights.push({ icon: <Laptop className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Laptop: Always plugged in? Modern batteries manage charge, but it still draws power." });
    }

    // 12. Iron Box
    if (appliances.includes('iron')) {
        const hours = getNum(details.iron_hours);
        if (hours > 0.5) insights.push({ icon: <Shirt className="w-6 h-6 text-orange-500" />, color: "text-orange-300", msg: "Ironing: Daily heating wastes energy. Iron all clothes in one weekly batch." });
    }

    // 13. Hair Dryer
    if (appliances.includes('hair_dryer')) {
        const hours = getNum(details.hair_dryer_hours);
        if (hours > 0.5) insights.push({ icon: <Wind className="w-6 h-6 text-yellow-500" />, color: "text-yellow-200", msg: "Hair Dryer: High heat device. 30 mins is equivalent to running 100 LEDs." });
    }

    // 14. Vacuum Cleaner
    if (appliances.includes('vacuum')) {
        const hours = getNum(details.vacuum_hours);
        if (hours > 0.4) insights.push({ icon: <Wind className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Vacuuming: Frequent heavy motor usage. Check bag/filter to shorten cleaning time." });
    }

    // 15. Mixer
    if (appliances.includes('mixer')) {
        const hours = getNum(details.mixer_hours);
        if (hours > 0.5) insights.push({ icon: <Utensils className="w-6 h-6 text-blue-400" />, color: "text-blue-200", msg: "Mixer/Grinder: Heavy preparation detected. Ensure lids are tight to avoid re-grinding." });
    }

    // Fallback
    if (insights.length === 0) {
        insights.push({ icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: "text-green-300", msg: "Efficiency Pro: Your energy habits are exemplary. Low consumption profile." });
    }

    // Priority Sort: Red > Orange > Yellow > Blue > Green
    const colorPriority: Record<string, number> = { "text-red-300": 4, "text-orange-300": 3, "text-yellow-300": 2, "text-yellow-200": 2, "text-blue-200": 1, "text-blue-300": 1, "text-green-300": 0 };
    insights.sort((a, b) => (colorPriority[b.color] || 0) - (colorPriority[a.color] || 0));

    return insights;
};
