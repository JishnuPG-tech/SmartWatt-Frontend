export interface NormalizedUsage {
    category: string;
    min_hours: number;
    max_hours: number;
    avg_hours: number;
}

export function normalizePattern(text: string): NormalizedUsage {
    // 1. Extract Category (Text before the parenthesis or the whole text if no parens)
    const categoryMatch = text.match(/^([^(]+)/);
    const category = categoryMatch ? categoryMatch[1].trim() : "Unknown";

    let min = 0;
    let max = 0;

    // 2. Handle "Weekly X min" (e.g., "Weekly 15 min")
    if (text.toLowerCase().includes("weekly")) {
        const weeklyMatch = text.match(/(\d+)(?:-(\d+))?\s*min/i);
        if (weeklyMatch) {
            const minMin = parseFloat(weeklyMatch[1]);
            const maxMin = weeklyMatch[2] ? parseFloat(weeklyMatch[2]) : minMin;

            // Convert weekly minutes to daily hours
            min = (minMin / 60) / 7;
            max = (maxMin / 60) / 7;
        }
    }
    // 3. Handle "X-Y hours" or "X hours"
    else if (text.match(/hours?\/day/i) || text.match(/hours?\)/i)) {
        // Check for "X-Y" range
        const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*hours?/i);
        if (rangeMatch) {
            min = parseFloat(rangeMatch[1]);
            max = parseFloat(rangeMatch[2]);
        } else {
            // Check for "X+" or single "X"
            const singleMatch = text.match(/(\d+(?:\.\d+)?)\+?\s*hours?/i);
            if (singleMatch) {
                min = parseFloat(singleMatch[1]);
                // If "+", assume practical max of 10 (unless min is higher)
                if (text.includes("+")) {
                    max = Math.max(min, 10); // Cap at 10 or min
                    // Special case: "Always on (24 hours)" or similar large numbers
                    if (min >= 20) max = 24;
                    else if (min >= 12) max = 24;
                } else {
                    max = min;
                }
            }
        }
    }
    // 4. Handle "X-Y min" or "X min" (Daily)
    else if (text.match(/min\/day/i) || text.match(/min\)/i)) {
        const rangeMatch = text.match(/(\d+)\s*-\s*(\d+)\s*min/i);
        if (rangeMatch) {
            min = parseFloat(rangeMatch[1]) / 60;
            max = parseFloat(rangeMatch[2]) / 60;
        } else {
            const singleMatch = text.match(/(\d+)\s*min/i);
            if (singleMatch) {
                min = parseFloat(singleMatch[1]) / 60;
                max = min;
            }
        }
    }
    // 5. Handle "Always on" or specific keywords if regex failed
    if (text.toLowerCase().includes("always on") || text.toLowerCase().includes("24 hours")) {
        if (max === 0) { // Only if not already set
            min = 20;
            max = 24;
        }
    }

    // Round to 2 decimals
    const avg = (min + max) / 2;

    return {
        category,
        min_hours: parseFloat(min.toFixed(2)),
        max_hours: parseFloat(max.toFixed(2)),
        avg_hours: parseFloat(avg.toFixed(2))
    };
}
