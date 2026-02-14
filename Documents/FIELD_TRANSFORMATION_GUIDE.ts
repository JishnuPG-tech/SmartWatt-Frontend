/ 
 * FIELD NAME TRANSFORMATION GUIDE
 * 
 * This file explains WHY and HOW frontend needs to transform field names
 * before sending data to the backend API.
 * 
 * THE PROBLEM:
 * - Frontend UI collects: "ac_star" with value "5-star"
 * - Backend expects: "ac_star_rating" with value 5 (integer)
 * 
 * Without transformation → Backend rejects request → Prediction fails!
 */

// ============================================================================
// EXAMPLE 1: AIR CONDITIONER
// ============================================================================

// ❌ WRONG - What UI currently sends:
const wrongACData = {
  n_occupants: 4,
  season: "summer",
  location_type: "urban",
  ac_star: "5-star",           // ❌ Wrong name AND wrong format!
  ac_tonnage: "1.5",            // ❌ String, should be number
  ac_type: "inverter",          // ✅ OK
  ac_hours: 6                   // ❌ Wrong name (should be ac_hours_per_day)
};

// ✅ CORRECT - What backend expects:
const correctACData = {
  n_occupants: 4,
  season: "summer",
  location_type: "urban",
  ac_star_rating: 5,            // ✅ Correct name + integer
  ac_tonnage: 1.5,              // ✅ Number
  ac_type: "inverter",          // ✅ OK
  ac_usage_pattern: "moderate", // ✅ Derived from pattern selection
  ac_hours_per_day: 6           // ✅ Correct name
};

// ============================================================================
// EXAMPLE 2: REFRIGERATOR
// ============================================================================

// ❌ WRONG:
const wrongFridgeData = {
  fridge_star: "4-star",        // ❌ Wrong name + format
  fridge_capacity: "240L",      // ❌ Wrong name + format
  fridge_type: "frost",         // ❌ Wrong value (should be frost_free)
  fridge_age: "3-5",            // ❌ Wrong format (range, not number)
  fridge_hours: 24              // ❌ Wrong name
};

// ✅ CORRECT:
const correctFridgeData = {
  fridge_star_rating: 4,        // ✅ Correct name + integer
  fridge_capacity_liters: 240,  // ✅ Correct name + number
  fridge_type: "frost_free",    // ✅ Correct value (with underscore)
  fridge_age_years: 4,          // ✅ Correct name + average of range
  fridge_hours_per_day: 24      // ✅ Correct name
};

// ============================================================================
// EXAMPLE 3: WASHING MACHINE
// ============================================================================

// ❌ WRONG:
const wrongWMData = {
  wm_star: "5-star",            // ❌ Wrong name + format
  wm_capacity: "7.0",           // ❌ Wrong name + string
  wm_type: "front_load",        // ✅ OK
  wm_pattern: "moderate"        // ❌ Wrong! Should derive wm_cycles_per_week
};

// ✅ CORRECT:
const correctWMData = {
  wm_star_rating: 5,            // ✅ Correct name + integer
  wm_capacity_kg: 7.0,          // ✅ Correct name + number
  wm_type: "front_load",        // ✅ OK
  wm_cycles_per_week: 3.5       // ✅ Derived from "moderate" pattern (3-4 cycles)
};

// ============================================================================
// TRANSFORMATION FUNCTIONS NEEDED
// ============================================================================

/ 
 * 1. Transform field NAMES
 */
