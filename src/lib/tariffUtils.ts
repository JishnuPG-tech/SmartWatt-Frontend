export const calculateBill = (biMonthlyUnits: number) => {
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
        // Telescopic: The "Layer Cake" Method
        // First 50 units are cheap. Next 50 are slightly more expensive.
        // You benefit from the lower tiers.
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
        // Non-Telescopic: The "Flat Rate" Trap
        // If you consume more than 250 units, KSEB charges you a flat high rate for EVERY unit.
        // You lose the benefit of the cheap starting tiers. This is why high bills shock people.
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
