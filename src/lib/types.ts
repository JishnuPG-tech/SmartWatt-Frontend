export interface HouseholdData {
    num_people: number;
    season: number | string;
    house_type: string;
    location_type?: string;
    bi_monthly_kwh?: number;
    kwh?: number;
    estimated_bill: number;
}

export interface ApplianceUsageDetails {
    // AC
    ac_tonnage?: string | number;
    ac_star?: string | number;
    ac_hours?: string | number;

    // Fan
    fan_type?: 'bldc' | 'standard' | string;
    num_fans?: string | number;
    fan_hours?: string | number;

    // Fridge
    fridge_capacity?: string | number;
    fridge_age?: string | number;
    fridge_hours?: string | number;

    // Washing Machine
    wm_capacity?: string | number;

    // Geyser/Water Heater
    geyser_type?: 'instant' | 'storage' | string;
    geyser_hours?: string | number;

    // TV
    tv_size?: string | number;
    tv_hours?: string | number;

    // Pump
    pump_hp?: string | number;
    pump_hours?: string | number;

    // Lighting (Counts)
    num_led?: string | number;
    num_cfl?: string | number;
    num_tube?: string | number;
    led_hours?: string | number;

    // Others
    mixer_hours?: string | number;
    iron_hours?: string | number;

    // Dynamic keys fallback (allows string indexing)
    [key: string]: any;
}

export interface BillResult {
    total: number;
    monthly: number;
    slab: string;
}

export interface AppliancePrediction {
    status: string;
    prediction: number;
    insights?: {
        efficiency_score: number;
        predicted_hours: number;
        source: string;
        anomaly?: {
            status: string; // "Normal" | "Usage_Anomaly" | "efficiency_warning" | "efficiency_critical"
            message: string;
            type: string;
        };
        confidence_score?: number;
        model_type?: string;
        accuracy_tag?: string;
    };
}

export interface TrainingPayload {
    num_people?: number;
    season?: string;
    house_type?: string;
    location_type?: string;
    bi_monthly_kwh?: number;
    estimated_bill?: number;

    appliance_usage?: ApplianceUsageDetails;
    selected_appliances?: string[];

    final_breakdown?: any;
    ai_results?: any;
    bill_estimate?: number;
    total_units_estimated?: number;
}
