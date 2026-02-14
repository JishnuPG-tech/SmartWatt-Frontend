/** 
 * Centralized Physics Constants for SmartWatt
 * ===========================================
 * Defines baseline wattage and efficiency factors for all appliances.
 * Source: BEE India Standards & Default Market Averages (2025)
 */

export const PHYSICS_DEFAULTS: Record<string, number> = {
    ceiling_fan: 75,      // Standard inductive fan
    led_light: 10,
    cfl_bulb: 15,
    tube_light: 40,
    ac: 1500,             // 1.5 Ton Non-Inverter Baseline
    refrigerator: 200,    // 250L Frost Free Baseline
    washing_machine: 500, // Top Load Washing Cycle
    television: 100,      // 43" LED Baseline
    desktop: 200,
    laptop: 50,
    water_heater: 2000,   // 25L Storage Geyser
    water_pump: 750,      // 1 HP Pump
    iron: 1000,
    chiller: 1500,
    induction: 1500,
    mixer_grinder: 750,
    microwave: 1200,
    kettle: 1500,
    rice_cooker: 700,
    toaster: 800,
    food_processor: 500,
    hair_dryer: 1200,
    vacuum: 1000
};

// Special Constants used in logic
export const PHYSICS_RATIOS = {
    BLDC_FAN_WATTS: 28,
    INSTANT_GEYSER_WATTS: 3000,
    TV_WATTS_PER_INCH: 2.0,
    FRIDGE_BASELINE_CAPACITY: 250,
    FRIDGE_HOURLY_BASE: 40, // Approx average hourly draw
    PUMP_HP_TO_WATTS: 746,
    AC_TON_TO_WATTS: 1000   // Rough baseline for high efficiency
};
