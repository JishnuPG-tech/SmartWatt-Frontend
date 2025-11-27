const API_URL = 'http://127.0.0.1:8000';

async function testBackend() {
    console.log('Testing Backend Connection with fetch...');

    // 1. Health Check
    try {
        const res = await fetch(API_URL + '/');
        const data = await res.json();
        console.log('✅ Health Check Passed:', data);
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
    }

    // 2. Calculate Bill
    try {
        const res = await fetch(API_URL + '/calculate-bill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kwh: 300 })
        });
        const data = await res.json();
        if (res.ok) console.log('✅ Calculate Bill Passed:', data);
        else console.error('❌ Calculate Bill Failed:', data);
    } catch (error) {
        console.error('❌ Calculate Bill Error:', error.message);
    }

    // 3. Predict Appliance (AC)
    try {
        const payload = {
            appliance_name: "ac",
            details: {
                total_kwh_monthly: 300,
                ac_hours_per_day: 6,
                ac_tonnage: 1.5,
                ac_star_rating: 3,
                num_ac_units: 1,
                ac_type: "split",
                ac_usage_pattern: "moderate"
            },
            total_bill: 300
        };
        const res = await fetch(API_URL + '/predict-appliance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) console.log('✅ Predict Appliance (AC) Passed:', data);
        else console.error('❌ Predict Appliance Failed:', data);
    } catch (error) {
        console.error('❌ Predict Appliance Error:', error.message);
    }
}

testBackend();
