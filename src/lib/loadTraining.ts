import { supabase } from "./supabaseClient";

export async function loadTraining(user_id: string) {
    try {
        const { data, error } = await supabase
            .from("smartwatt_training")
            .select("*")
            .eq("user_id", user_id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Load Error:", error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error("Load Training Exception:", err);
        return { data: null, error: err };
    }
}
