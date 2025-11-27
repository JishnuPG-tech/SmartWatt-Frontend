import { supabase } from "@/lib/supabaseClient";

export const saveTraining = async (id: string, payload: any) => {
    if (!id) return console.error("❌ No record ID");

    const data = payload?.appliance_usage ?? {};

    // 🔥 Extract structured values from JSON → SQL table columns
    const updateData: any = {
        num_people: payload?.num_people,
        season: payload?.season,
        house_type: payload?.house_type,
        bi_monthly_kwh: payload?.bi_monthly_kwh,
        estimated_bill: payload?.estimated_bill,

        // Full JSON for accuracy + training model later
        appliance_usage: payload?.appliance_usage,
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

    // Remove undefined keys to avoid overwriting with nulls if not intended
    Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
            delete updateData[key as keyof typeof updateData];
        }
    });

    const { data: result, error } = await supabase
        .from("smartwatt_training")
        .update(updateData)
        .eq("id", id)
        .select();

    if (error) {
        console.error("❌ Update Error Details:", JSON.stringify(error, null, 2));
        console.error("❌ Error Message:", error.message);
        console.error("❌ Error Hint:", error.hint);
        console.error("❌ Error Details:", error.details);
    } else {
        console.log("🔥 Record Updated:", result);
    }
};