function transformFieldNames(appliance: string, data: any): any {
  const fieldMappings: Record<string, Record<string, string>> = {
    ac: {
      'ac_star': 'ac_star_rating',
      'ac_hours': 'ac_hours_per_day'
    },
    fridge: {
      'fridge_star': 'fridge_star_rating',
      'fridge_capacity': 'fridge_capacity_liters',
      'fridge_age': 'fridge_age_years',
      'fridge_hours': 'fridge_hours_per_day'
    },
    wm: {
      'wm_star': 'wm_star_rating',
      'wm_capacity': 'wm_capacity_kg'
    },
    geyser: {
      'geyser_type': 'water_heater_type',
      'geyser_capacity': 'water_heater_capacity_liters',
      'geyser_hours': 'water_heater_usage_hours'
    },
    tv: {
      'tv_size': 'tv_size_inches',
      'tv_hours': 'tv_hours_per_day'
    },
    pump: {
      'pump_hp': 'water_pump_hp',
      'pump_hours': 'water_pump_usage_hours_per_day'
    },
    fan: {
      'num_fans': 'num_ceiling_fans',
      'fan_hours': 'fan_hours_per_day'
    }
  };

  const mapping = fieldMappings[appliance] || {};
  const transformed: any = {};

  for (const [key, value] of Object.entries(data)) {
    const newKey = mapping[key] || key;
    transformed[newKey] = value;
  }

  return transformed;
}

/ 
 * 2. Transform field VALUES
 */
function transformFieldValues(appliance: string, data: any): any {
  const transformed = { ...data };

  // Star Rating: "5-star" → 5
  for (const key in transformed) {
    if (key.includes('star_rating') && typeof transformed[key] === 'string') {
      const match = transformed[key].match(/(\d+)/);
      transformed[key] = match ? parseInt(match[1]) : 3; // Default to 3
    }
  }

  // Capacity: "240L" → 240
  if (transformed.fridge_capacity_liters && typeof transformed.fridge_capacity_liters === 'string') {
    transformed.fridge_capacity_liters = parseFloat(transformed.fridge_capacity_liters.replace(/[^\d.]/g, ''));
  }

  // Capacity: "7.0" → 7.0
  if (transformed.wm_capacity_kg && typeof transformed.wm_capacity_kg === 'string') {
    transformed.wm_capacity_kg = parseFloat(transformed.wm_capacity_kg);
  }

  // Capacity: "15L" → 15
  if (transformed.water_heater_capacity_liters && typeof transformed.water_heater_capacity_liters === 'string') {
    transformed.water_heater_capacity_liters = parseFloat(transformed.water_heater_capacity_liters.replace(/[^\d.]/g, ''));
  }

  // Age: "3-5" → 4 (average)
  if (transformed.fridge_age_years && typeof transformed.fridge_age_years === 'string') {
    if (transformed.fridge_age_years.includes('-')) {
      const [min, max] = transformed.fridge_age_years.split('-').map((s: string) => parseInt(s));
      transformed.fridge_age_years = (min + max) / 2;
    } else if (transformed.fridge_age_years.includes('+')) {
      transformed.fridge_age_years = parseInt(transformed.fridge_age_years.replace('+', '')) + 2; // "10+" → 12
    } else if (transformed.fridge_age_years.includes('<')) {
      transformed.fridge_age_years = 0.5; // "<1" → 0.5
    }
  }

  // Tonnage: "1.5" → 1.5
  if (transformed.ac_tonnage && typeof transformed.ac_tonnage === 'string') {
    transformed.ac_tonnage = parseFloat(transformed.ac_tonnage);
  }

  // TV Size: "43" → 43
  if (transformed.tv_size_inches && typeof transformed.tv_size_inches === 'string') {
    transformed.tv_size_inches = parseFloat(transformed.tv_size_inches.replace(/[^\d.]/g, ''));
  }

  // Type: "frost" → "frost_free"
  if (transformed.fridge_type === 'frost') {
    transformed.fridge_type = 'frost_free';
  }
  if (transformed.fridge_type === 'direct') {
    transformed.fridge_type = 'direct_cool';
  }

  return transformed;
}

/ 
 * 3. Derive missing fields from patterns
 */
