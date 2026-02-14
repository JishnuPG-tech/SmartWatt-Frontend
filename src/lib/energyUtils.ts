// --- PHYSICS ENGINE (The "Truth" Layer) ---
// This file contains the immutable laws of physics for our app.
// It bridges the gap between "What user says" and "What physics demands".
import { PHYSICS_DEFAULTS, PHYSICS_RATIOS } from './physicsConstants';
export { PHYSICS_DEFAULTS, PHYSICS_RATIOS };

import { ApplianceUsageDetails } from './types';

export const getNum = (key: string, def: number, details: ApplianceUsageDetails) => {
    const val = details[key];
    return (val !== undefined && val !== null && val !== '') ? Number(val) : def;
};

export const parseFloatVal = (key: string, def: number, details: ApplianceUsageDetails) => {
    const val = details[key];
    if (val === undefined || val === null || val === 'unknown') return def;
    if (typeof val === 'number') return val;
    return parseFloat(String(val));
};

export const parseStar = (key: string, details: ApplianceUsageDetails) => {
    const val = details[key];
    if (!val || val === 'unknown') return 3;
    const strVal = String(val);
    if (strVal.includes('5')) return 5;
    if (strVal.includes('4')) return 4;
    return 3;
};

export const getPhysicsRatio = (name: string, details: ApplianceUsageDetails): number => {
    try {
        if (name === 'water_pump') {
            const userHP = parseFloatVal('pump_hp', 1.0, details);
            const avgHP = 1.0;
            return userHP / avgHP;
        }
        else if (name === 'ac') {
            const userTons = parseFloatVal('ac_tonnage', 1.5, details);
            const userStar = parseStar('ac_star', details);
            // Efficiency Rule: Higher Star = Lower Multiplier (Better)
            // A 5-star AC uses ~20% less power than a 3-star one.
            const effFactor = 1 + ((3 - userStar) * 0.1);
            const userLoad = userTons * effFactor;
            const avgLoad = 1.5 * 1.0;
            return userLoad / avgLoad;
        }
        else if (name === 'ceiling_fan') {
            const isBLDC = details.fan_type === 'bldc';
            return isBLDC ? (PHYSICS_RATIOS.BLDC_FAN_WATTS / PHYSICS_DEFAULTS.ceiling_fan) : 1.0;
        }
        else if (name === 'television') {
            const size = parseFloatVal('tv_size', 43, details);
            const avgWatts = 80;
            const userWatts = size * 2.0;
            return userWatts / avgWatts;
        }
        else if (name === 'water_heater') {
            const isInstant = details.geyser_type === 'instant';
            return isInstant ? (PHYSICS_RATIOS.INSTANT_GEYSER_WATTS / PHYSICS_DEFAULTS.water_heater) : 1.0;
        }
        else if (name === 'washing_machine') {
            const cap = parseFloatVal('wm_capacity', 7.0, details);
            return cap / 7.0;
        }
        else if (name === 'fridge') {
            const cap = parseFloatVal('fridge_capacity', 250, details);
            const ratio = cap / PHYSICS_RATIOS.FRIDGE_BASELINE_CAPACITY;
            const ageFactor = details.fridge_age === '10+' ? 1.3 : 1.0;
            return ratio * ageFactor;
        }
        return 1.0;
    } catch (e) {
        console.warn("Physics scaling error:", e);
        return 1.0;
    }
};

export const getExactModeWatts = (name: string, details: ApplianceUsageDetails): number => {
    if (name === 'ac') {
        const tons = parseFloatVal('ac_tonnage', 1.5, details);
        const star = parseStar('ac_star', details);
        // Exact Mode: We calculate raw watts. 
        // 1 Ton ~ 1000 Watts (Roughly). 
        // We adjust for star rating.
        const efficiencyFactor = 1 + ((5 - star) * 0.12);
        return tons * 1000 * efficiencyFactor;
    } else if (name === 'ceiling_fan') {
        return details.fan_type === 'bldc' ? 28 : 75;
    } else if (name === 'water_pump') {
        const hp = parseFloatVal('pump_hp', 1.0, details);
        return hp * 746;
    } else if (name === 'television') {
        const size = parseFloatVal('tv_size', 43, details);
        return size * 2.0;
    } else if (name === 'water_heater') {
        return details.geyser_type === 'instant' ? 3000 : 2000;
    } else if (name === 'fridge') {
        // Fridge is unique, usually calculated per day not per hour in exact mode context,
        // but here we return approx hourly draw for the loop if needed
        const cap = parseFloatVal('fridge_capacity', 250, details);
        return (cap / 250) * 40; // Approx 40W baseline
    }
    return PHYSICS_DEFAULTS[name] || 100;
};

export interface BreakdownItem {
    id?: string;
    name: string;
    kwh: number;
    uncertainty: number;
    percentage: number;
    cost: number;
}

