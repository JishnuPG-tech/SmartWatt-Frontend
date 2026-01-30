// --- INSTANT ALERT LOGIC (The "Friendly Cop") ---
// Users make mistakes. They might typo "24 hours" for a toaster.
// Instead of waiting for a valid bill, we warn them RIGHT NOW.

export const getUsageAlert = (name: string, hours: number): { type: "warning" | "info" | "error"; message: string } | undefined => {
    if (!hours && hours !== 0) return undefined;

    // AC Logic
    if (name === 'ac') {
        if (hours > 16) return { type: "error", message: "Critical: continuous AC usage (>16h) will drastically spike your bill." };
        if (hours > 12) return { type: "warning", message: "Notice: High AC usage detected. Expect a significant impact on your monthly bill." };
    }

    // Geyser Logic
    if (name === 'geyser') {
        if (hours > 3) return { type: "error", message: "Critical: Geyser running >3 hours/day is extremely expensive." };
        if (hours > 1.5) return { type: "warning", message: "Warning: Most households only need 30-60 mins of geyser usage per day." };
    }

    // Pump Logic
    if (name === 'pump') {
        if (hours > 2) return { type: "error", message: "Critical: Water Pump > 2 hours? Check for leaks or float valve failure." };
        if (hours > 1) return { type: "warning", message: "Notice: Pump usage is higher than average (30-45 mins)." };
    }

    // Induction Logic
    if (name === 'induction') {
        if (hours > 3) return { type: "error", message: "Heavy Load: Induction > 3 hours makes electricity costlier than LPG." };
        if (hours > 2) return { type: "warning", message: "Warning: High induction usage detected." };
    }

    // Iron Logic
    if (name === 'iron') {
        if (hours > 1) return { type: "warning", message: "Tip: Ironing > 1 hour/day? Try batch ironing weekly to save power." };
    }

    // --- NEW APPLIANCES ---

    // Refrigerator
    if (name === 'fridge') {
        if (hours > 24) return { type: "error", message: "Hours cannot exceed 24." };
        if (hours < 10) return { type: "warning", message: "Warning: < 10 hours may cause food spoilage unless empty." };
    }

    // Washing Machine
    if (name === 'wm') {
        if (hours > 3) return { type: "warning", message: "High usage: > 3 hours/day. Verify if this is accurate." };
    }

    // Kitchen Utils
    if (['microwave', 'kettle', 'rice_cooker', 'food_processor'].includes(name)) {
        if (hours > 1.5) return { type: "warning", message: `High usage for ${name.replace('_', ' ')}. > 1.5 hours is unusual.` };
    }
    if (name === 'mixer') {
        if (hours > 1) return { type: "warning", message: "Mixer running > 1 hr? Ensure jars are not overloaded." };
    }
    if (name === 'toaster') {
        if (hours > 0.5) return { type: "warning", message: "> 30 mins of toasting? That's a lot of bread!" };
    }

    // Lights & Fans
    if (name === 'fans') {
        if (hours > 20) return { type: "warning", message: "Fans running > 20 hours. Consider BLDC fans to save 60%." };
    }
    if (['led', 'cfl', 'tube'].includes(name)) {
        if (hours > 18) return { type: "warning", message: "Lights on > 18 hours? Ensure you switch off when leaving rooms." };
    }

    // Electronics
    if (name === 'tv') {
        if (hours > 10) return { type: "warning", message: "TV on > 10 hours. Consider lowering brightness to save power." };
    }
    if (name === 'desktop') {
        if (hours > 16) return { type: "warning", message: "Desktop > 16 hours. Enable Sleep Mode when efficient." };
    }
    if (name === 'laptop') {
        if (hours > 16) return { type: "warning", message: "Laptop plugged in > 16 hours. Modern batteries prefer cycling." };
    }

    // Cleaning / Grooming
    if (name === 'hair_dryer') {
        if (hours > 0.5) return { type: "warning", message: "Hair Dryer > 30 mins is equivalent to running 100 LED bulbs!" };
    }
    if (name === 'vacuum') {
        if (hours > 1) return { type: "warning", message: "Vacuuming > 1 hour daily? Check bag/filter for blockages." };
    }

    return undefined;
};
