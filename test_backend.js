const axios = require('axios');

const API_URL = 'http://127.0.0.1:8000';

async function testBackend() {
    console.log('Testing Backend Connection...');

    // 1. Health Check
    try {
        const health = await axios.get(API_URL + '/');
        console.log('✅ Health Check Passed:', health.data);
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
        return;
    }

    // 2. Calculate Bill
    try {
        const bill = await axios.post(API_URL + '/calculate-bill', { kwh: 300 });
        console.log('✅ Calculate Bill Passed:', bill.data);
    } catch (error) {
        console.error('❌ Calculate Bill Failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
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
        const prediction = await axios.post(API_URL + '/predict-appliance', payload);
        console.log('✅ Predict Appliance (AC) Passed:', prediction.data);
    } catch (error) {
        console.error('❌ Predict Appliance Failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

testBackend();
