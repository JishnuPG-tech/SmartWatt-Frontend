import {
    AirVent, Refrigerator, WashingMachine, ShowerHead, Microwave, Coffee, Zap,
    Disc, CookingPot, Sandwich, Utensils, Tv, Monitor, Laptop, Droplet,
    Shirt, Wind, Lightbulb, Fan
} from 'lucide-react';
import React from 'react';

export const APPLIANCE_CATEGORIES = [
    {
        title: "Major Appliances",
        items: [
            { id: 'air_conditioner', label: 'Air Conditioner (AC)', icon: AirVent, color: "text-cyan-400" },
            { id: 'refrigerator', label: 'Refrigerator / Fridge', icon: Refrigerator, color: "text-blue-400" },
            { id: 'washing_machine', label: 'Washing Machine', icon: WashingMachine, color: "text-indigo-400" },
            { id: 'geyser', label: 'Water Heater / Geyser', icon: ShowerHead, color: "text-red-400" },
            { id: 'microwave', label: 'Microwave Oven', icon: Microwave, color: "text-orange-400" },
            { id: 'kettle', label: 'Electric Kettle', icon: Coffee, color: "text-amber-600" },
            { id: 'induction', label: 'Induction Cooktop', icon: Zap, color: "text-red-500" },
        ]
    },
    {
        title: "Kitchen Appliances",
        items: [
            { id: 'mixer', label: 'Mixer / Grinder', icon: Disc, color: "text-slate-400" },
            { id: 'rice_cooker', label: 'Rice Cooker', icon: CookingPot, color: "text-white" },
            { id: 'toaster', label: 'Toaster', icon: Sandwich, color: "text-orange-300" },
            { id: 'food_processor', label: 'Food Processor', icon: Utensils, color: "text-gray-400" },
        ]
    },
    {
        title: "Lighting & Fans",
        items: [
            {
                id: 'fans',
                label: 'Ceiling Fan',
                icon: Fan,
                color: "text-blue-300",
                quantityConfig: { key: 'num_fans', label: 'Number of fans', min: 1, max: 15, defaultValue: 4 }
            },
            {
                id: 'led_lights',
                label: 'LED Bulb',
                icon: Lightbulb,
                color: "text-yellow-400",
                quantityConfig: { key: 'num_led', label: 'Number of bulbs', min: 1, max: 30, defaultValue: 10 }
            },
            {
                id: 'cfl_lights',
                label: 'CFL Bulb',
                icon: Lightbulb,
                color: "text-white",
                quantityConfig: { key: 'num_cfl', label: 'Number of bulbs', min: 1, max: 20, defaultValue: 5 }
            },
            {
                id: 'tube_lights',
                label: 'Tube Light',
                icon: Lightbulb,
                color: "text-slate-200",
                quantityConfig: { key: 'num_tube', label: 'Number of lights', min: 1, max: 20, defaultValue: 5 }
            },
        ]
    },
    {
        title: "Other Appliances",
        items: [
            { id: 'tv', label: 'Television', icon: Tv, color: "text-emerald-400" },
            { id: 'desktop', label: 'Desktop Computer', icon: Monitor, color: "text-blue-500" },
            { id: 'laptop', label: 'Laptop', icon: Laptop, color: "text-sky-400" },
            { id: 'pump', label: 'Water Pump / Motor', icon: Droplet, color: "text-blue-600" },
            { id: 'iron', label: 'Iron', icon: Shirt, color: "text-yellow-500" },
            { id: 'hair_dryer', label: 'Hair Dryer', icon: Wind, color: "text-pink-400" },
            { id: 'vacuum', label: 'Vacuum Cleaner', icon: Wind, color: "text-teal-400" },
        ]
    }
];