/** 
 * Smartly distributes the gap between Physics Sum and Bill Input.
 * - If Physics < Bill: Distributes gap using caps and uncertainty weights.
 * - If Physics > Bill: Scales down proportionally.
 */
export const distributeEnergyGap = (
    breakdown: BreakdownItem[],
    totalBillKwh: number,
    estimatedTotalCost: number
): BreakdownItem[] => {

    const totalCalculatedKwh = breakdown.reduce((sum, item) => sum + item.kwh, 0);
    const gap = totalBillKwh - totalCalculatedKwh;

    // UNIFIED DISTRIBUTION STRATEGY (The "Fair Share" Algorithm)
    // Problem: The Physics math never perfectly matches the User's Bill.
    // Solution: We distribute the "Missing Energy" (The Gap) intelligently.

    // Goal: Always guarantee a "System & Unaccounted Load" row exists.
    // Why? Because no simulation is perfect. Showing 0% error is suspicious.
    // We admit ~5% uncertainty upfront to look more trustworthy.

    // 1. Calculate System Overhead (The "Tax")
    // Think of this like a service charge. 
    // Even if the calculations are perfect, we siphon off 5% to account for wiring losses, old meters, and hidden phantom loads.
    // Rule: Take at least 5% of the bill, or 35% of the unexplainable gap (whichever is BIGGER).
    const currentTotal = breakdown.reduce((sum, item) => sum + item.kwh, 0);
    const minOverhead = totalBillKwh * 0.05;
    const overheadShare = Math.max(gap * 0.35, minOverhead);

    // 2. Define Target for Appliances
    // The rest of the bill must be explained by appliances.
    const applianceTarget = totalBillKwh - overheadShare;
    const requiredChange = applianceTarget - currentTotal;

    // 3. Adjust Appliances to fit Target
    if (requiredChange > 0) {
        // SCENARIO A: Scaling Up (The "Balloon" Effect)
        // We didn't account for enough energy. To fill the gap, we "inflate" the usage of appliances.
        // But we can't just inflate indefinitely! A 3-star AC has a limit.
        // We use "CAPS" to stop appliances from exploding into unrealistic numbers.
        const CAPS: Record<string, number> = {
            fridge: 1.35, ceiling_fan: 1.50, led_light: 1.40,
            ac: 1.20, iron: 1.15, mixer: 1.15, default: 1.25
        };

        let totalAbsorbable = 0;
        const targets = breakdown.map(item => {
            const itemName = item.name?.toLowerCase() || '';
            const key = Object.keys(CAPS).find(k => itemName.includes(k)) || 'default';
            const maxKwh = item.kwh * CAPS[key];
            const room = Math.max(0, maxKwh - item.kwh);
            const weight = (item.uncertainty || 10) / 10;
            const absorbable = room * weight;
            totalAbsorbable += absorbable;
            return { ...item, absorbable, maxKwh };
        });

        let remainingToAdd = requiredChange;

        // Pass 1: Weighted Fill
        breakdown.forEach((item, idx) => {
            if (targets[idx].absorbable > 0 && totalAbsorbable > 0) {
                const share = (targets[idx].absorbable / totalAbsorbable) * requiredChange;
                const actualAdd = Math.min(share, remainingToAdd);

                item.kwh += actualAdd;
                item.uncertainty += actualAdd;
                remainingToAdd -= actualAdd;
            }
        });

        // Pass 2: Force Residual
        // If smart fill hit caps, just force-scale the rest (User wants exact match)
        if (remainingToAdd > 0.01) {
            const currentScale = breakdown.reduce((sum, i) => sum + i.kwh, 0);
            const forceScale = applianceTarget / currentScale;
            breakdown.forEach(item => { item.kwh *= forceScale; });
        }

    } else {
        // SCENARIO B: Scaling Down (Over-prediction)
        // We predicted too much, or Overhead ate into the budget.
        // Scale down proportionally.
        const scaleFactor = applianceTarget / currentTotal;
        breakdown.forEach(item => {
            item.kwh *= scaleFactor;
            item.uncertainty *= scaleFactor;
        });
    }

    // 4. Add System Overhead Row
    if (overheadShare > 0) {
        const otherCost = Math.round((overheadShare / totalBillKwh) * estimatedTotalCost);
        breakdown.push({
            id: 'system_overhead',
            name: "System & Unaccounted Load",
            kwh: overheadShare,
            uncertainty: 0,
            percentage: (overheadShare / totalBillKwh) * 100,
            cost: otherCost
        });
    }

    // Recalculate Costs & Percentages Final Pass
    breakdown.forEach(item => {
        item.cost = Math.round((item.kwh / totalBillKwh) * estimatedTotalCost);
        item.percentage = (item.kwh / totalBillKwh) * 100;
    });

    // Sort by usage
    breakdown.sort((a, b) => b.kwh - a.kwh);

    return breakdown;
};
