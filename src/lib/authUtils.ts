import { supabase } from "./supabaseClient";

/**
 * Safely retrieves the current session, handling "Invalid Refresh Token" errors
 * by automatically signing the user out (clearing stale tokens).
 */
export const getSafeSession = async () => {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            // Check for specific refresh token errors
            if (error.message.includes("Invalid Refresh Token") || error.message.includes("Refresh Token Not Found")) {
                console.warn("⚠️ Detected stale session. Clearing auth state...");
                await supabase.auth.signOut();
                return { session: null, error: null }; // Treated as just "not logged in"
            }
            throw error;
        }

        return { session: data.session, error: null };
    } catch (err) {
        const error = err as Error;
        console.error("❌ Auth Error:", error.message);
        return { session: null, error };
    }
};
