/** 
 * Field Transformation Utilities
 * Transforms UI field names and values to match backend API expectations
 */

/** 
 * Transform field names from UI format to backend format
 */
function transformFieldNames(appliance: string, data: Record<string, unknown>): Record<string, unknown> {
  const fieldMappings: Record<string, Record<string, string>> = {
    ac: {
      'ac_star': 'ac_star_rating',
      'ac_hours': 'ac_hours_per_day'
    },
    air_conditioner: {
      'ac_star': 'ac_star_rating',
      'ac_hours': 'ac_hours_per_day'
    },
    fridge: {
      'fridge_star': 'fridge_star_rating',
      'fridge_capacity': 'fridge_capacity_liters',
      'fridge_age': 'fridge_age_years',
      'fridge_hours': 'fridge_hours_per_day'
    },
    refrigerator: {
      'fridge_star': 'fridge_star_rating',
      'fridge_capacity': 'fridge_capacity_liters',
      'fridge_age': 'fridge_age_years',
      'fridge_hours': 'fridge_hours_per_day'
    },
    wm: {
      'wm_star': 'wm_star_rating',
      'wm_capacity': 'wm_capacity_kg'
    },
    washing_machine: {
      'wm_star': 'wm_star_rating',
      'wm_capacity': 'wm_capacity_kg'
    },
    geyser: {
      'geyser_type': 'water_heater_type',
      'geyser_capacity': 'water_heater_capacity_liters',
      'geyser_hours': 'water_heater_usage_hours'
    },
    water_heater: {
      'geyser_type': 'water_heater_type',
      'geyser_capacity': 'water_heater_capacity_liters',
      'geyser_hours': 'water_heater_usage_hours'
    },
    tv: {
      'tv_size': 'tv_size_inches',
      'tv_hours': 'tv_hours_per_day',
      'tv_type': 'television_type',
      'tv_pattern': 'television_usage_pattern'
    },
    television: {
      'tv_size': 'tv_size_inches',
      'tv_hours': 'tv_hours_per_day',
      'tv_type': 'television_type',
      'tv_pattern': 'television_usage_pattern'
    },
    pump: {
      'pump_hp': 'water_pump_hp',
      'pump_hours': 'water_pump_usage_hours_per_day'
    },
    water_pump: {
      'pump_hp': 'water_pump_hp',
      'pump_hours': 'water_pump_usage_hours_per_day'
    },
    fan: {
      'num_fans': 'num_ceiling_fans',
      'fan_hours': 'fan_hours_per_day'
    },
    ceiling_fan: {
      'num_fans': 'num_ceiling_fans',
      'fan_hours': 'fan_hours_per_day'
    },
    fans: {
      'num_fans': 'num_ceiling_fans',
      'fan_hours': 'fan_hours_per_day'
    }
  };

  const mapping = fieldMappings[appliance] || {};
  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const newKey = mapping[key] || key;
    transformed[newKey] = value;
  }

  return transformed;
}

/** 
 * Transform field values to correct types and formats
 */
