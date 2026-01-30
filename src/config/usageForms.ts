export interface FormField {
    label: string;
    key: string;
    options: { value: string; label: string }[];
}

export interface UsagePattern {
    value: string;
    label: string;
}

// New: Event-based input structure (Frequency + Duration)
export interface EventBasedConfig {
    q1: {
        question: string;
        options: { value: string; label: string; multiplier: number }[]; // multiplier: times per day
    };
    q2: {
        question: string;
        options: { value: string; label: string; hours: number }[];
    };
}

// New: Room-based input structure (for lights and fans)
export interface RoomBasedConfig {
    presets: { label: string; val: number }[];
    defaultHours: number;
}

// New: Pump-based input structure (for water pumps)
export interface PumpBasedConfig {
    enabled: true;
}

export interface ApplianceFormConfig {
    id: string;
    patterns?: UsagePattern[];
    defaultPattern?: string;
    fields?: FormField[];
    eventBased?: EventBasedConfig; // New: for short-usage appliances
    roomBased?: RoomBasedConfig; // New: for lights and fans
    pumpBased?: PumpBasedConfig; // New: for water pumps
}

export const USAGE_FORMS: Record<string, ApplianceFormConfig> = {
    // --- MAJOR APPLIANCES ---
    refrigerator: {
        id: 'refrigerator',
        patterns: [
            { value: "rare", label: "Rare / Intermittent use (0–8 hrs/day)" },
            { value: "normal", label: "Normal household use (8–16 hrs/day)" },
            { value: "heavy", label: "Regular continuous use (16–22 hrs/day)" },
            { value: "always", label: "Always ON (24x7)" }
        ],
        defaultPattern: "normal",
        fields: [
            { label: "Star rating", key: "fridge_star", options: [{ value: "unknown", label: "Don't Know" }, { value: "3-star", label: "3-star" }, { value: "4-star", label: "4-star" }, { value: "5-star", label: "5-star" }] },
            { label: "Capacity", key: "fridge_capacity", options: [{ value: "unknown", label: "Don't Know" }, { value: "190L", label: "190L" }, { value: "215L", label: "215L" }, { value: "240L", label: "240L" }, { value: "300L+", label: "300L+" }] },
            { label: "Type", key: "fridge_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "direct", label: "Direct Cool" }, { value: "frost", label: "Frost Free" }] },
            { label: "Age", key: "fridge_age", options: [{ value: "unknown", label: "Don't Know" }, { value: "<1", label: "< 1 year" }, { value: "1-3", label: "1-3 years" }, { value: "3-5", label: "3-5 years" }, { value: "5-10", label: "5-10 years" }, { value: "10+", label: "10+ years" }] }
        ]
    },
    air_conditioner: {
        id: 'ac',
        patterns: [
            { value: "rare", label: "Rare / Occasional (0–1 hr/day)" },
            { value: "short", label: "Daily – Short duration (1–4 hrs/day)" },
            { value: "long", label: "Daily – Long duration (4–8 hrs/day)" },
            { value: "night", label: "Mostly Night-time (6–8 hrs/night)" }
        ],
        defaultPattern: "short",
        fields: [
            { label: "Star rating", key: "ac_star", options: [{ value: "unknown", label: "Don't Know" }, { value: "3-star", label: "3-star" }, { value: "4-star", label: "4-star" }, { value: "5-star", label: "5-star" }] },
            { label: "Tonnage", key: "ac_tonnage", options: [{ value: "unknown", label: "Don't Know" }, { value: "1.0", label: "1.0 ton" }, { value: "1.5", label: "1.5 ton" }, { value: "2.0", label: "2.0 ton" }] },
            { label: "Type", key: "ac_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "window", label: "Window" }, { value: "split", label: "Split" }, { value: "inverter", label: "Inverter" }] },
            { label: "Age (years)", key: "ac_age_years", options: [{ value: "unknown", label: "Don't Know" }, { value: "0-2", label: "0-2 years (New)" }, { value: "3-5", label: "3-5 years" }, { value: "6-10", label: "6-10 years" }, { value: "10+", label: "10+ years (Old)" }] }
        ]
    },
    washing_machine: {
        id: 'wm',
        patterns: [
            { value: "light", label: "Light (1-2 cycles/week) - Small household" },
            { value: "moderate", label: "Moderate (3-4 cycles/week) - Regular household" },
            { value: "heavy", label: "Heavy (5-6 cycles/week) - Large family" },
            { value: "very_heavy", label: "Very Heavy (7+ cycles/week) - Daily washing" }
        ],
        defaultPattern: "moderate",
        fields: [
            { label: "Type", key: "wm_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "semi_automatic", label: "Semi-Automatic" }, { value: "top_load", label: "Top Load (Fully Automatic)" }, { value: "front_load", label: "Front Load (Fully Automatic)" }] },
            { label: "Capacity", key: "wm_capacity", options: [{ value: "unknown", label: "Don't Know" }, { value: "6.0", label: "6.0 kg" }, { value: "6.5", label: "6.5 kg" }, { value: "7.0", label: "7.0 kg" }, { value: "8.0", label: "8.0 kg+" }] },
            { label: "Star Rating", key: "wm_star", options: [{ value: "unknown", label: "Don't Know" }, { value: "3", label: "3 Star" }, { value: "4", label: "4 Star" }, { value: "5", label: "5 Star" }] },
            { label: "Usage Frequency", key: "wm_cycles_per_week", options: [{ value: "2", label: "Light (2-3 loads/week)" }, { value: "5", label: "Moderate (4-6 loads/week)" }, { value: "8", label: "Heavy (7-10 loads/week)" }, { value: "12", label: "Very Heavy (10+ loads/week)" }] }
        ]
    },
    geyser: {
        id: 'geyser',
        patterns: [
            { value: "minimal", label: "Minimal (30 min/day) - Quick showers" },
            { value: "light", label: "Light (1-2 hours/day) - Morning use only" },
            { value: "moderate", label: "Moderate (2-3 hours/day) - Morning + evening" },
            { value: "heavy", label: "Heavy (3+ hours/day) - Frequent hot water use" }
        ],
        defaultPattern: "light",
        fields: [
            { label: "Type", key: "geyser_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "instant", label: "Instant (3kW+)" }, { value: "storage", label: "Storage (2kW)" }, { value: "gas", label: "Gas Geyser" }] },
            { label: "Capacity", key: "geyser_capacity", options: [{ value: "unknown", label: "Don't Know" }, { value: "3L", label: "3 Liters (Instant)" }, { value: "10L", label: "10 Liters" }, { value: "15L", label: "15 Liters" }, { value: "25L", label: "25 Liters+" }] },
            { label: "Age", key: "geyser_age", options: [{ value: "unknown", label: "Don't Know" }, { value: "<2", label: "< 2 years" }, { value: "2-5", label: "2-5 years" }, { value: "5-10", label: "5-10 years" }, { value: "10+", label: "10+ years" }] }
        ]
    },
    // --- KITCHEN ---
    mixer: {
        id: 'mixer',
        eventBased: {
            q1: {
                question: "How often do you use the mixer?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average mixing time",
                options: [
                    { value: '5', label: '5 min', hours: 0.083 },
                    { value: '10', label: '10 min', hours: 0.167 },
                    { value: '15', label: '15 min', hours: 0.25 },
                    { value: '20', label: '20 min', hours: 0.333 }
                ]
            }
        }
    },
    microwave: {
        id: 'microwave',
        eventBased: {
            q1: {
                question: "How often do you use it?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average duration per session",
                options: [
                    { value: '2', label: '2 min', hours: 0.033 },
                    { value: '5', label: '5 min', hours: 0.083 },
                    { value: '10', label: '10 min', hours: 0.167 },
                    { value: '15', label: '15 min', hours: 0.25 }
                ]
            }
        }
    },
    kettle: {
        id: 'kettle',
        eventBased: {
            q1: {
                question: "How often do you boil water?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average boiling time",
                options: [
                    { value: '3', label: '3 min', hours: 0.05 },
                    { value: '5', label: '5 min', hours: 0.083 },
                    { value: '8', label: '8 min', hours: 0.133 },
                    { value: '10', label: '10 min', hours: 0.167 }
                ]
            }
        }
    },
    induction: {
        id: 'induction',
        eventBased: {
            q1: {
                question: "How often do you use the stove?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average duration per session",
                options: [
                    { value: '15', label: '15 min', hours: 0.25 },
                    { value: '30', label: '30 min', hours: 0.5 },
                    { value: '45', label: '45 min', hours: 0.75 },
                    { value: '60', label: '1 hour', hours: 1.0 }
                ]
            }
        }
    },
    rice_cooker: {
        id: 'rice_cooker',
        eventBased: {
            q1: {
                question: "How often do you cook rice?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average cooking duration",
                options: [
                    { value: '20', label: '20 min', hours: 0.333 },
                    { value: '30', label: '30 min', hours: 0.5 },
                    { value: '45', label: '45 min', hours: 0.75 },
                    { value: '60', label: '1 hour', hours: 1.0 }
                ]
            }
        }
    },
    toaster: {
        id: 'toaster',
        eventBased: {
            q1: {
                question: "How often do you toast?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average toasting time",
                options: [
                    { value: '3', label: '3 min', hours: 0.05 },
                    { value: '5', label: '5 min', hours: 0.083 },
                    { value: '8', label: '8 min', hours: 0.133 },
                    { value: '10', label: '10 min', hours: 0.167 }
                ]
            }
        }
    },
    food_processor: {
        id: 'food_processor',
        eventBased: {
            q1: {
                question: "How often do you use it?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average processing time",
                options: [
                    { value: '5', label: '5 min', hours: 0.083 },
                    { value: '10', label: '10 min', hours: 0.167 },
                    { value: '15', label: '15 min', hours: 0.25 },
                    { value: '20', label: '20 min', hours: 0.333 }
                ]
            }
        }
    },
    // --- LIGHTING & FANS ---
    fans: {
        id: 'fan',
        roomBased: {
            presets: [
                { label: 'Evening (5h)', val: 5 },
                { label: 'Night (8h)', val: 8 },
                { label: 'All Day (12h)', val: 12 }
            ],
            defaultHours: 8
        },
        fields: [
            { label: "Fan Type", key: "fan_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "standard", label: "Standard (Old, ~75W)" }, { value: "bldc", label: "BLDC (Energy Saver, ~30W)" }] },
            { label: "Number of Fans", key: "num_fans", options: [{ value: "1", label: "1 fan" }, { value: "2", label: "2 fans" }, { value: "3", label: "3 fans" }, { value: "4", label: "4-5 fans" }, { value: "6", label: "6+ fans" }] }
        ]
    },
    led_lights: {
        id: 'led',
        roomBased: {
            presets: [
                { label: 'Evening (5h)', val: 5 },
                { label: 'Morn + Eve (7h)', val: 7 },
                { label: 'All Day (12h)', val: 12 }
            ],
            defaultHours: 5
        }
    },
    cfl_lights: {
        id: 'cfl',
        roomBased: {
            presets: [
                { label: 'Evening (5h)', val: 5 },
                { label: 'Morn + Eve (7h)', val: 7 },
                { label: 'All Day (12h)', val: 12 }
            ],
            defaultHours: 5
        }
    },
    tube_lights: {
        id: 'tube',
        roomBased: {
            presets: [
                { label: 'Evening (5h)', val: 5 },
                { label: 'Morn + Eve (7h)', val: 7 },
                { label: 'All Day (12h)', val: 12 }
            ],
            defaultHours: 5
        }
    },
    // --- OTHER ---
    tv: {
        id: 'tv',
        patterns: [
            { value: "light", label: "Light (1-3 hours/day) - Occasional viewing" },
            { value: "moderate", label: "Moderate (3-5 hours/day) - Daily evening" },
            { value: "heavy", label: "Heavy (5-8 hours/day) - Regular watching" },
            { value: "always", label: "Always on (8+ hours/day) - Background TV" }
        ],
        defaultPattern: "moderate",
        fields: [
            { label: "TV Type", key: "tv_type", options: [{ value: "unknown", label: "Don't Know" }, { value: "LED", label: "LED / LCD" }, { value: "CRT", label: "Old Box TV (CRT)" }, { value: "Plasma", label: "Plasma" }] },
            { label: "Size", key: "tv_size", options: [{ value: "unknown", label: "Don't Know" }, { value: "32", label: "32 inch" }, { value: "43", label: "43 inch" }, { value: "55", label: "55 inch+" }] }
        ]
    },
    desktop: {
        id: 'desktop',
        patterns: [
            { value: "light", label: "Light (1-2 hours/day)" },
            { value: "moderate", label: "Moderate (3-5 hours/day) - Work/Study" },
            { value: "heavy", label: "Heavy (6-10 hours/day) - Full work day" },
            { value: "always", label: "Always on (24 hours) - Server/Mining" }
        ],
        defaultPattern: "moderate"
    },
    laptop: {
        id: 'laptop',
        patterns: [
            { value: "light", label: "Light (1-2 hours/day)" },
            { value: "moderate", label: "Moderate (3-5 hours/day) - Work/Study" },
            { value: "heavy", label: "Heavy (6-10 hours/day) - Full work day" },
            { value: "always", label: "Always plugged in (24 hours)" }
        ],
        defaultPattern: "moderate"
    },

    pump: {
        id: 'pump',
        patterns: [
            { value: "rare", label: "Rare / Occasional (10–15 minutes/day)" },
            { value: "normal", label: "Normal household use (20–30 minutes/day)" },
            { value: "frequent", label: "Frequent use (40–60 minutes/day)" },
            { value: "heavy", label: "Heavy use (90–120 minutes/day)" }
        ],
        defaultPattern: "daily_std",
        fields: [
            { label: "Motor Power", key: "pump_hp", options: [{ value: "0.5", label: "0.5 HP" }, { value: "1.0", label: "1.0 HP" }, { value: "1.5", label: "1.5 HP" }, { value: "2.0", label: "2.0 HP" }] }
        ]
    },
    iron: {
        id: 'iron',
        eventBased: {
            q1: {
                question: "How often do you use the iron?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average ironing time per session",
                options: [
                    { value: '10', label: '10 min', hours: 0.167 },
                    { value: '20', label: '20 min', hours: 0.333 },
                    { value: '30', label: '30 min', hours: 0.5 },
                    { value: '45', label: '45 min', hours: 0.75 },
                    { value: '60', label: '60 min', hours: 1.0 }
                ]
            }
        }
    },
    hair_dryer: {
        id: 'hair_dryer',
        eventBased: {
            q1: {
                question: "How often do you use the dryer?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average drying time",
                options: [
                    { value: '5', label: '5 min', hours: 0.083 },
                    { value: '10', label: '10 min', hours: 0.167 },
                    { value: '15', label: '15 min', hours: 0.25 },
                    { value: '30', label: '30 min', hours: 0.5 },
                    { value: '45', label: '45 min', hours: 0.75 }
                ]
            }
        }
    },
    vacuum: {
        id: 'vacuum',
        eventBased: {
            q1: {
                question: "How often do you vacuum?",
                options: [
                    { value: 'daily', label: 'Daily', multiplier: 1 },
                    { value: '2-3', label: 'Few times/week', multiplier: 0.43 },
                    { value: 'weekly', label: 'Once/week', multiplier: 0.14 },
                    { value: 'rarely', label: 'Rarely', multiplier: 0.07 }
                ]
            },
            q2: {
                question: "Average cleaning time",
                options: [
                    { value: '10', label: '10 min', hours: 0.167 },
                    { value: '20', label: '20 min', hours: 0.333 },
                    { value: '30', label: '30 min', hours: 0.5 },
                    { value: '45', label: '45 min', hours: 0.75 },
                    { value: '60', label: '1 hour', hours: 1.0 }
                ]
            }
        }
    },

};