function deriveFieldsFromPattern(appliance: string, data: any): any {
  const derived = { ...data };

  // AC: Derive ac_usage_pattern from ac_pattern
  if (appliance === 'ac' && data.ac_pattern) {
    // Pattern already has the value we need (light/moderate/heavy)
    derived.ac_usage_pattern = data.ac_pattern;
    delete derived.ac_pattern; // Remove the UI field
  }

  // WM: Derive wm_cycles_per_week from wm_pattern
  if (appliance === 'wm' && data.wm_pattern) {
    const cyclesMap: Record<string, number> = {
      'light': 1.5,        // 1-2 cycles
      'moderate': 3.5,     // 3-4 cycles
      'heavy': 5.5,        // 5-6 cycles
      'very_heavy': 7      // 7+ cycles
    };
    derived.wm_cycles_per_week = cyclesMap[data.wm_pattern] || 3.5;
    delete derived.wm_pattern;
  }

  return derived;
}

/ 
 * 4. COMPLETE TRANSFORMATION PIPELINE
 */
export function transformApplianceData(appliance: string, uiData: any): any {
  console.log('🔄 Transforming UI data for backend:', appliance);
  console.log('📥 Input:', uiData);

  // Step 1: Derive fields from patterns
  let data = deriveFieldsFromPattern(appliance, uiData);

  // Step 2: Transform field names
  data = transformFieldNames(appliance, data);

  // Step 3: Transform field values
  data = transformFieldValues(appliance, data);

  console.log('📤 Output:', data);
  return data;
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

// Before sending to API:
const uiData = {
  n_occupants: 4,
  season: "summer",
  location_type: "urban",
  ac_star: "5-star",
  ac_tonnage: "1.5",
  ac_type: "inverter",
  ac_pattern: "moderate",
  ac_hours: 6
};

// Transform it:
const backendData = transformApplianceData('ac', uiData);

// Now send to API:
const response = await fetch('/predict-appliance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appliance_name: 'air_conditioner',
    total_bill: 500,
    details: backendData  // ✅ Transformed data!
  })
});

// ============================================================================
// COMPLETE FIELD MAPPING REFERENCE
// ============================================================================

/*
UI Field Name              Backend Expected Name              Transformation
--------------             ---------------------              ---------------
ac_star                 → ac_star_rating                     "5-star" → 5
ac_hours                → ac_hours_per_day                   6 → 6
ac_pattern              → ac_usage_pattern                   "moderate" → "moderate"

fridge_star             → fridge_star_rating                 "4-star" → 4
fridge_capacity         → fridge_capacity_liters             "240L" → 240
fridge_age              → fridge_age_years                   "3-5" → 4
fridge_hours            → fridge_hours_per_day               24 → 24
fridge_type             → fridge_type                        "frost" → "frost_free"

wm_star                 → wm_star_rating                     "5-star" → 5
wm_capacity             → wm_capacity_kg                     "7.0" → 7.0
wm_pattern              → wm_cycles_per_week                 "moderate" → 3.5

geyser_type             → water_heater_type                  "storage" → "storage"
geyser_capacity         → water_heater_capacity_liters       "15L" → 15
geyser_hours            → water_heater_usage_hours           2 → 2

tv_size                 → tv_size_inches                     "43" → 43
tv_hours                → tv_hours_per_day                   4 → 4

pump_hp                 → water_pump_hp                      "1.0" → 1.0
pump_hours              → water_pump_usage_hours_per_day     0.5 → 0.5

num_fans                → num_ceiling_fans                   2 → 2
fan_hours               → fan_hours_per_day                  8 → 8
*/

// ============================================================================
// WHERE TO IMPLEMENT THIS?
// ============================================================================

/*
Option 1: In Frontend/src/lib/api.ts
- Add transformApplianceData() function
- Call it before every API request

Option 2: In Frontend/src/lib/api/predictAppliance.ts
- Transform data specifically for prediction endpoint

Option 3: In Frontend/src/components/UsageDetails.tsx
- Transform when collecting data from forms

RECOMMENDED: Option 1 (centralized transformation in api.ts)
*/
