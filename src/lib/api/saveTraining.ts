import { supabase } from "../supabaseClient";
import { TrainingPayload } from "../types";

// Define strict shape for the database update
interface SmartWattTrainingUpdate {
    num_people?: number;
    season?: string;
    house_type?: string;
    location_type?: string;
    bi_monthly_kwh?: number;
    monthly_kwh?: number;
    estimated_bill?: number;
    appliance_usage?: any; // JSONB
    selected_appliances?: string[];
    final_breakdown?: any; // JSONB
    ai_results?: any; // JSONB
    bill_estimate?: number;
    total_units_estimated?: number;
    updated_at: string;

    // Flattened Columns
    num_fans?: number | string;
    num_led?: number | string;
    num_cfl?: number | string;
    num_tube?: number | string;
    fan_hours?: number | string;
    led_hours?: number | string;
    tv_hours?: number | string;
    pump_hours?: number | string;
    mixer_hours?: number | string;
    fridge_hours?: number | string;
    iron_hours?: number | string;
}

export const saveTraining = async (id: string, payload: TrainingPayload) => {
    if (!id) {
        console.error("❌ SaveTraining Aborted: No record ID provided");
        return;
    }

    const data = payload?.appliance_usage;

    // 🔥 Extract structured values from JSON → SQL table columns
    // Using Partial<SmartWattTrainingUpdate> to allow building it up
    const updateData: Partial<SmartWattTrainingUpdate> = {
        num_people: payload?.num_people,
        season: payload?.season?.toString(),
        house_type: payload?.house_type,
        // location_type removed as it doesn't exist in DB schema
        bi_monthly_kwh: payload?.bi_monthly_kwh,
        estimated_bill: payload?.estimated_bill,

        // Full JSON for accuracy + training model later
        // Inject location_type into appliance_usage for persistence
        appliance_usage: {
            ...(payload?.appliance_usage || {}),
            // FIX: Only overwrite if payload.location_type is provided, otherwise keep existing
            location_type: payload?.location_type ?? payload?.appliance_usage?.location_type
        },
        selected_appliances: payload?.selected_appliances,

        // Results
        final_breakdown: payload?.final_breakdown || payload?.ai_results,
        bill_estimate: payload?.bill_estimate,
        total_units_estimated: payload?.total_units_estimated,

        updated_at: new Date().toISOString()
    };

    // Only calculate monthly_kwh if bi_monthly_kwh is present
    if (payload?.bi_monthly_kwh !== undefined) {
        updateData.monthly_kwh = payload.bi_monthly_kwh / 2;
    }

    // Only map appliance details if appliance_usage is present
    if (data) {
        updateData.num_fans = data.num_fans;
        updateData.num_led = data.num_led;
        updateData.num_cfl = data.num_cfl;
        updateData.num_tube = data.num_tube;

        updateData.fan_hours = data.fan_hours;
        updateData.led_hours = data.led_hours;
        updateData.tv_hours = data.tv_hours;
        updateData.pump_hours = data.pump_hours;
        updateData.mixer_hours = data.mixer_hours;
        updateData.fridge_hours = data.fridge_hours;
        updateData.iron_hours = data.iron_hours;
    }

    // Remove undefined keys (though Supabase usually handles undefined by ignoring, it's safer to be clean)
    Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof SmartWattTrainingUpdate] === undefined) {
            delete updateData[key as keyof SmartWattTrainingUpdate];
        }
    });

    try {
        const { error } = await supabase
            .from("smartwatt_training")
            .update(updateData)
            .eq("id", id);

        if (error) {
            console.error("❌ Supabase Update Error:", error.message);
        } else {
            // Success - Silent by default to avoid console noise
        }
    } catch (err) {
        console.error("❌ Critical Save Error:", err);
    }
};