function transformFieldValues(data: Record<string, unknown>): Record<string, unknown> {
  const transformed = { ...data };

  // Transform star ratings: "5-star" → 5
  for (const key in transformed) {
    if (key.includes('star_rating') && typeof transformed[key] === 'string') {
      const match = transformed[key].match(/(\d+)/);
      if (match) {
        transformed[key] = parseInt(match[1]);
      } else if (transformed[key] === 'unknown') {
        transformed[key] = 3; // Default to 3-star
      }
    }
  }

  // Fridge capacity: "240L" → 240
  if (transformed.fridge_capacity_liters && typeof transformed.fridge_capacity_liters === 'string') {
    const match = transformed.fridge_capacity_liters.match(/(\d+)/);
    transformed.fridge_capacity_liters = match ? parseFloat(match[1]) : 240;
  }

  // WM capacity: "7.0" → 7.0
  if (transformed.wm_capacity_kg && typeof transformed.wm_capacity_kg === 'string') {
    const match = transformed.wm_capacity_kg.match(/(\d+\.?\d*)/);
    transformed.wm_capacity_kg = match ? parseFloat(match[1]) : 7.0;
  }

  // Water heater capacity: "15L" → 15
  if (transformed.water_heater_capacity_liters && typeof transformed.water_heater_capacity_liters === 'string') {
    const match = transformed.water_heater_capacity_liters.match(/(\d+)/);
    transformed.water_heater_capacity_liters = match ? parseFloat(match[1]) : 15;
  }

  // Fridge age: Keep as string for AI-based dynamic resolution in backend
  // Backend will intelligently select value within range based on usage context
  if (transformed.fridge_age_years && typeof transformed.fridge_age_years === 'string') {
    const str = transformed.fridge_age_years;
    if (str === 'unknown') {
      transformed.fridge_age_years = 3;
    } else if (!str.includes('-') && !str.includes('+') && !str.includes('<')) {
      transformed.fridge_age_years = parseFloat(str) || 3;
    }
    // Keep ranges as-is: "3-5", "10+", "<1" for backend AI resolution
  }

  // Geyser/Water heater age: Keep ranges as strings
  if (transformed.water_heater_age && typeof transformed.water_heater_age === 'string') {
    const str = transformed.water_heater_age;
    if (str === 'unknown') {
      transformed.water_heater_age = 3;
    } else if (!str.includes('-') && !str.includes('+') && !str.includes('<')) {
      transformed.water_heater_age = parseFloat(str) || 3;
    }
    // Keep ranges for AI: "2-5", "10+", "<2"
  }

  // Fridge capacity: Keep "300L+" as string for AI resolution
  if (transformed.fridge_capacity_liters && typeof transformed.fridge_capacity_liters === 'string') {
    const str = transformed.fridge_capacity_liters;
    if (str.includes('+')) {
      // Keep as-is for backend AI: "300L+"
    } else {
      const match = str.match(/(\d+)/);
      transformed.fridge_capacity_liters = match ? parseFloat(match[1]) : 240;
    }
  }

  // WM capacity: Keep "8.0 kg+" as string for AI resolution
  if (transformed.wm_capacity_kg && typeof transformed.wm_capacity_kg === 'string') {
    const str = transformed.wm_capacity_kg;
    if (str.includes('+')) {
      // Keep as-is for backend AI: "8.0"
    } else {
      const match = str.match(/(\d+\.?\d*)/);
      transformed.wm_capacity_kg = match ? parseFloat(match[1]) : 7.0;
    }
  }

  // Water heater capacity: Keep "25L+" as string for AI resolution
  if (transformed.water_heater_capacity_liters && typeof transformed.water_heater_capacity_liters === 'string') {
    const str = transformed.water_heater_capacity_liters;
    if (str.includes('+')) {
      // Keep as-is for backend AI: "25L+"
    } else {
      const match = str.match(/(\d+)/);
      transformed.water_heater_capacity_liters = match ? parseFloat(match[1]) : 15;
    }
  }

  // Water heater capacity: Keep "25L+" as string for AI resolution
  if (transformed.water_heater_capacity_liters && typeof transformed.water_heater_capacity_liters === 'string') {
    const str = transformed.water_heater_capacity_liters;
    if (str.includes('+')) {
      // Keep as-is for backend AI: "25L+"
    } else {
      const match = str.match(/(\d+)/);
      transformed.water_heater_capacity_liters = match ? parseFloat(match[1]) : 15;
    }
  }

  // AC tonnage: "1.5" → 1.5
  if (transformed.ac_tonnage && typeof transformed.ac_tonnage === 'string') {
    const match = transformed.ac_tonnage.match(/(\d+\.?\d*)/);
    transformed.ac_tonnage = match ? parseFloat(match[1]) : 1.5;
  }

  // TV size: "43" → 43
  if (transformed.tv_size_inches && typeof transformed.tv_size_inches === 'string') {
    const match = transformed.tv_size_inches.match(/(\d+)/);
    transformed.tv_size_inches = match ? parseFloat(match[1]) : 43;
  }

  // Pump HP: "1.0" → 1.0
  if (transformed.water_pump_hp && typeof transformed.water_pump_hp === 'string') {
    const match = transformed.water_pump_hp.match(/(\d+\.?\d*)/);
    transformed.water_pump_hp = match ? parseFloat(match[1]) : 1.0;
  }

  // Fridge type: "frost" → "frost_free", "direct" → "direct_cool"
  if (transformed.fridge_type) {
    if (transformed.fridge_type === 'frost') {
      transformed.fridge_type = 'frost_free';
    } else if (transformed.fridge_type === 'direct') {
      transformed.fridge_type = 'direct_cool';
    }
  }

  // WM type: ensure correct format
  if (transformed.wm_type) {
    const typeMap: Record<string, string> = {
      'semi_automatic': 'semi_automatic',
      'top_load': 'top_load',
      'front_load': 'front_load'
    };
    transformed.wm_type = typeMap[String(transformed.wm_type)] || transformed.wm_type;
  }

  return transformed;
}

/** 
 * Derive missing fields from pattern selections
 */
function deriveFieldsFromPattern(appliance: string, data: Record<string, unknown>): Record<string, unknown> {
  const derived = { ...data };

  // AC: Derive ac_usage_pattern from ac_pattern
  if ((appliance === 'ac' || appliance === 'air_conditioner') && data.ac_pattern) {
    derived.ac_usage_pattern = data.ac_pattern; // light/moderate/heavy
    delete derived.ac_pattern;
  }

  // WM: Derive wm_cycles_per_week from wm_pattern
  if ((appliance === 'wm' || appliance === 'washing_machine') && data.wm_pattern) {
    const cyclesMap: Record<string, number> = {
      'light': 1.5,        // 1-2 cycles
      'moderate': 3.5,     // 3-4 cycles
      'heavy': 5.5,        // 5-6 cycles
      'very_heavy': 7      // 7+ cycles
    };
    derived.wm_cycles_per_week = cyclesMap[String(data.wm_pattern)] || 3.5;
    delete derived.wm_pattern;
  }

  return derived;
}

/** 
 * Main transformation function - applies all transformations
 */
export function transformApplianceData(appliance: string, uiData: Record<string, unknown>): Record<string, unknown> {
  console.log('🔄 Transforming data for:', appliance);
  console.log('📥 Input:', uiData);

  // Step 1: Derive fields from patterns
  let data = deriveFieldsFromPattern(appliance, uiData);

  // Step 2: Transform field names
  data = transformFieldNames(appliance, data);

  // Step 3: Transform field values
  data = transformFieldValues(data);

  console.log('📤 Output:', data);
  return data;
}
