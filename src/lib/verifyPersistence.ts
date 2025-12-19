
import fs from 'fs';
import path from 'path';

async function verifyPersistence() {
    // Load .env.local manually
    const envPath = path.resolve(__dirname, '../../.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                let val = value.trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                process.env[key.trim()] = val;
            }
        });
        // console.log("✅ Loaded .env.local");
    } else {
        console.error("❌ .env.local not found at:", envPath);
        return;
    }

    // Dynamic imports to avoid hoisting issues
    const { supabase } = await import('./supabaseClient');
    const { saveTraining } = await import('./saveTraining');
    const { loadTraining } = await import('./loadTraining');

    // console.log("🚀 Starting Persistence Verification...");

    // 1. Simulate a User ID (or use a test one)
    const TEST_USER_ID = crypto.randomUUID();
    // console.log(`👤 Using Test User ID: ${TEST_USER_ID}`);

    // 2. Create a record manually first (since page.tsx does this)
    // console.log("📝 Creating initial record...");
    const { data: initialRecord, error: createError } = await supabase
        .from("smartwatt_training")
        .insert({
            user_id: TEST_USER_ID,
            num_people: 2,
            bi_monthly_kwh: 100,
            selected_appliances: [],
            appliance_usage: {},
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (createError) {
        console.error("❌ Failed to create initial record:", createError);
        return;
    }
    // console.log("✅ Initial record created:", initialRecord);
    const trainingId = initialRecord.id;

    // 3. Test Load
    // console.log("🔄 Testing Load...");
    const loadedData = await loadTraining(TEST_USER_ID);
    if (!loadedData) {
        console.error("❌ Load failed: No data returned.");
        return;
    }
    // console.log("✅ Load successful:", loadedData);

    // 4. Test Save (Update)
    // console.log("💾 Testing Save (Update)...");
    const testPayload = {
        num_people: 5,
        bi_monthly_kwh: 500,
        selected_appliances: ["fridge", "ac"],
        appliance_usage: { "fridge_hours": 24 }
    };

    await saveTraining(trainingId, testPayload);

    // 5. Verify Update
    // console.log("🔍 Verifying Update...");
    // Wait a bit for propagation? usually instant for single read
    const { data: reloadedData, error: reloadError } = await loadTraining(TEST_USER_ID);

    if (reloadError) {
        console.error("❌ Reload failed:", reloadError);
        return;
    }

    if (reloadedData?.num_people === 5 &&
        reloadedData?.bi_monthly_kwh === 500 &&
        reloadedData?.selected_appliances?.includes("fridge") &&
        reloadedData?.appliance_usage?.fridge_hours === 24) {
        // console.log("✅ VERIFICATION SUCCESS: Data persisted correctly!");
    } else {
        console.error("❌ VERIFICATION FAILED: Data mismatch.");
        // console.log("Expected:", testPayload);
        // console.log("Received:", reloadedData);
    }

    // Cleanup (Optional)
    // await supabase.from("smartwatt_training").delete().eq("id", trainingId);
}

verifyPersistence();
