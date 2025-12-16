import requests
import json

API_URL = 'http://127.0.0.1:8000'

def test_backend():
    print('Testing Backend Connection with Python...')

    # 1. Health Check
    try:
        res = requests.get(f'{API_URL}/', timeout=5)
        print(f'✅ Health Check Passed: {res.json()}')
    except Exception as e:
        print(f'❌ Health Check Failed: {e}')

    # 2. Calculate Bill
    try:
        res = requests.post(f'{API_URL}/calculate-bill', json={'kwh': 300}, timeout=5)
        if res.status_code == 200:
            print(f'✅ Calculate Bill Passed: {res.json()}')
        else:
            print(f'❌ Calculate Bill Failed: {res.text}')
    except Exception as e:
        print(f'❌ Calculate Bill Error: {e}')

    # 3. Predict Appliance (AC)
    try:
        payload = {
            "appliance_name": "ac",
            "details": {
                "total_kwh_monthly": 300,
                "ac_hours_per_day": 6,
                "ac_tonnage": 1.5,
                "ac_star_rating": 3,
                "num_ac_units": 1,
                "ac_type": "split",
                "ac_usage_pattern": "moderate"
            },
            "total_bill": 300
        }
        res = requests.post(f'{API_URL}/predict-appliance', json=payload, timeout=5)
        if res.status_code == 200:
            print(f'✅ Predict Appliance (AC) Passed: {res.json()}')
        else:
            print(f'❌ Predict Appliance Failed: {res.text}')
    except Exception as e:
        print(f'❌ Predict Appliance Error: {e}')

if __name__ == '__main__':
    test_backend()
